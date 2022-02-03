import embed, { VisualizationSpec } from 'vega-embed';
import { getDataCars } from './dataCars';
import { Strip } from './Strip';
import './style.scss'; // import styles as described https://github.com/webpack-contrib/sass-loader
import { Scatterplot, VisualizationBase } from './visualizations';

var TITLE = 'Iguanodon'

// document.title = TITLE;
// document.getElementById('app-header').textContent = TITLE;
// console.log('Hello World');
const visualizations: VisualizationBase[] = [];
setupSidebarMenu();

const visStrip = document.getElementById('vis-strip') as HTMLDivElement;
const visMutli = document.getElementById('vis-multiples') as HTMLDivElement;
const dataset = getDataCars();

// vis 1
// const visItem1 = document.createElement('div');
// visItem1.classList.add('vis-item');
// visStrip.appendChild(visItem1);
// createTestVis1(visItem1, getDataCars());

// vis 2
// const visItem2 = document.createElement('div');
// visItem2.classList.add('vis-item');
// visStrip.appendChild(visItem2);
// createTestVis2(visItem2, getDataCars());

// vis mutli
// const visMulti = document.getElementById('vis-multiples') as HTMLDivElement;


// const visCtrMultiple = document.createElement('div');
// visCtrMultiple.classList.add('vis-mult');
// visMulti.appendChild(visCtrMultiple);

// vis multi items
// for (let i = 0; i < 6; i++) {
//   const visMultiItem = document.createElement('div');
//   visMultiItem.classList.add('vis-mult-item');
//   visMulti.appendChild(visMultiItem);
//   createTestVis2(visMultiItem, getDataCars());
// }

function initScatterplot() {
  //TODO create scatterplot and add it to visualization array

  const scatterplot = new Scatterplot('scatter0');
  const strip = new Strip(dataset, scatterplot, visStrip, visMutli);
  // strip.addVisualization(scatterplot);
  //TODO implement initialization of random design choices
}

function handleVisTypeClick(type: string) {
  if (type === 'scatter') {
    console.log('Visualization type: scatter')
    initScatterplot();
  } else if (type === 'line') {
    console.log('Visualization type: line')
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
    btnCntr.appendChild(tmpBtn);
    tmpBtn.addEventListener('click', (event) => {
      handleVisTypeClick(elem.type);
    })
  }

}





async function createTestVis1(container: HTMLDivElement, data) {
  // const spec: VisualizationSpec = {
  //   $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  //   //data: { url: './assets/cars.json' },
  //   data: { values: data },
  //   width: 'container', //responsive width
  //   height: 'container', //responsive height
  //   //width: 360,
  //   //height: 300,
  //   mark: { type: 'point', filled: true, size: 30, opacity: 0.6 },
  //   encoding: {
  //     x: { field: 'Weight_in_lbs', type: 'quantitative' },
  //     y: { field: 'Horsepower', type: 'quantitative' },
  //     color: { field: 'Origin', type: 'ordinal' }
  //   }
  // };

  // const result = await embed(container, spec, { "actions": false });


  // console.log(result.view);
  const scatterplot = new Scatterplot('scatter_1');
  scatterplot.showVisualization(container);
}

async function createTestVis2(container: HTMLDivElement, data) {
  const spec: VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    //data: { url: './assets/cars.json' },
    data: { values: data },
    width: 'container', //responsive width
    height: 'container', //responsive height
    //width: 360,
    //height: 300,
    mark: { type: 'point', filled: true, size: 30, opacity: 0.6 },
    encoding: {
      x: { field: 'Weight_in_lbs', type: 'quantitative' },
      y: { field: 'Horsepower', type: 'quantitative' },
      color: { field: 'Origin', type: 'nominal' }
    }
  };

  const result = await embed(container, spec, { "actions": false });


  console.log('vis 2: ', result.view);
}
