import * as aq from 'arquero';
import { Barchart } from './BarChart';
import { getDataCars } from './dataCars';
import { getDataStock } from './dataStock';
import { Linechart } from './LineChart';
import { Scatterplot } from './Scatterplot';
import { Strip } from './Strip';
import './style.scss'; // import styles as described https://github.com/webpack-contrib/sass-loader
import { getColumnTypesFromArqueroTable } from './util';
import { VisualizationBase } from './visualizations';

var TITLE = 'Iguanodon'

// document.title = TITLE;
// document.getElementById('app-header').textContent = TITLE;
// console.log('Hello World');
const visualizations: VisualizationBase[] = [];
setupSidebarMenu();

const visPipeline = document.getElementById('vis-pipeline') as HTMLDivElement;
const visStrip = document.getElementById('vis-strip') as HTMLDivElement;
const scoreStrip = document.getElementById('score-strip') as HTMLDivElement;
const detailsStrip = document.getElementById('details-strip') as HTMLDivElement;
const visMutli = document.getElementById('vis-multiples') as HTMLDivElement;
const objectivesCntr = document.getElementById('objectives') as HTMLDivElement;
const dataset = getDataCars();


function clearStrips() {
  // clear Visualization pipeline
  visPipeline.innerHTML = '';


  // clear small Multiples
  visMutli.innerHTML = '';

  // clear list of objectives
  objectivesCntr.innerHTML = '';

  // clear all strip parts
  // vis strip -> all vis-item but id=hover-preview
  const visItemsElem = Array.from(visStrip.querySelectorAll(':not(#hover-preview).vis-item'));
  for (const ch of visItemsElem) {
    visStrip.removeChild(ch);
  }

  // score strip -> all score-item but id=score-preview
  const scoreItemsElem = Array.from(scoreStrip.querySelectorAll(':not(#score-preview).score-item'));
  for (const ch of scoreItemsElem) {
    scoreStrip.removeChild(ch);
  }

  // details strip -> all detail-item (checkboxes) but id=detail-preview
  const detailItemsElem = Array.from(detailsStrip.querySelectorAll(':not(#detail-preview).detail-item'));
  for (const ch of detailItemsElem) {
    detailsStrip.removeChild(ch);
  }
  // svg line: details strip -> objetive-indicator-svg -> svg: svg-objective -> line
  const detailSVGCntr = detailsStrip.querySelector('#svg-objective');
  console.log('svg: ', detailSVGCntr);
  // const detailSVGLines = Array.from(detailSVGCntr.querySelectorAll('line'));
  const detailSVGLines = Array.from(detailSVGCntr.children);
  for (const ch of detailSVGLines) {
    detailSVGCntr.removeChild(ch);
  }

  // objective label: details strip -> objetive-indicator-html -> wrapper-idicator-html -> objective-detail-info
  const detailHTMLCntr = detailsStrip.querySelector('#wrapper-indicator-html');
  const detailHTMLInfos = Array.from(detailHTMLCntr.querySelectorAll('.objective-detail-info'));
  for (const ch of detailHTMLInfos) {
    detailHTMLCntr.removeChild(ch);
  }

}


function initScatterplot() {
  const dataset = getDataCars();
  const aqDataset = aq.from(dataset);
  // const colNames = aqDataset.columnNames();
  // console.log('columnNames: ', colNames);

  const colTypesTable = getColumnTypesFromArqueroTable(aqDataset);
  console.log('colTypesTable: ', colTypesTable);

  const scatterplot = new Scatterplot('scatter0', aqDataset, 'Weight_in_lbs', 'Horsepower', 'Origin');
  console.log('Start vis: ', scatterplot);
  const strip = new Strip(scatterplot, visStrip, visMutli);
  // strip.addVisualization(scatterplot);
  //TODO implement initialization of random design choices
}

function initLinechart() {
  const dataset = getDataStock();
  const aqDataset = aq.from(dataset);
  // const colNames = aqDataset.columnNames();
  // console.log('columnNames: ', colNames);

  const colTypesTable = getColumnTypesFromArqueroTable(aqDataset);
  console.log('colTypesTable: ', colTypesTable);

  const linechart = new Linechart('line0', aqDataset, 'date', 'price', 'symbol');
  console.log('Start vis: ', linechart);
  const strip = new Strip(linechart, visStrip, visMutli);
  // strip.addVisualization(scatterplot);
  //TODO implement initialization of random design choices
}

function initBarchart() {
  const dataset = getDataCars();
  const aqDataset = aq.from(dataset);
  const barchart = new Barchart('line0', aqDataset, 'date', 'price', 'symbol');
  console.log('Start vis: ', barchart);
  const strip = new Strip(barchart, visStrip, visMutli);
  // strip.addVisualization(scatterplot);
  //TODO implement initialization of random design choices
}

function handleVisTypeClick(type: string) {
  clearStrips();
  if (type === 'scatter') {
    console.log('Visualization type: scatter')
    initScatterplot();
  } else if (type === 'line') {
    console.log('Visualization type: line')
    initLinechart();
  } else if (type === 'bar') {
    console.log('Visualization type: bar')
  }
}

function setupSidebarMenu() {
  // TODO add sidebar options
  // -> start with the visualization types
  const sidebar = document.getElementById('sidebar') as HTMLDivElement;
  const btnCntr = document.createElement('div');
  sidebar.appendChild(btnCntr);

  const visBtns = [
    { name: 'Scatterplot', type: 'scatter' },
    { name: 'Line Chart', type: 'line' },
    { name: 'Bar Chart', type: 'bar' },
  ];
  for (const elem of visBtns) {
    const tmpBtn = document.createElement('button');
    tmpBtn.innerHTML = elem.name;
    tmpBtn.classList.add('btn-vis-type');
    btnCntr.appendChild(tmpBtn);
    tmpBtn.addEventListener('click', (event) => {
      handleVisTypeClick(elem.type);
    })
  }

}



