import ColumnTable from "arquero/dist/types/table/column-table";
import embed, { VisualizationSpec } from "vega-embed";
import { ActionType, VisPiplineStage } from "./designChoices";
import { ObjectiveState } from "./Objective";
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
  // visStage: VisPiplineStage;
  // type: ActionType;
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

export interface IObjectiveState {
  id: string;
  label: string;
  state: ObjectiveState;
  corrActions: number;
  numActions: number;
}

// export interface lowLevelObjective {
//   id: string,
//   label: string,
//   description: string,
//   designChoices: designChoiceBase[],
//   state: ObjectiveState,
//   corrDesignChoices: number,
// }

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

  // design choices
  // designChoices: designChoiceBase[];

  // HTML element with the visualization
  visContainer: HTMLElement;

  // TODO add dynamic data as parameter
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
        await embed(container, this.vegaSpec, { actions: false, renderer: 'svg', padding: {left: 0, top: 0, right: 0, bottom: 4}});
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

  // updateVegaSpecBasedOnDesignChoices() {
  //   for (const desC of this.designChoices) {
  //     this.vegaSpec = desC.updateVegaSpec(this);
  //   }
  // }

  convertNullEncoding(value: string): string {
    if (value === null || value === 'null') {
      return '';
    } else {
      return value;
    }
  }

  // createActionObject(id: string, label: string, value: any, visStage: VisPiplineStage, type: ActionType): IAction {
  //   return {
  //     id,
  //     label,
  //     value,
  //     visStage,
  //     type
  //   };
  // }

  createAction(id: actionsScatter, label: string, value: boolean) {
    return {
      id,
      label,
      value
    };
  }


  // FIXME
  // setActionsBasedOnVisualization(visualization: VisualizationBase, withEncodings: boolean = false) {
  //   let givenActions = visualization.actions;
    
  //   // remove the encoding actions based on the withEncodings parameter
  //   // if(!withEncodings) {
  //   //   givenActions = givenActions.filter((elem) => elem.type !== ActionType.Encoding);
  //   // }

  //   // go through all the given actions
  //   for(const gAction of givenActions) {
  //     // find the action that should be changed based on the given one
  //     const currAction = this.actions.filter((elem) => elem.id ===  gAction.id);
  //     if (currAction && currAction.length > 0) {
  //       // set the current action value to the one given
  //       currAction[0].value = gAction.value;
  //     }
  //   }

  //   // update objectives and visualization
  //   // this.createObjectives(); //FIXME not needed -> commented out
  //   this.updateVegaSpec();
  // }



  // baseDesignChoicesOnVisualization(visualization: VisualizationBase) {
  //   const desChoices = visualization.designChoices;

  //   for (const dc of desChoices) {
  //     // find given design choice in design choices
  //     const currDesCh = this.designChoices.filter((elem) => elem.id === dc.id)
  //     if (currDesCh) {
  //       // set the current design choice value to the one given
  //       currDesCh[0].value = dc.value;
  //       this.vegaSpec = currDesCh[0].updateVegaSpec(this);
  //     }
  //   }

  //   this.updateVegaSpecBasedOnDesignChoices();
  //   // TODO update parameters for objectives
  //   // vega spec for legend
  //   // [ ] commented out legend and rightColor encoding
  //   // // console.log('legend objective: ', this.objectives.filter((elem) => elem.id === 'addLegend')[0]);
  //   // (this.objectives.filter((elem) => elem.id === 'addLegend')[0] as any).vegaSpec = this.vegaSpec;
  //   // // console.log('rightColorEnc objective: ', this.objectives.filter((elem) => elem.id === 'rightColorEnc')[0]);
  //   // (this.objectives.filter((elem) => elem.id === 'rightColorEnc')[0] as any).vegaSpec = this.vegaSpec;
  //   // // vega spec for right color encoding

  // }

 

  // getStateOfDesignChoices(): { dcId: string; label: string, type: ActionType; value: boolean | string | number }[] {
  //   const desCArr: { dcId: string; label: string, type: ActionType; value: boolean | string | number }[] = [];
  //   for (const dc of this.designChoices) {
  //     desCArr.push(dc.getCurrentState());
  //   }

  //   return desCArr;
  // }

  // getLHLObjctivesBasedOnDesignChoice(designChoiceId: string): { highLevel: highLevelObjective, lowLevel: IObjective } {
  //   const objectives = {
  //     lowLevel: null,
  //     highLevel: null
  //   }

  //   // get low level
  //   for (const lob of this.objectives) {
  //     if (lob.actions.map((elem) => elem.id).indexOf(designChoiceId) !== -1) {
  //       objectives.lowLevel = lob;
  //     }
  //   }

  //   // get low level
  //   for (const hob of this.highLevelObjectives) {
  //     if (objectives.lowLevel) {
  //       if (hob.lowLevelObjectives.map((elem) => elem.id).indexOf(objectives.lowLevel.id) !== -1) {
  //         objectives.highLevel = hob;
  //       }
  //     }
  //   }

  //   return objectives;
  // }

  // getDesignChoicesBasedOnId(ids: string[]): designChoiceBase[] {
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

  // getLowLevelObjectiveById(id: string): lowLevelObjective {
  //   return this.objectives.filter((elem) => elem.id === id)[0];
  // }

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

  // abstract getEncodings(): IEncoding[];

  
  // abstract setEncodings(encodinds: IEncoding[]);
  
  abstract getCopyofVisualization(): VisualizationBase;
  // abstract getCopyofVisualizationWithChangedEncodings(encodings: IEncoding[]): VisualizationBase;

  // abstract getVisualizationCopyWithEncodingsAndActions(copyId: string, encodings: {field: string, value: string}[]): VisualizationBase;

  // abstract setupVegaSpecification();
  
  // abstract setupDesignChoices();
  // abstract updateVegaSpecForSmallMultiple(vSpec: VisualizationSpec): VisualizationSpec;

  abstract checkStateOfObjective(id: string): { state: ObjectiveState, corrActions: number };
}

