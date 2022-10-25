import * as aq from 'arquero';
import { Barchart } from './BarChart';
import { getDataCars } from './dataCars';
import { getDataStock } from './dataStock';
import { Game, IGameDescription } from './Game';
import { Investigation } from './Investigation';
import { Linechart } from './LineChart';
import { Scatterplot } from './Scatterplot';
import { Strip } from './Strip';
import './style.scss'; // import styles as described https://github.com/webpack-contrib/sass-loader
import { getColumnTypesFromArqueroTable, niceName } from './util';
import { VisType } from './visualizations';

var TITLE = 'Iguanodon'
document.title = TITLE;

// document.getElementById('app-header').textContent = TITLE;
// console.log('Hello World');
// const visualizations: VisualizationBase[] = [];
// setupSidebarMenu(); //HACK

// URL parameters
const queryString = window.location.search;
console.log('queryString:', queryString);

const urlParams = new URLSearchParams(queryString);
// check if url parameter exists
console.log('has id: ',urlParams.has('id'));

// get id
const urlId = urlParams.get('id')
console.log('id: ', urlId);

// get all relevant HTML DOM elements
// header
const $header = document.getElementById('header') as HTMLDivElement;
// nav
const $nav = document.getElementById('nav') as HTMLDivElement;

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


// const visPipeline = document.getElementById('vis-pipeline') as HTMLDivElement;
// const visStrip = document.getElementById('vis-strip') as HTMLDivElement;
// const scoreStrip = document.getElementById('score-strip') as HTMLDivElement;
// const detailsStrip = document.getElementById('details-strip') as HTMLDivElement;
// const visMutli = document.getElementById('vis-multiples') as HTMLDivElement;
// const objectivesCntr = document.getElementById('objectives') as HTMLDivElement;
const dataset = getDataCars();


// variable for Free mode vs explanatory mode
let isFreeMode = false;
let aqDataset = aq.from(dataset);

// get column names
const colNames = aqDataset.columnNames();
const colNiceNames = colNames.map((elem) => {return {[elem]: niceName(elem)}});
// console.log('names: ', {colNames,colNiceNames});

// rename columns
// aq.names(colNiceNames);
aqDataset = aqDataset.rename(colNiceNames);

// console.log('aqDataset',aqDataset);
// console.log('values: ',aqDataset.objects());


// GAME 1
// scatterplot
const scatter = new Scatterplot(aqDataset, 'Miles per gallon', 'Horsepower', 'Origin');

const solutionActions = [
  { id: "sample_data", value: false },
  { id: "aggregate", value: false },
  { id: "lower_opacity", value: true },
  { id: "decrease_size", value: false },
  { id: "x_axis_zero", value: true },
  { id: "y_axis_zero", value: true },
  { id: "background_color", value: false },
  { id: "legend", value: true },
  { id: "nominal_colors", value: true }
];

const solution = scatter.getCopyofVisualization()
solution.setMutlipleActions(solutionActions);
// game config
const gameDescr: IGameDescription = {
  gameId: 1,
  // dataset
  // vistype
  // encodings
  // initalState
  visualization: scatter,
  solution: solution
}


// GAME 2
// scatterplot
const scatter2 = new Scatterplot(aqDataset, 'Weight in lbs', 'Acceleration',null);

const solutionActions2 = [
  { id: "sample_data", value: false },
  { id: "aggregate", value: false },
  { id: "lower_opacity", value: true },
  { id: "decrease_size", value: false },
  { id: "x_axis_zero", value: true },
  { id: "y_axis_zero", value: true },
  { id: "background_color", value: false }
]

const solution2 = scatter.getCopyofVisualization()
solution2.setMutlipleActions(solutionActions2);
// game config
const gameDescr2: IGameDescription = {
  gameId: 2,
  // dataset
  // vistype
  // encodings
  // initalState
  visualization: scatter2,
  solution: solution2
}


// new game
let currGameId = gameDescr.gameId;
// let currGame = new Game($main, gameDescr, aqDataset, false);
new Game($main, gameDescr, aqDataset, false);
$main.dataset.gameId = `${currGameId}`;

// nav -> retry
const navRetry = $nav.querySelector('.nav-retry') as HTMLDivElement;
navRetry.addEventListener('click', (event) => {
  const elem = event.target as HTMLElement;
  // elem.classList.toggle('active');
  // const gameId = $main.dataset.gameId;
  //TODO retry game
  console.log('old game: ', currGameId);
  // new Game($main, gameDescr, aqDataset, false);
  restartGame();
}); 

// nav -> next
const navNext = $nav.querySelector('.nav-next') as HTMLDivElement;
navNext.addEventListener('click', (event) => {
  const elem = event.target as HTMLElement;
  // elem.classList.toggle('active');
  // const gameId = $main.dataset.gameId;
  //TODO retry game
  console.log('old game: ', currGameId);
  // new Game($main, gameDescr, aqDataset, false);
  nextGame();
}); 


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
    // new Game($main, gameDescr, aqDataset, false);
    restartGame();
  })
  btnArea.appendChild(btnRetry);


  // button next
  const btnNext = document.createElement('div');
  btnNext.innerHTML = '&#10132; Start new game';
  btnNext.classList.add('modal-btn','btn-next')
  btnNext.addEventListener('click', (event) => {
    modalGameEnd.classList.remove('show-modal');
    // TODO start different game
    nextGame();
  })
  btnArea.appendChild(btnNext);
}

function restartGame() {
  const gameId = Number($main.dataset.gameId);
  if(gameId === gameDescr.gameId) {
    new Game($main, gameDescr, aqDataset, false);
    currGameId = gameDescr.gameId;
    $main.dataset.gameId = `${currGameId}`;
  } else {
    new Game($main, gameDescr2, aqDataset, false);
    currGameId = gameDescr2.gameId;
    $main.dataset.gameId = `${currGameId}`;
  }
}

function nextGame() {
  const gameId = Number($main.dataset.gameId);
  if(gameId === gameDescr.gameId) {
    new Game($main, gameDescr2, aqDataset, false);
    currGameId = gameDescr2.gameId;
    $main.dataset.gameId = `${currGameId}`;
  } else {
    new Game($main, gameDescr, aqDataset, false);
    currGameId = gameDescr.gameId;
    $main.dataset.gameId = `${currGameId}`;
  }
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



