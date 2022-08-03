import ColumnTable from "arquero/dist/types/table/column-table";
import embed, { VisualizationSpec } from "vega-embed";
import { designChoiceBase, DesignChoiceType } from "./designChoices";
import { ObjectiveState } from "./Objective";
import { deepCopy } from "./util";

/**
 * Enumeration for the visualization type, e.g. scatterplot.
 */
export enum VisType {
  Scatter,
  Line,
  Bar
}

export interface lowLevelObjective {
  id: string,
  label: string,
  description: string,
  designChoices: designChoiceBase[],
  state: ObjectiveState,
  corrDesignChoices: number,
}

export interface highLevelObjective {
  id: string,
  label: string,
  description: string,
  lowLevelObjectives: lowLevelObjective[],
}

export abstract class VisualizationBase {
  id: string;
  type: VisType;
  dataset: ColumnTable;

  // vega specification -> JSON object
  vegaSpec: VisualizationSpec;

  // objectives
  objectives: lowLevelObjective[];

  highLevelObjectives: highLevelObjective[];

  // design choices
  designChoices: designChoiceBase[];

  // HTML element with the visualization
  visContainer: HTMLElement;

  // TODO add dynamic data as parameter
  constructor(id: string, dataset) {
    this.id = id;
    this.dataset = dataset;
    // this.setupVegaSpecification();
    // this.setupDesignChoices();
    // this.setupObjectives();
  }

  async showVisualization(container: HTMLDivElement, isSmallMultiple: boolean = false) {
    this.visContainer = container;
    // for (const desC of this.designChoices) {
    //   this.vegaSpec = desC.updateVegaSpec(this);
    // }
    // make sure the vegaSpec is up-to-date
    this.updateVegaSpecBasedOnDesignChoices()
    // console.log('plot vega vis: ', this.id, this.vegaSpec);
    try {
      // await embed(container, this.vegaSpec, { actions: false, renderer: 'svg' });
      if (isSmallMultiple) {
        const smVegaSpec = this.updateVegaSpecForSmallMultiple(deepCopy(this.vegaSpec));

        await embed(container, smVegaSpec, { actions: false });
      } else {
        await embed(container, this.vegaSpec, { actions: false, renderer: 'svg' });
      }
    } catch (error) {
      // HACK add meaningful error catch
      console.warn('Problem with promise in visualization > showVisualization(): ', error);
    }

  }

  updateVegaSpecBasedOnDesignChoices() {
    for (const desC of this.designChoices) {
      this.vegaSpec = desC.updateVegaSpec(this);
    }
  }

  convertNullEncoding(value: string): string {
    if (value === null || value === 'null') {
      return '';
    } else {
      return value;
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
        this.vegaSpec = currDesCh[0].updateVegaSpec(this);
      }
    }

    this.updateVegaSpecBasedOnDesignChoices();
    // TODO update parameters for objectives
    // vega spec for legend
    // [ ] commented out legend and rightColor encoding
    // // console.log('legend objective: ', this.objectives.filter((elem) => elem.id === 'addLegend')[0]);
    // (this.objectives.filter((elem) => elem.id === 'addLegend')[0] as any).vegaSpec = this.vegaSpec;
    // // console.log('rightColorEnc objective: ', this.objectives.filter((elem) => elem.id === 'rightColorEnc')[0]);
    // (this.objectives.filter((elem) => elem.id === 'rightColorEnc')[0] as any).vegaSpec = this.vegaSpec;
    // // vega spec for right color encoding

  }

  getStateOfDesignChoices(): { dcId: string; label: string, type: DesignChoiceType; value: boolean | string | number }[] {
    const desCArr: { dcId: string; label: string, type: DesignChoiceType; value: boolean | string | number }[] = [];
    for (const dc of this.designChoices) {
      desCArr.push(dc.getCurrentState());
    }

    return desCArr;
  }

  getLHLObjctivesBasedOnDesignChoice(designChoiceId: string): { highLevel: highLevelObjective, lowLevel: lowLevelObjective } {
    const objectives = {
      lowLevel: null,
      highLevel: null
    }

    // get low level
    for (const lob of this.objectives) {
      if (lob.designChoices.map((elem) => elem.id).indexOf(designChoiceId) !== -1) {
        objectives.lowLevel = lob;
      }
    }

    // get low level
    for (const hob of this.highLevelObjectives) {
      if (objectives.lowLevel) {
        if (hob.lowLevelObjectives.map((elem) => elem.id).indexOf(objectives.lowLevel.id) !== -1) {
          objectives.highLevel = hob;
        }
      }
    }

    return objectives;
  }

  getDesignChoicesBasedOnId(ids: string[]): designChoiceBase[] {
    const arr: designChoiceBase[] = [];
    for (const id of ids) {
      const desCArr = this.designChoices.filter((elem) => elem.id === id);
      if (desCArr) {
        const desC = desCArr[0];
        arr.push(desC);
      }
    }

    return arr;
  }

  getObjectivesState(): { id: string, label: string, state: ObjectiveState, corrDesignChoices: number, numDesignChoices: number }[] {
    const stateObjectives = [];
    for (const ob of this.objectives) {
      const state = this.checkStateOfObjective(ob.id);
      stateObjectives.push({
        id: ob.id,
        label: ob.label,
        state: state.state,
        corrDesignChoices: state.corrDesignChoices,
        numDesignChoices: ob.designChoices.length
      });
    }
    return stateObjectives;
  }

  getLowLevelObjectiveById(id: string): lowLevelObjective {
    return this.objectives.filter((elem) => elem.id === id)[0];
  }

  abstract getCopyofVisualization(copyId: string): VisualizationBase;
  abstract getVisualizationCopyWithEncodingsAndActions(copyId: string, encodinds: {field: string, value: string}[]): VisualizationBase;

  abstract setupVegaSpecification();
  abstract setupDesignChoices();
  abstract setupObjectives();

  abstract getEncodings(): {field: string, value: string}[];

  abstract setEncodings(encodinds: {field: string, value: string}[]);

  abstract updateVegaSpecForSmallMultiple(vSpec: VisualizationSpec): VisualizationSpec;
  abstract checkStateOfObjective(id: string): { state: ObjectiveState, corrDesignChoices: number };
}

