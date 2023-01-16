import './style.scss'; // import styles as described https://github.com/webpack-contrib/sass-loader
import * as aq from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
import { getDataCars, getSampledDataCars } from './dataCars';
import { getGameBoardDescriptions } from './Game';
import { GameBoard, IGameBoardDescription } from './GameBoard';
import { actionsScatter, Scatterplot } from './Scatterplot';
import { getColumnTypesFromArqueroTable, getDateParts, niceName } from './util';
import { VisType } from './visualizations';

var TITLE = 'Iguanodon'
document.title = TITLE;

// document.getElementById('app-header').textContent = TITLE;
// console.log('Hello World');
// const visualizations: VisualizationBase[] = [];
// setupSidebarMenu(); //HACK

export let userId =  null;
export let isSurvey: boolean = false;
// URL parameters
const queryString = window.location.search;
// console.log('queryString:', queryString);

const urlParams = new URLSearchParams(queryString);
// check if url parameter exists
// console.log('has id: ',urlParams.has('id'));

// get id
const urlId = urlParams.get('id');
// console.log('id: ', urlId);

if(urlParams.has('id')) {
  userId = urlParams.get('id');
}

if(urlParams.has('type')) {
  const type = urlParams.get('type');
  isSurvey = type === 'survey';
}

const dateParts = getDateParts(new Date());
// console.log("🚀 ~ file: index.ts ~ line 46 ~ dateParts", dateParts)
const code =`537${dateParts.labels.day}${dateParts.labels.month}${dateParts.labels.hour}${dateParts.labels.minutes}${dateParts.labels.seconds}${dateParts.labels.milliseconds}`;
// console.log("🚀 ~ file: index.ts ~ line 47 ~ code", code)

if(isSurvey) {
  // set user id code
  userId = Number(code);
}
console.log("🚀 ~ file: index.ts:51 ~ isSurvey", isSurvey);



// get all relevant HTML DOM elements
// header
// const $header = document.getElementById('header') as HTMLDivElement;
// nav
// const $nav = document.getElementById('nav') as HTMLDivElement;
export const $nav = document.querySelector('nav.navbar') as HTMLDivElement;
// $nav.classList.remove('hide');

// set vds lab logo
// const logo = $nav.querySelector('.logo') as HTMLImageElement;
// logo.src = 

// nav -> help
const navHelp = $nav.querySelector('.nav-help') as HTMLDivElement;
navHelp.addEventListener('click', (event) => {
  const elem = event.target as HTMLElement;
  // elem.classList.toggle('active');
  const modalHelp = document.body.querySelector('#modal-help');
  modalHelp.classList.add('show-modal');
}); 


// main
const $main = document.getElementById('main') as HTMLDivElement;

// create modals
createHelpModal();
createGameEndModal();

// TODO after page load read JSON file


// const visPipeline = document.getElementById('vis-pipeline') as HTMLDivElement;
// const visStrip = document.getElementById('vis-strip') as HTMLDivElement;
// const scoreStrip = document.getElementById('score-strip') as HTMLDivElement;
// const detailsStrip = document.getElementById('details-strip') as HTMLDivElement;
// const visMutli = document.getElementById('vis-multiples') as HTMLDivElement;
// const objectivesCntr = document.getElementById('objectives') as HTMLDivElement;

// variable for Free mode vs explanatory mode
// let isFreeMode = false;

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


export const fullDataset: {data: ColumnTable, allItems: number, notNullItems: number} = {
  data: aq.from(datasetAllItems),
  allItems: datasetAllItems.length,
  notNullItems: null};

export const sampledDataset: {data: ColumnTable, allItems: number, notNullItems: number} = {
  data: aq.from(datasetSampledItems),
  allItems: datasetSampledItems.length,
  notNullItems: null};
// *******************


// *********************************************++
// get danfo dataframe
// let dfDataset = new dfd.DataFrame(fullDataset);
// dfDataset.print();
// const [dataRows, dataCols] = dfDataset.shape;
// console.log('data size: ', {dataRows, dataCols});
// console.log('data types: ', dfDataset.ctypes.print());
// const colNamesNew = dfDataset.columns;
// console.log('data column names: ', colNamesNew);

// const colNiceNamesObj = {};
// colNamesNew.forEach(element => {
//   colNiceNamesObj[''+element] = niceName(element);
// });
// console.log('new column names: ', colNiceNamesObj);
// dfDataset = dfDataset.rename(colNiceNamesObj);
// console.log('new data column names: ', dfDataset.columns);
// *********************************************++


// <div class="navbar-item nav-game">
//           <div class="dropdown">
//             <div class="dropdown-btn">
//               <div class="dropdown-btn-label"></div>
//               <div class="dropdown-btn-icon"></div>
//             </div>
//             <div class="dropdown-menu">
//               <div class="dropdown-content">
//                 <div class="dropdown-menu-item"></div>
//                 <div class="dropdown-menu-item"></div>
//               </div>
//             </div>
//           </div>
//         </div>


// get game board descriptions (games + attempts) 
const gameBoardDescr = getGameBoardDescriptions();

// Set start game -> Game 1
const startGame = gameBoardDescr[0];

// setup dropdown functionality
addDropdownFunctionality($main, gameBoardDescr, startGame.gameId);


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
      ddItem.dataset.score = '0';
      // add eventlistenter to change game
      ddItem.addEventListener('click',(event) => {
        // const elem = event.target;
        const elemGameId = ddItem.dataset.gameId;
        const currGameId = divMain.dataset.gameId;
        // TODO only change game when not survey
        if(elemGameId === currGameId) {
          $dropdownMenu.classList.add('display-none');
          console.warn('same Game: ', {currGameId, elemGameId});
        } else {
          $dropdownMenu.classList.add('display-none');
          console.warn('change Game: ', {currGameId, elemGameId});
          updateGameBoard(Number(elemGameId));
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
/*
  Games
  - id
  - visualization
  - usable actions
  - start config
  - solution visualization
  - number of atttempts ?
*/


/*
  GAME 1
  - id: 1
  - visualization: scatterplot
  - usable actions:
    - decrease mark size
    - add background color
    - lighten grid lines
    - use horizontal text
    - write abbreviations out
  - start config  
  - solution  
*/
/*
// GAME 1
// scatterplot
const scatter1 = new Scatterplot(aqFullDataset,aqSampledDataset, 'Horsepower', 'Miles per gallon', null);
// const scatter = new Scatterplot(aqFullDataset,aqSampledDataset, 'Horsepower', 'Miles per gallon', null);

// usable actions
const usableActions1 = [
  actionsScatter.DecreaseMarkSize,
  actionsScatter.AddBackgroundColor,
  actionsScatter.LightenGridLines,
  actionsScatter.HorizontalTextForAxis,
  actionsScatter.WriteAbbreviationsOut
];

scatter1.setUsableActions(usableActions1);
console.log('scatter1 actions: ', scatter1.actions);

const solutionActions1 = [
  { id: actionsScatter.DecreaseMarkSize, value: true },
  { id: actionsScatter.AddBackgroundColor, value: false },
  { id: actionsScatter.LightenGridLines, value: true },
  { id: actionsScatter.HorizontalTextForAxis, value: true },
  { id: actionsScatter.WriteAbbreviationsOut, value: true }
];

// console.log('usableActions enum: ', usableActions1);
// const usableActionsString = usableActions1.map((elem) => elem.toString());
// console.log('usableActions string: ', usableActionsString);


const solution1 = scatter1.getCopyofVisualization()
solution1.setMutlipleActions(solutionActions1);
// game config
const game1Descr: IGameBoardDescription = {
  gameId: 1,
  // usableActions: usableActions1,
  // visType: VisType.Scatter,
  startVisualization: scatter1,
  // initalState
  solutionVisualization: solution1,
  attempts: 10
}


// GAME 2
// scatterplot
const scatter2 = new Scatterplot(aqFullDataset,aqSampledDataset, 'Horsepower', 'Miles per gallon', 'Origin');
// const scatter = new Scatterplot(aqFullDataset,aqSampledDataset, 'Horsepower', 'Miles per gallon', null);

// usable actions
const usableActions2 = [
  actionsScatter.DecreaseMarkSize,
  actionsScatter.ChangeMarkToRing,
  actionsScatter.AddBackgroundColor,
  actionsScatter.LightenGridLines,
  actionsScatter.HorizontalTextForAxis,
  actionsScatter.AddLegend,
  actionsScatter.ApplyNominalColors,
  actionsScatter.AddLegendBorder,
];

scatter2.setUsableActions(usableActions2);

const solutionActions2 = [
  { id: actionsScatter.DecreaseMarkSize, value: false },
  { id: actionsScatter.ChangeMarkToRing, value: true },
  { id: actionsScatter.AddBackgroundColor, value: false },
  { id: actionsScatter.LightenGridLines, value: true },
  { id: actionsScatter.HorizontalTextForAxis, value: true },
  { id: actionsScatter.AddLegend, value: true },
  { id: actionsScatter.ApplyNominalColors, value: true },
  { id: actionsScatter.AddLegendBorder, value: false }
];

const solution2 = scatter2.getCopyofVisualization()
solution2.setMutlipleActions(solutionActions2);
// game config
const game2Descr: IGameBoardDescription = {
  gameId: 2,
  // usableActions: usableActions2,
  // visType: VisType.Scatter,
  startVisualization: scatter2,
  // initalState
  solutionVisualization: solution2,
  attempts: 10
}

// GAME 2
// scatterplot
// const scatter2 = new Scatterplot(aqFullDataset, aqSampledDataset, 'Weight in lbs', 'Acceleration',null);

// const solutionActions2 = [
//   { id: "sample_data", value: false },
//   { id: "aggregate", value: false },
//   { id: "lower_opacity", value: true },
//   { id: "decrease_size", value: false },
//   { id: "x_axis_zero", value: true },
//   { id: "y_axis_zero", value: true },
//   { id: "background_color", value: false }
// ]

// const solution2 = scatter2.getCopyofVisualization()
// solution2.setMutlipleActions(solutionActions2);
// // game config
// const gameDescr2: IGameDescription = {
//   gameId: 2,
//   // dataset
//   // sampled dataset
//   // vistype
//   // encodings
//   // initalState
//   visualization: scatter2,
//   solution: solution2
// }


// GAME 3
// scatterplot
const scatter3 = new Scatterplot(aqFullDataset,aqSampledDataset, 'Horsepower', 'Miles per gallon', 'Origin');
// const scatter = new Scatterplot(aqFullDataset,aqSampledDataset, 'Horsepower', 'Miles per gallon', null);

// usable actions
const usableActions3 = [
  actionsScatter.SampleData,
  actionsScatter.DecreaseMarkSize,
  actionsScatter.DecreaseMarkOpacity,
  actionsScatter.ChangeMarkToRing,
  actionsScatter.AggregateDataPoints,
  actionsScatter.AddBackgroundColor,
  actionsScatter.LightenGridLines,
  actionsScatter.HorizontalTextForAxis,
  actionsScatter.WriteAbbreviationsOut,
  actionsScatter.AddLegend,
  actionsScatter.ApplyNominalColors,
  actionsScatter.AddLegendBorder,
  actionsScatter.AddLegendTitle,
];

scatter3.setUsableActions(usableActions3);

const solutionActions3 = [
  { id: actionsScatter.SampleData, value: false },
  { id: actionsScatter.DecreaseMarkSize, value: false },
  { id: actionsScatter.DecreaseMarkOpacity, value: true },
  { id: actionsScatter.ChangeMarkToRing, value: false },
  { id: actionsScatter.AggregateDataPoints, value: false },
  { id: actionsScatter.AddBackgroundColor, value: false },
  { id: actionsScatter.LightenGridLines, value: true },
  { id: actionsScatter.HorizontalTextForAxis, value: true },
  { id: actionsScatter.WriteAbbreviationsOut, value: true },
  { id: actionsScatter.AddLegend, value: true },
  { id: actionsScatter.ApplyNominalColors, value: true },
  { id: actionsScatter.AddLegendBorder, value: false },
  { id: actionsScatter.AddLegendTitle, value: true }
];

const solution3 = scatter3.getCopyofVisualization()
solution3.setMutlipleActions(solutionActions3);
// game config
const game3Descr: IGameBoardDescription = {
  gameId: 3,
  // usableActions: usableActions3,
  // visType: VisType.Scatter,
  startVisualization: scatter3,
  // initalState
  solutionVisualization: solution3,
  attempts: 10
}*/

// HACK
// // new game
// let currGameId = game1Descr.gameId;
// // let currGame = new Game($main, gameDescr, aqDataset, false);
// let currentGame = new GameBoard($main, game1Descr);
// $main.dataset.gameId = `${currGameId}`;

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

// nav -> next
// const navNext = $nav.querySelector('.nav-next') as HTMLDivElement;
// navNext.addEventListener('click', (event) => {
//   const elem = event.target as HTMLElement;
//   // elem.classList.toggle('active');
//   // const gameId = $main.dataset.gameId;
//   //TODO retry game
//   console.log('old game: ', currGameId);
//   // new Game($main, gameDescr, aqDataset, false);
//   nextGame();
// }); 


function createHelpModal() {
  const modalHelp = document.createElement('div');
  modalHelp.id = 'modal-help';
  modalHelp.style.display = 'none';
  document.body.appendChild(modalHelp);
  modalHelp.classList.add('show-modal');

  // button close-x
  const btnCross = document.createElement('div');
  btnCross.innerHTML = '&times;';
  btnCross.classList.add('modal-btn','btn-cross');
  modalHelp.addEventListener('click', (event) => {
    modalHelp.classList.remove('show-modal');
  })
  modalHelp.appendChild(btnCross);

  // TODO add HELP content
  // content area
  const contentArea = document.createElement('div');
  contentArea.classList.add('content-area');
  modalHelp.appendChild(contentArea);

  // pHead - heading
  const pHead = document.createElement('p');
  pHead.classList.add('modal-heading');
  pHead.innerText = 'HELP';
  contentArea.appendChild(pHead);

  // p1 - goal
  const p1 = document.createElement('p');
  p1.innerText = 'The goal of this game is to fulfill all objectives for one visualization by applying the right actions.';
  contentArea.appendChild(p1);

  // p2 - parts
  const p2 = document.createElement('p');
  p2.innerText = `The top half shows you the visualizations and the botton half the actions and objectives.

  Visualizations: 
  The visualization of the current attempt will be displayed, as well as the previous one or the solution.
  
  Actions: 
  Allow you to change the configuration of the visualization and will be used to check the correctness of objective.
  
  Objectives:
  Indicate the objectives of the visualization of each attempt, there are three different states:
  - green: objective is fulfilled
  - orange: objective is partially fulfilled
  - red: objective is unfulfilled`;
  contentArea.appendChild(p2);

  // p3 - steps
  const p3 = document.createElement('p');
  p3.innerText = `The gameplay consits of following steps:
  - Change the current visualization by toggeling the corresponding action with their buttons. You can change as may actions you like until you think that the current configuration would fulfill all the objectives.
  - Click the 'Confirm' button to check the state of the objectives. This will color the objectives based on their correctness. 
  - If you didn't fulfill all objectives, you can try again to change the action in the a new attempt.`;
  contentArea.appendChild(p3);

  // p4 - win
  const p4 = document.createElement('p');
  p4.innerText = `You win the game if you correctly apply the actions and fulfill all objectives within the given attempts.`;
  contentArea.appendChild(p4);


  // button area
  const btnArea = document.createElement('div');
  btnArea.classList.add('btn-area');
  modalHelp.appendChild(btnArea);

  // button close
  const btnClose = document.createElement('div');
  btnClose.innerHTML = 'Close';
  btnClose.classList.add('modal-btn','btn-close')
  btnClose.addEventListener('click', (event) => {
    modalHelp.classList.remove('show-modal');
  })
  btnArea.appendChild(btnClose);
}

function createGameEndModal() {
  const modalGameEnd = document.createElement('div');
  modalGameEnd.id = 'modal-game-end';
  modalGameEnd.style.display = 'none';
  document.body.appendChild(modalGameEnd);

  // button close-x
  const btnCross = document.createElement('div');
  btnCross.innerHTML = '&times;';
  btnCross.classList.add('modal-btn','btn-cross');
  btnCross.addEventListener('click', (event) => {
    modalGameEnd.classList.remove('show-modal');
  })
  modalGameEnd.appendChild(btnCross);

  // TODO add GAME END content
  // content area
  const contentArea = document.createElement('div');
  contentArea.classList.add('content-area');
  modalGameEnd.appendChild(contentArea);

  // game win content
  const contentWin = document.createElement('div');
  contentWin.classList.add('content-win','display-none');
  contentArea.appendChild(contentWin);

  // pHeadWin - heading
  const pHeadWin = document.createElement('p');
  pHeadWin.classList.add('modal-heading');
  pHeadWin.innerText = 'YOU WIN!';
  contentWin.appendChild(pHeadWin);

  // p1Win - message
  const p1Win = document.createElement('p');
  p1Win.innerText = `Congratulation on your accomplishment!
  You can try again or try another game.`;
  contentWin.appendChild(p1Win);

  // game lose content
  const contentLose = document.createElement('div');
  contentLose.classList.add('content-lose','display-none');
  contentArea.appendChild(contentLose);

  // pHeadLose - heading
  const pHeadLose = document.createElement('p');
  pHeadLose.classList.add('modal-heading');
  pHeadLose.innerText = 'YOU LOSE!';
  contentLose.appendChild(pHeadLose);

  // p1Lose - message
  const p1Lose = document.createElement('p');
  p1Lose.innerText = `It's just a game. Sometimes you win, sometimes you lose.
  You can try again or try another game.`;
  contentLose.appendChild(p1Lose);

  // button area
  const btnArea = document.createElement('div');
  btnArea.classList.add('btn-area');
  modalGameEnd.appendChild(btnArea);

  // button retry
  const btnRetry = document.createElement('div');
  btnRetry.innerHTML = '&#10226;  Retry';
  btnRetry.classList.add('modal-btn','btn-retry')
  btnRetry.addEventListener('click', (event) => {
    modalGameEnd.classList.remove('show-modal');
    // TODO restart game
    // TODO save track data
    // new Game($main, gameDescr, aqDataset, false);
    restartGame();
  })
  btnArea.appendChild(btnRetry);


  // button next
  const btnNext = document.createElement('div');
  btnNext.innerHTML = '&#10132; Next game';
  btnNext.classList.add('modal-btn','btn-next')
  btnNext.addEventListener('click', (event) => {
    modalGameEnd.classList.remove('show-modal');
    // TODO start different game
    // TODO save track data
    nextGame();
  })
  btnArea.appendChild(btnNext);
}

function restartGame() {
  const gameId = Number($main.dataset.gameId);
  // get the right game board description
  const gameBoardsDescr = gameBoardDescr.filter((elem) => elem.gameId === gameId);
  updateGameBoard(gameId);
  // if(gameBoardsDescr.length === 1) {
    // const gbd = gameBoardsDescr[0];
    // currentGame = new GameBoard($main, gbd);
  // }

  // if(gameId === game1Descr.gameId) {
  //   currentGame = new GameBoard($main, game1Descr);
  //   currGameId = game1Descr.gameId;
  //   $main.dataset.gameId = `${currGameId}`;
  // } else if (gameId === game2Descr.gameId) {
  //   currentGame = new GameBoard($main, game2Descr);
  //   currGameId = game2Descr.gameId;
  //   $main.dataset.gameId = `${currGameId}`;
  // } else {
  //   currentGame = new GameBoard($main, game3Descr);
  //   currGameId = game3Descr.gameId;
  //   $main.dataset.gameId = `${currGameId}`;
  // }
}

function nextGame() {
  const gameId = Number($main.dataset.gameId);
  const nextGameId = (gameId % 3) + 1; 
  updateGameBoard(nextGameId);

  // if(gameId === game1Descr.gameId) {
  //   currentGame = new GameBoard($main, game2Descr);
  //   currGameId = game2Descr.gameId;
  //   $main.dataset.gameId = `${currGameId}`;
  // } else if(gameId === game2Descr.gameId) {
  //   currentGame = new GameBoard($main, game3Descr);
  //   currGameId = game3Descr.gameId;
  //   $main.dataset.gameId = `${currGameId}`;
  // } else {
  //   currentGame = new GameBoard($main, game1Descr);
  //   currGameId = game1Descr.gameId;
  //   $main.dataset.gameId = `${currGameId}`;
  // }
}

// --------- OLD CODE: BEGIN ---------
// const testInvestigation = new Investigation($main, isFreeMode, aqDataset);

// function clearInvestigation() {
//   $main.replaceChildren();
//   const investigationTwo = new Investigation($main, isFreeMode, aqDataset);
// }

// function clearSelectedVisualization() {
//   // clear endcoding selections
//   const sidebar = document.getElementById('sidebar') as HTMLDivElement;
//   const sidebarEncoding = document.getElementById('sidebar-encoding-cntr') as HTMLDivElement;
//   if (sidebar && sidebarEncoding) {
//     sidebar.removeChild(sidebarEncoding);
//   }

//   clearStripElements();
// }

// function clearStripElements() {
//   // clear Visualization pipeline
//   visPipeline.innerHTML = '';

//   // clear small Multiples
//   visMutli.innerHTML = '';

//   // clear list of objectives
//   objectivesCntr.innerHTML = '';

//   // clear all strip parts
//   // vis strip -> all vis-item but id=hover-preview
//   const visItemsElem = Array.from(visStrip.querySelectorAll(':not(#hover-preview).vis-item'));
//   for (const ch of visItemsElem) {
//     visStrip.removeChild(ch);
//   }

//   // score strip -> all score-item but id=score-preview
//   const scoreItemsElem = Array.from(scoreStrip.querySelectorAll(':not(#score-preview).score-item'));
//   for (const ch of scoreItemsElem) {
//     scoreStrip.removeChild(ch);
//   }

//   // details strip -> all detail-item (checkboxes) but id=detail-preview
//   const detailItemsElem = Array.from(detailsStrip.querySelectorAll(':not(#detail-preview).detail-item'));
//   for (const ch of detailItemsElem) {
//     detailsStrip.removeChild(ch);
//   }
//   // svg line: details strip -> objetive-indicator-svg -> svg: svg-objective -> line
//   const detailSVGCntr = detailsStrip.querySelector('#svg-objective');
//   console.log('svg: ', detailSVGCntr);
//   // const detailSVGLines = Array.from(detailSVGCntr.querySelectorAll('line'));
//   const detailSVGLines = Array.from(detailSVGCntr.children);
//   for (const ch of detailSVGLines) {
//     detailSVGCntr.removeChild(ch);
//   }

//   // objective label: details strip -> objetive-indicator-html -> wrapper-idicator-html -> objective-detail-info
//   const detailHTMLCntr = detailsStrip.querySelector('#wrapper-indicator-html');
//   const detailHTMLInfos = Array.from(detailHTMLCntr.querySelectorAll('.objective-detail-info'));
//   for (const ch of detailHTMLInfos) {
//     detailHTMLCntr.removeChild(ch);
//   }

// }


// function addEncondingSelections(visType: VisType) {
//   const sidebar = document.getElementById('sidebar') as HTMLDivElement;
//   const selectionCntr = document.createElement('div');
//   selectionCntr.id = 'sidebar-encoding-cntr';
//   selectionCntr.dataset.visType = '' + visType;
//   sidebar.appendChild(selectionCntr);

//   if (visType === VisType.Scatter) {
//     const dataset = getDataCars();
//     const aqDataset = aq.from(dataset);
//     const dataAttrTypes = getColumnTypesFromArqueroTable(aqDataset);
//     // remove PK column -> name
//     const availAttrTypes = dataAttrTypes.filter((elem) => elem.label !== 'Name');
//     console.log('colTypesTable: ', dataAttrTypes);
//     const numAttr = availAttrTypes.filter((elem) => elem.type === 'continuous');
//     // const catAttr = dataAttrTypes.filter((elem) => elem.type === 'categorical');

//     // add x encoding
//     const xEncoding = createSelectWithLabel('x-Axis', visType, numAttr)
//     selectionCntr.appendChild(xEncoding)
//     // add y encoding
//     const yEncoding = createSelectWithLabel('y-Axis', visType, numAttr)
//     selectionCntr.appendChild(yEncoding)
//     // add color encoding
//     // TODO remove name categorical attribute
//     const colorEncoding = createSelectWithLabel('Color', visType, availAttrTypes)
//     selectionCntr.appendChild(colorEncoding)


//   } else if (visType === VisType.Line) {

//     // // add x encoding
//     // const xEncoding = createSelectWithLabel('x-Axis', visType, numAttr)
//     // selectionCntr.appendChild(xEncoding)
//     // // add y encoding
//     // const yEncoding = createSelectWithLabel('y-Axis', visType, numAttr)
//     // selectionCntr.appendChild(yEncoding)
//     // // add color encoding
//     // const colorEncoding = createSelectWithLabel('Color', visType, numAttr)
//     // selectionCntr.appendChild(colorEncoding)

//   } else if (visType === VisType.Bar) {

//     // // add x encoding
//     // const xEncoding = createSelectWithLabel('x-Axis', visType, numAttr)
//     // selectionCntr.appendChild(xEncoding)
//     // // add y encoding
//     // const yEncoding = createSelectWithLabel('y-Axis', visType, numAttr)
//     // selectionCntr.appendChild(yEncoding)
//     // // add color encoding
//     // const colorEncoding = createSelectWithLabel('Color', visType, numAttr)
//     // selectionCntr.appendChild(colorEncoding)

//   }

//   // TODO replace the selects
//   // replaceSelectWithDivAndList();
// }



// function replaceSelectWithDivAndList() {
//   // get container with the selectes
//   const selectionCntr = document.querySelector('#sidebar-encoding-cntr') as HTMLDivElement;

//   const allSelects = selectionCntr.querySelectorAll('select');
//   allSelects.forEach((value, idx, elements) => {
//     // current select element
//     const currSelect = elements[idx];
//     // options of select
//     const children = Array.from(currSelect.children) as HTMLOptionElement[];
//     // get all options for select
//     const numbOptions = children.length;


//     // add css class to hide select
//     currSelect.classList.add('select-hidden');

//     // add div as wrapper of current select
//     const parent = currSelect.parentNode;
//     const wrapper = document.createElement('div');
//     wrapper.classList.add('select-modified');
//     // set wrapper as child (instead of select)
//     parent.replaceChild(wrapper, currSelect);
//     // add select as child of wrapper
//     wrapper.appendChild(currSelect);


//     // add div as alternative to the select 
//     const altSelect = document.createElement('div');
//     altSelect.classList.add('select-styled');
//     // set inital value to the first value of options
//     altSelect.innerHTML = children[0].text;
//     altSelect.dataset.value = children[0].value;
//     // add new div to wrapper
//     wrapper.appendChild(altSelect);



//     // TODO replace list with div and fley layout
//     // add list as alternative to the options
//     const list = document.createElement('ul');
//     list.classList.add('select-options', 'list-hidden');
//     // add list to wrapper
//     wrapper.appendChild(list);

//     // add list items to the list based on the select options
//     for (const op of children) {
//       const listElem = document.createElement('li');
//       listElem.dataset.value = op.value;
//       listElem.innerHTML = op.text;
//       list.appendChild(listElem);

//       listElem.addEventListener('click', (event) => {
//         event.stopPropagation();
//         altSelect.classList.remove('active');
//         altSelect.innerHTML = listElem.innerHTML;
//         altSelect.dataset.value = listElem.dataset.value;
//         list.classList.add('list-hidden');
//       });
//     }

//     // add event listener for the altDiv
//     altSelect.addEventListener('click', (event) => {
//       event.stopPropagation();
//       // toggle active
//       altSelect.classList.toggle('active');
//       // show list based on class
//       const isActive = altSelect.classList.contains('active');
//       list.classList.toggle('list-hidden', !isActive);

//     });

//     document.addEventListener('click', (event) => {
//       altSelect.classList.remove('active');
//       list.classList.add('list-hidden');
//     });

//   });

// }


// function createSelectWithLabel(lable: string, visType: VisType, options: { label: string }[], withEmptyOption: boolean = true): HTMLDivElement {
//   const lowCaseLabel = lable.toLowerCase();
//   // encoding div
//   const currEncoding = document.createElement('div');
//   currEncoding.classList.add('encoding');

//   // label
//   const currLabel = document.createElement('div');
//   currLabel.classList.add('label-encoding');
//   // currLabel.htmlFor = `${lowCaseLabel}-encoding`;
//   currLabel.innerHTML = lable;
//   currEncoding.appendChild(currLabel);

//   // select
//   const currSelect = document.createElement('Select');
//   currSelect.id = `${lowCaseLabel}-encoding`;
//   currSelect.classList.add('select-encoding');
//   currSelect.addEventListener('change', (event) => {
//     handleSelectChange(visType);
//   });
//   currEncoding.appendChild(currSelect);

//   // add empty option to encoding
//   if (withEmptyOption) {
//     const emptyOpt = document.createElement('option');
//     emptyOpt.value = 'null';
//     emptyOpt.innerHTML = 'None';
//     // emptyOpt.classList.add('none-opt');
//     currSelect.appendChild(emptyOpt);
//   }

//   // add options to encoding
//   for (const op of options) {
//     const currOpt = document.createElement('option');
//     currOpt.value = op.label;
//     currOpt.innerHTML = op.label;
//     currSelect.appendChild(currOpt);
//   }

//   return currEncoding;
// }

// function handleSelectChange(visType: VisType) {
//   console.log('Check me out: ', visType);
//   const sidebar = document.getElementById('sidebar') as HTMLDivElement;
//   // const selectionCntr = document.querySelector('#sidebar-encoding-cntr') as HTMLDivElement;
//   // const visType = Number(selectionCntr.dataset.visType) as VisType;

//   if (visType === VisType.Scatter) {
//     // check if x and y encoding not null
//     const xEnc = sidebar.querySelector('#x-axis-encoding') as HTMLSelectElement;
//     const valX = xEnc.value;

//     const yEnc = sidebar.querySelector('#y-axis-encoding') as HTMLSelectElement;
//     const valY = yEnc.value;

//     const colorEnc = sidebar.querySelector('#color-encoding') as HTMLSelectElement;
//     const valColor = colorEnc.value;

//     // const xEnc = sidebar.querySelector('#x-axis-encoding') as HTMLElement;
//     // const valX = xEnc.dataset.value;

//     // const yEnc = sidebar.querySelector('#y-axis-encoding') as HTMLElement;
//     // const valY = yEnc.dataset.value;

//     // const colorEnc = sidebar.querySelector('#color-encoding') as HTMLElement;
//     // const valColor = colorEnc.dataset.value;

//     console.log('selected encodings: ', { valX, valY, valColor });

//     if (valX !== 'null' && valY !== 'null') {
//       clearStripElements();
//       initScatterplot(valX, valY, valColor);
//     }


//   } else if (visType === VisType.Line) {


//   } else if (visType === VisType.Bar) {

//   }
// }

// function initScatterplot(xEnc: string, yEnc: string, colotEnc: string) {
//   const dataset = getDataCars();
//   const aqDataset = aq.from(dataset);
//   // const colNames = aqDataset.columnNames();
//   // console.log('columnNames: ', colNames);

//   // addEncondingSelections(VisType.Scatter);
//   // const colTypesTable = getColumnTypesFromArqueroTable(aqDataset);
//   // console.log('colTypesTable: ', colTypesTable);

//   const scatterplot = new Scatterplot(aqDataset, xEnc, yEnc, colotEnc);
//   console.log('Start vis: ', scatterplot);
//   const strip = new Strip(scatterplot, visStrip, visMutli);
//   // strip.addVisualization(scatterplot);
//   //TODO implement initialization of random design choices
// }

// function initLinechart() {
//   const dataset = getDataStock();
//   const aqDataset = aq.from(dataset);
//   // const colNames = aqDataset.columnNames();
//   // console.log('columnNames: ', colNames);

//   const colTypesTable = getColumnTypesFromArqueroTable(aqDataset);
//   console.log('colTypesTable: ', colTypesTable);

//   const linechart = new Linechart(aqDataset, 'date', 'price', 'symbol');
//   console.log('Start vis: ', linechart);
//   const strip = new Strip(linechart, visStrip, visMutli);
//   // strip.addVisualization(scatterplot);
//   //TODO implement initialization of random design choices
// }

// function initBarchart() {
//   const dataset = getDataCars();
//   const aqDataset = aq.from(dataset);
//   const barchart = new Barchart(aqDataset, 'date', 'price', 'symbol');
//   console.log('Start vis: ', barchart);
//   const strip = new Strip(barchart, visStrip, visMutli);
//   // strip.addVisualization(scatterplot);
//   //TODO implement initialization of random design choices
// }

// function handleVisTypeClick(type: string) {
//   clearSelectedVisualization();
//   if (type === 'scatter') {
//     console.log('Visualization type: scatter')
//     addEncondingSelections(VisType.Scatter);
//     // initScatterplot();
//   } else if (type === 'line') {
//     console.log('Visualization type: line')
//     // initLinechart();
//   } else if (type === 'bar') {
//     console.log('Visualization type: bar')
//   }
// }

// function setupSidebarMenu() {
//   // TODO add sidebar options
//   // -> start with the visualization types
//   const sidebar = document.getElementById('sidebar') as HTMLDivElement;
//   const btnCntr = document.createElement('div');
//   sidebar.appendChild(btnCntr);

//   const visBtns = [
//     { name: 'Scatterplot', type: 'scatter' },
//     { name: 'Line Chart', type: 'line' },
//     { name: 'Bar Chart', type: 'bar' },
//   ];
//   for (const elem of visBtns) {
//     const tmpBtn = document.createElement('button');
//     tmpBtn.innerHTML = elem.name;
//     tmpBtn.classList.add('btn-vis-type');
//     btnCntr.appendChild(tmpBtn);
//     tmpBtn.addEventListener('click', (event) => {
//       handleVisTypeClick(elem.type);
//     })
//   }

// }



