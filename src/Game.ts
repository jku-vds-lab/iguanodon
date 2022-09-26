import ColumnTable from "arquero/dist/types/table/column-table";
import { ObjectiveState } from "./Objective";
import { createToggleSwitch, getColumnTypesFromArqueroTable } from "./util";
import {  VisualizationBase } from "./visualizations";

export interface IGameDescription {
  gameId: number,
  visualization: VisualizationBase,
}
export class Game {
  
  private _visHistory: { attempt: number, visualization: VisualizationBase }[];
  
  $container: HTMLDivElement;
  $currVis: HTMLDivElement;
  $lastVis: HTMLDivElement;
  $cntrTable: HTMLDivElement;
  $gameTable: HTMLDivElement;

  // private _dataColumns: {label: string, type: string}[]
  private _numbAttempts: number = 10;
  private _currAttempt: number = 0;
  
  dataset: ColumnTable;
  visualization: VisualizationBase;

  constructor(cntrMain: HTMLDivElement, game: IGameDescription, dataset: ColumnTable, isFreeMode: boolean) {
    this.$container = cntrMain;

    this._visHistory = [];
    // this.dataset = dataset;
    // this._dataColumns = getColumnTypesFromArqueroTable(dataset);
    // console.log('data columns: ', this._dataColumns);

    // TODO constructor parameter: gameID
    // with gameID: 
    // - the visualization 
    // - the axis and color encodings
    // - and the optimal solution 
    this.visualization = game.visualization;


    this.createGameSetup();
    this.setInitalVisualizationState();
    
  }

  createGameSetup() {
    // with all the actions and objectives
    // last vis
    this.$lastVis = document.createElement('div');
    this.$lastVis.id = 'last-vis';
    this.$lastVis.classList.add('vis-container');
    const lastVisLabel = document.createElement('div');
    lastVisLabel.classList.add('vis-label');
    const lastVisPlot = document.createElement('div');
    lastVisPlot.classList.add('vis-plot');
    this.$lastVis.appendChild(lastVisLabel);
    this.$lastVis.appendChild(lastVisPlot);

    // current vis
    this.$currVis = document.createElement('div');
    this.$currVis.id = 'current-vis';
    this.$currVis.classList.add('vis-container');
    const currVisLabel = document.createElement('div');
    currVisLabel.classList.add('vis-label');
    const currVisPlot = document.createElement('div');
    currVisPlot.classList.add('vis-plot');
    this.$currVis.appendChild(currVisLabel);
    this.$currVis.appendChild(currVisPlot);

    // this.$cntrTable = document.createElement('div'); // container for table
    // this.$cntrTable.id = 'cntr-table';

    this.$gameTable = this.createGameTable();
    this.$gameTable.id = 'game-table';
    // this.$cntrTable.appendChild(this.$gameTable);

    // add dom elements to container
    this.$container.appendChild(this.$lastVis);
    this.$container.appendChild(this.$currVis);
    this.$container.appendChild(this.$gameTable);
  }

  createGameTable(): HTMLDivElement {
     // number of columns = attemtps + 2 (action/objective + solution) 
    // const numbColumns = this._numbAttempts + 2; 


    // create container for flex table
    const table = document.createElement('div');

    // label column
    const colLabel = document.createElement('div');
    colLabel.classList.add('column','label');
    // header 
    const headerElemLabel = document.createElement('div');
    headerElemLabel.innerText = 'Actions & Objectives';
    headerElemLabel.classList.add('row','header');
    colLabel.appendChild(headerElemLabel);
    // actions
    for(const act of this.visualization.actions) {
      const actElem = document.createElement('div');
      actElem.innerText = act.label;
      actElem.dataset.action = act.id;
      actElem.classList.add('row','action');
      colLabel.appendChild(actElem);
    }
    // objectives
    for(const obj of this.visualization.objectives) {
      const objElem = document.createElement('div');
      objElem.innerText = obj.label;
      objElem.dataset.objective = obj.id;
      objElem.classList.add('row','objective');
      colLabel.appendChild(objElem);
    }
    // add label column to table
    table.appendChild(colLabel);

    // attempt columns
    for(let i=1; i<=this._numbAttempts; i++) {
      const colAttempt = document.createElement('div');
      colAttempt.classList.add('column','attempt');
      colAttempt.dataset.attempt = `${i}`;
      // header 
      const headerElem = document.createElement('div');
      headerElem.innerText = `Attempt ${i}`;
      headerElem.classList.add('row','header');
      colAttempt.appendChild(headerElem);
      // actions
      for(const act of this.visualization.actions) {
        const actElem = document.createElement('div');
        const toggle = this.createActionableToggleSwitch();
        toggle.classList.add('hide');
        actElem.appendChild(toggle);
        actElem.dataset.action = act.id;
        actElem.classList.add('row','action');
        colAttempt.appendChild(actElem);
      }
      // objectives
      for(const obj of this.visualization.objectives) {
        const objElem = document.createElement('div');
        objElem.dataset.objective = obj.id;
        objElem.dataset.value = 'none';
        objElem.classList.add('row','objective');
        colAttempt.appendChild(objElem);
      }

      // confirm button
      const confirmElem = document.createElement('button');
      confirmElem.innerText = 'Confirm';
      confirmElem.classList.add('row','confirm','hide');
      confirmElem.addEventListener('click', (event) => this.clickConfirmHandler(event));
      colAttempt.appendChild(confirmElem);

      // add attempt column to table
      table.appendChild(colAttempt);
    }

    // solution column
    const colSolution = document.createElement('div');
    colSolution.classList.add('column','solution');
    // header 
    const headerElemSolution = document.createElement('div');
    headerElemSolution.innerText = 'Solution';
    headerElemSolution.classList.add('row','header');
    colSolution.appendChild(headerElemSolution);
    // actions
    for(const act of this.visualization.actions) {
      const actElem = document.createElement('div');
      const toggle = createToggleSwitch();
      toggle.classList.add('hide');
      actElem.appendChild(toggle);
      actElem.dataset.action = act.id;
      actElem.classList.add('row','action');
      colSolution.appendChild(actElem);
    }
    // objectives
    for(const obj of this.visualization.objectives) {
      const objElem = document.createElement('div');
      objElem.dataset.objective = obj.id;
      objElem.dataset.value = 'none';
      objElem.classList.add('row','objective');
      colSolution.appendChild(objElem);
    }
    // add attempt column to table
    table.appendChild(colSolution);

    return table;
  }


  clickConfirmHandler(event: MouseEvent) {
    event.stopPropagation();
    // ----- CURRENT ATTEMPT
    // add current attempt to visHistory
    this._visHistory.push({attempt: this._currAttempt, visualization: this.visualization});
 
    // disable actions & confirm
    const colCurrAct = this.$gameTable.querySelector(`.column.attempt[data-attempt='${this._currAttempt}']`);
    if(colCurrAct) {
      // disable actions
      const actRows = Array.from(colCurrAct.querySelectorAll('.action')) as HTMLDivElement[];
      for(const aRow of actRows) {
        const checkbox = aRow.querySelector('input') as HTMLInputElement;
        checkbox.disabled = true;
      }

       // disable confirm
       const confirm = colCurrAct.querySelector('.confirm') as HTMLButtonElement;
       if(confirm) {
        confirm.disabled = true;
       }
       
    }
    // show objectives
    const colCurrObj = this.$gameTable.querySelector(`.column.attempt[data-attempt='${this._currAttempt}']`);
    if(colCurrObj) {
      const visObjStates = this.visualization.getObjectivesState();
      console.log('visObjStates',visObjStates);
      // get row objective
      const objRows = Array.from(colCurrObj.querySelectorAll('.objective')) as HTMLDivElement[];
      console.log('objRows',objRows);
      for(const oRow of objRows) {
        const oid = oRow.dataset.objective;
        
        // check if objective exists
        const currObjState = visObjStates.filter((elem) => elem.id === oid);

        if(currObjState.length === 1)  {
          const currState = currObjState[0];
          // set objetive value
          oRow.dataset.value = `${this.convertObjStateToString(currState.state)}`;
        }
      }
    }

    // update last vis
    this.updateVisualizationContainer(this.$lastVis,this._currAttempt,this.visualization);


    // TODO check for all correct objectives or last attempt

    // ----- NEXT ATTEMPT
    this._currAttempt++;
    // copy vis 
    const copyVis = this.visualization.getCopyofVisualization();
    this.visualization = copyVis;
    // show actions & set actions
    // show confirm
    const colNext = this.$gameTable.querySelector(`.column.attempt[data-attempt='${this._currAttempt}']`);
    if(colNext) {
      // set actions
      const actRows = Array.from(colNext.querySelectorAll('.action')) as HTMLDivElement[];
      for(const aRow of actRows) {
        
        const aid = aRow.dataset.action;
        const currAction = this.visualization.getAction(aid);
        const currValue = currAction.value;
  
        const label = aRow.querySelector('label') as HTMLLabelElement;
        label.classList.remove('hide');

        const checkbox = aRow.querySelector('input') as HTMLInputElement;
        checkbox.checked = currValue;
      }

       // show confirm button
       const confirm = colNext.querySelector('.confirm')
       if(confirm) {
        confirm.classList.remove('hide');
       }
       
    }
    // update current vis
    this.updateVisualizationContainer(this.$currVis,this._currAttempt,this.visualization);


  }

  updateVisualizationContainer(visContainer: HTMLDivElement, attempt: number, vis: VisualizationBase) {
    const divLabel = visContainer.querySelector('.vis-label') as HTMLDivElement;
    divLabel.innerText = `Attempt ${attempt}`;
    const divPlot = visContainer.querySelector('.vis-plot') as HTMLDivElement;
    vis.showVisualization(divPlot);
  }

  convertObjStateToString(objState: ObjectiveState): string {
    if(objState === ObjectiveState.correct) return 'correct';
    if(objState === ObjectiveState.partial) return 'partial';
    if(objState === ObjectiveState.wrong) return 'wrong';
  }


  createActionableToggleSwitch(): HTMLLabelElement {
    const toggle = createToggleSwitch();
    toggle.classList.add('hide');

    const input = toggle.querySelector('input');

    input.addEventListener('change', (event) => {
      event.stopPropagation();

      const col = this.$gameTable.querySelector(`.column.attempt[data-attempt='${this._currAttempt}']`);
      if(col) {
        // get actions
        const actRows = Array.from(col.querySelectorAll('.action')) as HTMLDivElement[];
        for(const aRow of actRows) {
          // current checkbox value
          const checkbox = aRow.querySelector('input') as HTMLInputElement;
          const checkValue = checkbox.checked;

          const aid = aRow.dataset.action;
          const currAction = this.visualization.getAction(aid);
          // set action value
          currAction.value = checkValue;
    
          const label = aRow.querySelector('label') as HTMLLabelElement;
          label.classList.remove('hide');
        }

        // update current vis
        this.updateVisualizationContainer(this.$currVis,this._currAttempt,this.visualization);
        
      }
    });

    return toggle;
  }

  async setInitalVisualizationState() {
    // set inital state of game
    // set current attempt
    this._currAttempt = 1;
    // get attempt column 1
    const col = this.$gameTable.querySelector(`.column.attempt[data-attempt='${this._currAttempt}']`);
    if(col) {
      // set actions
      const actRows = Array.from(col.querySelectorAll('.action')) as HTMLDivElement[];
      for(const aRow of actRows) {
        
        const aid = aRow.dataset.action;
        const currAction = this.visualization.getAction(aid);
        const currValue = currAction.value;
  
        const label = aRow.querySelector('label') as HTMLLabelElement;
        label.classList.remove('hide');

        const checkbox = aRow.querySelector('input') as HTMLInputElement;
        checkbox.checked = currValue;
      }

       // show confirm button
       const confirm = col.querySelector('.confirm')
       if(confirm) {
        confirm.classList.remove('hide');
       }
       
    }

    // update visualization in current visualization div
    this.updateVisualizationContainer(this.$currVis,this._currAttempt,this.visualization);


  }



}
