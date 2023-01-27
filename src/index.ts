import './style.scss';
import * as aq from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
import { getDataCars, getSampledDataCars } from './dataCars';
import { getGameBoardDescriptions } from './Game';
import { GameBoard, IGameBoardDescription } from './GameBoard';
import { actionsScatter, Scatterplot } from './Scatterplot';
import { getColumnTypesFromArqueroTable, getDateParts, niceName, writeToClipboard } from './util';
import { VisType } from './visualizations';
import helpModal from './templates/helpModal.html';
import gameOverModal from './templates/gameOverModal.html';
import gameWinModal from './templates/gameWinModal.html';
import * as jsonAllCars from './assets/cars.json';
import * as jsonSampledCars from './assets/sampledCars.json';

// import the different Font Awesome icons sets
// import '@fortawesome/fontawesome-free/js/brands.js'; // https://fontawesome.com/search?o=r&m=free&f=brands
import '@fortawesome/fontawesome-free/js/solid.js'; // https://fontawesome.com/search?o=r&m=free&s=solid
// import '@fortawesome/fontawesome-free/js/regular.js'; // https://fontawesome.com/search?o=r&m=free&s=regular

// import font awesome core to make the above sets work
import '@fortawesome/fontawesome-free/js/fontawesome.js'; //
import { IUserTrackData } from './REST';


var TITLE = 'Iguanodon'
document.title = TITLE;


export let userId: string =  '';
export let isSurvey: boolean = false;
export let hasMiniSurveyReq: boolean = true;
// URL parameters
const queryString = window.location.search;
// console.log('queryString:', queryString);

const urlParams = new URLSearchParams(queryString);
// check if url parameter exists
// console.log('has id: ',urlParams.has('id'));

// get id
// const urlId = urlParams.get('id');
// console.log('id: ', urlId);

// if(urlParams.has('id')) {
//   userId = urlParams.get('id');
// }

if(urlParams.has('type')) {
  const type = urlParams.get('type');
  isSurvey = type === 'survey';
}

const dateParts = getDateParts(new Date());
// console.log("🚀 ~ file: index.ts ~ line 46 ~ dateParts", dateParts)
const code =`537${dateParts.labels.day}${dateParts.labels.month}${dateParts.labels.hour}${dateParts.labels.minutes}`;
console.log("🚀 ~ file: index.ts ~ line 47 ~ code", code)

if(isSurvey) {
  // set user id code
  userId = code;
  hasMiniSurveyReq = false;
}
console.log("🚀 ~ file: index.ts:51 ~ isSurvey", isSurvey);

export const userTrackDat: IUserTrackData = {
  userId: userId,
  games: []
}


export const $nav = document.querySelector('nav.navbar') as HTMLDivElement;

// nav -> help
const navHelp = $nav.querySelector('.nav-help') as HTMLDivElement;
navHelp.addEventListener('click', (event) => {
  const elem = event.target as HTMLElement;
  event.stopPropagation();
  // elem.classList.toggle('active');
  // const modalHelp = document.body.querySelector('#modal-help');
  // modalHelp.classList.add('show-modal');

  const modalHelp = document.body.querySelector('.modal.modal-help');
  const modalHelpContent: HTMLDivElement = modalHelp.querySelector('.modal-content');
  modalHelp.classList.toggle('is-active');
  modalHelpContent.scrollTop = 0;
}); 

// nav -> retry
const navRetry = $nav.querySelector('.nav-retry') as HTMLDivElement;
navRetry.addEventListener('click', (event) => {
  const elem = event.target as HTMLElement;
  // elem.classList.toggle('active');
  // const gameId = $main.dataset.gameId;
  // console.log('old game: ', currGameId);
  // new Game($main, gameDescr, aqDataset, false);
  // retry game
  restartGame();
}); 


// TODO for isSurvey = true
// [ ] no linkt to VDS Lab HP 
// [ ] retry is not allowed until 3 games are played
// [ ] game selection not allowed until 3 games are played
// [x] survey button not actionable until 3 games
// [ ] WIN modal -> no retry until 3 games
// [ ] GAME OVER modal -> no retry until 3 games
// [ ] add code and to survey button 

// show survey button if needed
const navSurvey = $nav.querySelector('.nav-survey') as HTMLDivElement;
navSurvey.classList.remove('display-none');

// actionListener for copy to clipboard button
const btnCopy = navSurvey.querySelector('.copy') as HTMLDivElement;
btnCopy.addEventListener('click',(event) => {
  if(hasMiniSurveyReq) {
    writeToClipboard(userId);
  }
});

// set allowed state of buttons 
// win / game over -> no close (btn, x, bg, retry) / retry
// navbar -> retry
// navbar -> game selection items
// 

// main
const $main = document.getElementById('main') as HTMLDivElement;


// TODO after page load read JSON file


// ***** Datasets *****
const datasetAllItems = getDataCars();
console.log("🚀 ~ file: index.ts:89 ~ fullDataset", datasetAllItems);
const datasetSampledItems = getSampledDataCars();
console.log("🚀 ~ file: index.ts:101 ~ sampledDataset", datasetSampledItems);

// full datasset 
export let aqFullDataset = aq.from(datasetAllItems);
export let aqSampledDataset = aq.from(datasetSampledItems);

// get column names
const colNames = aqFullDataset.columnNames();
const colNiceNames = colNames.map((elem) => {return {[elem]: niceName(elem)}});
// console.log("🚀 ~ file: index.ts:96 ~ colNiceNames", colNiceNames)
// console.log('names: ', {colNames,colNiceNames});

// rename columns
aqFullDataset = aqFullDataset.rename(colNiceNames);
// console.log('aqDataset',aqDataset);
// console.log('values: ',aqDataset.objects());
aqSampledDataset = aqSampledDataset.rename(colNiceNames);
// *******************



// add modals and their functionality
addModalsAndFunctionality(isSurvey);





// get game board descriptions (games + attempts) 
const gameBoardDescr = getGameBoardDescriptions();

// Set start game -> Game 1
const startGame = gameBoardDescr.filter((elem => elem.gameId === 1))[0];

// setup dropdown functionality
addDropdownFunctionality($main, gameBoardDescr, startGame.gameId);
// TODO add link to VDS Lab Logo if it isn't a survey

// create start Game
let currentGame = new GameBoard($main, startGame);


function addDropdownFunctionality(divMain: HTMLDivElement, gameBoards: IGameBoardDescription[], startGame: number) {
  // get nav game div
  const $navGame = document.querySelector('.nav-game') as HTMLDivElement;
  // get dropdown menu
  const $dropdownMenu = $navGame.querySelector('.dropdown-menu') as HTMLDivElement;

  // get dropdown button
  const $dropdownBtn = $navGame.querySelector('.dropdown-btn') as HTMLDivElement;
  // label label to button-item
  const dropdownBtnLabel = $dropdownBtn.querySelector('.dropdown-btn-item.label') as HTMLDivElement;
  dropdownBtnLabel.innerHTML = `Game ${gameBoards[0].gameId}`;

  const dropdownBtnPoints = $dropdownBtn.querySelector('.dropdown-btn-item.points') as HTMLDivElement;
  dropdownBtnPoints.innerHTML = `Points: -`;
  // add eventlistener to toggle dropdown menu
  // TODO only make active dropdown when not a survey
  $dropdownBtn.addEventListener('click', (event) => {
    $dropdownMenu.classList.toggle('display-none');
  });

  // show dorpdown arrow
  const dropdownArrow = $dropdownBtn.querySelector('.dropdown-btn-item.arrow') as HTMLDivElement;
  dropdownArrow.classList.remove('display-none');

  // add games to dropdown content
  const dropdownContent = $dropdownMenu.querySelector('.dropdown-content') as HTMLDivElement;
  if(dropdownContent) {
    const fragmentContent = new DocumentFragment();
    // go through all the game boards
    for(const gbd of gameBoards) {
      // TODO check if games in local/session storage
      const ddItem = document.createElement('div');
      ddItem.classList.add('dropdown-menu-item');
      fragmentContent.append(ddItem)
      ddItem.dataset.gameId = `${gbd.gameId}`; //data-game-id
      ddItem.dataset.score = '-1';
      // add eventlistenter to change game
      ddItem.addEventListener('click',(event) => {
        // const elem = event.target;
        const elemGameId = ddItem.dataset.gameId;
        const currGameId = divMain.dataset.gameId;
        $dropdownMenu.classList.add('display-none');
        // TODO only change game when not survey or all 3 games are played
        if(hasMiniSurveyReq) {
          if(elemGameId === currGameId) {
            // $dropdownMenu.classList.add('display-none');
            console.warn('same Game: ', {currGameId, elemGameId});
          } else {
            // $dropdownMenu.classList.add('display-none');
            console.warn('change Game: ', {currGameId, elemGameId});
            updateGameBoard(Number(elemGameId));
          }
        }
      })

      // create the elements for in menu item 
      const contentLabels = ['label', 'reward','points'];
      for(const cl of contentLabels){
        const ddItemContent = document.createElement('div');
        ddItemContent.classList.add('item-content',cl);
        // label
        if(cl==='label') {
          ddItemContent.innerHTML = `Game ${gbd.gameId}`;
        }
        // reward
        if(cl==='reward') {
          const imgReward = document.createElement('img');
          imgReward.classList.add('img-reward');
          ddItemContent.append(imgReward);
        }
        // points
        if(cl==='points') {
          ddItemContent.innerHTML = `Points: -`;
        }
        // TODO check storage if not survey for game states (points/rewards)
        ddItem.append(ddItemContent);
      }
    }
    dropdownContent.append(fragmentContent)
  }
}


function updateGameBoard(gameId: number) {
  const newGameBoardDescr = gameBoardDescr.filter((elem) => elem.gameId === gameId);
  if(newGameBoardDescr.length === 1) {
    // update navigation game dropwown button
    // get reward and points from dropdown menu item
    const menuItem = $nav.querySelector(`.dropdown-menu-item[data-game-id="${gameId}"]`) as HTMLDivElement;
    const menuItemReward = menuItem.querySelector('.reward');
    const imgMenuItemRewar = menuItemReward.querySelector('.img-reward') as HTMLImageElement;
    const menuItemPoints = menuItem.querySelector('.points');

    // dropdown button
    const dropdownBtn = $nav.querySelector('.dropdown-btn') as HTMLDivElement;
    // update button label
    const dropdownBtnLabel = dropdownBtn.querySelector('.dropdown-btn-item.label') as HTMLDivElement;
    dropdownBtnLabel.innerHTML = `Game ${gameId}`;
    // update button reward
    const dropdownBtnReward = dropdownBtn.querySelector('.dropdown-btn-item.reward') as HTMLDivElement;
    const imgBtn = dropdownBtnReward.querySelector('.img-reward') as HTMLImageElement;
    imgBtn.src = imgMenuItemRewar.src;
    // update button points
    const dropdownBtnPoints = dropdownBtn.querySelector('.dropdown-btn-item.points') as HTMLDivElement;
    dropdownBtnPoints.innerHTML = menuItemPoints.innerHTML;

    // change game board
    const selectGameBoardDescr = newGameBoardDescr[0];
    // console.info('change GameBoard to: ', selectGameBoardDescr);
    currentGame = new GameBoard($main, selectGameBoardDescr);
  }
}





function addModalsAndFunctionality(isSurvey: boolean) {
  const divHelpModal = addHelpModalFunctionality();
  const divGameWinModal = addGameWinModalFunctionality();
  const divGameOverModal = addGameOverModalFunctionality();

  // --- NAVBAR CLOSE --
  $nav.addEventListener('click', (event) => {
    divHelpModal.classList.remove('is-active');
    divGameWinModal.classList.remove('is-active');
    divGameOverModal.classList.remove('is-active');
  });
}

function addHelpModalFunctionality(): HTMLDivElement {
  // create template element to convert string into DOM element structure
  const templateHelp = document.createElement('template');
  // remove start and end whitespaces
  const trimHelpModal = helpModal.trim(); 
  // create DOM element structure
  templateHelp.innerHTML = trimHelpModal;
  
  // get template content as DocumentFragment
  // with a DocumentFragment different elements can be accessed and modified
  const fragHelp = templateHelp.content;
  // get help modal
  const divHelpModal = fragHelp.querySelector('.modal-help') as HTMLDivElement;
  const modalHelpContent: HTMLDivElement = divHelpModal.querySelector('.modal-content');
  // make initial state of help modal active
  divHelpModal.classList.add('is-active');

  // --- Functionality
  // -- Navigation with content menu
  // add scrolling to modal text
  const modalHelpRef = divHelpModal.querySelector('.modal-content-reference');
  const refLinks: HTMLDivElement[] = Array.from(modalHelpRef.querySelectorAll('.reference'))
  const modalHelpContentText = divHelpModal.querySelector('.modal-content-text');
  for(const ref of refLinks) {
    ref.addEventListener('click', (event) => {
      event.stopPropagation();
      const elemIdShow = ref.dataset.contentId;
      const elem = modalHelpContentText.querySelector(`#${elemIdShow}`);
      elem.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
    });
  }

  // -- Close
  // modal-background
  const modalBackground = divHelpModal.querySelector('.modal-background');
  modalBackground.addEventListener('click', (event) => {
    divHelpModal.classList.remove('is-active');
  });

  // button close-x
  const btnCross = divHelpModal.querySelector('.btn-cross');
  btnCross.addEventListener('click', (event) => {
    divHelpModal.classList.remove('is-active');
  });

  // button close
  const btnClose = divHelpModal.querySelector('.btn-close');
  btnClose.addEventListener('click', (event) => {
    divHelpModal.classList.remove('is-active');
  });
  
  // add DocumentFragment to body
  document.body.append(templateHelp.content);
  // scroll to the top
  modalHelpContent.scrollTop = 0;

  
  // add dataset to help modal
  addDatasetTableToHelpModal();


  return divHelpModal;
}

function addDatasetTableToHelpModal() {
  const data = aqFullDataset.objects()
  // const fragTable = new DocumentFragment;
  const divDataset = document.createElement('div');
  divDataset.classList.add('dataset');
  const tableData = document.createElement('table');
  tableData.classList.add('table-data');
  divDataset.append(tableData);
  // get data properties
  const propNames = Object.getOwnPropertyNames(data[0]);
  
  // add table head
  const tableHead = document.createElement('thead');
  tableData.append(tableHead);
  
  // add table header cells
  const rowHeader = document.createElement('tr');
  tableHead.append(rowHeader);
  for(const pn of propNames){
    const cell = document.createElement('th');
    rowHeader.append(cell);
    cell.innerText = `${pn}`;
  }
  
  // add table body
  const tableBody = document.createElement('tbody');
  tableData.append(tableBody);
  
  // add table data rows
  for(const row of data){
    const rowElem = document.createElement('tr');
    tableBody.append(rowElem);
  
    for(const p of propNames) {
      const cell = document.createElement('td');
      rowElem.append(cell);
      cell.innerText = `${row[p]}`;
    }
  }
  
  // get help modal
  const modalHelp = document.body.querySelector('.modal.modal-help');
  const modalHelpContent = modalHelp.querySelector('.modal-content-text');
  modalHelpContent.append(divDataset);
}


function addGameWinModalFunctionality(): HTMLDivElement {
  return addGameResultModalFunctionality(gameWinModal, 'modal-game-win');
}

function addGameOverModalFunctionality(): HTMLDivElement {
  return addGameResultModalFunctionality(gameOverModal, 'modal-game-over');
}

function addGameResultModalFunctionality(modalContent: string, modalClass: string): HTMLDivElement {
   // create template element to convert string into DOM element structure
   const templateGameResult = document.createElement('template');
   // remove start and end whitespaces
   const trimGameResultModal = modalContent.trim();
   // create DOM element structure
   templateGameResult.innerHTML = trimGameResultModal;
 
   // get template content as DocumentFragment
   // with a DocumentFragment different elements can be accessed and modified
   const fragGameResult = templateGameResult.content;
 
   // get game result modal
   const divGameResultModal = fragGameResult.querySelector(`.${modalClass}`) as HTMLDivElement;
 
   // --- Functionality
   // modal-background
   const modalBackgroundGR = divGameResultModal.querySelector('.modal-background');
   modalBackgroundGR.addEventListener('click', (event) => {
     divGameResultModal.classList.remove('is-active');
   });
 
   // button close-x
   const btnCrossGR = divGameResultModal.querySelector('.btn-cross');
   btnCrossGR.addEventListener('click', (event) => {
     divGameResultModal.classList.remove('is-active');
   });
 
   // button close
   const btnCloseGR = divGameResultModal.querySelector('.btn-close');
   btnCloseGR.addEventListener('click', (event) => {
     divGameResultModal.classList.remove('is-active');
   });
 
   // button retry
   const btnRetry = divGameResultModal.querySelector('.btn-retry');
   btnRetry.addEventListener('click', (event) => {
     divGameResultModal.classList.remove('is-active');
     restartGame();
   });
 
   // button next game
   const btnNext = divGameResultModal.querySelector('.btn-next');
   btnNext.addEventListener('click', (event) => {
     divGameResultModal.classList.remove('is-active');
     nextGame();
   });
   
   // add DocumentFragment to body
   document.body.append(fragGameResult);

   return divGameResultModal;
}

function restartGame() {
  const gameId = Number($main.dataset.gameId);
  // get the right game board description
  const gameBoardsDescr = gameBoardDescr.filter((elem) => elem.gameId === gameId);
  if(hasMiniSurveyReq) {
    updateGameBoard(gameId);
  }
}

function nextGame() {
  const gameId = Number($main.dataset.gameId);
  const nextGameId = (gameId % 3) + 1; 
}

// ***** Datasets without arquero *****
// rename json array property
// TODO remove arquero
// TODO use top-level await for data loading
// interface jsonDataCar {
//   Name: string;
//   Miles_per_Gallon: number;
//   Cylinders: number;
//   Displacement: number;
//   Horsepower: number;
//   Weight_in_lbs: number;
//   Acceleration: number;
//   Year: string;
//   Origin: string;
// };

// export interface IDataCar {
//   Name: string;
//   'Miles per gallon': number;
//   Cylinders: number;
//   Displacement: number;
//   Horsepower: number;
//   'Weight in lbs': number;
//   Acceleration: number;
//   Year: string;
//   Origin: string;
// };
// // const allOriginalCarsObj: dataCar[] = jsonAllCars;
// const allOriginalCars = getDataCars();
// console.log("🚀 ~ file: index.ts:140 ~ allOriginalCars", allOriginalCars);
// // const sampOriginalCarsObj: dataCar[] = jsonSampledCars;
// const sampOriginalCars = getSampledDataCars();
// console.log("🚀 ~ file: index.ts:143 ~ sampOriginalCars", sampOriginalCars);

// const propNames = Object.getOwnPropertyNames(allOriginalCars[0]);
// console.log("🚀 ~ file: index.ts:126 ~ propNames", propNames)
// const propNiceNames = propNames.map((elem) => {return {propName: elem, propNiceName: niceName(elem)}});
// console.log("🚀 ~ file: index.ts:127 ~ propNiceNames", propNiceNames)
// export const allCars = allOriginalCars.map((item) => {
//   const renamedItem: IDataCar = {
//     Name: '',
//     'Miles per gallon': 0,
//     Cylinders: 0,
//     Displacement: 0,
//     Horsepower: 0,
//     'Weight in lbs': 0,
//     Acceleration: 0,
//     Year: '',
//     Origin: ''
//   };
//   for(const pnn of propNiceNames) {
//     renamedItem[pnn.propNiceName] = item[pnn.propName];
//   }
//   return renamedItem;
// });
// console.log("🚀 ~ file: index.ts:164 ~ allCars ~ allCars", allCars);
// export const sampledCars = sampOriginalCars.map((item) => {
//   const renamedItem: IDataCar = {
//     Name: '',
//     'Miles per gallon': 0,
//     Cylinders: 0,
//     Displacement: 0,
//     Horsepower: 0,
//     'Weight in lbs': 0,
//     Acceleration: 0,
//     Year: '',
//     Origin: ''
//   };
//   for(const pnn of propNiceNames) {
//     renamedItem[pnn.propNiceName] = item[pnn.propName];
//   }
//   return renamedItem;
// });
// console.log("🚀 ~ file: index.ts:158 ~ sampledCars ~ sampledCars", sampledCars);
// *******************