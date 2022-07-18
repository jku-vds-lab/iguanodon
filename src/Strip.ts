import { DesignChoiceType, VisPiplineStage } from "./designChoices";
import { ObjectiveState } from "./Objective";
import { getUniqueRandomValuesFrom0toN, getUniqueRandomValuesFromArray } from "./util";
import { lowLevelObjective, VisType, VisualizationBase } from "./visualizations";


export class Strip {
  // visualizations: VisualizationBase[];
  // dataset;
  private _visHistory: { pos: number, score: number, visualization: VisualizationBase }[];
  $visStrip: HTMLDivElement;
  $visMultiPreview: HTMLDivElement;
  $visHoverPreview: HTMLDivElement;
  $visDetailPreview: HTMLDivElement;
  $visPipeline: HTMLDivElement;
  $detailsStrip: HTMLDivElement;
  $objectivesContainer: HTMLDivElement;
  $objectiveIndicator: HTMLDivElement;
  $scoreStrip: HTMLDivElement;
  private _numberOfPreview = 6;
  private _preview: { pos: number, visualization: VisualizationBase }[];
  private _pipelineDesignChoiceOrder: string[]; // save the order of the design choices for the current strip
  xAxisAttributes: string[];
  yAxisAttributes: string[];
  colorAttributes: string[];

  constructor(initalVisualization: VisualizationBase, visStrip: HTMLDivElement, visMulti: HTMLDivElement) {
    // this.dataset = dataset;
    this._visHistory = [];
    this._pipelineDesignChoiceOrder = [];
    this.$visStrip = visStrip;
    this.$visMultiPreview = visMulti;
    this.$visHoverPreview = document.getElementById('hover-preview') as HTMLDivElement;
    this.$visDetailPreview = document.getElementById('detail-preview') as HTMLDivElement;
    this.$visPipeline = document.getElementById('vis-pipeline') as HTMLDivElement;
    this.$detailsStrip = document.getElementById('details-strip') as HTMLDivElement;
    this.$objectivesContainer = document.getElementById('objectives') as HTMLDivElement;
    this.$objectiveIndicator = document.getElementById('objective-indicator-svg') as HTMLDivElement;
    this.$scoreStrip = document.getElementById('score-strip') as HTMLDivElement;



    // TODO remvoe hard coded attribute encoding options
    if (initalVisualization.type === VisType.Scatter) {
      this.xAxisAttributes = ['Miles_per_Gallon', 'Displacement', 'Horsepower', 'Weight_in_lbs', 'Acceleration'];
      this.yAxisAttributes = ['Miles_per_Gallon', 'Displacement', 'Horsepower', 'Weight_in_lbs', 'Acceleration'];
      this.colorAttributes = ['Origin', 'Cylinders', 'Acceleration', null];
    } else if (initalVisualization.type === VisType.Line) {
      this.xAxisAttributes = ['date'];
      this.yAxisAttributes = ['price'];
      this.colorAttributes = ['symbol'];
    } else if (initalVisualization.type === VisType.Bar) {

    }


    // setup all preview elements
    for (let i = 0; i < this._numberOfPreview; i++) {
      // create elements for
      const visMultiItem = document.createElement('div');
      visMultiItem.classList.add('vis-mult-item');
      this.$visMultiPreview.appendChild(visMultiItem);
    }

    this.setupVisPipeline(initalVisualization);
    this.setUpObjectivesList(initalVisualization);
    this.addVisualization(initalVisualization);
    // this.setupObjecticeIdication();
  }

  scrollToEnd() {
    const strip = document.getElementById('strip');
    const scrollWidth = strip.scrollWidth;
    // console.log('scrollWidth: ', scrollWidth);
    // strip.scrollLeft = scrollWidth;
    strip.scrollTo({
      top: 0,
      left: scrollWidth,
      behavior: 'smooth'
    });
  }

  setUpObjectivesList(visualization: VisualizationBase) {
    // TODO remove the next 2 lines
    // get high-level objectives
    // const highObjs = visualization.objectives.filter((elem) => elem.isHighLevel === true);

    // add high-level elements
    for (const hob of visualization.highLevelObjectives) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = hob.label;
      tempDiv.classList.add('objective-item', 'high-level-objective');
      tempDiv.dataset.objId = `${hob.id}`;
      this.$objectivesContainer.appendChild(tempDiv);


      // add low-level elements
      for (const lob of hob.lowLevelObjectives) {
        const tmpLowObj = document.createElement('div');
        tmpLowObj.classList.add('objective-item', 'low-level-objective');
        tmpLowObj.dataset.objId = `${lob.id}`;
        // // indicator
        // const tmpLowObjInd = document.createElement('div');
        // tmpLowObjInd.classList.add('obj-item-ind');
        // // label 
        // const tmpLowObjLabel = document.createElement('div');
        // tmpLowObjLabel.classList.add('obj-item-label');
        // tmpLowObjLabel.innerHTML = lob.label;
        // // descirption
        // const tmpLowObjDescr = document.createElement('div');
        // tmpLowObjDescr.classList.add('obj-item-descr');
        // tmpLowObjDescr.innerHTML = lob.description;


        // tmpLowObj.appendChild(tmpLowObjInd);
        // tmpLowObj.appendChild(tmpLowObjLabel);
        // tmpLowObj.appendChild(tmpLowObjDescr);

        // create details element
        const tmpLowDetails = document.createElement('details');
        // create details element content
        tmpLowDetails.innerHTML = `
        <summary>${lob.label}</summary>
        <p>${lob.description}</p>
        `;
        tmpLowObj.appendChild(tmpLowDetails);
        this.$objectivesContainer.appendChild(tmpLowObj);


        for (const dc of lob.designChoices) {
          this.highlightPipelineOption(tmpLowObj, dc.id);
        }
        // hover
        tmpLowObj.addEventListener('mouseenter', (event) => {
          // add highlight
          // dimensions of svg container
          const indicatorDim = this.$objectiveIndicator.getBoundingClientRect();
          const leftSpace = indicatorDim.left;
          const topSpace = indicatorDim.top;
          const elementSpace = 3;
          // console.log('svg dim: ', { indicatorDim, leftSpace, topSpace });
          const svgElement: SVGElement = this.$objectiveIndicator.querySelector('#svg-objective');
          // dimensions of the objective
          const dim = tmpLowObj.getBoundingClientRect();
          // console.log('dim: ', dim);


          const labelSize = window.getComputedStyle(tmpLowObj).getPropertyValue('font-size');

          // coordinates for objective
          const xObj = indicatorDim.width;
          const yObjTopSpace = (Number(labelSize.substring(0, labelSize.length - 2)) * 1.5) / 2;
          const yObj = dim.top + yObjTopSpace - topSpace;
          // const yObj = dim.top + (dim.height / 2) - topSpace;
          // console.log('y distances: ', { original: (dim.height / 2), dynamic: yObjTopSpace });

          const positions = this._visHistory.map((elem) => elem.pos);
          const lastPos = positions.length === 0 ? 0 : (Math.max(...positions));
          // get details container for lastPos
          const lastCntr = this.$detailsStrip.querySelector(`[data-pos='${lastPos}']`);
          // get design choice containers
          for (const dc of lob.designChoices) {
            // cntrDesC.classList.add('highlighted');
            const cntrDesC = lastCntr.querySelector(`[data-design-choice-id='${dc.id}']`).children[0] as HTMLDivElement;
            const dimDc = cntrDesC.getBoundingClientRect();
            // console.log('dimDc: ', dimDc);
            // coordinates for the design choice
            const xDc = dimDc.right - leftSpace + elementSpace;
            const yDC = dimDc.top + (dimDc.height / 2) - topSpace;

            // coordinates for path control points
            const cx1 = (xObj - xDc) / 2 + xDc;
            const cy1 = yDC;
            const cx2 = (xObj - xDc) / 2 + xDc;
            const cy2 = yObj;
            const d = 'M ' + xDc + ' ' + yDC +
              ' C ' + cx1 + ' ' + cy1 + ', ' + cx2 + ' ' + cy2 + ', ' + xObj + ' ' + yObj;

            // add path
            const currPath: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            // currPath.setAttribute('id', 'path-' + ceParent.id + '-to-' + ceChild.id);
            // currPath.setAttribute('class', 'svg-path');
            currPath.classList.add('obj-dc-path');
            currPath.setAttribute('d', d);
            currPath.setAttribute('stroke-width', '5px');
            svgElement.appendChild(currPath);

          }

        });
        tmpLowObj.addEventListener('mouseleave', (event) => {
          // remove highlight
          const svgElement: SVGElement = this.$objectiveIndicator.querySelector('#svg-objective');
          const positions = this._visHistory.map((elem) => elem.pos);
          const lastPos = positions.length === 0 ? 0 : (Math.max(...positions));
          // get details container for lastPos
          const lastCntr = this.$detailsStrip.querySelector(`[data-pos='${lastPos}']`);
          // get design choices container
          for (const dc of lob.designChoices) {
            const cntrDesC = lastCntr.querySelector(`[data-design-choice-id='${dc.id}']`);
            // cntrDesC.classList.remove('highlighted');
            const paths = svgElement.querySelectorAll('.obj-dc-path');
            paths.forEach((elem) => {
              svgElement.removeChild(elem);
            })

          }
        });
      }
    }

  }

  // setupObjecticeIdication() {
  //   const svgElement: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  //   svgElement.setAttribute('id', 'svg-objective');
  //   this.$objectiveIndicator.appendChild(svgElement);
  // }

  addObjectiveIdication(obj: lowLevelObjective, designChoiceId: string, startPos: number, endPos: number, betterScore: boolean) {
    // get current dimensions
    // const stripDimensions = this.$detailsStrip.getBoundingClientRect();
    const indicatorDim = this.$objectiveIndicator.getBoundingClientRect();
    const leftSpace = indicatorDim.left;
    const topSpace = indicatorDim.top;
    const elementSpace = 3;
    console.log('indicators: ', indicatorDim);
    const svgElement: SVGElement = this.$objectiveIndicator.querySelector('#svg-objective');
    const htmlElement = this.$detailsStrip.querySelector('#wrapper-indicator-html');
    // update current dimensions
    // svgElement.setAttribute('width', '' + stripDimensions.width);
    // svgElement.setAttribute('height', '' + stripDimensions.height);

    // get details container for startPos
    const startCntr = this.$detailsStrip.querySelector(`[data-pos='${startPos}']`);
    // get design choice container
    const startDesC = startCntr.querySelector(`[data-design-choice-id='${designChoiceId}']`).children[0];
    const dimStartDesC = startDesC.getBoundingClientRect();
    console.log('starCntr', { startDesC, dimStartDesC });
    // get details container for endPos
    const endCntr = this.$detailsStrip.querySelector(`[data-pos='${endPos}']`);
    // get design choice container
    const endDesC = endCntr.querySelector(`[data-design-choice-id='${designChoiceId}']`).children[0];
    const dimEndDesC = endDesC.getBoundingClientRect();
    console.log('endDesC', { endDesC, dimEndDesC });

    // draw line between the two design choices
    console.log('svg-line: ', { start: startDesC, end: endDesC });
    const currLine: SVGLineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const x1 = dimStartDesC.right - leftSpace + elementSpace;
    const x2 = dimEndDesC.left - leftSpace - elementSpace;
    const y1 = dimStartDesC.top + (dimStartDesC.height / 2) - topSpace;
    const y2 = dimEndDesC.top + (dimEndDesC.height / 2) - topSpace;
    console.log('strip dim: ', document.getElementById('strip').getBoundingClientRect())

    const scoreClass = betterScore ? 'better' : 'worse';
    currLine.classList.add(scoreClass);
    currLine.setAttribute('x1', `${x1}`);
    currLine.setAttribute('y1', `${y1}`);
    currLine.setAttribute('x2', `${x2}`);
    currLine.setAttribute('y2', `${y2}`);
    console.log('svg line: ', currLine);
    svgElement.appendChild(currLine);

    if (obj) {
      const divLabel = document.createElement('div');
      divLabel.classList.add('objective-detail-info', scoreClass);
      divLabel.innerHTML = `${obj.label}`;
      const divTop = y1 - 25;
      const divLeft = (x1 + (x2 - x1) / 2) - 75;
      divLabel.style.top = `${divTop}px`;
      divLabel.style.left = `${divLeft}px`;
      htmlElement.appendChild(divLabel);
    }

  }

  async addVisualization(visualization: VisualizationBase, isHoverPreview: boolean = false) {
    if (isHoverPreview) {
      const visItem = document.createElement('div');
      // visItem.classList.add('vis-item');
      this.$visHoverPreview.appendChild(visItem);
      visualization.showVisualization(visItem);

      // const detailItem = document.createElement('div');
      this.addPipelineState(this.$visDetailPreview, visualization);
    } else {
      // create container for new visualization
      const visItem = document.createElement('div');
      visItem.classList.add('vis-item');
      // add vis container to vis strip
      this.$visStrip.appendChild(visItem);

      try {
        // add visualization to container
        await visualization.showVisualization(visItem);
      } catch (error) {
        // HACK add meaningful error catch
        console.warn('Problem with promise of adding visualization to history in Strip > addVisualization(): ', error);
      }


      // get new position index
      const positions = this._visHistory.map((elem) => elem.pos);
      const newPos = positions.length === 0 ? 0 : (Math.max(...positions) + 1)

      // set HTML dataset attribute pos
      visItem.dataset.pos = `${newPos}`;

      // create container for visualization pipeline state (design choices)
      const stateItem = document.createElement('div');
      stateItem.classList.add('detail-item');
      // set HTML dataset attribute pos
      stateItem.dataset.pos = `${newPos}`;
      // add container item to deatils strip
      this.$detailsStrip.appendChild(stateItem);
      // add the design choice configurations to the new pipeline container
      this.addPipelineState(stateItem, visualization);
      // update the small multiples for the new visualization
      this.updateMulitPreview(visualization);

      // update score function
      // get all objective and their correctness
      // const visObjectives = visualization.objectives;


      const corrObjectives = visualization.getObjectivesState();

      // for (const ob of visObjectives) {
      //   if (!ob.isHighLevel) {
      //     corrObjectives.push(ob.isCorrect());
      //   }
      // }
      console.log('correctness of objecties: ', corrObjectives);
      let maxDesC = 0;
      let amountCorrDesC = 0;
      for (const cob of corrObjectives) {
        maxDesC = maxDesC + cob.numDesignChoices;
        // highlight objective correctness
        const objClass = cob.state === ObjectiveState.correct ? 'correct' : (cob.state === ObjectiveState.partial ? 'partial' : 'wrong');
        const objElem = this.$objectivesContainer.querySelector(`[data-obj-id=${cob.id}]`);
        if (objElem) {
          // remove old classes
          objElem.classList.remove('correct', 'partial', 'wrong');
          // add new class
          objElem.classList.add(objClass);
        }

        // get number of correct design choices
        amountCorrDesC = amountCorrDesC + cob.corrDesignChoices;

      }
      const score = Math.round((amountCorrDesC / maxDesC) * 10000) / 100;
      console.log('Correcness Score: ', { maxDesC, amountCorrDesC, score });

      // create container for visualization pipeline state (design choices)
      const scoreItem = document.createElement('div');
      scoreItem.innerHTML = '' + score;
      scoreItem.classList.add('score-item');
      this.$scoreStrip.append(scoreItem);

      // save current visualization in history with new position index
      this._visHistory.push({ pos: newPos, score, visualization })


      // get the changes in the design choices 
      console.log('visHistory: ', this._visHistory);
      const histLeg = this._visHistory.length;
      if (histLeg >= 2) {
        const oldState = this._visHistory[histLeg - 2];
        const oldVis = oldState.visualization;
        const oldVisState = oldVis.getStateOfDesignChoices();
        const oldScore = oldState.score;

        const newState = this._visHistory[histLeg - 1];
        const newVis = newState.visualization;
        const newVisState = newVis.getStateOfDesignChoices();
        const newScore = newState.score;
        console.log('New and old Visualization States: ', { oldVisState, newVisState });

        const diffArr = [];
        for (const oldDesC of oldVisState) {
          const newDesC = newVisState.filter((elem) => elem.dcId === oldDesC.dcId)[0];
          if (newDesC) {
            const oldValue = oldDesC.value;
            const newValue = newDesC.value;
            if (oldValue !== newValue) {
              diffArr.push({
                dcId: oldDesC.dcId,
                type: oldDesC.type,
                oldValue,
                newValue
              });
            }
          }
        }
        const betterScore = (newScore - oldScore) >= 0 ? true : false;
        console.log('Diff in Vis States: ', diffArr);
        const hlObj = visualization.getLHLObjctivesBasedOnDesignChoice(diffArr[0].dcId)
        console.log('Objectives: ', hlObj);
        this.addObjectiveIdication(hlObj.lowLevel, diffArr[0].dcId, newPos - 1, newPos, betterScore);




      }


      // scroll to the end of the script
      this.scrollToEnd();
    }

  }

  async updateMulitPreview(visualization: VisualizationBase) {
    const numbDesignChoices = visualization.designChoices.length;
    // console.log('update Previews from design choices: ', visualization.designChoices);
    const divPreviews = Array.from(this.$visMultiPreview.getElementsByClassName('vis-mult-item')) as HTMLDivElement[];

    // console.log('update Previews');
    // console.log('params: ', numbDesignChoices,)
    // get random array with indices of the design choices
    const designChoiceSelection = getUniqueRandomValuesFrom0toN(visualization.designChoices.length, divPreviews.length);
    // console.log('params: ', { numbDesignChoices, designChoiceSelection });
    // for (const divElem of divPreviews) {
    divPreviews.forEach(async (divElem, i) => {
      // console.log('preview element: ', divElem);
      divElem.textContent = '';

      if (i < numbDesignChoices) {
        //const preVis = deepCopy(visualization);
        const visCntrLabel = document.createElement('div');
        visCntrLabel.classList.add('small-multiple-label');
        divElem.appendChild(visCntrLabel);

        // const visCntrWrapper = document.createElement('div');
        // visCntrWrapper.classList.add('small-multiple-vis-wrapper');
        // divElem.appendChild(visCntrWrapper);
        const visCntr = document.createElement('div');
        visCntr.classList.add('small-multiple-vis');
        divElem.appendChild(visCntr);

        // const preVis = new Scatterplot(`preview-${i}`);
        // preVis.baseDesignChoicesOnVisualization(visualization);

        const preVis = visualization.getCopyofVisualization(`preview-${i}`)
        // preVis.id = `preview-${i}`;
        // console.log('copy: ', preVis);
        const selctionId = designChoiceSelection[i];
        const desC = preVis.designChoices[selctionId];
        // console.log('preview: ', { i, preVis });

        if (desC.type === DesignChoiceType.option) {
          // console.log('design choice: ', { i, id: desC.id, old: desC.value.toString(), new: (!desC.value).toString() });
          desC.value = !desC.value;
          visCntrLabel.innerHTML = desC.label;
        } else {
          // color, x, y - encodings
          if (desC.id === 'x_axis_encoding') {
            const xEncoding = desC.value as string;
            // remove current value from possible values
            const xAttr = this.xAxisAttributes.filter((elem) => elem !== xEncoding);
            const newValue = getUniqueRandomValuesFromArray(xAttr, 1)[0];
            // console.log('design choice: ', { i, id: desC.id, old: desC.value === null || undefined ? 'null' : desC.value.toString(), new: newValue === null ? 'null' : newValue.toString() });
            desC.value = newValue;
          } else if (desC.id === 'y_axis_encoding') {
            const yEncoding = desC.value as string;
            // remove current value from possible values
            const yAttr = this.xAxisAttributes.filter((elem) => elem !== yEncoding);
            const newValue = getUniqueRandomValuesFromArray(yAttr, 1)[0];
            // console.log('design choice: ', { i, id: desC.id, old: desC.value === null || undefined ? 'null' : desC.value.toString(), new: newValue === null ? 'null' : newValue.toString() });
            desC.value = newValue;
          } else if (desC.id === 'color_encoding') {
            const colorEncoding = desC.value as string;
            // remove current value from possible values
            const colorAttr = this.xAxisAttributes.filter((elem) => elem !== colorEncoding);
            const newValue = getUniqueRandomValuesFromArray(colorAttr, 1)[0];
            // console.log('design choice: ', { i, id: desC.id, old: desC.value === null || undefined ? 'null' : desC.value.toString(), new: newValue === null ? 'null' : newValue.toString() });
            desC.value = newValue;
          }

        }
        //const previewVegaSpec = desC.updateVegaSpec(preVis)
        //this._visHistory.push({ pos: i, visualization: preVis })

        this.addPreviewActions(visCntr, preVis);
        // // hover
        // visCntr.addEventListener('mouseenter', (event) => {
        //   // add preview
        //   this.addVisualization(preVis, true);
        // });
        // visCntr.addEventListener('mouseleave', (event) => {
        //   // remove preview
        //   this.$visHoverPreview.innerHTML = '';
        //   this.$visDetailPreview.innerHTML = '';
        //   // const hoverPreview = this.$visStrip.getElementsByClassName('hover-preview')[0];
        //   // hoverPreview.parentNode.removeChild(hoverPreview);
        // });
        // // click
        // visCntr.addEventListener('click', (event) => {
        //   // remove preview
        //   // const hoverPreview = this.$visStrip.getElementsByClassName('hover-preview')[0];
        //   // hoverPreview.parentNode.removeChild(hoverPreview);
        //   this.$visHoverPreview.innerHTML = '';
        //   this.$visDetailPreview.innerHTML = '';
        //   // add visualization to history
        //   this.addVisualization(preVis);
        // });

        try {
          // add visualization as small multiple
          preVis.showVisualization(visCntr, true);
          // await embed(divElem, previewVegaSpec, { "actions": false });
        } catch {
          // FIXME add error catch
        }
      } else {
        this._visHistory.push({ pos: i, score: 0, visualization: null })

      }
    });

    // for (let i = 0; i < this._numberOfPreview; i++) {
    //   // create elements for
    //   const visMultiItem = document.createElement('div');
    //   visMultiItem.classList.add('vis-mult-item');
    //   this.$visMultiPreview.appendChild(visMultiItem);
    //   if (i < numbDesignChoices) {
    //     const dc = visualization.designChoices[i];
    //     const previewVegaSpec = dc.updateVegaSpec(visualization, true)
    //     try {
    //       await embed(visMultiItem, previewVegaSpec, { "actions": false });
    //     } catch {
    //       // FIXME add error catch
    //     }
    //   }

    // }
  }

  addPreviewActions(actionElem: HTMLElement, previewVis: VisualizationBase) {
    // hover
    actionElem.addEventListener('mouseenter', (event) => {
      // add preview
      this.addVisualization(previewVis, true);
    });
    actionElem.addEventListener('mouseleave', (event) => {
      // remove preview
      this.$visHoverPreview.innerHTML = '';
      this.$visDetailPreview.innerHTML = '';
      // const hoverPreview = this.$visStrip.getElementsByClassName('hover-preview')[0];
      // hoverPreview.parentNode.removeChild(hoverPreview);
    });

    // click
    actionElem.addEventListener('click', (event) => {
      // remove preview
      // const hoverPreview = this.$visStrip.getElementsByClassName('hover-preview')[0];
      // hoverPreview.parentNode.removeChild(hoverPreview);
      this.$visHoverPreview.innerHTML = '';
      this.$visDetailPreview.innerHTML = '';
      // add visualization to history
      this.addVisualization(previewVis);
    });
  }

  addPreviewActionsBasedOnDesignChoice(actionElem: HTMLElement, previewVis: VisualizationBase) {

    // hover
    actionElem.addEventListener('mouseenter', (event) => {

      // get current pos
      const detailItem = actionElem.parentElement.parentElement;
      // get new position index
      const positions = this._visHistory.map((elem) => elem.pos);
      const lastPos = positions.length === 0 ? 0 : (Math.max(...positions))
      console.log('Hover add preview: ', { actionElem, detailItem, lastPos, currPos: detailItem.dataset.pos })
      // check if current position === last position
      if (detailItem.dataset.pos === `${lastPos}`) {
        // add preview
        this.addVisualization(previewVis, true);
      }
    });
    actionElem.addEventListener('mouseleave', (event) => {
      // get current pos
      const detailItem = actionElem.parentElement.parentElement;
      // get new position index
      const positions = this._visHistory.map((elem) => elem.pos);
      const lastPos = positions.length === 0 ? 0 : (Math.max(...positions))
      console.log('Hover remove preview: ', { actionElem, detailItem, lastPos, currPos: detailItem.dataset.pos })
      // check if current position === last position
      if (detailItem.dataset.pos === `${lastPos}`) {
        // remove preview
        this.$visHoverPreview.innerHTML = '';
        this.$visDetailPreview.innerHTML = '';
        // const hoverPreview = this.$visStrip.getElementsByClassName('hover-preview')[0];
        // hoverPreview.parentNode.removeChild(hoverPreview);
      }
    });

    // click
    actionElem.addEventListener('click', (event) => {
      event.preventDefault();
      // get current pos
      const detailItem = actionElem.parentElement.parentElement;
      // get new position index
      const positions = this._visHistory.map((elem) => elem.pos);
      const lastPos = positions.length === 0 ? 0 : (Math.max(...positions))
      // console.log('Click preview: ', { actionElem, detailItem, lastPos, currPos: detailItem.dataset.pos })
      // check if current position === last position
      if (detailItem.dataset.pos === `${lastPos}`) {
        // remove preview
        // const hoverPreview = this.$visStrip.getElementsByClassName('hover-preview')[0];
        // hoverPreview.parentNode.removeChild(hoverPreview);
        this.$visHoverPreview.innerHTML = '';
        this.$visDetailPreview.innerHTML = '';
        // add visualization to history
        this.addVisualization(previewVis);
      }
    });


  }

  addPipelineState(container: HTMLDivElement, visualization: VisualizationBase) {
    for (const desChOrderId of this._pipelineDesignChoiceOrder) {
      const pipItem = document.createElement('div');
      pipItem.classList.add('pipeline-item');
      container.appendChild(pipItem);

      const desC = visualization.designChoices.filter((elem) => elem.id === desChOrderId)[0]
      // console.log('add pipeline stage: ', { desC, desChOrderId, designChoices: visualization.designChoices });
      if (desC) {
        pipItem.classList.add('pipeline-stage-item');
        // set HTML dataset attribute
        pipItem.dataset.designChoiceId = desC.id

        if (desC.type === DesignChoiceType.option) {
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = desC.value as boolean;
          // cb.disabled = true;
          pipItem.appendChild(cb);
          this.highlightPipelineOption(cb, desC.id);
          const preVis = visualization.getCopyofVisualization(`preview-cb`);
          const preVisDesC = preVis.getDesignChoicesBasedOnId([desC.id])[0];
          preVisDesC.value = !preVisDesC.value;
          this.addPreviewActionsBasedOnDesignChoice(cb, preVis);

        } else {
          const div = document.createElement('div');
          div.innerHTML = `${desC.value}`;
          pipItem.appendChild(div);
          this.highlightPipelineOption(div, desC.id);
          // if (desC.id === 'sample_data') {
          //   const cb = document.createElement('input');
          //   cb.type = 'checkbox';
          //   // TODO check logic
          //   cb.checked = desC.value === this.dataset.lenght;
          //   cb.disabled = true;
          //   pipItem.appendChild(cb);
          // } else {
          //   pipItem.innerHTML = `${desC.value}`;
          // }
        }


      }
    }
  }

  highlightPipelineOption(elem: HTMLElement, designChoiceId: string) {
    // hover
    elem.addEventListener('mouseenter', (event) => {
      // add highlight to vis stage option
      this.addVisPipelineOptionHighlight(designChoiceId);
    });
    elem.addEventListener('mouseleave', (event) => {
      // remove highlight to vis stage option
      this.removeVisPipelineOptionHighlight(designChoiceId);
    });
  }

  addVisPipelineOptionHighlight(designChoiceId: string) {
    const option = this.$visPipeline.querySelector(`[data-design-choice-id=${designChoiceId}]`);
    option.classList.add('highlighted');
  }

  removeVisPipelineOptionHighlight(designChoiceId: string) {
    const option = this.$visPipeline.querySelector(`[data-design-choice-id=${designChoiceId}]`);
    option.classList.remove('highlighted');
  }

  setupVisPipeline(visualization: VisualizationBase) {
    // 1. Raw information
    const rawInf = document.createElement('div');
    rawInf.innerHTML = 'Raw Information'
    rawInf.classList.add('pipeline-item');
    this.$visPipeline.appendChild(rawInf);
    this._pipelineDesignChoiceOrder.push('empty');

    // 2. Data Transform -> Stage
    const dcDataTrans = visualization.designChoices.filter((elem) => elem.stage === VisPiplineStage.dataTransform)
    for (const desC of dcDataTrans) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = desC.label;
      tempDiv.classList.add('data-transform', 'pipeline-item', 'pipeline-stage-item');
      tempDiv.dataset.designChoiceId = desC.id
      this.$visPipeline.appendChild(tempDiv);
      this._pipelineDesignChoiceOrder.push(desC.id);
    }

    // 3. Dataset
    const datasetLable = document.createElement('div');
    datasetLable.innerHTML = 'Dataset'
    datasetLable.classList.add('pipeline-item');
    this.$visPipeline.appendChild(datasetLable);
    this._pipelineDesignChoiceOrder.push('empty');

    // 4. Visual Mapping -> Stage
    const dcVisualMap = visualization.designChoices.filter((elem) => elem.stage === VisPiplineStage.visualMapping)
    for (const desC of dcVisualMap) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = desC.label;
      tempDiv.classList.add('visual-map', 'pipeline-item', 'pipeline-stage-item');
      tempDiv.dataset.designChoiceId = desC.id
      this.$visPipeline.appendChild(tempDiv);
      this._pipelineDesignChoiceOrder.push(desC.id);
    }

    // 5. Visual Form
    const visualForm = document.createElement('div');
    visualForm.innerHTML = 'Visual Form'
    visualForm.classList.add('pipeline-item');
    this.$visPipeline.appendChild(visualForm);
    this._pipelineDesignChoiceOrder.push('empty');

    // 6. View Transform -> Stage
    const dcViewTrans = visualization.designChoices.filter((elem) => elem.stage === VisPiplineStage.viewTransform)
    for (const desC of dcViewTrans) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = desC.label;
      tempDiv.classList.add('view-transform', 'pipeline-item', 'pipeline-stage-item');
      tempDiv.dataset.designChoiceId = desC.id
      this.$visPipeline.appendChild(tempDiv);
      this._pipelineDesignChoiceOrder.push(desC.id);
    }

    // 7. View
    const view = document.createElement('div');
    view.innerHTML = 'View'
    view.classList.add('pipeline-item');
    this.$visPipeline.appendChild(view);
    this._pipelineDesignChoiceOrder.push('empty');
  }

}