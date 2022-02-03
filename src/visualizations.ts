import embed, { VisualizationSpec } from "vega-embed";
import { getDataCars } from "./dataCars";
import { addBackgroundColor, addLegend, colorEncoding, decreseMarkSize, designChoiceBase, lowerOpacityMark, nominalColorScale, sampleData, startWith0XAxis, startWith0YAxis, xAxisEncoding, yAxisEncoding } from "./designChoices";

/**
 * Enumeration for the visualization type, e.g. scatterplot.
 */
export enum VisType {
  Scatter,
  Line,
  Bar
}

export abstract class VisualizationBase {
  id: string;
  type: VisType;

  // vega specification -> JSON object
  vegaSpec: VisualizationSpec;

  // objectives
  objectives: [];

  // design choices
  designChoices: designChoiceBase[];

  constructor(id: string) {
    this.id = id;
    this.setupVegaSpecification();
    this.setupDesignChoices();
    this.setupObjectives();
  }

  async showVisualization(container: HTMLDivElement) {
    for (const desC of this.designChoices) {
      this.vegaSpec = desC.updateVegaSpec(this);
    }
    // console.log('plot vega vis: ', this.id, this.vegaSpec);
    try {
      await embed(container, this.vegaSpec, { "actions": false });
    } catch {
      // FIXME add error catch
    }

  }


  baseDesignChoicesOnVisualization(visualization: VisualizationBase) {
    const desChoices = visualization.designChoices;

    for (const dc of desChoices) {
      // find given design choice in design choices
      const currDesCh = this.designChoices.filter((elem) => elem.id === dc.id)
      if (currDesCh) {
        // set the current design choice value to the one given
        currDesCh[0].value = dc.value;
      }
    }

  }

  // TODO make data changeable

  abstract setupVegaSpecification();
  abstract setupObjectives();
  abstract setupDesignChoices();
}


export class Scatterplot extends VisualizationBase {

  constructor(id: string) {
    super(id);
    this.type = VisType.Scatter;
  }

  setupVegaSpecification() {
    // TODO remove when data can be changed
    const data = getDataCars();
    const dataLen = data.length;

    this.vegaSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      //data: { url: './assets/cars.json' },
      data: { values: data },
      transform: [{ sample: dataLen }],
      width: 'container', //responsive width
      height: 'container', //responsive height
      background: '#FFFFFF', // background color
      //width: 360,
      //height: 300,
      // mark
      mark: {
        type: 'point', // mark type
        filled: true,
        size: 30, // mark size
        opacity: 0.6 //mark opacity
      },
      // encodings + start with 0 + color scale
      encoding: {
        x: {
          field: 'Weight_in_lbs',
          type: 'quantitative',
          scale: { zero: false } // start x-axis with 0
        },
        y: {
          field: 'Horsepower',
          type: 'quantitative',
          scale: { zero: false } // start y-axis with 0
        },
        color: {
          field: 'Origin',
          type: 'ordinal'  // define color scale type
        }
      },
      // legend options
      config: {
        legend: {
          disable: true // hide legend
        }
      }
    };
  }

  setupDesignChoices() {
    // TODO add design choices
    this.designChoices = [];
    // 0 at x-axis
    this.designChoices.push(new startWith0XAxis('zeor_x_axis'));
    // 0 at x-axis
    this.designChoices.push(new startWith0YAxis('zeor_y_axis'));
    // add backgorund color
    this.designChoices.push(new addBackgroundColor('background_color'));
    // add legend
    this.designChoices.push(new addLegend('legend'));
    // decrease mark size
    this.designChoices.push(new decreseMarkSize('decrese_mark_size'));
    // lower opacity mark
    this.designChoices.push(new lowerOpacityMark('lower_mark_opacity'));
    // nominal color scale
    this.designChoices.push(new nominalColorScale('nominal_color_scale'));

    // sample data
    const samData = new sampleData('sample_data');
    samData.value = (this.vegaSpec as any).transform[0].sample;
    this.designChoices.push(samData);

    // x-axis encoding
    const xAxisEnc = new xAxisEncoding('x_axis_encoding');
    xAxisEnc.value = 'Weight_in_lbs';
    this.designChoices.push(xAxisEnc);

    // y-axis encoding
    const yAxisEnc = new yAxisEncoding('y_axis_encoding');
    yAxisEnc.value = 'Horsepower';
    this.designChoices.push(yAxisEnc);

    // y-axis encoding
    const colorEnc = new colorEncoding('color_encoding');
    colorEnc.value = 'Origin';
    this.designChoices.push(colorEnc);

  }



  setupObjectives() {
    // TODO add objectives
    this.objectives = [];
  }
}