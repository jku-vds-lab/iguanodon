import ColumnTable from "arquero/dist/types/table/column-table";
import { deepCopy, getAbbreviations, getColumnTypesFromArqueroTable, getRandomBoolean, uniqueFilter } from "./util";
import { IObjective, ObjectiveState, VisType, VisualizationBase } from "./visualizations";

export enum actionsScatter {
  SampleData = "sampleData",
  DecreaseMarkSize = "decreaseMarkSize",
  DecreaseMarkOpacity = "decreaseMarkOpacity",
  ChangeMarkToRing = "changeMarktoRing",
  AggregateDataPoints = "aggregateDataPoints",
  AddLegend = "addLegend",
  ApplyNominalColors = "applyNominalColors",
  AddLegendBorder = "addLegendBorder",
  AddLegendTitle = "addLegendTitle",
  AddBackgroundColor = "addBackgroundColor",
  LightenGridLines = "lightenGridLines",
  HorizontalTextForAxis = "horizontalTextForAxis",
  WriteAbbreviationsOut = "writeAbbreviationsOut"
}

export enum objectivesScatter {
  ReduceOverplotting = "reduceOverplotting",
  UtilizeColorEncoding = "utilizeColorEncoding",
  ReduceChartjunk = "reduceChartjunk",
  ImproveReadability = "improveReadability",
}

export interface IActionVisConfig {
  id: actionsScatter, 
  value: boolean
}


export class Scatterplot extends VisualizationBase {

  private xEncoding: string;
  private yEncoding: string;
  private colorEncoding: string;
  private _hasColorEncoding: boolean;
  private _fullDatasetInfo: {
    sampled: boolean,
    allItems: number,
    notNullItems: number
  };
  private _sampledDatasetInfo: {
    sampled: boolean,
    allItems: number,
    notNullItems: number
  };

  private _axisTitleFontSize: number = 11;

  constructor(fullDataset: ColumnTable, sampledDataset: ColumnTable, xEncoding: string, yEncoding: string, colorEncoding: string) {
    super(fullDataset,sampledDataset, VisType.Scatter);
    this.xEncoding = this.convertNullEncoding(xEncoding); 
    this.yEncoding = this.convertNullEncoding(yEncoding); 
    this.colorEncoding = this.convertNullEncoding(colorEncoding); 

    this._hasColorEncoding = this.colorEncoding !== '';
    
    // console.log('SP enocodings: ',{x: this.xEncoding, y: this.yEncoding, c: this.colorEncoding});
    this.createDatasetSizes();


    // 1. create the actions based on encodings
    this.createActions();
    // 2. create objectives based on encodings
    this.createObjectives();
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

  private createDatasetSizes(){
    // full dataset
    // get items without missing values
    const nonMissingItems = this.fullDataset.objects().filter((elem) => {
      if(this._hasColorEncoding) {
        return elem[this.xEncoding] && elem[this.yEncoding] && elem[this.colorEncoding];
      } else {
        return elem[this.xEncoding] && elem[this.yEncoding];
      } 
    });
    this._fullDatasetInfo = {
      sampled: false,
      allItems: this.fullDataset.objects().length,
      notNullItems: nonMissingItems.length
    };
    // console.log('_fullDataset: ', this._fullDatasetInfo);

    // sampled dataset
    // get items without missing values
    const nonMissingItemsSampeld = this.sampledDataset.objects().filter((elem) => {
      if(this._hasColorEncoding) {
        return elem[this.xEncoding] && elem[this.yEncoding] && elem[this.colorEncoding];
      } else {
        return elem[this.xEncoding] && elem[this.yEncoding];
      } 
    });
    this._sampledDatasetInfo = {
      sampled: true,
      allItems: this.sampledDataset.objects().length,
      notNullItems: nonMissingItemsSampeld.length
    };


    // console.log('_sampledDataset: ', this._sampledDatasetInfo);
  }

  createActions() {
    this.actions = [];

    // ACTIONS (general)
    // sample data
    const aSample = this.createAction(actionsScatter.SampleData,'Sample data randomly(25%)', getRandomBoolean());
    this.actions.push(aSample);
    // decrease mark size
    const aSize = this.createAction(actionsScatter.DecreaseMarkSize,'Decreased mark size', getRandomBoolean());
    this.actions.push(aSize);
    // decrease mark opacity
    const aOpacity = this.createAction(actionsScatter.DecreaseMarkOpacity,'Decrease mark opacity', getRandomBoolean());
    this.actions.push(aOpacity);
    // change mark type to ring
    const aType = this.createAction(actionsScatter.ChangeMarkToRing,'Change mark type to ring', getRandomBoolean());
    this.actions.push(aType);
    // aggregation (mean)
    const aAggregation = this.createAction(actionsScatter.AggregateDataPoints,'Aggregate data points (average)', getRandomBoolean());
    this.actions.push(aAggregation);
    // add background color or image
    const aBackground = this.createAction(actionsScatter.AddBackgroundColor,'Add background color or image', getRandomBoolean());
    this.actions.push(aBackground);
    // lighten grid lines
    const aGridLines = this.createAction(actionsScatter.LightenGridLines,'Lighten grid lines', getRandomBoolean());
    this.actions.push(aGridLines);
    // use horizontal text for y-axis title
    const aHorizontalText = this.createAction(actionsScatter.HorizontalTextForAxis,'Use horizontal text for y-axis title', getRandomBoolean());
    this.actions.push(aHorizontalText);
    // write abbreviations out
    const aWriteAbbrOut = this.createAction(actionsScatter.WriteAbbreviationsOut,'Write abbreviations out', getRandomBoolean());
    this.actions.push(aWriteAbbrOut);


    // FIXME
    // ACTIONS (conditional)
    if(this._hasColorEncoding) {
      // add legend
      const aLegend = this.createAction(actionsScatter.AddLegend,'Add legend', getRandomBoolean());
      this.actions.push(aLegend);
      // apply nominal color schema
      const aNominalColors = this.createAction(actionsScatter.ApplyNominalColors,'Apply nominal color schema', getRandomBoolean());
      this.actions.push(aNominalColors);
      // add border around legend
      const aLegendBorder = this.createAction(actionsScatter.AddLegendBorder,'Add border around legend', getRandomBoolean());
      this.actions.push(aLegendBorder);
      // add legend title
      const aLegendTitle = this.createAction(actionsScatter.AddLegendTitle,'Add legend title', getRandomBoolean());
      this.actions.push(aLegendTitle);
    }
  }

  
  createObjectives() {
    // const avoidMIObjectives: IObjective[] = [];
    // const reduceMLObjectives: IObjective[] = [];

    // ----- objectives ----- 
    this.objectives = [];

    // OBJECTIVES (general)
    // reduce overplotting
    const reduceOP: IObjective = {
      id: objectivesScatter.ReduceOverplotting,
      label: 'Reduce overplotting',
      description: 'Reduce Overplotting: Description', //TODO add description
      actions: this.getMultipleAction([actionsScatter.SampleData, actionsScatter.DecreaseMarkSize, actionsScatter.DecreaseMarkOpacity, actionsScatter.ChangeMarkToRing, actionsScatter.AggregateDataPoints]),
      state: null,
      corrActions: 0
      // numActions: 4
    }
    if(reduceOP.actions.length > 0) {
      this.objectives.push(reduceOP);
    }

    // reduce chartjunk
    const reduceChartjunk: IObjective = {
      id: objectivesScatter.ReduceChartjunk,
      label: 'Reduce chartjunk',
      description: 'Reduce Chartjunk: Description', //TODO add description
      actions: this.getMultipleAction([actionsScatter.AddBackgroundColor, actionsScatter.LightenGridLines]),
      state: null,
      corrActions: 0
      // numActions: 1
    }
    if(reduceChartjunk.actions.length > 0) {
      this.objectives.push(reduceChartjunk);
    }

    // improve readability
    const improveRead: IObjective = {
      id: objectivesScatter.ImproveReadability,
      label: 'Improve readability',
      description: 'Improve Readability: Description', //TODO add description
      actions: this.getMultipleAction([actionsScatter.HorizontalTextForAxis, actionsScatter.WriteAbbreviationsOut]),
      state: null,
      corrActions: 0
      // numActions: 1
    }
    if(improveRead.actions.length > 0) {
      this.objectives.push(improveRead);
    }

    // OBJECTIVES (conditional)
    // coditional objectives
    if(this._hasColorEncoding) {
      // utilize visual encodings properly
      const utilizeColorEnc: IObjective = {
        id: objectivesScatter.UtilizeColorEncoding,
        label: 'Utilize color encoding properly',
        description: 'Utilize color encoding properly: Description', //TODO add description
        actions: this.getMultipleAction([actionsScatter.AddLegend, actionsScatter.ApplyNominalColors, actionsScatter.AddLegendBorder, actionsScatter.AddLegendTitle]),
        state: null,
        corrActions: 0
        // numActions: 1
      }
      if(utilizeColorEnc.actions.length > 0) {
        this.objectives.push(utilizeColorEnc);
      }
    }
    
  }

  updateVegaSpec() {
    // get number of data items
    const dataTotalSize = this.fullDataset.numRows();

    // get action values
    // sample data
    const sampleDataAction = this.getAction(actionsScatter.SampleData);
    const sampleDataActionValue = sampleDataAction !== null ? sampleDataAction.value : false;
    // const sampledSize = sampleDataActionValue ? Math.ceil(dataTotalSize/4) : dataTotalSize;
    // const sampledSize = sampleDataActionValue ? Math.ceil(dataTotalSize/2) : dataTotalSize;
    const visDataset = sampleDataActionValue ? this.sampledDataset : this.fullDataset;
    this.currentDatasetInfo = sampleDataActionValue ? this._sampledDatasetInfo : this._fullDatasetInfo;


    // decreased size
    const decreasedSizeAction = this.getAction(actionsScatter.DecreaseMarkSize);
    const decreasedSizeActionValue = decreasedSizeAction !== null ? decreasedSizeAction.value : false;
    const size = decreasedSizeActionValue ? 15 : 30;

    // decrease opacity
    const opacityAction = this.getAction(actionsScatter.DecreaseMarkOpacity);
    const opacityActionValue = opacityAction !== null ? opacityAction.value : false;
    const opacity = opacityActionValue ? 0.4 : 1;

    // mark as ring
    const markRingAction = this.getAction(actionsScatter.ChangeMarkToRing);
    const markRingActionValue = markRingAction !== null ? markRingAction.value : false;
    const markFilled = !markRingActionValue;

    // aggreation mean
    const aggregateAction = this.getAction(actionsScatter.AggregateDataPoints);
    const aggregateValues = aggregateAction !== null ? aggregateAction.value : false;

    // background color
    const backgroundColorAction = this.getAction(actionsScatter.AddBackgroundColor);
    const backgroundColorValue = backgroundColorAction !== null ? backgroundColorAction.value : false;
    const backgorundColor = backgroundColorValue ? '#d4d4d4' : '#FFFFFF';

    // lighten grid color
    const lightenGridColorAction = this.getAction(actionsScatter.LightenGridLines);
    const lightenGridColorValue = lightenGridColorAction !== null ? lightenGridColorAction.value : true;
    const gridColor = lightenGridColorValue ? 'lightGray' : 'black';

    // legend title
    const addLegendTitleAction = this.getAction(actionsScatter.AddLegendTitle);
    const addLegendTitleActionValue = addLegendTitleAction !== null ? addLegendTitleAction.value : true;
    
    // legend border
    const addLegendBorderAction = this.getAction(actionsScatter.AddLegendBorder);
    const addLegendBorderActionValue = addLegendBorderAction !== null ? addLegendBorderAction.value : false;

    // horizontal text for x-axiy
    const useHorizontalAxisTitleAction = this.getAction(actionsScatter.HorizontalTextForAxis);
    const useHorizontalAxisTitleActionValue = useHorizontalAxisTitleAction !== null ? useHorizontalAxisTitleAction.value : true;

    // write abbreviations out
    const writeAbbreviationsOutAction = this.getAction(actionsScatter.WriteAbbreviationsOut);
    const writeAbbreviationsOutValue = writeAbbreviationsOutAction !== null ? writeAbbreviationsOutAction.value : true;

    // // zero on x-axis
    // const zeroXAxisAction = this.getAction('x_axis_zero');
    // const zeroXAxis = zeroXAxisAction !== null ? zeroXAxisAction.value : false;

    // // zero on y-axis
    // const zeroYAxisAction = this.getAction('y_axis_zero');
    // const zeroYAxis = zeroYAxisAction !== null ? zeroYAxisAction.value : false;

    // legend
    const legendAction = this.getAction(actionsScatter.AddLegend);
    const showLegend = legendAction !== null ? legendAction.value : false;
    
    // nominal color sale
    const dataTypes = getColumnTypesFromArqueroTable(this.fullDataset);
    const datasetAttr = dataTypes.filter((elem) => elem.label === this.colorEncoding)[0];
    let colorTypeNotNominal = 'ordinal';
    if (datasetAttr?.type === 'continuous') {
      // values of the attribute
      const data = this.fullDataset.array(this.colorEncoding);
      const uniqueData = data.filter(uniqueFilter); // get unique values
      if (uniqueData.length > 10) {
        colorTypeNotNominal = 'quantitative';
      }
    }

    const nominalColorsAction = this.getAction(actionsScatter.ApplyNominalColors);
    const nominalColorsActionValue = nominalColorsAction !== null ? nominalColorsAction.value : false;
    const colorType = nominalColorsActionValue ? 'nominal' : colorTypeNotNominal;


    // setup the VegaSpec object
    // gerneral 
    let vegaSpecBuildUp: any = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      //data: { url: './assets/cars.json' },
      // data: { values: this.fullDataset.objects() }, // TODO replace with link to file 
      // transform: [{ sample: sampledSize }],
      data: { values: visDataset.objects() }, // TODO replace with link to file    
      width: 'container', //responsive width
      height: 'container', //responsive height
      autosize: {type: 'fit', contains: 'padding'},
      title : {
        text: 'Car mileage decreases with higher horsepower',
        fontSize: 14
      },
      background: `${backgorundColor}`, // background color}
      // view: {fill: `${backgorundColor}`}, // background color}
    };

    // marks
    vegaSpecBuildUp.mark = {
      type: 'point', // mark type
      filled: markFilled, // markd filled -> point / not filled -> ring
      size, // mark size
      opacity //mark opacity
    };

    // encodings 
    vegaSpecBuildUp.encoding = {};
    // x
    const xTitle = writeAbbreviationsOutValue ? this.xEncoding : getAbbreviations(this.xEncoding);
    if(this.xEncoding) {
      vegaSpecBuildUp.encoding.x = {
        field: this.xEncoding,
        title: xTitle,
        type: 'quantitative',
        // scale: { zero: zeroXAxis } // start x-axis with 0
      };

      if(aggregateValues) {
        vegaSpecBuildUp.encoding.x.aggregate = 'mean'
      }
    }
    // y
    const yTitle = writeAbbreviationsOutValue ? this.yEncoding : getAbbreviations(this.yEncoding);
    if(this.yEncoding) {
      vegaSpecBuildUp.encoding.y = {
        field: this.yEncoding,
        type: 'quantitative',
        title: yTitle
        // titel: `${niceName(this.yEncoding)}`,
        // scale: { zero: zeroYAxis } // start y-axis with 0
      };

      if(aggregateValues) {
        vegaSpecBuildUp.encoding.y.aggregate = 'mean';
      }

      if(useHorizontalAxisTitleActionValue) {
        vegaSpecBuildUp.encoding.y.axis = {
          titleAngle: 0,
          titleAnchor: 'end',
          titleAlign: 'left',
          titleLineHeight: Math.ceil(this._axisTitleFontSize*2.3),
          titleBaseline: 'line-bottom'
        };        
      }
    }

    // color
    const colorTitle = writeAbbreviationsOutValue ? this.colorEncoding : getAbbreviations(this.colorEncoding);
    if(this.colorEncoding) {
      vegaSpecBuildUp.encoding.color = {
        field: this.colorEncoding,
        title: colorTitle,
        type: colorType,  // define color scale type
      };

      if(!addLegendTitleActionValue) {
        vegaSpecBuildUp.encoding.color.title = ""; // remove legend title
      }
    }

    // config
    vegaSpecBuildUp.config = {
      legend: {
        disable: !showLegend, // hide legend
        strokeColor: addLegendBorderActionValue ? "black" : null, // add border around legend
        padding: addLegendBorderActionValue ? 5 : 0, // increase padding with legend border
      },
      axis: {
        gridColor, // gird lines color
        titleFontSize: this._axisTitleFontSize
      }
    };

    // console.log('vegaSpecBuildUp: ', vegaSpecBuildUp);
    this.vegaSpec = vegaSpecBuildUp;
  }


  getCopyofVisualization(): VisualizationBase {
    const copy = new Scatterplot(this.fullDataset, this.sampledDataset, this.xEncoding, this.yEncoding, this.colorEncoding);
    // copy.setActionsBasedOnVisualization(this);
    // TODO update usabe actions
    copy.actions = deepCopy(this.actions);
    // copy.objectives = deepCopy(this.objectives);
    return copy;
  }


  checkStateOfObjective(id: string): { state: ObjectiveState, corrActions: number } {
    // make sure the vegaSpec is up-to-date
    this.updateVegaSpec();

    if (id === objectivesScatter.ReduceOverplotting) {
      return this.checkReduceOverplotting();
    } else if (id === objectivesScatter.UtilizeColorEncoding) {
      return this.checkUtilizeVisualEncodings();
    } else if (id === objectivesScatter.ReduceChartjunk) {
      return this.checkReduceChartjunk();
    } else if (id === objectivesScatter.ImproveReadability) {
      return this.checkImproveReadability();
    }

  }

  private checkImproveReadability(): { state: ObjectiveState, corrActions: number } {
    const objective = this.getObjective(objectivesScatter.ImproveReadability);
  

    const amount = objective.actions.length;
    const actions = objective.actions;


    let corrActions = 0;
    // use horizontal text -> true
    const aHorizontalText = actions.filter((elem) => elem.id === actionsScatter.HorizontalTextForAxis)
    if(aHorizontalText.length === 1) {
      const aHorizontalTextValue = aHorizontalText[0].value;
      if(aHorizontalTextValue === true) {
        corrActions += 1;
      }
    }
    // write abbreviations out -> true
    const aWriteAbbrOut = actions.filter((elem) => elem.id === actionsScatter.WriteAbbreviationsOut)
    if(aWriteAbbrOut.length === 1) {
      const aWriteAbbrOutValue = aWriteAbbrOut[0].value;
      if(aWriteAbbrOutValue === true) {
        corrActions += 1;
      }
    }

    const state = corrActions === amount ? ObjectiveState.correct : (corrActions === 0 ? ObjectiveState.wrong : ObjectiveState.partial);


    return {
      state,
      corrActions
    };
  }  

  private checkReduceChartjunk(): { state: ObjectiveState, corrActions: number } {
    const objective = this.getObjective(objectivesScatter.ReduceChartjunk);

    const amount = objective.actions.length;
    const actions = objective.actions;


    let corrActions = 0;
    // add background -> false
    const aBackground = actions.filter((elem) => elem.id === actionsScatter.AddBackgroundColor)
    if(aBackground.length === 1) {
      const aBackgroundValue = aBackground[0].value;
      if(aBackgroundValue === false) {
        corrActions += 1;
      }
    }
    // lighten grid lines -> true
    const aLitherGrid = actions.filter((elem) => elem.id === actionsScatter.LightenGridLines)
    if(aLitherGrid.length === 1) {
      const aLitherGridValue = aLitherGrid[0].value;
      if(aLitherGridValue === true) {
        corrActions += 1;
      }
    }

    const state = corrActions === amount ? ObjectiveState.correct : (corrActions === 0 ? ObjectiveState.wrong : ObjectiveState.partial);


    return {
      state,
      corrActions
    };
  }


  private checkUtilizeVisualEncodings(): { state: ObjectiveState, corrActions: number } {
    const objective = this.getObjective(objectivesScatter.UtilizeColorEncoding);

    const amount = objective.actions.length;
    const actions = objective.actions;

    let corrActions = 0;
    // legend -> true
    const aLegend = actions.filter((elem) => elem.id === actionsScatter.AddLegend)
    if(aLegend.length === 1) {
      const aLegendValue = aLegend[0].value;
      if(aLegendValue === true) {
        corrActions += 1;
      }
    }
    // nominal color -> true
    const aNolColor = actions.filter((elem) => elem.id === actionsScatter.ApplyNominalColors)
    if(aNolColor.length === 1) {
      const aNolColorValue = aNolColor[0].value;
      if(aNolColorValue === true) {
        corrActions += 1;
      }
    }
    // legend border -> false
    const aLegendBorder = actions.filter((elem) => elem.id === actionsScatter.AddLegendBorder)
    if(aLegendBorder.length === 1) {
      const aLegendBorderValue = aLegendBorder[0].value;
      if(aLegendBorderValue === false) {
        corrActions += 1;
      }
    }
    // legend title -> true
    const aLegendTitle = actions.filter((elem) => elem.id === actionsScatter.AddLegendTitle)
    if(aLegendTitle.length === 1) {
      const aLegendTitleValue = aLegendTitle[0].value;
      if(aLegendTitleValue === true) {
        corrActions += 1;
      }
    }

    const state = corrActions === amount ? ObjectiveState.correct : (corrActions === 0 ? ObjectiveState.wrong : ObjectiveState.partial);

    return {
      state,
      corrActions
    };

  }
  private checkReduceOverplotting(): { state: ObjectiveState, corrActions: number } {
    // console.log('Overplotting -> Visualization container: ', { cntr: this.visContainer, children: this.visContainer.childNodes });

     // get objective
    const objective = this.getObjective(objectivesScatter.ReduceOverplotting);
    const amount = objective.actions.length;

    const numbOfTrue = objective.actions.map((elem) => elem.value).filter((elem) => elem === true).length;
    // const numbOfFalse = objective.actions.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    let correct = numbOfTrue === 1;
    let corrActions = correct ? objective.actions.length : 0;

    // TODO // FIXME needed ?
    /*
    // no actions are applied
    // check overplotting if exists
    if(numbOfTrue === 0) {
      // get svg element that has all points
      const svgElement = this.visContainer.querySelector('svg');
      
      // 'g' element with the classes=.mark-symbol.role-mark.marks
      const groupWithAllMarks = this.visContainer.querySelector('.mark-symbol.role-mark.marks') as SVGGElement;

      // get all the marks
      const marks = groupWithAllMarks.querySelectorAll('path');

      // get the all marks and their position for overlap calculation
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
      if (marks.length > 0) {
        const mark = marks[0];
        const markInfo = mark.getBBox();
        const markDiameter = markInfo.width;
        // area of on mark
        const areaOneMark = Math.PI * (Math.pow(markDiameter, 2) / 4)
        // area of all marks
        areaAllMarks = areaOneMark * marks.length;
      }

      // calculate overlapping area of marks
      const areaOverlap = calculatePointsOverlap(markObjects);
      // realation of overlap area to area of all marks
      const percentageOverlap = areaOverlap.overlapArea / areaAllMarks;

      if(percentageOverlap > 0.3) {
        correct = false;
        corrActions = 0;
      }
    }
    */


    return {
      state: correct ? ObjectiveState.correct : ObjectiveState.wrong,
      corrActions
    };
  }

}