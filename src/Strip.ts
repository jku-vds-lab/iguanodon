import { DesignChoiceType, VisPiplineStage } from "./designChoices";
import { getUniqueRandomValuesFrom0toN, getUniqueRandomValuesFromArray } from "./util";
import { Scatterplot, VisualizationBase } from "./visualizations";

export class Strip {
  // visualizations: VisualizationBase[];
  dataset;
  private _visHistory: { pos: number, visualization: VisualizationBase }[];
  $visStrip: HTMLDivElement;
  $visMultiPreview: HTMLDivElement;
  $visHoverPreview: HTMLDivElement;
  $visDetailPreview: HTMLDivElement;
  $visPipeline: HTMLDivElement;
  $detailsStrip: HTMLDivElement;
  private _numberOfPreview = 6;
  private _preview: { pos: number, visualization: VisualizationBase }[];
  private _pipelineDesignChoiceOrder: string[];
  axisAttributes: string[];
  colorAttributes: string[];

  constructor(dataset: any, initalVisualization: VisualizationBase, visStrip: HTMLDivElement, visMulti: HTMLDivElement) {
    this.dataset = dataset;
    this._visHistory = [];
    this._pipelineDesignChoiceOrder = [];
    this.$visStrip = visStrip;
    this.$visMultiPreview = visMulti;
    this.$visHoverPreview = document.getElementById('hover-preview') as HTMLDivElement;
    this.$visDetailPreview = document.getElementById('detail-preview') as HTMLDivElement;
    this.$visPipeline = document.getElementById('vis-pipeline') as HTMLDivElement;
    this.$detailsStrip = document.getElementById('details-strip') as HTMLDivElement;


    // TODO remvoe hard coded attribute encoding options
    this.axisAttributes = ['Miles_per_Gallon', 'Displacement', 'Horsepower', 'Weight_in_lbs', 'Acceleration'];
    this.colorAttributes = ['Origin', 'Cylinders', 'Acceleration', null];


    // setup all preview elements
    for (let i = 0; i < this._numberOfPreview; i++) {
      // create elements for
      const visMultiItem = document.createElement('div');
      visMultiItem.classList.add('vis-mult-item');
      this.$visMultiPreview.appendChild(visMultiItem);
    }

    this.setupVisPipeline(initalVisualization);
    this.addVisualization(initalVisualization);
  }

  scrollToEnd() {
    const strip = document.getElementById('strip');
    const scrollWidth = strip.scrollWidth;
    // console.log('scrollWidth: ', scrollWidth);
    strip.scrollLeft = scrollWidth;
  }

  addVisualization(visualization: VisualizationBase, isHoverPreview: boolean = false) {
    if (isHoverPreview) {
      const visItem = document.createElement('div');
      // visItem.classList.add('vis-item');
      this.$visHoverPreview.appendChild(visItem);
      visualization.showVisualization(visItem);

      const detailItem = document.createElement('div');
      this.addPipelineState(this.$visDetailPreview, visualization);
    } else {
      const visItem = document.createElement('div');
      visItem.classList.add('vis-item');
      this.$visStrip.appendChild(visItem);
      visualization.showVisualization(visItem);

      const positions = this._visHistory.map((elem) => elem.pos);
      const newPos = positions.length === 0 ? 0 : (Math.max(...positions) + 1)

      this._visHistory.push({ pos: newPos, visualization })
      const stateItem = document.createElement('div');
      stateItem.classList.add('detail-item');
      this.$detailsStrip.appendChild(stateItem);
      this.addPipelineState(stateItem, visualization);
      this.updateMulitPreview(visualization);
      this.scrollToEnd();
    }

  }

  async updateMulitPreview(visualization: VisualizationBase) {
    const numbDesignChoices = visualization.designChoices.length;
    const divPreviews = Array.from(this.$visMultiPreview.getElementsByClassName('vis-mult-item')) as HTMLDivElement[];

    const designChoiceSelection = getUniqueRandomValuesFrom0toN(visualization.designChoices.length, divPreviews.length);
    // for (const divElem of divPreviews) {
    divPreviews.forEach(async (divElem, i) => {
      // console.log('preview element: ', divElem);
      divElem.textContent = '';

      if (i < numbDesignChoices) {
        //const preVis = deepCopy(visualization);
        const visCntr = document.createElement('div');
        divElem.appendChild(visCntr);
        const preVis = new Scatterplot(`preview-${i}`);
        preVis.baseDesignChoicesOnVisualization(visualization);
        // preVis.id = `preview-${i}`;
        // console.log('copy: ', preVis);
        const selctionId = designChoiceSelection[i];
        const desC = preVis.designChoices[selctionId];
        if (desC.type === DesignChoiceType.option) {
          desC.value = !desC.value;
        } else {
          // color, x, y - encodings
          if (desC.id === 'y_axis_encoding' || desC.id === 'x_axis_encoding') {
            const newValue = getUniqueRandomValuesFromArray(this.axisAttributes, 1)[0];
            desC.value = newValue;
          } else if (desC.id === 'color_encoding') {
            const newValue = getUniqueRandomValuesFromArray(this.colorAttributes, 1)[0];
            desC.value = newValue;
          }

        }
        //const previewVegaSpec = desC.updateVegaSpec(preVis)

        //this._visHistory.push({ pos: i, visualization: preVis })

        // hover
        visCntr.addEventListener('mouseenter', (event) => {
          // add preview
          this.addVisualization(preVis, true);
        });
        visCntr.addEventListener('mouseleave', (event) => {
          // remove preview
          this.$visHoverPreview.innerHTML = '';
          this.$visDetailPreview.innerHTML = '';
          // const hoverPreview = this.$visStrip.getElementsByClassName('hover-preview')[0];
          // hoverPreview.parentNode.removeChild(hoverPreview);
        });
        // click
        visCntr.addEventListener('click', (event) => {
          // remove preview
          // const hoverPreview = this.$visStrip.getElementsByClassName('hover-preview')[0];
          // hoverPreview.parentNode.removeChild(hoverPreview);
          this.$visHoverPreview.innerHTML = '';
          this.$visDetailPreview.innerHTML = '';
          // add visualization to history
          this.addVisualization(preVis);
        });

        try {
          // add visualization as small multiple
          preVis.showVisualization(visCntr);
          // await embed(divElem, previewVegaSpec, { "actions": false });
        } catch {
          // FIXME add error catch
        }
      } else {
        this._visHistory.push({ pos: i, visualization: null })

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

  addPipelineState(container: HTMLDivElement, visualization: VisualizationBase) {


    for (const desChOrderId of this._pipelineDesignChoiceOrder) {
      const pipItem = document.createElement('div');
      pipItem.classList.add('pipeline-item');
      container.appendChild(pipItem);

      const desC = visualization.designChoices.filter((elem) => elem.id === desChOrderId)[0]
      // console.log('add pipeline stage: ', { desC, desChOrderId, designChoices: visualization.designChoices });
      if (desC) {
        pipItem.classList.add('pipeline-stage-item');
        if (desC.type === DesignChoiceType.option) {
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = desC.value as boolean;
          cb.disabled = true;
          pipItem.appendChild(cb);
        } else {
          if (desC.id === 'sample_data') {
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            // TODO check logic
            cb.checked = desC.value === this.dataset.lenght;
            cb.disabled = true;
            pipItem.appendChild(cb);
          } else {
            pipItem.innerHTML = `${desC.value}`;
          }
        }
      }
    }


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