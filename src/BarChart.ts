import ColumnTable from "arquero/dist/types/table/column-table";
import { VisualizationSpec } from "vega-embed";
import { getDataCars } from "./dataCars";
import { ActionType, VisPiplineStage } from "./designChoices";
import { ObjectiveState } from "./Objective";
import { getRandomBoolean } from "./util";
import { highLevelObjective, IEncoding, IObjective, VisType, VisualizationBase } from "./visualizations";

export class Barchart extends VisualizationBase {

  private xEncoding: string;
  private yEncoding: string;
  private colorEncoding: string;
  private _hasColorEncoding: boolean;


  constructor(dataset: ColumnTable, xEncoding: string, yEncoding: string, colorEncoding: string) {
    super(dataset, VisType.Bar);
    this.xEncoding = this.convertNullEncoding(xEncoding); 
    this.yEncoding = this.convertNullEncoding(yEncoding); 
    this.colorEncoding = this.convertNullEncoding(colorEncoding); 

    this._hasColorEncoding = this.colorEncoding !== '';
    

    console.log('BC enocodings: ',{x: this.xEncoding, y: this.yEncoding, c: this.colorEncoding, hasColorEncoding: this._hasColorEncoding});

    // 1. create the actions based on encodings
    this.updateActions();
    // 2. create objectives based on encodings
    this.updateObjectives();
    // 3. create Vega spec based on encodings & actions
    this.updateVegaSpec();

    // create function that updated vegaSpec based on Encodings And Actions
    // create functions that changes Encoding/Actions
    // create function that randomly sets the states for an initial visualization

    // this.setupVegaSpecification();
    // this.setupDesignChoices();
    // this.updateObjectives();
  }

  updateActions() {
    this.actions = [];
    // encoding actions
    // x
    const xEnc = this.createActionObject('x_encoding','x-Axis Encoding', this.xEncoding, VisPiplineStage.visualMapping, ActionType.Encoding);
    this.actions.push(xEnc);
    // y
    const yEnc = this.createActionObject('y_encoding','y-Axis Encoding', this.yEncoding, VisPiplineStage.visualMapping, ActionType.Encoding);
    this.actions.push(yEnc);

    // option actions
    // FIXME
    // // improve scaleability
    // const aAggregateSmallerBars = this.createActionObject('aggregate_samller_bars','Aggregate Smaller Bars', getRandomBoolean(), VisPiplineStage.dataTransform, ActionType.Option);
    // this.actions.push(aAggregateSmallerBars);
    // no round bars
    const aNoRoundBars = this.createActionObject('no_round_bars','No Rounded Bars', getRandomBoolean(), VisPiplineStage.visualMapping, ActionType.Option);
    this.actions.push(aNoRoundBars);
    // start y with 0
    const aYZero = this.createActionObject('y_axis_zero','Start y-Axis with 0', getRandomBoolean(), VisPiplineStage.viewTransform, ActionType.Option);
    this.actions.push(aYZero);
    // order bars
    const aOrderBars = this.createActionObject('order_bars','Order Bars by Value', getRandomBoolean(), VisPiplineStage.viewTransform, ActionType.Option);
    this.actions.push(aOrderBars);
    // background color
    const aBackground = this.createActionObject('background_color','Add Background Color', getRandomBoolean(), VisPiplineStage.viewTransform, ActionType.Option);
    this.actions.push(aBackground);


  }

  updateObjectives() {
    const avoidMIObjectives: IObjective[] = [];
    const reduceMLObjectives: IObjective[] = [];

    // ----- objectives ----- 
    this.objectives = [];
    // avoid non-zero axis
    const avoidNZAD: IObjective = {
      id: 'avoidNZAD',
      label: 'Avoid Non-Zero Axis Distortions',
      description: 'Avoid Non-Zero Axis Distortions: Description', //TODO add description
      actions: this.getMultipleAction(['y_axis_zero']),
      state: null,
      corrActions: 0,
      numActions: 1
    }
    this.objectives.push(avoidNZAD);
    // add objective to HL objective
    avoidMIObjectives.push(avoidNZAD);

    // avoid distracting embellishments
    const avoidDisEm: IObjective = {
      id: 'avoidDisEm',
      label: 'Avoid Distracting Embellishments',
      description: 'Avoid Distracting Embellishments: Description', //TODO add description
      actions: this.getMultipleAction(['background_color']),
      state: null,
      corrActions: 0,
      numActions: 1
    }
    this.objectives.push(avoidDisEm);
    // add objective to HL objective
    reduceMLObjectives.push(avoidDisEm);

    // FIXME
    // // Improve Scalability
    // const imprScale: IObjective = {
    //   id: 'imporveScalability',
    //   label: 'Improve Scalability',
    //   description: 'Improve Scalability: Description', //TODO add description
    //   actions: this.getMultipleAction(['aggregate_samller_bars']),
    //   state: null,
    //   corrActions: 0,
    //   numActions: 1
    // }
    // this.objectives.push(imprScale);
    // // add objective to HL objective
    // reduceMLObjectives.push(imprScale);

    // Avoid Hard to Read Values
    const avoidHTRValues: IObjective = {
      id: 'avoidHTRValues',
      label: 'Avoid Hard to Read Values',
      description: 'Avoid Hard to Read Values: Description', //TODO add description
      actions: this.getMultipleAction(['no_round_bars']),
      state: null,
      corrActions: 0,
      numActions: 1
    }
    this.objectives.push(avoidHTRValues);
    // add objective to HL objective
    avoidMIObjectives.push(avoidHTRValues);

    // Make Size Comparison Easier
    const makeSizeCompEasier: IObjective = {
      id: 'makeSizeCompEasier',
      label: 'Make Size Comaprison Easier',
      description: 'Make Size Comaprison Easier: Description', //TODO add description
      actions: this.getMultipleAction(['order_bars']),
      state: null,
      corrActions: 0,
      numActions: 1
    }
    this.objectives.push(makeSizeCompEasier);
    // add objective to HL objective
    reduceMLObjectives.push(makeSizeCompEasier);


    // ----- high-level objectives ----- 
    this.highLevelObjectives = [];

    // avoid missinterpretation
    const avoidMI: highLevelObjective = {
      id: 'avoidMI',
      label: 'Avoid Misinterpretation',
      description: '',
      lowLevelObjectives: avoidMIObjectives
    }
    
    // reduce memory load
    const reduceML: highLevelObjective = {
      id: 'reduceML',
      label: 'Reduce Memory Load',
      description: '',
      lowLevelObjectives: reduceMLObjectives
    }

    // add HL Objectives to array
    this.highLevelObjectives.push(avoidMI);
    this.highLevelObjectives.push(reduceML);
  }

  updateVegaSpec() {
    // get number of data items
    const dataTotalSize = this.dataset.numRows();

    // get action values
    // background color
    const backgroundColorAction = this.getAction('background_color');
    const backgroundColorValue =backgroundColorAction !== null ? backgroundColorAction.value : false;
    const backgorundColor = backgroundColorValue ? '#d4d4d4' : '#FFFFFF';

    // rounded bars
    const roundedBarsAction = this.getAction('no_round_bars');
    const roundedBars = roundedBarsAction !== null ? roundedBarsAction.value : false;
    const roundedBarsRarius = roundedBars ? 100 : 0;

    // zero on y-axis
    const zeroYAxisAction = this.getAction('y_axis_zero');
    const zeroYAxis = zeroYAxisAction !== null ? zeroYAxisAction.value : false;

    // order bars
    const orderBarsAction = this.getAction('order_bars');
    const orderBars = orderBarsAction !== null ? orderBarsAction.value : false;


    // setup the VegaSpec object
    // FIXME add aggregate smaller bars
    // gerneral 
    let vegaSpecBuildUp: any = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      //data: { url: './assets/cars.json' },
      data: { values: this.dataset.objects() }, // TODO replace with link to file 
      width: 'container', //responsive width
      height: 'container', //responsive height
      autosize: {type: 'fit', contains: 'padding'},
      background: `${backgorundColor}`, // background color}
    };

    // marks
    vegaSpecBuildUp.mark = {
      type: 'bar', // mark type
      filled: true,
      cornerRadiusEnd: roundedBarsRarius
    };

    // encodings 
    vegaSpecBuildUp.encoding = {};
    // x
    if(this.xEncoding) {
      vegaSpecBuildUp.encoding.x = {
        field: this.xEncoding,
        type: 'nominal',
        axis: {labelAngle: 0}
      };
      if(orderBars) {
        vegaSpecBuildUp.encoding.x.sort = '-y'
      }
    }
    // y
    if(this.yEncoding) {
      vegaSpecBuildUp.encoding.y = {
        field: this.yEncoding,
        type: 'quantitative',
        aggregate: 'mean',
        scale: { zero: zeroYAxis } // start y-axis with 0
      };
    } else {
      vegaSpecBuildUp.encoding.y = {
        aggregate: 'count',
        scale: { zero: zeroYAxis } // start y-axis with 0
      };
    }
    
    this.vegaSpec = vegaSpecBuildUp;

  }

  getCopyofVisualization(): VisualizationBase {
    const copy = new Barchart(this.dataset, this.xEncoding, this.yEncoding, this.colorEncoding);
    copy.setActionsBasedOnVisualization(this);
    return copy;
  }

  // getCopyofVisualization(copyId: string): VisualizationBase {
  //   const copyScatter = new Barchart(copyId, this.dataset, this.xEncoding, this.yEncoding, this.colorEncoding);
  //   copyScatter.baseDesignChoicesOnVisualization(this);

  //   // copyScatter.vegaSpec = deepCopy(this.vegaSpec);
  //   // // objectives
  //   // copyScatter.objectives = deepCopy(this.objectives);

  //   // // design choices
  //   // copyScatter.designChoices = deepCopy(this.designChoices);
  //   return copyScatter;
  // }

  getCopyofVisualizationWithChangedEncodings(encodings: IEncoding[]): VisualizationBase{
    let xEnc = '';
    let yEnc = '';
    let cEnc = '';

    for(const e of encodings) {
      const val = this.convertNullEncoding(e.value); 
      if(e.field === 'x') {
        xEnc = val;
      } else if (e.field === 'y') {
        yEnc = val;
      } else if (e.field === 'color') {
        cEnc = val;
      }
    }

    const copy = new Barchart(this.dataset, xEnc, yEnc, cEnc);
    copy.setActionsBasedOnVisualization(this);
    return copy;
  }

  // getVisualizationCopyWithEncodingsAndActions(copyId: string, encodinds: {field: string, value: string}[]): VisualizationBase {
  //   let xEnc = '';
  //   let yEnc = '';
  //   let cEnc = '';

  //   for(const e of encodinds) {
  //     const val = this.convertNullEncoding(e.value); 
  //     if(e.field === 'x') {
  //       xEnc = val;
  //     } else if (e.field === 'y') {
  //       yEnc = val;
  //     } else if (e.field === 'color') {
  //       cEnc = val;
  //     }
  //   }

  //   const copyScatter = new Barchart(copyId, this.dataset, xEnc, xEnc, cEnc);
  //   copyScatter.baseDesignChoicesOnVisualization(this);

  //   return copyScatter;

  // }

  getEncodings(): IEncoding[] {
    const encodings = [];
    encodings.push({field: 'x', value: this.xEncoding});
    encodings.push({field: 'y', value: this.yEncoding});

    return encodings;
  }

  setEncodings(encodinds: IEncoding[]) {
    for(const e of encodinds) {
      const val = this.convertNullEncoding(e.value); 
      if(e.field === 'x') {
        const xEnc = this.getAction('x_encoding');
        xEnc.value = val;
        this.xEncoding = val;
      } else if (e.field === 'y') {
        const yEnc = this.getAction('y_encoding');
        yEnc.value = val;
        this.yEncoding = val;
      } 
      // else if (e.field === 'color') {
      //   const cEnc = this.getAction('color_encoding');
      //   cEnc.value = val;
      //   this.colorEncoding = val;
      // }
    }
    this._hasColorEncoding = this.colorEncoding !== '';

    // create the actions based on encodings
    this.updateActions();
    // create objectives based on encodings
    this.updateObjectives();
    // create Vega spec based on encodings & actions
    this.updateVegaSpec();

    // this.setupVegaSpecification();
    // this.setupDesignChoices();
    // this.setupObjectives();
    // this.updateVegaSpecBasedOnDesignChoices();
  }
  
  // setupVegaSpecification() {
  //   // TODO remove when data can be changed
  //   const data = getDataCars();
  //   const dataLen = this.dataset.numRows();

  //   this.vegaSpec = {
  //     $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  //     //data: { url: './assets/cars.json' },
  //     data: { values: this.dataset.objects() },
  //     transform: [{ sample: dataLen }],
  //     width: 'container', //responsive width
  //     height: 'container', //responsive height
  //     background: '#FFFFFF', // background color
  //     //width: 360,
  //     //height: 300,
  //     // mark
  //     mark: {
  //       type: 'point', // mark type
  //       filled: true,
  //       size: 30, // mark size
  //       opacity: 0.6 //mark opacity
  //     },
  //     // encodings + start with 0 + color scale
  //     encoding: {
  //       x: {
  //         field: this.xEncoding,
  //         // field: 'Weight_in_lbs',
  //         type: 'quantitative',
  //         scale: { zero: false } // start x-axis with 0
  //       },
  //       y: {
  //         field: this.yEncoding,
  //         // field: 'Horsepower',
  //         type: 'quantitative',
  //         scale: { zero: false } // start y-axis with 0
  //       },
  //       color: {
  //         field: this.colorEncoding,
  //         // field: 'Origin',
  //         type: 'ordinal'  // define color scale type
  //       }
  //     },
  //     // legend options
  //     config: {
  //       legend: {
  //         disable: true // hide legend
  //       }
  //     }
  //   };
  // }

  checkStateOfObjective(id: string): { state: ObjectiveState, corrActions: number } {
    // make sure the vegaSpec is up-to-date
    // this.updateVegaSpecBasedOnDesignChoices();
    this.updateVegaSpec();


    if (id === 'avoidNZAD') {
      return this.checkAvoidNonZeroAxis();
    } else if (id === 'imporveScalability') {
      return this.checkImproveScalability();
    } else if (id === 'avoidDisEm') {
      return this.checkAvoidEmbellishments();
    } else if (id === 'avoidHTRValues') {
      return this.checkAvoidHardToReadValues();
    } else if (id === 'makeSizeCompEasier') {
      return this.checkMakeSizeCompEasier();
    }
  }


  private checkAvoidNonZeroAxis(): { state: ObjectiveState, corrActions: number } {
    const objetive = this.getObjective('avoidNZAD');
    // TODO Objective: avoidNZAD

    const amount = objetive.actions.length;

    const numbOfTrue = objetive.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const correct = numbOfTrue >= 1;
    const corrActions = numbOfTrue;

    return {
      state: numbOfTrue === amount ? ObjectiveState.correct : (numbOfTrue >= 1 ? ObjectiveState.partial : ObjectiveState.wrong),
      corrActions
    };
  }

  private checkImproveScalability(): { state: ObjectiveState, corrActions: number } {
    const objetive = this.getObjective('imporveScalability');
    const amount = objetive.actions.length;

    const numbOfTrue = objetive.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const correct = numbOfFalse === objetive.actions.length;
    const corrActions = correct ? objetive.actions.length : 0;

    // TODO check how many categories to exist
    return {
      state: ObjectiveState.correct,
      corrActions
    };
  }

  private checkAvoidEmbellishments(): { state: ObjectiveState, corrActions: number } {
    const objetive = this.getObjective('avoidDisEm');
    // TODO Objective: avoidDisEm

    const amount = objetive.actions.length;

    const numbOfTrue = objetive.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const correct = numbOfFalse === objetive.actions.length;
    const corrActions = correct ? objetive.actions.length : 0;


    return {
      state: correct ? ObjectiveState.correct : ObjectiveState.wrong,
      corrActions
    };
  }

  private checkAvoidHardToReadValues(): { state: ObjectiveState, corrActions: number } {
    const objetive = this.getObjective('avoidHTRValues');
    const amount = objetive.actions.length;

    const numbOfTrue = objetive.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const correct = numbOfFalse === objetive.actions.length;
    const corrActions = correct ? objetive.actions.length : 0;


    return {
      state: correct ? ObjectiveState.correct : ObjectiveState.wrong,
      corrActions
    };
  }

  private checkMakeSizeCompEasier(): { state: ObjectiveState, corrActions: number } {
    const objetive = this.getObjective('makeSizeCompEasier');
    const amount = objetive.actions.length;

    const numbOfTrue = objetive.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const correct = numbOfFalse === objetive.actions.length;
    const corrActions = correct ? objetive.actions.length : 0;

    // TODO check if it is already ordered by size by default 
    return {
      state: ObjectiveState.correct,
      corrActions
    };
  }

  // private checkReduceOverplotting(): { state: ObjectiveState, corrActions: number } {
  //   console.log('check reduce overplotting objective')
  //   console.log('this: ', this);

  //   const objetive = this.getObjective('reduceOP');
  //   // TODO Objective: reduceOP

  //   const amount = objetive.actions.length;

  //   const numbOfTrue = objetive.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
  //   const numbOfFalse = objetive.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
  //   const correct = numbOfTrue === 1;
  //   const corrActions = correct ? objetive.actions.length : 0;

  //   return {
  //     state: correct ? ObjectiveState.correct : ObjectiveState.wrong,
  //     corrActions
  //   };
  // }

  // private checkShowLegend(): { state: ObjectiveState, corrActions: number } {
  //   const objetive = this.getObjective('addLegend');
  //   // TODO Objective: addLegend

  //   const amount = objetive.actions.length;

  //   const numbOfTrue = objetive.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
  //   const numbOfFalse = objetive.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
  //   const colorEncoding = (this.vegaSpec as any).encoding.color.field;

  //   let corr = false;
  //   if (colorEncoding === '') {
  //     corr = numbOfFalse === 1 ? true : false;
  //   } else {
  //     corr = numbOfTrue === 1 ? true : false;
  //   }

  //   return {
  //     state: corr ? ObjectiveState.correct : ObjectiveState.wrong,
  //     corrActions: corr ? objetive.actions.length : 0
  //   };
  // }

  // private checkRightColorEncding(): { state: ObjectiveState, corrActions: number } {
  //   const objetive = this.getObjective('rightColorEnc');
  //   // TODO Objective: rightColorEnc

  //   const amount = objetive.actions.length;

  //   const numbOfTrue = objetive.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
  //   const numbOfFalse = objetive.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
  //   const colorEncoding = (this.vegaSpec as any).encoding.color.field;


  //   let corr = false;
  //   if (colorEncoding === '') {
  //     // if no color encoding -> value does not matter
  //     corr = true;
  //   } else {
  //     // if color encoding -> value has to be true
  //     corr = numbOfTrue === 1 ? true : false;
  //   }

  //   return {
  //     state: corr ? ObjectiveState.correct : ObjectiveState.wrong,
  //     corrActions: corr ? objetive.actions.length : 0
  //   };
  // }



}