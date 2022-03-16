import * as aq from 'arquero';
import { op } from "arquero";
import ColumnTable from "arquero/dist/types/table/column-table";
import { VisualizationSpec } from 'vega-embed';
import { addBackgroundColor, addLegend, decreseMarkSize, lowerOpacityMark, nominalColorScale, sampleData, startWith0XAxis, startWith0YAxis } from "./designChoices";
import { ObjectiveState } from "./Objective";
import { caculateAreaPolygone, calculatePointsOverlap, convexHull, getColumnTypesFromArqueroTable } from "./util";
import { VisType, VisualizationBase } from "./visualizations";


export class Scatterplot extends VisualizationBase {

  private xEncoding: string;
  private yEncoding: string;
  private colorEncoding: string;

  constructor(id: string, dataset: ColumnTable, xEncoding: string, yEncoding: string, colorEncoding: string) {
    super(id, dataset);
    this.type = VisType.Scatter;
    this.xEncoding = xEncoding;
    this.yEncoding = yEncoding;
    this.colorEncoding = colorEncoding;
    if (colorEncoding === null || colorEncoding === 'null') {
      this.colorEncoding = '';
    }

    this.setupVegaSpecification();
    this.setupDesignChoices();
    this.setupObjectives();
  }

  getCopyofVisualization(copyId: string): VisualizationBase {
    const copyScatter = new Scatterplot(copyId, this.dataset, this.xEncoding, this.yEncoding, this.colorEncoding);
    copyScatter.baseDesignChoicesOnVisualization(this);

    // copyScatter.vegaSpec = deepCopy(this.vegaSpec);
    // // objectives
    // copyScatter.objectives = deepCopy(this.objectives);

    // // design choices
    // copyScatter.designChoices = deepCopy(this.designChoices);
    return copyScatter;
  }

  setupVegaSpecification() {
    // const dataLen = this.dataset.length;
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
    smVegaSpec.encoding.x.title = null;
    smVegaSpec.encoding.y.title = null;
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

    // TODO remove/comment out encodings
    // // x-axis encoding
    // const xAxisEnc = new xAxisEncoding();
    // xAxisEnc.value = this.xEncoding;
    // // xAxisEnc.value = 'Weight_in_lbs';
    // this.designChoices.push(xAxisEnc);

    // // y-axis encoding
    // const yAxisEnc = new yAxisEncoding();
    // yAxisEnc.value = this.yEncoding;
    // // yAxisEnc.value = 'Horsepower';
    // this.designChoices.push(yAxisEnc);

    // // y-axis encoding
    // const colorEnc = new colorEncoding();
    // colorEnc.value = this.colorEncoding;
    // // colorEnc.value = 'Origin';
    // this.designChoices.push(colorEnc);

  }


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
      description: 'Reduce Overplotting: Description', //TODO add description
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
      description: 'Avoid Non-Zero Axis Distortions: Description', //TODO add description
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
      description: 'Show Legend: Description', //TODO add description
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
      description: 'Use Right Visual Color Encoding: Description', //TODO add description
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
      description: 'Avoid Distracting Embellishments: Description', //TODO add description
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


  getObjectivesState(): { id: string, state: ObjectiveState, corrDesignChoices: number, numDesignChoices: number }[] {
    const stateObjectives = [];
    for (const ob of this.objectives) {
      const state = this.checkStateOfObjective(ob.id);
      stateObjectives.push({
        id: ob.id,
        state: state.state,
        corrDesignChoices: state.corrDesignChoices,
        numDesignChoices: ob.designChoices.length
      });
    }
    return stateObjectives;
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

  // TODO remove is in parent class
  // getLowLevelObjectiveById(id: string): lowLevelObjective {
  //   console.log('get low level objective')
  //   return this.objectives.filter((elem) => elem.id === id)[0];
  // }

  private checkReduceOverplotting(): { state: ObjectiveState, corrDesignChoices: number } {
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
    if (marks.length > 0) {
      const mark = marks[0];
      const markInfo = mark.getBBox();
      const markDiameter = markInfo.width;
      // const markXYCoord = mark.getAttribute('transform');
      // const markCoord = markXYCoord.substring(10, markXYCoord.length - 1).split(',');
      // markInfo.x = Number(markCoord[0]);
      // markInfo.y = Number(markCoord[1]);
      // console.log('first mark Info: ', { mark, markInfo });

      // const xMin = markInfo.x - markInfo.width / 2;
      // const xMax = markInfo.x + markInfo.width / 2;
      // const yMin = markInfo.y - markInfo.height / 2;
      // const yMax = markInfo.y + markInfo.height / 2;

      // // get all circles overlapping current one
      // const neighMarks = Array.from(marks).filter((elem) => {
      //   const tempMarkInfo = elem.getBBox();
      //   const tmpXYCoord = elem.getAttribute('transform');
      //   const tmpCoord = tmpXYCoord.substring(10, tmpXYCoord.length - 1).split(',');
      //   tempMarkInfo.x = Number(tmpCoord[0]);
      //   tempMarkInfo.y = Number(tmpCoord[1]);

      //   return (tempMarkInfo.x > xMin && tempMarkInfo.x < xMax) && (tempMarkInfo.y > yMin && tempMarkInfo.y < yMax);
      // });
      // console.log('neighbours: ', neighMarks);

      const areaOneMark = Math.PI * (Math.pow(markDiameter, 2) / 4)
      areaAllMarks = areaOneMark * marks.length;
      // console.log('Areas: ', { areaOneMark, areaAllMarks, areaContainingMarks });
    }


    const hullmarks = convexHull(markObjects);
    // console.log('hull points info: ', hullmarks);
    // console.log('hull points: ', hullmarks.map((elem) => elem.mark));
    const hullArea = caculateAreaPolygone(hullmarks);
    // console.log('hull Area: ', hullArea);

    console.time("overlapp Calc");
    const areaOverlap = calculatePointsOverlap(markObjects);
    const percentageOverlap = areaOverlap.overlapArea / areaAllMarks;
    // console.log('point area overlap: ', areaOverlap);
    console.timeEnd("overlapp Calc");

    console.log('________');
    console.log('Overplotting points:', { points: marks.length, overlapPoints: areaOverlap.overlapPoints, ratio: areaOverlap.overlapPoints / marks.length });
    console.log('Overplotting Vis Area:', { pointsArea: areaAllMarks, areaContainingMarks, ratio: areaAllMarks / areaContainingMarks });
    console.log('Overplotting Hull Area:', { pointsArea: areaAllMarks, hullArea, ratio: areaAllMarks / hullArea });
    console.log('Overplotting Overlap Area:', { pointsArea: areaAllMarks, overlapArea: areaOverlap.overlapArea, ratio: percentageOverlap });

    // get objective
    const objetive = this.getLowLevelObjectiveById('reduceOP');
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



    console.log('________');
    // console.log('Axis min/max: ', { xMin, xMax, yMin, yMax });
    console.log('Axis min/max: ', minMax);
    const xdiff = Math.abs(minMax.xMax - minMax.xMin);
    const ydiff = Math.abs(minMax.yMax - minMax.yMin);

    // according to DRACO rules: http://vizrec.bernhardpointner.com/recommender
    // Prefer not to use zero when the difference between min and max is larger than distance to 0.
    // no show 0 -> max-min > min
    // show 0 -> max-min < min
    const xShow0 = minMax.xmin >= 0 && xdiff < minMax.xmin;
    const yShow0 = minMax.ymin >= 0 && ydiff < minMax.ymin;
    console.log('Axis prefered state: ', { xdiff, xShow0, ydiff, yShow0 });

    // const amount = objetive.designChoices.length;


    const desCXAxisState = objetive.designChoices.filter((elem) => elem.id === 'zeor_x_axis')[0].value;
    const desCYAxisState = objetive.designChoices.filter((elem) => elem.id === 'zeor_y_axis')[0].value;

    const xCorr = desCXAxisState === xShow0;
    const yCorr = desCYAxisState === yShow0;
    const sumCorr = Number(xCorr) + Number(yCorr);


    const state = sumCorr === 2 ? ObjectiveState.correct : (sumCorr === 1 ? ObjectiveState.partial : ObjectiveState.wrong);
    const corrDesignChoices = sumCorr;
    // const numbOfTrue = objetive.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
    // const numbOfFalse = objetive.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
    // const correct = numbOfTrue >= 1;
    // const corrDesignChoices = numbOfTrue;

    return {
      state,
      corrDesignChoices
    };
  }

  private checkShowLegend(): { state: ObjectiveState, corrDesignChoices: number } {
    const objetive = this.getLowLevelObjectiveById('addLegend');

    // TODO check if color encoding is used
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

    // TODO check attribtue type and the color type
    // attribute name for color encoding
    const colorEnc = (this.vegaSpec as any).encoding.color.field;
    const desCColorEncState = objetive.designChoices.filter((elem) => elem.id === 'nominal_color_scale')[0].value;

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
      corrDesignChoices: state === ObjectiveState.correct ? 1 : 0
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