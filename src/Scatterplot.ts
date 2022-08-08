import * as aq from 'arquero';
import { op } from "arquero";
import ColumnTable from "arquero/dist/types/table/column-table";
import { VisualizationSpec } from 'vega-embed';
import { addBackgroundColor, addLegend, colorEncoding, decreseMarkSize, designChoiceBase, ActionType, lowerOpacityMark, nominalColorScale, sampleData, startWith0XAxis, startWith0YAxis, VisPiplineStage, xAxisEncoding, yAxisEncoding } from "./designChoices";
import { ObjectiveState } from "./Objective";
import { caculateAreaPolygone, calculatePointsOverlap, convexHull, getColumnTypesFromArqueroTable, getRandomBoolean, uniqueFilter } from "./util";
import { highLevelObjective, IAction, IEncoding, IObjective, IObjectiveState, VisType, VisualizationBase } from "./visualizations";

// export enum ScatterplotActions {
//   XEncoding, 
//   YEncoding,
//   ColorEncoding,
//   SampleData,
//   Aggregate,
//   LowerOpacity,
//   DecreaseSize,
//   XAxisZero,
//   YAxisZero,
//   Legend,
//   NominalColor,
//   Background,
// }

// export type SpActionString = keyof typeof ScatterplotActions;

export class Scatterplot extends VisualizationBase {

  private xEncoding: string;
  private yEncoding: string;
  private colorEncoding: string;
  private _hasColorEncoding: boolean;

  constructor(dataset: ColumnTable, xEncoding: string, yEncoding: string, colorEncoding: string) {
    super(dataset, VisType.Scatter);
    this.xEncoding = this.convertNullEncoding(xEncoding); 
    this.yEncoding = this.convertNullEncoding(yEncoding); 
    this.colorEncoding = this.convertNullEncoding(colorEncoding); 

    this._hasColorEncoding = this.colorEncoding !== '';
    

    // console.log('SP enocodings: ',{x: this.xEncoding, y: this.yEncoding, c: this.colorEncoding});

    // 1. create the actions based on encodings
    this.updateActions();
    // 2. create objectives based on encodings
    this.updateObjectives();
    // 3. create Vega spec based on encodings & actions
    this.updateVegaSpec();

    // console.log('SP vega-spec: ',this.vegaSpec);
    // create function that updated vegaSpec based on Encodings And Actions
    // create functions that changes Encoding/Actions
    // create function that randomly sets the states for an initial visualization

    // this.setupVegaSpecification();
    // this.setupDesignChoices();
    // this.setupObjectives();
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
    // color
    const cEnc = this.createActionObject('color_encoding','Color Encoding', this.colorEncoding, VisPiplineStage.visualMapping, ActionType.Encoding);
    this.actions.push(cEnc);

    // option actions
    // sample data
    const aSample = this.createActionObject('sample_data','Sample Data (25%)', getRandomBoolean(), VisPiplineStage.dataTransform, ActionType.Option);
    this.actions.push(aSample);
    // aggregation (mean)
    const aAggregation = this.createActionObject('aggregate','Aggregate Data (Mean)', getRandomBoolean(), VisPiplineStage.dataTransform, ActionType.Option);
    this.actions.push(aAggregation);
    // lower mark opacity
    const aOpacity = this.createActionObject('lower_opacity','Lower Opacity for Marks', getRandomBoolean(), VisPiplineStage.visualMapping, ActionType.Option);
    this.actions.push(aOpacity);
    // decrese mark size
    const aSize = this.createActionObject('decrease_size','Decreased Mark Size', getRandomBoolean(), VisPiplineStage.visualMapping, ActionType.Option);
    this.actions.push(aSize);
    // start x with 0
    const aXZero = this.createActionObject('x_axis_zero','Start x-Axis with 0', getRandomBoolean(), VisPiplineStage.viewTransform, ActionType.Option);
    this.actions.push(aXZero);
    // start y with 0
    const aYZero = this.createActionObject('y_axis_zero','Start y-Axis with 0', getRandomBoolean(), VisPiplineStage.viewTransform, ActionType.Option);
    this.actions.push(aYZero);
    // background color
    const aBackground = this.createActionObject('background_color','Add Background Color', getRandomBoolean(), VisPiplineStage.viewTransform, ActionType.Option);
    this.actions.push(aBackground);


    // conditional option actions
    if(this._hasColorEncoding) {
      // legend
      const aLegend = this.createActionObject('legend','Add Legend', getRandomBoolean(), VisPiplineStage.viewTransform, ActionType.Option)
      this.actions.push(aLegend);
      // nomnal color scale
      const aNominalColors = this.createActionObject('nominal_colors','Nominal Color Scale', getRandomBoolean(), VisPiplineStage.visualMapping, ActionType.Option)
      this.actions.push(aNominalColors);
    }
  }

  
  updateObjectives() {
    const avoidMIObjectives: IObjective[] = [];
    const reduceMLObjectives: IObjective[] = [];

    // ----- objectives ----- 
    this.objectives = [];
    // reduce overplotting
    const reduceOP: IObjective = {
      id: 'reduceOP',
      label: 'Reduce Overplotting',
      description: 'Reduce Overplotting: Description', //TODO add description
      actions: this.getMultipleAction(['sample_data', 'aggregate', 'lower_opacity', 'decrease_size']),
      state: null,
      corrActions: 0,
      numActions: 4
    }
    this.objectives.push(reduceOP);
    // add objective to HL objective
    avoidMIObjectives.push(reduceOP);

    // avoid non-zero axis
    const avoidNZAD: IObjective = {
      id: 'avoidNZAD',
      label: 'Avoid Non-Zero Axis Distortions',
      description: 'Avoid Non-Zero Axis Distortions: Description', //TODO add description
      actions: this.getMultipleAction(['x_axis_zero', 'y_axis_zero']),
      state: null,
      corrActions: 0,
      numActions: 2
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

    // coditional objectives
    if(this._hasColorEncoding) {
      // add legend
      const addLegend: IObjective = {
        id: 'addLegend',
        label: 'Show Legend',
        description: 'Show Legend: Description', //TODO add description
        actions: this.getMultipleAction(['legend']),
        state: null,
        corrActions: 0,
        numActions: 1
      }
      this.objectives.push(addLegend);
      // add objective to HL objective
      avoidMIObjectives.push(addLegend);

      // use the right color encoding
      const rightColorEnc: IObjective = {
        id: 'rightColorEnc',
        label: 'Use Right Visual Color Encoding',
        description: 'Use Right Visual Color Encoding: Description', //TODO add description
        actions: this.getMultipleAction(['nominal_colors']),
        state: null,
        corrActions: 0,
        numActions: 1
      }
      this.objectives.push(rightColorEnc);
      // add objective to HL objective
      avoidMIObjectives.push(rightColorEnc);
    }
    

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
    // sample data
    const sampleDataAction = this.getAction('sample_data');
    const sampleDataActionValue = sampleDataAction !== null ? sampleDataAction.value : false;
    const sampledSize = sampleDataActionValue ? Math.ceil(dataTotalSize/4) : dataTotalSize;
   
    // aggreation mean
    const aggregateAction = this.getAction('aggregate');
    const aggregateValues = aggregateAction !== null ? aggregateAction.value : false;

    // background color
    const backgroundColorAction = this.getAction('background_color');
    const backgroundColorValue =backgroundColorAction !== null ? backgroundColorAction.value : false;
    const backgorundColor = backgroundColorValue ? '#d4d4d4' : '#FFFFFF';

    // decreased size
    const decreasedSizeAction = this.getAction('decrease_size');
    const decreasedSizeActionValue = decreasedSizeAction !== null ? decreasedSizeAction.value : false;
    const size = decreasedSizeActionValue ? 15 : 30;

    // opacity
    const opacityAction = this.getAction('lower_opacity');
    const opacityActionValue = opacityAction !== null ? opacityAction.value : false;
    const opacity = opacityActionValue ? 0.4 : 1;
    
    // zero on x-axis
    const zeroXAxisAction = this.getAction('x_axis_zero');
    const zeroXAxis = zeroXAxisAction !== null ? zeroXAxisAction.value : false;

    // zero on y-axis
    const zeroYAxisAction = this.getAction('y_axis_zero');
    const zeroYAxis = zeroYAxisAction !== null ? zeroYAxisAction.value : false;

    // legend
    const legendAction = this.getAction('legend');
    const showLegend = legendAction !== null ? legendAction.value : false;
    
    // nominal color sale
    const dataTypes = getColumnTypesFromArqueroTable(this.dataset);
    const datasetAttr = dataTypes.filter((elem) => elem.label === this.colorEncoding)[0];
    let colorTypeNotNominal = 'ordinal';
    if (datasetAttr?.type === 'continuous') {
      // values of the attribute
      const data = this.dataset.array(this.colorEncoding);
      const uniqueData = data.filter(uniqueFilter); // get unique values
      if (uniqueData.length > 10) {
        colorTypeNotNominal = 'quantitative';
      }
    }

    const nominalColorsAction = this.getAction('nominal_colors');
    const nominalColorsActionValue = nominalColorsAction !== null ? nominalColorsAction.value : false;
    const colorType = nominalColorsActionValue ? 'nominal' : colorTypeNotNominal;


    // setup the VegaSpec object
    // gerneral 
    let vegaSpecBuildUp: any = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      //data: { url: './assets/cars.json' },
      data: { values: this.dataset.objects() }, // TODO replace with link to file 
      transform: [{ sample: sampledSize }],
      width: 'container', //responsive width
      height: 'container', //responsive height
      background: `${backgorundColor}`, // background color}
    };

    // marks
    vegaSpecBuildUp.mark = {
      type: 'point', // mark type
      filled: true,
      size, // mark size
      opacity //mark opacity
    };

    // encodings 
    vegaSpecBuildUp.encoding = {};
    // x
    if(this.xEncoding) {
      vegaSpecBuildUp.encoding.x = {
        field: this.xEncoding,
        // field: 'Weight_in_lbs',
        type: 'quantitative',
        scale: { zero: zeroXAxis } // start x-axis with 0
      };

      if(aggregateValues) {
        vegaSpecBuildUp.encoding.x.aggregate = 'mean'
      }
    }
    // y
    if(this.yEncoding) {
      vegaSpecBuildUp.encoding.y = {
        field: this.yEncoding,
        // field: 'Horsepower',
        type: 'quantitative',
        scale: { zero: zeroYAxis } // start y-axis with 0
      };

      if(aggregateValues) {
        vegaSpecBuildUp.encoding.y.aggregate = 'mean'
      }
    }

    // color
    if(this.colorEncoding) {
      vegaSpecBuildUp.encoding.color = {
        field: this.colorEncoding,
        // field: 'Origin',
        type: colorType  // define color scale type
      };
    }

    // config
    vegaSpecBuildUp.config = {
      legend: {
        disable: !showLegend // hide legend
      }
    };

    // console.log('vegaSpecBuildUp: ', vegaSpecBuildUp);
    this.vegaSpec = vegaSpecBuildUp;
  }


  getCopyofVisualization(): VisualizationBase {
    const copy = new Scatterplot(this.dataset, this.xEncoding, this.yEncoding, this.colorEncoding);
    copy.setActionsBasedOnVisualization(this);
    return copy;
  }

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

    const copy = new Scatterplot(this.dataset, xEnc, yEnc, cEnc);
    copy.setActionsBasedOnVisualization(this);
    // console.log('Actions: ', {origin: this.actions, copy: copy.actions});
    // console.log('vega-Specs: ', {origin: this.vegaSpec, copy: copy.vegaSpec});
    return copy;
  }


  // getCopyofVisualization(): VisualizationBase {
  //   const copyScatter = new Scatterplot(this.dataset, this.xEncoding, this.yEncoding, this.colorEncoding);
  //   copyScatter.baseDesignChoicesOnVisualization(this);

  //   // copyScatter.vegaSpec = deepCopy(this.vegaSpec);
  //   // // objectives
  //   // copyScatter.objectives = deepCopy(this.objectives);

  //   // // design choices
  //   // copyScatter.designChoices = deepCopy(this.designChoices);
  //   return copyScatter;
  // }

  // getVisualizationCopyWithEncodingsAndActions(encodings: {field: string, value: string}[]): VisualizationBase {
  //   let xEnc = '';
  //   let yEnc = '';
  //   let cEnc = '';

  //   for(const e of encodings) {
  //     const val = this.convertNullEncoding(e.value); 
  //     if(e.field === 'x') {
  //       xEnc = val;
  //     } else if (e.field === 'y') {
  //       yEnc = val;
  //     } else if (e.field === 'color') {
  //       cEnc = val;
  //     }
  //   }

  //   const copyScatter = new Scatterplot(this.dataset, xEnc, xEnc, cEnc);
  //   copyScatter.baseDesignChoicesOnVisualization(this);

  //   return copyScatter;

  // }

  getEncodings(): IEncoding[] {
    const encodings = [];
    encodings.push({field: 'x', value: this.xEncoding});
    encodings.push({field: 'y', value: this.yEncoding});
    encodings.push({field: 'color', value: this.colorEncoding});

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
      } else if (e.field === 'color') {
        const cEnc = this.getAction('color_encoding');
        cEnc.value = val;
        this.colorEncoding = val;
      }
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
  //   // const dataLen = this.dataset.length;
  //   const dataLen = this.dataset.numRows();

  //   // gerneral 
  //   let vegaSpecBuildUp: any = {
  //     $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  //     //data: { url: './assets/cars.json' },
  //     data: { values: this.dataset.objects() },
  //     transform: [{ sample: dataLen }],
  //     width: 'container', //responsive width
  //     height: 'container', //responsive height
  //     background: '#FFFFFF', // background color}
  //   };

  //   // marks
  //   vegaSpecBuildUp.mark = {
  //     type: 'point', // mark type
  //     filled: true,
  //     size: 30, // mark size
  //     opacity: 0.6 //mark opacity
  //   };

  //   // encodings 
  //   vegaSpecBuildUp.encoding = {};
  //   // x
  //   if(this.xEncoding) {
  //     vegaSpecBuildUp.encoding.x = {
  //       field: this.xEncoding,
  //       // field: 'Weight_in_lbs',
  //       type: 'quantitative',
  //       scale: { zero: false } // start x-axis with 0
  //     };
  //   }
  //   // y
  //   if(this.yEncoding) {
  //     vegaSpecBuildUp.encoding.y = {
  //       field: this.yEncoding,
  //       // field: 'Horsepower',
  //       type: 'quantitative',
  //       scale: { zero: false } // start y-axis with 0
  //     };
  //   }

  //   // color
  //   if(this.colorEncoding) {
  //     vegaSpecBuildUp.encoding.color = {
  //       field: this.colorEncoding,
  //       // field: 'Origin',
  //       type: 'ordinal'  // define color scale type
  //     };
  //   }

  //   // config
  //   vegaSpecBuildUp.config = {
  //     legend: {
  //       disable: true // hide legend
  //     }
  //   };

  //   // console.log('vegaSpecBuildUp: ', vegaSpecBuildUp);
  //   this.vegaSpec = vegaSpecBuildUp;

  //   // this.vegaSpec = {
  //   //   $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  //   //   //data: { url: './assets/cars.json' },
  //   //   data: { values: this.dataset.objects() },
  //   //   transform: [{ sample: dataLen }],
  //   //   width: 'container', //responsive width
  //   //   height: 'container', //responsive height
  //   //   background: '#FFFFFF', // background color
  //   //   //width: 360,
  //   //   //height: 300,
  //   //   // mark
  //   //   mark: {
  //   //     type: 'point', // mark type
  //   //     filled: true,
  //   //     size: 30, // mark size
  //   //     opacity: 0.6 //mark opacity
  //   //   },
  //   //   // encodings + start with 0 + color scale
  //   //   encoding: {
  //   //     x: {
  //   //       field: this.xEncoding,
  //   //       // field: 'Weight_in_lbs',
  //   //       type: 'quantitative',
  //   //       scale: { zero: false } // start x-axis with 0
  //   //     },
  //   //     y: {
  //   //       field: this.yEncoding,
  //   //       // field: 'Horsepower',
  //   //       type: 'quantitative',
  //   //       scale: { zero: false } // start y-axis with 0
  //   //     },
  //   //     color: {
  //   //       field: this.colorEncoding,
  //   //       // field: 'Origin',
  //   //       type: 'ordinal'  // define color scale type
  //   //     }
  //   //   },
  //   //   // legend options
  //   //   config: {
  //   //     legend: {
  //   //       disable: true // hide legend
  //   //     }
  //   //   }
  //   // };
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
  //   // decrease mark size
  //   this.designChoices.push(new decreseMarkSize());
  //   // lower opacity mark
  //   this.designChoices.push(new lowerOpacityMark());
  //   if(this._hasColorEncoding) {
  //     // add legend
  //     this.designChoices.push(new addLegend());
  //     // nominal color scale
  //     this.designChoices.push(new nominalColorScale());
  //   }

  //   // sample data
  //   const samData = new sampleData((this.vegaSpec as any).transform[0].sample);
  //   // samData.value = (this.vegaSpec as any).transform[0].sample;
  //   this.designChoices.push(samData);

  //   // TODO remove/comment out encodings
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


  // private getDesignChoicesBasedOnId(ids: string[]): designChoiceBase[] {
  //   const arr: designChoiceBase[] = [];
  //   for (const id of ids) {
  //     const desCArr = this.designChoices.filter((elem) => elem.id === id);
  //     if (desCArr) {
  //       const desC = desCArr[0];
  //       arr.push(desC);
  //     }
  //   }

  //   return arr;
  // }


  // setupObjectives() {
  //   this.objectives = [];


  //   // low-level objectives ---------------------------
  //   // reduce overplotting
  //   // const reduceOP = new Objective('reduceOP');
  //   // reduceOP.label = 'Reduce Overplotting';
  //   const reduceOP = new ReduceOverPlotting('reduceOP');
  //   reduceOP.designChoices = this.getDesignChoicesBasedOnId(['sample_data', 'lower_mark_opacity', 'decrese_mark_size']);
  //   this.objectives.push(reduceOP);

  //   // avoid nonzero axis distortion
  //   // const avoidNZAD = new Objective('avoidNZAD');
  //   // avoidNZAD.label = 'Avoid Non-Zero Axis Distortions';
  //   const avoidNZAD = new AvoidNonZeroAxis('avoidNZAD');
  //   avoidNZAD.designChoices = this.getDesignChoicesBasedOnId(['zeor_x_axis', 'zeor_y_axis']);
  //   this.objectives.push(avoidNZAD);

  //   // add legend
  //   // const addLegend = new Objective('addLegend');
  //   // addLegend.label = 'Show Legend'
  //   const addLegend = new ShowLegend('addLegend', this.vegaSpec);
  //   addLegend.designChoices = this.getDesignChoicesBasedOnId(['legend']);
  //   this.objectives.push(addLegend);

  //   // use the right color encoding
  //   // const rightColorEnc = new Objective('rightColorEnc');
  //   // rightColorEnc.label = 'Use Right Visual Color Encoding';
  //   const rightColorEnc = new RightColorEncding('rightColorEnc', this.vegaSpec);
  //   rightColorEnc.designChoices = this.getDesignChoicesBasedOnId(['nominal_color_scale']);
  //   this.objectives.push(rightColorEnc);

  //   // incerese domain understanding
  //   // TODO design choices are not yet implmented
  //   // const incDU = new Objective('incDU');
  //   // incDU.designChoices = this.getDesignChoicesBasedOnId(['']);
  //   // this.objectives.push(incDU);

  //   // avoid distracting embellishments
  //   // const avoidDisEm = new Objective('avoidDisEm');
  //   // avoidDisEm.label = 'Avoid distracting embellishments';
  //   const avoidDisEm = new AvoidEmbellishments('avoidDisEm');
  //   avoidDisEm.designChoices = this.getDesignChoicesBasedOnId(['background_color']);
  //   this.objectives.push(avoidDisEm);


  //   // high-level objectives --------------------------
  //   // avoid missinterpretation
  //   // const avoidMI = new Objective('avoidMI', true);
  //   // avoidMI.label = 'Avoid Misinterpretation';
  //   const avoidMI = new AvoidMisinterpretation('avoidMI', true);
  //   avoidMI.childObjectives.push(reduceOP);
  //   avoidMI.childObjectives.push(avoidNZAD);
  //   avoidMI.childObjectives.push(addLegend);
  //   avoidMI.childObjectives.push(rightColorEnc);
  //   this.objectives.push(avoidMI);

  //   // reduce memory load
  //   // const reduceML = new Objective('reduceML', true);
  //   // reduceML.label = 'Reduce Memory Load';
  //   const reduceML = new ReduceMemoryLoad('reduceML', true);
  //   reduceML.childObjectives.push(avoidDisEm);
  //   this.objectives.push(reduceML);
  // }


  // setupObjectives() {
  //   // newObjectives: {
  //   //   id: string,
  //   //   label: string,
  //   //   isHighLevel: boolean,
  //   //   description: string,
  //   //   designChoices: designChoiceBase[],
  //   //   state: ObjectiveState,
  //   //   corrDesignChoices: number,
  //   // }[];

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
  //     description: 'Reduce Overplotting: Description', //TODO add description
  //     designChoices: this.getDesignChoicesBasedOnId(['sample_data', 'lower_mark_opacity', 'decrese_mark_size']),
  //     state: null,
  //     corrDesignChoices: 0
  //   }
  //   this.objectives.push(reduceOP);
  //   // add LL objective to HL objective
  //   avoidMI.lowLevelObjectives.push(reduceOP);


  //   // avoid nonzero axis distortion
  //   // const avoidNZAD = new Objective('avoidNZAD');
  //   // avoidNZAD.label = 'Avoid Non-Zero Axis Distortions';
  //   // const avoidNZAD = new AvoidNonZeroAxis('avoidNZAD');
  //   // avoidNZAD.designChoices = this.getDesignChoicesBasedOnId(['zeor_x_axis', 'zeor_y_axis']);
  //   // this.objectives.push(avoidNZAD);
  //   const avoidNZAD = {
  //     id: 'avoidNZAD',
  //     label: 'Avoid Non-Zero Axis Distortions',
  //     description: 'Avoid Non-Zero Axis Distortions: Description', //TODO add description
  //     designChoices: this.getDesignChoicesBasedOnId(['zeor_x_axis', 'zeor_y_axis']),
  //     state: null,
  //     corrDesignChoices: 0
  //   }
  //   this.objectives.push(avoidNZAD);
  //   // add LL objective to HL objective
  //   avoidMI.lowLevelObjectives.push(avoidNZAD);

  //   if(this._hasColorEncoding) {
  //     // add legend
  //     // const addLegend = new Objective('addLegend');
  //     // addLegend.label = 'Show Legend'
  //     // const addLegend = new ShowLegend('addLegend', this.vegaSpec);
  //     // addLegend.designChoices = this.getDesignChoicesBasedOnId(['legend']);
  //     // this.objectives.push(addLegend);
  //     const addLegend = {
  //       id: 'addLegend',
  //       label: 'Show Legend',
  //       description: 'Show Legend: Description', //TODO add description
  //       designChoices: this.getDesignChoicesBasedOnId(['legend']),
  //       state: null,
  //       corrDesignChoices: 0
  //     }
  //     this.objectives.push(addLegend);
  //     // add LL objective to HL objective
  //     avoidMI.lowLevelObjectives.push(addLegend);

  //     // use the right color encoding
  //     // const rightColorEnc = new Objective('rightColorEnc');
  //     // rightColorEnc.label = 'Use Right Visual Color Encoding';
  //     // const rightColorEnc = new RightColorEncding('rightColorEnc', this.vegaSpec);
  //     // rightColorEnc.designChoices = this.getDesignChoicesBasedOnId(['nominal_color_scale']);
  //     // this.objectives.push(rightColorEnc);
  //     const rightColorEnc = {
  //       id: 'rightColorEnc',
  //       label: 'Use Right Visual Color Encoding',
  //       description: 'Use Right Visual Color Encoding: Description', //TODO add description
  //       designChoices: this.getDesignChoicesBasedOnId(['nominal_color_scale']),
  //       state: null,
  //       corrDesignChoices: 0
  //     }
  //     this.objectives.push(rightColorEnc);
  //     // add LL objective to HL objective
  //     avoidMI.lowLevelObjectives.push(rightColorEnc);
  //   }

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
  //     description: 'Avoid Distracting Embellishments: Description', //TODO add description
  //     designChoices: this.getDesignChoicesBasedOnId(['background_color']),
  //     state: null,
  //     corrDesignChoices: 0
  //   }
  //   this.objectives.push(avoidDisEm);
  //   // add LL objective to HL objective
  //   reduceML.lowLevelObjectives.push(avoidDisEm);

  //   // add HL Objectives to array
  //   this.highLevelObjectives.push(avoidMI);
  //   this.highLevelObjectives.push(reduceML);


  // }


  // getObjectivesState(): IObjectiveState[] {
  //   const stateObjectives = [];
  //   for (const ob of this.objectives) {
  //     const state = this.checkStateOfObjective(ob.id);
  //     stateObjectives.push({
  //       id: ob.id,
  //       label: ob.label,
  //       state: state.state,
  //       corrActions: state.corrActions,
  //       numActions: ob.actions.length
  //     });
  //   }
  //   return stateObjectives;
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

  // TODO remove is in parent class
  // getLowLevelObjectiveById(id: string): lowLevelObjective {
  //   console.log('get low level objective')
  //   return this.objectives.filter((elem) => elem.id === id)[0];
  // }

  private checkReduceOverplotting(): { state: ObjectiveState, corrActions: number } {
    // console.log('Overplotting -> Visualization container: ', { cntr: this.visContainer, children: this.visContainer.childNodes });

    // get svg element that has all points
    // const svgElement = this.visContainer.querySelector('.marks');
    // const svgElement = this.visContainer.childNodes[0];
    // console.log('svg container: ', svgElement);
    // 'g' element with the classes=.mark-symbol.role-mark.marks
    const groupWithAllMarks = this.visContainer.querySelector('.mark-symbol.role-mark.marks') as SVGGElement;
    // console.log('all marks container: ', groupWithAllMarks);
    // console.log('all marks container BBboc: ', groupWithAllMarks.getBBox());
    const bBoxSVGGElement = groupWithAllMarks.getBBox();
    const areaContainingMarks = bBoxSVGGElement.height * bBoxSVGGElement.width;

    const marks = groupWithAllMarks.querySelectorAll('path');
    // console.log('all marks: ', marks);

    let idx = 0;
    const markObjects = Array.from(marks).map((elem) => {
      const tempMarkInfo = elem.getBBox() as any;
      const tmpXYCoord = elem.getAttribute('transform');
      const tmpCoord = tmpXYCoord.substring(10, tmpXYCoord.length - 1).split(',');
      tempMarkInfo.x = Number(tmpCoord[0]);
      tempMarkInfo.y = Number(tmpCoord[1]);
      tempMarkInfo.r = Number(tempMarkInfo.width / 2);
      tempMarkInfo.mark = elem;
      tempMarkInfo.idx = idx;
      idx++;
      return tempMarkInfo;
    });


    let areaAllMarks = 0;
    // check if there are marks
    // if (marks.length > 0) {
    //   const mark = marks[0];
    //   const markInfo = mark.getBBox();
    //   const markDiameter = markInfo.width;
    //   // const markXYCoord = mark.getAttribute('transform');
    //   // const markCoord = markXYCoord.substring(10, markXYCoord.length - 1).split(',');
    //   // markInfo.x = Number(markCoord[0]);
    //   // markInfo.y = Number(markCoord[1]);
    //   // console.log('first mark Info: ', { mark, markInfo });

    //   // const xMin = markInfo.x - markInfo.width / 2;
    //   // const xMax = markInfo.x + markInfo.width / 2;
    //   // const yMin = markInfo.y - markInfo.height / 2;
    //   // const yMax = markInfo.y + markInfo.height / 2;

    //   // // get all circles overlapping current one
    //   // const neighMarks = Array.from(marks).filter((elem) => {
    //   //   const tempMarkInfo = elem.getBBox();
    //   //   const tmpXYCoord = elem.getAttribute('transform');
    //   //   const tmpCoord = tmpXYCoord.substring(10, tmpXYCoord.length - 1).split(',');
    //   //   tempMarkInfo.x = Number(tmpCoord[0]);
    //   //   tempMarkInfo.y = Number(tmpCoord[1]);

    //   //   return (tempMarkInfo.x > xMin && tempMarkInfo.x < xMax) && (tempMarkInfo.y > yMin && tempMarkInfo.y < yMax);
    //   // });
    //   // console.log('neighbours: ', neighMarks);

    //   const areaOneMark = Math.PI * (Math.pow(markDiameter, 2) / 4)
    //   areaAllMarks = areaOneMark * marks.length;
    //   // console.log('Areas: ', { areaOneMark, areaAllMarks, areaContainingMarks });
    // }


    // const hullmarks = convexHull(markObjects);
    // console.log('hull points info: ', hullmarks);
    // console.log('hull points: ', hullmarks.map((elem) => elem.mark));
    // const hullArea = caculateAreaPolygone(hullmarks);
    // console.log('hull Area: ', hullArea);
    console.groupCollapsed('Action: Overlapp')
    console.time("overlapp Calc");
    const areaOverlap = calculatePointsOverlap(markObjects);
    const percentageOverlap = areaOverlap.overlapArea / areaAllMarks;
    // console.log('point area overlap: ', areaOverlap);
    console.timeEnd("overlapp Calc");

    console.log('________');
    console.log('Overplotting points:', { points: marks.length, overlapPoints: areaOverlap.overlapPoints, ratio: areaOverlap.overlapPoints / marks.length });
    console.log('Overplotting Vis Area:', { pointsArea: areaAllMarks, areaContainingMarks, ratio: areaAllMarks / areaContainingMarks });
    // console.log('Overplotting Hull Area:', { pointsArea: areaAllMarks, hullArea, ratio: areaAllMarks / hullArea });
    console.log('Overplotting Overlap Area:', { pointsArea: areaAllMarks, overlapArea: areaOverlap.overlapArea, ratio: percentageOverlap });
    console.groupEnd();

    // get objective
    const objective = this.getObjective('reduceOP');
    /*

    // get deign choice of objective: 'sample_data', 'lower_mark_opacity', 'decrese_mark_size'
    const desCSampleState = objetive.designChoices.filter((elem) => elem.id === 'sample_data')[0].value;
    const desCLowOpacityState = objetive.designChoices.filter((elem) => elem.id === 'lower_mark_opacity')[0].value;
    const desCYDecMarkSizeState = objetive.designChoices.filter((elem) => elem.id === 'decrese_mark_size')[0].value;
    const desCStateCount = Number(desCSampleState) + Number(desCLowOpacityState) + Number(desCYDecMarkSizeState);

    let state = ObjectiveState.correct
    // set overplotting threshold to >30% (>0.30) of overlap area
    if(percentageOverlap > 0.3) {
      // OVERPLOTTING
      if(desCStateCount === 0) {
        // no design choices used -> state: wrong
        state = ObjectiveState.wrong;
      }

    } else {
      // NO OVERPLOTTING
      if(desCStateCount === 0) {
        // no design choices used -> state: correct
        state = ObjectiveState.correct;

      } else if (desCStateCount === 1) {
        // one design choice used
        if(desCSampleState) {
          // sample data used -> state: correct
          state = ObjectiveState.correct;
        } else if (desCYDecMarkSizeState) {
          // decreased mark sized used -> state: correct
          state = ObjectiveState.correct;
        } else if (desCLowOpacityState) {
          // lower opacity used -> state: wrong
          state = ObjectiveState.wrong;
        }
        
      } else if (desCStateCount === 1) {
        // two design choices used
        // check the design choices of the previous visualization
        // if
      }

    }

    */


    const amount = objective.actions.length;

    const numbOfTrue = objective.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objective.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const correct = numbOfTrue === 1;
    const corrActions = correct ? objective.actions.length : 0;

    return {
      state: correct ? ObjectiveState.correct : ObjectiveState.wrong,
      corrActions
    };
  }

  private checkAvoidNonZeroAxis(): { state: ObjectiveState, corrActions: number } {
    const objetive = this.getObjective('avoidNZAD');

    // get min and may values of data
    // const xMin = Math.min(...this.dataset.array(this.xEncoding) as number[]);
    // const xMax = Math.max(...this.dataset.array(this.xEncoding) as number[]);

    // const yMin = Math.min(...this.dataset.array(this.yEncoding) as number[]);
    // const yMax = Math.max(...this.dataset.array(this.yEncoding) as number[]);


    const minMax = aq.table({ x: this.dataset.array(this.xEncoding), y: this.dataset.array(this.yEncoding) })
      .rollup({
        xMin: d => op.min(d.x),
        xMax: d => op.max(d.x),
        yMin: d => op.min(d.y),
        yMax: d => op.max(d.y)
      }).objects()[0];



    // console.log('________');
    // // console.log('Axis min/max: ', { xMin, xMax, yMin, yMax });
    // console.log('Axis min/max: ', minMax);
    // const xdiff = Math.abs(minMax.xMax - minMax.xMin);
    // const ydiff = Math.abs(minMax.yMax - minMax.yMin);

    // // according to DRACO rules: http://vizrec.bernhardpointner.com/recommender
    // // Prefer not to use zero when the difference between min and max is larger than distance to 0.
    // // no show 0 -> max-min > min
    // // show 0 -> max-min < min
    // const xShow0 = minMax.xmin >= 0 && xdiff < minMax.xmin;
    // const yShow0 = minMax.ymin >= 0 && ydiff < minMax.ymin;
    // console.log('Axis prefered state: ', { xdiff, xShow0, ydiff, yShow0 });

    // // const amount = objetive.designChoices.length;


    // const desCXAxisState = objetive.actions.filter((elem) => elem.id === 'x_axis_zero')[0].value;
    const desCXAxisState = this.getAction('x_axis_zero').value;
    // const desCYAxisState = objetive.actions.filter((elem) => elem.id === 'y_axis_zero')[0].value;
    const desCYAxisState = this.getAction('y_axis_zero').value;

    // const xCorr = desCXAxisState === xShow0;
    // const yCorr = desCYAxisState === yShow0;
    
    const xCorr = desCXAxisState ===  (minMax.xMin >= 0);
    const yCorr = desCYAxisState ===  (minMax.yMin >= 0);
    console.log('Zero on axis: ',{xCorr, desCXAxisState, xMin: minMax.xMin, yCorr, desCYAxisState, yMin: minMax.yMin});

    const sumCorr = Number(xCorr) + Number(yCorr);


    const state = sumCorr === 2 ? ObjectiveState.correct : (sumCorr === 1 ? ObjectiveState.partial : ObjectiveState.wrong);
    const corrActions = sumCorr;
    // const numbOfTrue = objetive.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
    // const numbOfFalse = objetive.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    // const correct = numbOfTrue >= 1;
    // const corrActions = numbOfTrue;

    return {
      state,
      corrActions
    };
  }

  private checkShowLegend(): { state: ObjectiveState, corrActions: number } {
    const objetive = this.getObjective('addLegend');

    // TODO check if color encoding is used
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

    // TODO check attribtue type and the color type
    // attribute name for color encoding
    const colorEnc = (this.vegaSpec as any).encoding.color.field;
    const desCColorEncState = objetive.actions.filter((elem) => elem.id === 'nominal_colors')[0].value;

    // const amount = objetive.designChoices.length;

    // const numbOfTrue = objetive.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
    // const numbOfFalse = objetive.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    // const colorEncoding = (this.vegaSpec as any).encoding.color.field;


    let state = ObjectiveState.wrong;
    if (colorEnc === '') {
      // if no color encoding -> value does not matter
      // corr = true;
      state = ObjectiveState.correct;
    } else {
      // if color encoding -> check if attribute type is categorical, then the value has to be true
      const types = getColumnTypesFromArqueroTable(this.dataset);
      const datasetAttr = types.filter((elem) => elem.label === colorEnc)[0];
      if (datasetAttr.type === 'categorical') {
        // nominal color scale has to be used
        state = desCColorEncState ? ObjectiveState.correct : ObjectiveState.wrong;
      } else {
        // non nominal color scale has to be used
        state = desCColorEncState ? ObjectiveState.wrong : ObjectiveState.correct;
      }
    }

    return {
      state,
      corrActions: state === ObjectiveState.correct ? 1 : 0
    };
  }

  private checkAvoidEmbellishments(): { state: ObjectiveState, corrActions: number } {
    const objetive = this.getObjective('avoidDisEm');

    // const amount = objetive.actions.length;

    // const numbOfTrue = objetive.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
    const numbOfFalse = objetive.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    const correct = numbOfFalse === objetive.actions.length;
    const corrActions = correct ? objetive.actions.length : 0;


    return {
      state: correct ? ObjectiveState.correct : ObjectiveState.wrong,
      corrActions
    };
  }

}