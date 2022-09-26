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
import { getColumnTypesFromArqueroTable } from './util';
import { VisType } from './visualizations';

var TITLE = 'Iguanodon'
document.title = TITLE;

// document.getElementById('app-header').textContent = TITLE;
// console.log('Hello World');
// const visualizations: VisualizationBase[] = [];
// setupSidebarMenu(); //HACK

// get all relevant HTML DOM elements
// header
const $header = document.getElementById('header') as HTMLDivElement;
// nav
const $nav = document.getElementById('nav') as HTMLDivElement;
// main
const $main = document.getElementById('main') as HTMLDivElement;


// const visPipeline = document.getElementById('vis-pipeline') as HTMLDivElement;
// const visStrip = document.getElementById('vis-strip') as HTMLDivElement;
// const scoreStrip = document.getElementById('score-strip') as HTMLDivElement;
// const detailsStrip = document.getElementById('details-strip') as HTMLDivElement;
// const visMutli = document.getElementById('vis-multiples') as HTMLDivElement;
// const objectivesCntr = document.getElementById('objectives') as HTMLDivElement;
const dataset = getDataCars();


// variable for Free mode vs explanatory mode
let isFreeMode = false;
const aqDataset = aq.from(dataset);

// scatterplot
const scatter = new Scatterplot(aqDataset, 'Miles_per_Gallon', 'Horsepower', 'Origin');

// game
const gameDescr: IGameDescription = {
  gameId: 1,
  visualization: scatter
}

// new game
const game = new Game($main, gameDescr, aqDataset, false);


// const testInvestigation = new Investigation($main, isFreeMode, aqDataset);

function clearInvestigation() {
  $main.replaceChildren();
  const investigationTwo = new Investigation($main, isFreeMode, aqDataset);
}

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



