import ColumnTable from "arquero/dist/types/table/column-table";
import { VisualizationSpec } from "vega-embed";
import { getDataCars } from "./dataCars";
import { addBackgroundColor, addLegend, colorEncoding, decreseMarkSize, designChoiceBase, lowerOpacityMark, nominalColorScale, sampleData, startWith0XAxis, startWith0YAxis, xAxisEncoding, yAxisEncoding } from "./designChoices";
import { ObjectiveState } from "./Objective";
import { IEncoding, VisType, VisualizationBase } from "./visualizations";

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
    

    console.log('BC enocodings: ',{x: this.xEncoding, y: this.yEncoding, c: this.colorEncoding});

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
    // TODO actions
    // // encoding actions
    // // x
    // const xEnc = this.createActionObject('x_encoding','x-Axis Encoding', this.xEncoding, VisPiplineStage.visualMapping, ActionType.Encoding);
    // this.actions.push(xEnc);
    // // y
    // const yEnc = this.createActionObject('y_encoding','y-Axis Encoding', this.yEncoding, VisPiplineStage.visualMapping, ActionType.Encoding);
    // this.actions.push(yEnc);
    // // color
    // const cEnc = this.createActionObject('color_encoding','Color Encoding', this.colorEncoding, VisPiplineStage.visualMapping, ActionType.Encoding);
    // this.actions.push(cEnc);

    // // option actions
    // // sample data
    // const aSample = this.createActionObject('sample_data','Sample Data (25%)', false, VisPiplineStage.dataTransform, ActionType.Option);
    // this.actions.push(aSample);
    // // aggregation (mean)
    // const aAggregation = this.createActionObject('aggregate','Aggregate Data (Mean)', false, VisPiplineStage.dataTransform, ActionType.Option);
    // this.actions.push(aAggregation);
    // // lower mark opacity
    // const aOpacity = this.createActionObject('lower_opacity','Lower Opacity for Marks', false, VisPiplineStage.visualMapping, ActionType.Option);
    // this.actions.push(aOpacity);
    // // decrese mark size
    // const aSize = this.createActionObject('decrease_size','Decreased Mark Size', false, VisPiplineStage.visualMapping, ActionType.Option);
    // this.actions.push(aSize);
    // // start x with 0
    // const aXZero = this.createActionObject('x_axis_zero','Start x-Axis with 0', false, VisPiplineStage.viewTransform, ActionType.Option);
    // this.actions.push(aXZero);
    // // start y with 0
    // const aYZero = this.createActionObject('y_axis_zero','Start y-Axis with 0', false, VisPiplineStage.viewTransform, ActionType.Option);
    // this.actions.push(aYZero);
    // // background color
    // const aBackground = this.createActionObject('background_color','Add Background Color', false, VisPiplineStage.viewTransform, ActionType.Option);
    // this.actions.push(aBackground);


    // // conditional option actions
    // if(this._hasColorEncoding) {
    //   // legend
    //   const aLegend = this.createActionObject('legend','Add Legend', false, VisPiplineStage.viewTransform, ActionType.Option)
    //   this.actions.push(aLegend);
    //   // nomnal color scale
    //   const aNominalColors = this.createActionObject('nominal_colors','Nominal Color Scale', false, VisPiplineStage.visualMapping, ActionType.Option)
    //   this.actions.push(aNominalColors);
    // }
  }

  updateObjectives() {
    // TODO objective
    // const avoidMIObjectives: IObjective[] = [];
    // const reduceMLObjectives: IObjective[] = [];

    // // ----- objectives ----- 
    // this.objectives = [];
    // // reduce overplotting
    // const reduceOP: IObjective = {
    //   id: 'reduceOP',
    //   label: 'Reduce Overplotting',
    //   description: 'Reduce Overplotting: Description', //TODO add description
    //   actions: this.getMultipleAction(['sample_data', 'aggregate', 'lower_opacity', 'decrease_size']),
    //   state: null,
    //   corrActions: 0,
    //   numActions: 4
    // }
    // this.objectives.push(reduceOP);
    // // add objective to HL objective
    // avoidMIObjectives.push(reduceOP);

    // // avoid non-zero axis
    // const avoidNZAD: IObjective = {
    //   id: 'avoidNZAD',
    //   label: 'Avoid Non-Zero Axis Distortions',
    //   description: 'Avoid Non-Zero Axis Distortions: Description', //TODO add description
    //   actions: this.getMultipleAction(['x_axis_zero', 'y_axis_zero']),
    //   state: null,
    //   corrActions: 0,
    //   numActions: 2
    // }
    // this.objectives.push(avoidNZAD);
    // // add objective to HL objective
    // avoidMIObjectives.push(avoidNZAD);

    // // avoid distracting embellishments
    // const avoidDisEm: IObjective = {
    //   id: 'avoidDisEm',
    //   label: 'Avoid Distracting Embellishments',
    //   description: 'Avoid Distracting Embellishments: Description', //TODO add description
    //   actions: this.getMultipleAction(['background_color']),
    //   state: null,
    //   corrActions: 0,
    //   numActions: 1
    // }
    // this.objectives.push(avoidDisEm);
    // // add objective to HL objective
    // reduceMLObjectives.push(avoidDisEm);

    // // coditional objectives
    // if(this._hasColorEncoding) {
    //   // add legend
    //   const addLegend: IObjective = {
    //     id: 'addLegend',
    //     label: 'Show Legend',
    //     description: 'Show Legend: Description', //TODO add description
    //     actions: this.getMultipleAction(['legend']),
    //     state: null,
    //     corrActions: 0,
    //     numActions: 1
    //   }
    //   this.objectives.push(addLegend);
    //   // add objective to HL objective
    //   avoidMIObjectives.push(addLegend);

    //   // use the right color encoding
    //   const rightColorEnc: IObjective = {
    //     id: 'rightColorEnc',
    //     label: 'Use Right Visual Color Encoding',
    //     description: 'Use Right Visual Color Encoding: Description', //TODO add description
    //     actions: this.getMultipleAction(['nominal_colors']),
    //     state: null,
    //     corrActions: 0,
    //     numActions: 1
    //   }
    //   this.objectives.push(rightColorEnc);
    //   // add objective to HL objective
    //   avoidMIObjectives.push(rightColorEnc);
    // }
    

    // // ----- high-level objectives ----- 
    // this.highLevelObjectives = [];

    // // avoid missinterpretation
    // const avoidMI: highLevelObjective = {
    //   id: 'avoidMI',
    //   label: 'Avoid Misinterpretation',
    //   description: '',
    //   lowLevelObjectives: avoidMIObjectives
    // }
    
    // // reduce memory load
    // const reduceML: highLevelObjective = {
    //   id: 'reduceML',
    //   label: 'Reduce Memory Load',
    //   description: '',
    //   lowLevelObjectives: reduceMLObjectives
    // }

    // // add HL Objectives to array
    // this.highLevelObjectives.push(avoidMI);
    // this.highLevelObjectives.push(reduceML);
  }

  updateVegaSpec() {
    // get number of data items
    const dataTotalSize = this.dataset.numRows();

    // TODO update Vega-Spec
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

  // updateVegaSpecForSmallMultiple(vSpec: VisualizationSpec) {
  //   const smVegaSpec = vSpec as any;
  //   return smVegaSpec;
  // }

  // setupDesignChoices() {
  //   // TODO add not yet implemented design choices
  //   this.designChoices = [];
  //   // 0 at x-axis
  //   this.designChoices.push(new startWith0XAxis());
  //   // 0 at y-axis
  //   this.designChoices.push(new startWith0YAxis());
  //   // add backgorund color
  //   this.designChoices.push(new addBackgroundColor());
  //   // add legend
  //   this.designChoices.push(new addLegend());
  //   // decrease mark size
  //   this.designChoices.push(new decreseMarkSize());
  //   // lower opacity mark
  //   this.designChoices.push(new lowerOpacityMark());
  //   // nominal color scale
  //   this.designChoices.push(new nominalColorScale());

  //   // sample data
  //   const samData = new sampleData((this.vegaSpec as any).transform[0].sample);
  //   // samData.value = (this.vegaSpec as any).transform[0].sample;
  //   this.designChoices.push(samData);

  //   // x-axis encoding
  //   const xAxisEnc = new xAxisEncoding();
  //   xAxisEnc.value = this.xEncoding;
  //   // xAxisEnc.value = 'Weight_in_lbs';
  //   this.designChoices.push(xAxisEnc);

  //   // y-axis encoding
  //   const yAxisEnc = new yAxisEncoding();
  //   yAxisEnc.value = this.yEncoding;
  //   // yAxisEnc.value = 'Horsepower';
  //   this.designChoices.push(yAxisEnc);

  //   // y-axis encoding
  //   const colorEnc = new colorEncoding();
  //   colorEnc.value = this.colorEncoding;
  //   // colorEnc.value = 'Origin';
  //   this.designChoices.push(colorEnc);

  // }



  // updateObjectives() {

  //   // newObjectives: {
  //   //   id: string,
  //   //   label: string,
  //   //   isHighLevel: boolean,
  //   //   description: string,
  //   //   designChoices: designChoiceBase[],
  //   //   state: ObjectiveState,
  //   //   corrDesignChoices: number,
  //   // }[];
  //   this.objectives = [];
  //   // low-level objectives ---------------------------
  //   // reduce overplotting
  //   // const reduceOP = new Objective('reduceOP');
  //   // reduceOP.label = 'Reduce Overplotting';
  //   // const reduceOP = new ReduceOverPlotting('reduceOP');
  //   // reduceOP.designChoices = this.getDesignChoicesBasedOnId(['sample_data', 'lower_mark_opacity', 'decrese_mark_size']);
  //   // this.objectives.push(reduceOP);
  //   const reduceOP = {
  //     id: 'reduceOP',
  //     label: 'Reduce Overplotting',
  //     description: '',
  //     designChoices: this.getDesignChoicesBasedOnId(['sample_data', 'lower_mark_opacity', 'decrese_mark_size']),
  //     state: null,
  //     corrDesignChoices: 0
  //   }
  //   this.objectives.push(reduceOP);


  //   // avoid nonzero axis distortion
  //   // const avoidNZAD = new Objective('avoidNZAD');
  //   // avoidNZAD.label = 'Avoid Non-Zero Axis Distortions';
  //   // const avoidNZAD = new AvoidNonZeroAxis('avoidNZAD');
  //   // avoidNZAD.designChoices = this.getDesignChoicesBasedOnId(['zeor_x_axis', 'zeor_y_axis']);
  //   // this.objectives.push(avoidNZAD);
  //   const avoidNZAD = {
  //     id: 'avoidNZAD',
  //     label: 'Avoid Non-Zero Axis Distortions',
  //     description: '',
  //     designChoices: this.getDesignChoicesBasedOnId(['zeor_x_axis', 'zeor_y_axis']),
  //     state: null,
  //     corrDesignChoices: 0
  //   }
  //   this.objectives.push(avoidNZAD);
  //   // add legend
  //   // const addLegend = new Objective('addLegend');
  //   // addLegend.label = 'Show Legend'
  //   // const addLegend = new ShowLegend('addLegend', this.vegaSpec);
  //   // addLegend.designChoices = this.getDesignChoicesBasedOnId(['legend']);
  //   // this.objectives.push(addLegend);
  //   const addLegend = {
  //     id: 'addLegend',
  //     label: 'Show Legend',
  //     description: '',
  //     designChoices: this.getDesignChoicesBasedOnId(['legend']),
  //     state: null,
  //     corrDesignChoices: 0
  //   }
  //   this.objectives.push(addLegend);

  //   // use the right color encoding
  //   // const rightColorEnc = new Objective('rightColorEnc');
  //   // rightColorEnc.label = 'Use Right Visual Color Encoding';
  //   // const rightColorEnc = new RightColorEncding('rightColorEnc', this.vegaSpec);
  //   // rightColorEnc.designChoices = this.getDesignChoicesBasedOnId(['nominal_color_scale']);
  //   // this.objectives.push(rightColorEnc);
  //   const rightColorEnc = {
  //     id: 'rightColorEnc',
  //     label: 'Use Right Visual Color Encoding',
  //     description: '',
  //     designChoices: this.getDesignChoicesBasedOnId(['nominal_color_scale']),
  //     state: null,
  //     corrDesignChoices: 0
  //   }
  //   this.objectives.push(rightColorEnc);

  //   // incerese domain understanding
  //   // TODO design choices are not yet implmented
  //   // const incDU = new Objective('incDU');
  //   // incDU.designChoices = this.getDesignChoicesBasedOnId(['']);
  //   // this.objectives.push(incDU);

  //   // avoid distracting embellishments
  //   // const avoidDisEm = new Objective('avoidDisEm');
  //   // avoidDisEm.label = 'Avoid distracting embellishments';
  //   // const avoidDisEm = new AvoidEmbellishments('avoidDisEm');
  //   // avoidDisEm.designChoices = this.getDesignChoicesBasedOnId(['background_color']);
  //   // this.objectives.push(avoidDisEm);
  //   const avoidDisEm = {
  //     id: 'avoidDisEm',
  //     label: 'Avoid Distracting Embellishments',
  //     description: '',
  //     designChoices: this.getDesignChoicesBasedOnId(['background_color']),
  //     state: null,
  //     corrDesignChoices: 0
  //   }
  //   this.objectives.push(avoidDisEm);


  //   // high-level objectives --------------------------
  //   this.highLevelObjectives = [];
  //   // newHighLevelObjectives: {
  //   //   id: string,
  //   //   label: string,
  //   //   description: string,
  //   //   lowLevelObjectives: any[],
  //   // }[];

  //   // avoid missinterpretation
  //   // const avoidMI = new Objective('avoidMI', true);
  //   // avoidMI.label = 'Avoid Misinterpretation';
  //   // const avoidMI = new AvoidMisinterpretation('avoidMI', true);
  //   // avoidMI.childObjectives.push(reduceOP);
  //   // avoidMI.childObjectives.push(avoidNZAD);
  //   // avoidMI.childObjectives.push(addLegend);
  //   // avoidMI.childObjectives.push(rightColorEnc);
  //   // this.objectives.push(avoidMI);
  //   const avoidMI = {
  //     id: 'avoidMI',
  //     label: 'Avoid Misinterpretation',
  //     description: '',
  //     lowLevelObjectives: []
  //   }
  //   avoidMI.lowLevelObjectives.push(reduceOP);
  //   avoidMI.lowLevelObjectives.push(avoidNZAD);
  //   avoidMI.lowLevelObjectives.push(addLegend);
  //   avoidMI.lowLevelObjectives.push(rightColorEnc);
  //   this.highLevelObjectives.push(avoidMI);

  //   // reduce memory load
  //   // const reduceML = new Objective('reduceML', true);
  //   // reduceML.label = 'Reduce Memory Load';
  //   // const reduceML = new ReduceMemoryLoad('reduceML', true);
  //   // reduceML.childObjectives.push(avoidDisEm);
  //   // this.objectives.push(reduceML);
  //   const reduceML = {
  //     id: 'reduceML',
  //     label: 'Reduce Memory Load',
  //     description: '',
  //     lowLevelObjectives: []
  //   }
  //   reduceML.lowLevelObjectives.push(avoidDisEm);
  //   this.highLevelObjectives.push(reduceML);
  // }


  // checkStateOfObjective(id: string): { state: ObjectiveState, corrDesignChoices: number } {
  //   // make sure the vegaSpec is up-to-date
  //   this.updateVegaSpecBasedOnDesignChoices();

  //   if (id === 'reduceOP') {
  //     return this.checkReduceOverplotting();
  //   } else if (id === 'avoidNZAD') {
  //     return this.checkAvoidNonZeroAxis();
  //   } else if (id === 'addLegend') {
  //     return this.checkShowLegend();
  //   } else if (id === 'rightColorEnc') {
  //     return this.checkRightColorEncding();
  //   } else if (id === 'avoidDisEm') {
  //     return this.checkAvoidEmbellishments();
  //   }
  // }

  checkStateOfObjective(id: string): { state: ObjectiveState, corrActions: number } {
    // make sure the vegaSpec is up-to-date
    // this.updateVegaSpecBasedOnDesignChoices();
    this.updateVegaSpec();


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


  private checkReduceOverplotting(): { state: ObjectiveState, corrActions: number } {
    console.log('check reduce overplotting objective')
    console.log('this: ', this);

    const objetive = this.getObjective('reduceOP');
    // TODO Objective: reduceOP

    const amount = objetive.actions.length;

    const numbOfTrue = objetive.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const correct = numbOfTrue === 1;
    const corrActions = correct ? objetive.actions.length : 0;

    return {
      state: correct ? ObjectiveState.correct : ObjectiveState.wrong,
      corrActions
    };
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

  private checkShowLegend(): { state: ObjectiveState, corrActions: number } {
    const objetive = this.getObjective('addLegend');
    // TODO Objective: addLegend

    const amount = objetive.actions.length;

    const numbOfTrue = objetive.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const colorEncoding = (this.vegaSpec as any).encoding.color.field;

    let corr = false;
    if (colorEncoding === '') {
      corr = numbOfFalse === 1 ? true : false;
    } else {
      corr = numbOfTrue === 1 ? true : false;
    }

    return {
      state: corr ? ObjectiveState.correct : ObjectiveState.wrong,
      corrActions: corr ? objetive.actions.length : 0
    };
  }

  private checkRightColorEncding(): { state: ObjectiveState, corrActions: number } {
    const objetive = this.getObjective('rightColorEnc');
    // TODO Objective: rightColorEnc

    const amount = objetive.actions.length;

    const numbOfTrue = objetive.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
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
      corrActions: corr ? objetive.actions.length : 0
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

}