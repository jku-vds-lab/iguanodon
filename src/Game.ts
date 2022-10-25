import ColumnTable from "arquero/dist/types/table/column-table";
import { ObjectiveState } from "./Objective";
import { createToggleSwitch, getColumnTypesFromArqueroTable } from "./util";
import {  IAction, VisualizationBase } from "./visualizations";

export interface IGameDescription {
  gameId: number,
  visualization: VisualizationBase,
  solution: VisualizationBase
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
  private _gameId: number;
  
  dataset: ColumnTable;
  visualization: VisualizationBase;
  solution: VisualizationBase;
  shownActions: IAction[];

  constructor(cntrMain: HTMLDivElement, game: IGameDescription, dataset: ColumnTable, isFreeMode: boolean) {
    this.$container = cntrMain;

    this._visHistory = [];
    // this.dataset = dataset;
    // this._dataColumns = getColumnTypesFromArqueroTable(dataset);
    // console.log('data columns: ', this._dataColumns);

    this._gameId = game.gameId;
    // TODO constructor parameter: gameID
    // with gameID: 
    // - the visualization 
    // - the axis and color encodings
    // - and the optimal solution 
    this.visualization = game.visualization.getCopyofVisualization();
    this.solution = game.solution.getCopyofVisualization();

    this.shownActions = this.visualization.actions;


    this.createGameSetup();
    this.setInitalVisualizationState();
    
  }

  getGameId(): number {
    return this._gameId;
  }

  createGameSetup() {
    // clear game
    this.$container.innerText = '';
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
    // header action
    const headerActionLabel = document.createElement('div');
    headerActionLabel.innerText = 'Actions';
    headerActionLabel.classList.add('row','header', 'label');
    colLabel.appendChild(headerActionLabel);
    // actions
    for(const act of this.shownActions) {
      const actElem = document.createElement('div');
      actElem.innerText = act.label;
      actElem.dataset.action = act.id;
      actElem.classList.add('row','action','label');
      colLabel.appendChild(actElem);
    }

    // confirm container + button
    const confirmElemLabel = document.createElement('div');
    confirmElemLabel.classList.add('row','confirm','hide');
    // const confirmBtn = document.createElement('button');
    // confirmBtn.innerText = 'Confirm';
    // confirmBtn.classList.add('confirm-btn');
    // confirmBtn.addEventListener('click', (event) => this.clickConfirmHandler(event));
    // confirmElem.appendChild(confirmBtn);
    colLabel.appendChild(confirmElemLabel);


    // header objective
    const headerObjectiveLabel = document.createElement('div');
    headerObjectiveLabel.innerText = 'Objectives';
    headerObjectiveLabel.classList.add('row','header', 'label');
    colLabel.appendChild(headerObjectiveLabel);
    // objectives
    for(const obj of this.visualization.objectives) {
      const objElem = document.createElement('div');
      objElem.innerText = obj.label;
      objElem.dataset.objective = obj.id;
      objElem.classList.add('row','objective','label');
      colLabel.appendChild(objElem);
    }
    // add label column to table
    table.appendChild(colLabel);

    // attempt columns
    for(let i=1; i<=this._numbAttempts; i++) {
      const colAttempt = document.createElement('div');
      colAttempt.classList.add('column','attempt');
      colAttempt.dataset.attempt = `${i}`;
      // header action
      const headerAction = document.createElement('div');
      headerAction.innerText = `Attempt ${i}`;
      headerAction.classList.add('row','header');
      colAttempt.appendChild(headerAction);
      // actions
      for(const act of this.shownActions) {
        const actElem = document.createElement('div');
        const toggle = this.createActionableToggleSwitch();
        toggle.classList.add('hide');
        actElem.appendChild(toggle);
        actElem.dataset.action = act.id;
        actElem.classList.add('row','action');
        colAttempt.appendChild(actElem);
      }

      // confirm container + button
      const confirmElem = document.createElement('div');
      confirmElem.classList.add('row','confirm','hide');
      const confirmBtn = document.createElement('div');
      confirmBtn.innerText = 'Confirm';
      confirmBtn.classList.add('confirm-btn');
      confirmBtn.addEventListener('click', async (event) => this.clickConfirmHandler(event));
      confirmElem.appendChild(confirmBtn);
      colAttempt.appendChild(confirmElem);

      // header objective
      const headerObjective = document.createElement('div');
      headerObjective.innerText = '';
      headerObjective.classList.add('row','header');
      colAttempt.appendChild(headerObjective);
      // objectives
      for(const obj of this.visualization.objectives) {
        const objElem = document.createElement('div');
        objElem.dataset.objective = obj.id;
        objElem.classList.add('row','objective','result');
        const objElemIdicator = document.createElement('div');
        objElemIdicator.classList.add('obj_indicator');
        objElemIdicator.dataset.value = 'none';
        objElem.appendChild(objElemIdicator);
        colAttempt.appendChild(objElem);
      }

      // add attempt column to table
      table.appendChild(colAttempt);
    }

    // solution column
    const colSolution = document.createElement('div');
    colSolution.classList.add('column','solution');
    // header action 
    const headerActionSolution = document.createElement('div');
    headerActionSolution.innerText = 'Solution';
    headerActionSolution.classList.add('row','header');
    colSolution.appendChild(headerActionSolution);
    // actions
    for(const act of this.shownActions) {
      const actElem = document.createElement('div');
      const toggle = createToggleSwitch();
      toggle.classList.add('hide');
      actElem.appendChild(toggle);
      actElem.dataset.action = act.id;
      actElem.classList.add('row','action');
      colSolution.appendChild(actElem);
    }

    // confirm container + button
    const confirmElemSolution = document.createElement('div');
    confirmElemSolution.classList.add('row','confirm','hide');
    // const confirmBtn = document.createElement('button');
    // confirmBtn.innerText = 'Confirm';
    // confirmBtn.classList.add('confirm-btn');
    // confirmBtn.addEventListener('click', (event) => this.clickConfirmHandler(event));
    // confirmElem.appendChild(confirmBtn);
    colSolution.appendChild(confirmElemSolution);

    // header objective 
    const headerObjectiveSolution = document.createElement('div');
    headerObjectiveSolution.innerText = '';
    headerObjectiveSolution.classList.add('row','header');
    colSolution.appendChild(headerObjectiveSolution);
    // objectives
    for(const obj of this.visualization.objectives) {
      const objElem = document.createElement('div');
      objElem.dataset.objective = obj.id;
      objElem.classList.add('row','objective','result');
      const objElemIdicator = document.createElement('div');
      objElemIdicator.classList.add('obj_indicator');
      objElemIdicator.dataset.value = 'none';
      objElem.appendChild(objElemIdicator);
      colSolution.appendChild(objElem);
    }
    // add attempt column to table
    table.appendChild(colSolution);

    return table;
  }


  async clickConfirmHandler(event: MouseEvent) {
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
        const span = aRow.querySelector('span') as HTMLSpanElement;
        span.dataset.disabled = 'true';
      }

       // disable confirm
      //  const confirmBtn = colCurrAct.querySelector('.confirm-btn') as HTMLButtonElement;
       const confirmBtn = colCurrAct.querySelector('.confirm-btn') as HTMLDivElement;
       if(confirmBtn) {
        // confirmBtn.disabled = true;
        confirmBtn.classList.add('disabled','hide');
       }
       
    }
    // show objectives
    const fulfilledObjectives = this.visualization.areAllObjectivesFulfilled();
    const colCurrObj = this.$gameTable.querySelector(`.column.attempt[data-attempt='${this._currAttempt}']`) as HTMLDivElement;
    this.setTableColumnObjectives(colCurrObj, this.visualization);
    // if(colCurrObj) {
    //   const visObjStates = this.visualization.getObjectivesState();
    //   console.log('visObjStates',visObjStates);
    //   console.log('visActionStates',this.visualization.actions);
    //   // get row objective
    //   const objRows = Array.from(colCurrObj.querySelectorAll('.objective')) as HTMLDivElement[];
    //   console.log('objRows',objRows);
    //   for(const oRow of objRows) {
    //     const oid = oRow.dataset.objective;
        
    //     // check if objective exists
    //     const currObjState = visObjStates.filter((elem) => elem.id === oid);

    //     if(currObjState.length === 1)  {
    //       const currState = currObjState[0];
    //       // get objecive idicator
    //       const oRowIndicator = oRow.querySelector('.obj_indicator') as HTMLDivElement;
    //       // set objetive value
    //       oRowIndicator.dataset.value = `${this.convertObjStateToString(currState.state)}`;
    //       oRowIndicator.title = `${this.convertObjStateToTooltip(currState.state)}`;
    //     }
    //   }
    // }

    // update last vis
    const heading = `Attempt ${this._currAttempt}`;
    this.updateVisualizationContainer(this.$lastVis,this.visualization, heading);


    // check for all correct objectives or last attempt
    console.log('visualization all objecitve states: ',fulfilledObjectives);
    if(fulfilledObjectives) {
      // all objective fulfilled -> WIN
      
      // show solution in current vis (actions + vis)
      // copy current correct vis as solution 
      const currSolution = this.visualization.getCopyofVisualization();
      // get solution column
      const solutionCol = this.$gameTable.querySelector(`.column.solution`) as HTMLDivElement;
      // set solution column action
      this.setTableColumnActions(solutionCol,currSolution);
      // show solution -> update current vis: solution
      const heading = `Solution`;
      await this.updateVisualizationContainer(this.$currVis,currSolution, heading);
      // set solution column objectives
      this.setTableColumnObjectives(solutionCol, currSolution);

      // show WIN modal
      const modalGameEnd = document.body.querySelector('#modal-game-end');
      modalGameEnd.classList.add('show-modal');

      const gameLose =  modalGameEnd.querySelector('.content-lose');
      gameLose.classList.add('display-none');
      const gameWin =  modalGameEnd.querySelector('.content-win');
      gameWin.classList.remove('display-none');

    } else {
      // not all objectives fulfilled
      if(this._currAttempt === this._numbAttempts) {
        // all attempts used -> LOSE

        // show solution in current vis (actions + vis)
        // copy current correct vis as solution 
        const currSolution = this.solution;
        // get solution column
        const solutionCol = this.$gameTable.querySelector(`.column.solution`) as HTMLDivElement;
        // set solution column actions
        this.setTableColumnActions(solutionCol,currSolution);
        // show solution -> update current vis: solution
        const heading = `Solution`;
        await this.updateVisualizationContainer(this.$currVis,currSolution, heading);
        // set solution column objectives
        this.setTableColumnObjectives(solutionCol, currSolution);

        // show LOSE modal
        const modalGameEnd = document.body.querySelector('#modal-game-end');
        modalGameEnd.classList.add('show-modal');

        const gameWin =  modalGameEnd.querySelector('.content-win');
        gameWin.classList.add('display-none');
        const gameLose =  modalGameEnd.querySelector('.content-lose');
        gameLose.classList.remove('display-none');

      } else {
        // attempts still possible -> NEXT ATTEMPT
        this._currAttempt++;
        // copy vis 
        const copyVis = this.visualization.getCopyofVisualization();
        this.visualization = copyVis;
        // show actions & set actions
        // show confirm
        const colNext = this.$gameTable.querySelector(`.column.attempt[data-attempt='${this._currAttempt}']`) as HTMLDivElement;
        this.setTableColumnActions(colNext,this.visualization);
        // if(colNext) {
        //   // set actions
        //   const actRows = Array.from(colNext.querySelectorAll('.action')) as HTMLDivElement[];
        //   for(const aRow of actRows) {
            
        //     const aid = aRow.dataset.action;
        //     const currAction = this.visualization.getAction(aid);
        //     const currValue = currAction.value;
      
        //     const label = aRow.querySelector('label') as HTMLLabelElement;
        //     label.classList.remove('hide');

        //     const checkbox = aRow.querySelector('input') as HTMLInputElement;
        //     checkbox.checked = currValue;
        //   }

        //   // show confirm div
        //   const confirmCntr = colNext.querySelector('.confirm')
        //   if(confirmCntr) {
        //     confirmCntr.classList.remove('hide');
        //   }    
        // }
        // update current vis
        const heading = `Attempt ${this._currAttempt} Preview`;
        this.updateVisualizationContainer(this.$currVis,this.visualization, heading);
      }
    }

  }

  setTableColumnActions(column: HTMLDivElement, vis: VisualizationBase) {
    if(column) {
      // set actions
      const actRows = Array.from(column.querySelectorAll('.action')) as HTMLDivElement[];
      for(const aRow of actRows) {
        
        const aid = aRow.dataset.action;
        const currAction = vis.getAction(aid);
        const currValue = currAction.value;
  
        const label = aRow.querySelector('label') as HTMLLabelElement;
        label.classList.remove('hide');

        const checkbox = aRow.querySelector('input') as HTMLInputElement;
        checkbox.checked = currValue;
      }

      // show confirm div
      const confirmCntr = column.querySelector('.confirm')
      if(confirmCntr) {
        confirmCntr.classList.remove('hide');
      }    
    }
  }

  setTableColumnObjectives(column: HTMLDivElement, vis: VisualizationBase) {
    if(column) {
      const visObjStates = vis.getObjectivesState();
      console.log('visObjStates',visObjStates);
      console.log('visActionStates',vis.actions);
      // get row objective
      const objRows = Array.from(column.querySelectorAll('.objective')) as HTMLDivElement[];
      console.log('objRows',objRows);
      for(const oRow of objRows) {
        const oid = oRow.dataset.objective;
        
        // check if objective exists
        const currObjState = visObjStates.filter((elem) => elem.id === oid);

        if(currObjState.length === 1)  {
          const currState = currObjState[0];
          // get objecive idicator
          const oRowIndicator = oRow.querySelector('.obj_indicator') as HTMLDivElement;
          // set objetive value
          oRowIndicator.dataset.value = `${this.convertObjStateToString(currState.state)}`;
          oRowIndicator.title = `${this.convertObjStateToTooltip(currState.state)}`;
        }
      }
    }
  }

  async updateVisualizationContainer(visContainer: HTMLDivElement, vis: VisualizationBase, heading: string) {
    const divLabel = visContainer.querySelector('.vis-label') as HTMLDivElement;
    divLabel.innerText = `${heading}`;
    const divPlot = visContainer.querySelector('.vis-plot') as HTMLDivElement;
    await vis.showVisualization(divPlot);
  }

  convertObjStateToString(objState: ObjectiveState): string {
    if(objState === ObjectiveState.correct) return 'correct';
    if(objState === ObjectiveState.partial) return 'partial';
    if(objState === ObjectiveState.wrong) return 'wrong';
  }

  convertObjStateToTooltip(objState: ObjectiveState): string {
    if(objState === ObjectiveState.correct) return 'Objective is fulfilled';
    if(objState === ObjectiveState.partial) return 'Objective is partially fulfilled';
    if(objState === ObjectiveState.wrong) return 'Objective is unfulfilled';
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
        const heading = `Attempt ${this._currAttempt} Preview`;
        this.updateVisualizationContainer(this.$currVis,this.visualization, heading);
        
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
    const heading = `Attempt ${this._currAttempt} Preview`;
    this.updateVisualizationContainer(this.$currVis,this.visualization, heading);


  }



}
