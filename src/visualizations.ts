import ColumnTable from "arquero/dist/types/table/column-table";
import embed, { VisualizationSpec } from "vega-embed";
import { actionsScatter } from "./Scatterplot";
import { deepCopy } from "./util";

/**
 * Enumeration for the visualization type, e.g. scatterplot.
 */
export enum VisType {
  Scatter,
  Line,
  Bar
}

export interface IAction {
  id: string;
  label: string;
  value: any;
}

export interface IEncoding {
  field: string;
  value: string;
}

export interface IObjective {
  id: string;
  label: string;
  description: string;
  actions: IAction[];
  state: ObjectiveState;
  corrActions: number;
  // numActions: number;
}


export enum ObjectiveState {
  correct,
  partial,
  wrong
}

export interface IObjectiveState {
  id: string;
  label: string;
  state: ObjectiveState;
  corrActions: number;
  numActions: number;
}

export interface highLevelObjective {
  id: string,
  label: string,
  description: string,
  lowLevelObjectives: IObjective[],
}

export abstract class VisualizationBase {
  type: VisType;
  fullDataset: ColumnTable;
  sampledDataset: ColumnTable;

  // acitons
  private _actions: IAction[];

  // objectives
  objectives: IObjective[];

  // vega specification -> JSON object
  vegaSpec: VisualizationSpec;


  highLevelObjectives: highLevelObjective[];

  currentDatasetInfo: {
    sampled: boolean,
    allItems: number,
    notNullItems: number
  };

  // HTML element with the visualization
  visContainer: HTMLElement;

  constructor(fullDataset: ColumnTable, sampledDataset: ColumnTable, visType: VisType) {
    this.fullDataset = fullDataset;
    this.sampledDataset = sampledDataset;
    this.type = visType;
  }

  public set actions(actions: IAction[]) {
    this._actions = actions;
    this.createObjectives();
  }

  public get actions(): IAction[] {
    return this._actions;
  }

  async showVisualization(container: HTMLDivElement, isSmallMultiple: boolean = false) {
    this.visContainer = container;
    // make sure the vegaSpec is up-to-date
    this.updateVegaSpec();

    // console.log('plot vega vis: ', this.id, this.vegaSpec);
    try {
      // await embed(container, this.vegaSpec, { actions: false, renderer: 'svg' });
      if (isSmallMultiple) {
        const smVegaSpec = this.updateVegaSpecForSmallMultiple(deepCopy(this.vegaSpec));

        await embed(container, smVegaSpec, { actions: false, padding: {left: 0, top: 0, right: 0, bottom: 4} });
      } else {
        await embed(container, this.vegaSpec, { actions: false, renderer: 'svg', padding: {left: 4, top: 4, right: 4, bottom: 4}});
      }
    } catch (error) {
      // HACK add meaningful error catch
      console.warn('Problem with promise in visualization > showVisualization(): ', error);
    }

  }

  updateVegaSpecForSmallMultiple(vSpec: VisualizationSpec) {
    const smVegaSpec = vSpec as any;
    if(smVegaSpec?.encoding?.x) smVegaSpec.encoding.x.title = null;
    if(smVegaSpec?.encoding?.y) smVegaSpec.encoding.y.title = null;
    return smVegaSpec;
  }

  convertNullEncoding(value: string): string {
    if (value === null || value === 'null') {
      return '';
    } else {
      return value;
    }
  }

  createAction(id: actionsScatter, label: string, value: boolean) {
    return {
      id,
      label,
      value
    };
  }

  getObjectivesState(): IObjectiveState[] {
    const stateObjectives = [];
    for (const ob of this.objectives) {
      const state = this.checkStateOfObjective(ob.id);
      stateObjectives.push({
        id: ob.id,
        label: ob.label,
        state: state.state,
        corrActions: state.corrActions,
        numActions: ob.actions.length
      });
    }
    return stateObjectives;
  }

  areAllObjectivesFulfilled(): boolean {
    let fulfill: boolean = true;

    const objs = this.getObjectivesState();
    for(const obj of objs) {
      if(obj.state === ObjectiveState.correct) {
        fulfill = fulfill && true;
      }else {
        fulfill = fulfill && false;
      }
    }

    return fulfill;
  }


  getAction(id: string): IAction {
    const actions = this.actions.filter((elem) => elem.id === id);
    if(actions.length === 1) {
      return actions[0];
    }
    
    return null;
  }


  setMutlipleActions(actions: {id: string, value:boolean}[]) {
    for(const a of actions) {
      const currAction = this.getAction(a.id);
      if(currAction) {
        currAction.value = a.value
      }
    }
  }

  getMultipleAction(ids: string[]): IAction[] {
    const actions = [];
    for(const id of ids) {
      const act = this.getAction(id);
      if(act) {
        actions.push(act);
      }
    }
    return actions;
  }

  getObjective(id: string): IObjective {
    const objective = this.objectives.filter((elem) => elem.id === id);
    if(objective.length === 1) {
      return objective[0];
    }
    
    return null;
  }

  getMultipleObjectives(ids: string[]): IObjective[] {
    const objectives = [];
    for(const id of ids) {
      const obj = this.getObjective(id);
      if(obj) {
        objectives.push(obj);
      }
    }
    return objectives;
  }
  

  setUsableActions(actionIds: actionsScatter[]) {
    const actionIdsString = actionIds.map((elem) => elem.toString());
    const originalActions = deepCopy(this.actions);
    const usableActions = [];

    // check all actions of current visualization
    for(const act of originalActions) {
      if(actionIdsString.indexOf(act.id) !== -1) {
        // only add usable actions
        usableActions.push(act);
      }
    }


    this.actions = usableActions;
  }

  abstract createActions();

  abstract createObjectives();

  abstract updateVegaSpec();
 
  abstract getCopyofVisualization(): VisualizationBase;

  abstract checkStateOfObjective(id: string): { state: ObjectiveState, corrActions: number };
}

