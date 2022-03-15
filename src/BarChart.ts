import ColumnTable from "arquero/dist/types/table/column-table";
import { VisualizationSpec } from "vega-embed";
import { getDataCars } from "./dataCars";
import { addBackgroundColor, addLegend, colorEncoding, decreseMarkSize, lowerOpacityMark, nominalColorScale, sampleData, startWith0XAxis, startWith0YAxis, xAxisEncoding, yAxisEncoding } from "./designChoices";
import { ObjectiveState } from "./Objective";
import { VisType, VisualizationBase } from "./visualizations";

export class Barchart extends VisualizationBase {

  private xEncoding: string;
  private yEncoding: string;
  private colorEncoding: string;


  constructor(id: string, dataset: ColumnTable, xEncoding: string, yEncoding: string, colorEncoding: string) {
    super(id, dataset);
    this.type = VisType.Bar;
    this.xEncoding = xEncoding;
    this.yEncoding = yEncoding;
    this.colorEncoding = colorEncoding === null ? '' : colorEncoding;

    this.setupVegaSpecification();
    this.setupDesignChoices();
    this.setupObjectives();
  }

  getCopyofVisualization(copyId: string): VisualizationBase {
    const copyScatter = new Barchart(copyId, this.dataset, this.xEncoding, this.yEncoding, this.colorEncoding);
    copyScatter.baseDesignChoicesOnVisualization(this);

    // copyScatter.vegaSpec = deepCopy(this.vegaSpec);
    // // objectives
    // copyScatter.objectives = deepCopy(this.objectives);

    // // design choices
    // copyScatter.designChoices = deepCopy(this.designChoices);
    return copyScatter;
  }

  setupVegaSpecification() {
    // TODO remove when data can be changed
    const data = getDataCars();
    const dataLen = this.dataset.numRows();

    this.vegaSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      //data: { url: './assets/cars.json' },
      data: { values: this.dataset.objects() },
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
          field: this.xEncoding,
          // field: 'Weight_in_lbs',
          type: 'quantitative',
          scale: { zero: false } // start x-axis with 0
        },
        y: {
          field: this.yEncoding,
          // field: 'Horsepower',
          type: 'quantitative',
          scale: { zero: false } // start y-axis with 0
        },
        color: {
          field: this.colorEncoding,
          // field: 'Origin',
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

  updateVegaSpecForSmallMultiple(vSpec: VisualizationSpec) {
    const smVegaSpec = vSpec as any;
    return smVegaSpec;
  }

  setupDesignChoices() {
    // TODO add not yet implemented design choices
    this.designChoices = [];
    // 0 at x-axis
    this.designChoices.push(new startWith0XAxis());
    // 0 at y-axis
    this.designChoices.push(new startWith0YAxis());
    // add backgorund color
    this.designChoices.push(new addBackgroundColor());
    // add legend
    this.designChoices.push(new addLegend());
    // decrease mark size
    this.designChoices.push(new decreseMarkSize());
    // lower opacity mark
    this.designChoices.push(new lowerOpacityMark());
    // nominal color scale
    this.designChoices.push(new nominalColorScale());

    // sample data
    const samData = new sampleData((this.vegaSpec as any).transform[0].sample);
    // samData.value = (this.vegaSpec as any).transform[0].sample;
    this.designChoices.push(samData);

    // x-axis encoding
    const xAxisEnc = new xAxisEncoding();
    xAxisEnc.value = this.xEncoding;
    // xAxisEnc.value = 'Weight_in_lbs';
    this.designChoices.push(xAxisEnc);

    // y-axis encoding
    const yAxisEnc = new yAxisEncoding();
    yAxisEnc.value = this.yEncoding;
    // yAxisEnc.value = 'Horsepower';
    this.designChoices.push(yAxisEnc);

    // y-axis encoding
    const colorEnc = new colorEncoding();
    colorEnc.value = this.colorEncoding;
    // colorEnc.value = 'Origin';
    this.designChoices.push(colorEnc);

  }



  setupObjectives() {

    // newObjectives: {
    //   id: string,
    //   label: string,
    //   isHighLevel: boolean,
    //   description: string,
    //   designChoices: designChoiceBase[],
    //   state: ObjectiveState,
    //   corrDesignChoices: number,
    // }[];
    this.objectives = [];
    // low-level objectives ---------------------------
    // reduce overplotting
    // const reduceOP = new Objective('reduceOP');
    // reduceOP.label = 'Reduce Overplotting';
    // const reduceOP = new ReduceOverPlotting('reduceOP');
    // reduceOP.designChoices = this.getDesignChoicesBasedOnId(['sample_data', 'lower_mark_opacity', 'decrese_mark_size']);
    // this.objectives.push(reduceOP);
    const reduceOP = {
      id: 'reduceOP',
      label: 'Reduce Overplotting',
      description: '',
      designChoices: this.getDesignChoicesBasedOnId(['sample_data', 'lower_mark_opacity', 'decrese_mark_size']),
      state: null,
      corrDesignChoices: 0
    }
    this.objectives.push(reduceOP);


    // avoid nonzero axis distortion
    // const avoidNZAD = new Objective('avoidNZAD');
    // avoidNZAD.label = 'Avoid Non-Zero Axis Distortions';
    // const avoidNZAD = new AvoidNonZeroAxis('avoidNZAD');
    // avoidNZAD.designChoices = this.getDesignChoicesBasedOnId(['zeor_x_axis', 'zeor_y_axis']);
    // this.objectives.push(avoidNZAD);
    const avoidNZAD = {
      id: 'avoidNZAD',
      label: 'Avoid Non-Zero Axis Distortions',
      description: '',
      designChoices: this.getDesignChoicesBasedOnId(['zeor_x_axis', 'zeor_y_axis']),
      state: null,
      corrDesignChoices: 0
    }
    this.objectives.push(avoidNZAD);
    // add legend
    // const addLegend = new Objective('addLegend');
    // addLegend.label = 'Show Legend'
    // const addLegend = new ShowLegend('addLegend', this.vegaSpec);
    // addLegend.designChoices = this.getDesignChoicesBasedOnId(['legend']);
    // this.objectives.push(addLegend);
    const addLegend = {
      id: 'addLegend',
      label: 'Show Legend',
      description: '',
      designChoices: this.getDesignChoicesBasedOnId(['legend']),
      state: null,
      corrDesignChoices: 0
    }
    this.objectives.push(addLegend);

    // use the right color encoding
    // const rightColorEnc = new Objective('rightColorEnc');
    // rightColorEnc.label = 'Use Right Visual Color Encoding';
    // const rightColorEnc = new RightColorEncding('rightColorEnc', this.vegaSpec);
    // rightColorEnc.designChoices = this.getDesignChoicesBasedOnId(['nominal_color_scale']);
    // this.objectives.push(rightColorEnc);
    const rightColorEnc = {
      id: 'rightColorEnc',
      label: 'Use Right Visual Color Encoding',
      description: '',
      designChoices: this.getDesignChoicesBasedOnId(['nominal_color_scale']),
      state: null,
      corrDesignChoices: 0
    }
    this.objectives.push(rightColorEnc);

    // incerese domain understanding
    // TODO design choices are not yet implmented
    // const incDU = new Objective('incDU');
    // incDU.designChoices = this.getDesignChoicesBasedOnId(['']);
    // this.objectives.push(incDU);

    // avoid distracting embellishments
    // const avoidDisEm = new Objective('avoidDisEm');
    // avoidDisEm.label = 'Avoid distracting embellishments';
    // const avoidDisEm = new AvoidEmbellishments('avoidDisEm');
    // avoidDisEm.designChoices = this.getDesignChoicesBasedOnId(['background_color']);
    // this.objectives.push(avoidDisEm);
    const avoidDisEm = {
      id: 'avoidDisEm',
      label: 'Avoid Distracting Embellishments',
      description: '',
      designChoices: this.getDesignChoicesBasedOnId(['background_color']),
      state: null,
      corrDesignChoices: 0
    }
    this.objectives.push(avoidDisEm);


    // high-level objectives --------------------------
    this.highLevelObjectives = [];
    // newHighLevelObjectives: {
    //   id: string,
    //   label: string,
    //   description: string,
    //   lowLevelObjectives: any[],
    // }[];

    // avoid missinterpretation
    // const avoidMI = new Objective('avoidMI', true);
    // avoidMI.label = 'Avoid Misinterpretation';
    // const avoidMI = new AvoidMisinterpretation('avoidMI', true);
    // avoidMI.childObjectives.push(reduceOP);
    // avoidMI.childObjectives.push(avoidNZAD);
    // avoidMI.childObjectives.push(addLegend);
    // avoidMI.childObjectives.push(rightColorEnc);
    // this.objectives.push(avoidMI);
    const avoidMI = {
      id: 'avoidMI',
      label: 'Avoid Misinterpretation',
      description: '',
      lowLevelObjectives: []
    }
    avoidMI.lowLevelObjectives.push(reduceOP);
    avoidMI.lowLevelObjectives.push(avoidNZAD);
    avoidMI.lowLevelObjectives.push(addLegend);
    avoidMI.lowLevelObjectives.push(rightColorEnc);
    this.highLevelObjectives.push(avoidMI);

    // reduce memory load
    // const reduceML = new Objective('reduceML', true);
    // reduceML.label = 'Reduce Memory Load';
    // const reduceML = new ReduceMemoryLoad('reduceML', true);
    // reduceML.childObjectives.push(avoidDisEm);
    // this.objectives.push(reduceML);
    const reduceML = {
      id: 'reduceML',
      label: 'Reduce Memory Load',
      description: '',
      lowLevelObjectives: []
    }
    reduceML.lowLevelObjectives.push(avoidDisEm);
    this.highLevelObjectives.push(reduceML);
  }


  checkStateOfObjective(id: string): { state: ObjectiveState, corrDesignChoices: number } {
    // make sure the vegaSpec is up-to-date
    this.updateVegaSpecBasedOnDesignChoices();

    if (id === 'reduceOP') {
      return this.checkReduceOverplotting();
    } else if (id === 'avoidNZAD') {
      return this.checkAvoidNonZeroAxis();
    } else if (id === 'addLegend') {
      return this.checkShowLegend();
    } else if (id === 'rightColorEnc') {
      return this.checkRightColorEncding();
    } else if (id === 'avoidDisEm') {
      return this.checkAvoidEmbellishments();
    }
  }


  private checkReduceOverplotting(): { state: ObjectiveState, corrDesignChoices: number } {
    console.log('check reduce overplotting objective')
    console.log('this: ', this);

    const objetive = this.getLowLevelObjectiveById('reduceOP');

    const amount = objetive.designChoices.length;

    const numbOfTrue = objetive.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const correct = numbOfTrue === 1;
    const corrDesignChoices = correct ? objetive.designChoices.length : 0;

    return {
      state: correct ? ObjectiveState.correct : ObjectiveState.wrong,
      corrDesignChoices
    };
  }

  private checkAvoidNonZeroAxis(): { state: ObjectiveState, corrDesignChoices: number } {
    const objetive = this.getLowLevelObjectiveById('avoidNZAD');

    const amount = objetive.designChoices.length;

    const numbOfTrue = objetive.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const correct = numbOfTrue >= 1;
    const corrDesignChoices = numbOfTrue;

    return {
      state: numbOfTrue === amount ? ObjectiveState.correct : (numbOfTrue >= 1 ? ObjectiveState.partial : ObjectiveState.wrong),
      corrDesignChoices
    };
  }

  private checkShowLegend(): { state: ObjectiveState, corrDesignChoices: number } {
    const objetive = this.getLowLevelObjectiveById('addLegend');

    const amount = objetive.designChoices.length;

    const numbOfTrue = objetive.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const colorEncoding = (this.vegaSpec as any).encoding.color.field;

    let corr = false;
    if (colorEncoding === '') {
      corr = numbOfFalse === 1 ? true : false;
    } else {
      corr = numbOfTrue === 1 ? true : false;
    }

    return {
      state: corr ? ObjectiveState.correct : ObjectiveState.wrong,
      corrDesignChoices: corr ? objetive.designChoices.length : 0
    };
  }

  private checkRightColorEncding(): { state: ObjectiveState, corrDesignChoices: number } {
    const objetive = this.getLowLevelObjectiveById('rightColorEnc');

    const amount = objetive.designChoices.length;

    const numbOfTrue = objetive.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const colorEncoding = (this.vegaSpec as any).encoding.color.field;


    let corr = false;
    if (colorEncoding === '') {
      // if no color encoding -> value does not matter
      corr = true;
    } else {
      // if color encoding -> value has to be true
      corr = numbOfTrue === 1 ? true : false;
    }

    return {
      state: corr ? ObjectiveState.correct : ObjectiveState.wrong,
      corrDesignChoices: corr ? objetive.designChoices.length : 0
    };
  }

  private checkAvoidEmbellishments(): { state: ObjectiveState, corrDesignChoices: number } {
    const objetive = this.getLowLevelObjectiveById('avoidDisEm');

    const amount = objetive.designChoices.length;

    const numbOfTrue = objetive.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const correct = numbOfFalse === objetive.designChoices.length;
    const corrDesignChoices = correct ? objetive.designChoices.length : 0;


    return {
      state: correct ? ObjectiveState.correct : ObjectiveState.wrong,
      corrDesignChoices
    };
  }

}