import ColumnTable from "arquero/dist/types/table/column-table";
import { $nav, checkMinimalSurveyRequirement, getAllGameBoardDescr, setIsGameFinished, updateUserTrackData, userId } from ".";
import { IAttemptTrackData, IGameTrackData, postJSONAttemptData, postJSONGameData } from "./REST";
import { actionsScatter } from "./Scatterplot";
import { createToggleButton, deepCopy, getColumnTypesFromArqueroTable, getDateParts } from "./util";
import {  IAction, ObjectiveState, VisualizationBase } from "./visualizations";
import imgBadgeGold from "./images/badge_gold.svg";
import imgBadgeSilver from "./images/badge_silver.svg";
import imgBadgeBronze from "./images/badge_bronze.svg";

export interface IGameBoardDescription {
  gameId: number,
  label: string,
  startVisualization: VisualizationBase,
  solutionVisualization: VisualizationBase,
  attempts: number
}

export enum gameReward {
  gold = 'gold',
  silver = 'silver',
  bronze = 'bronze',
  noReward = 'noReward'
};

export enum gameEndReason {
  gameStart = 'gameStart',
  gameWin = 'gameWin',
  gameOver = 'gameOver',
  gameRetry = 'gameRetry',
  gameNext = 'gameNext',
  gameChange = 'gameChange'
};

export class GameBoard {
  
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
  private _attemptStorage: IAttemptTrackData;
  
  dataset: ColumnTable;
  visualization: VisualizationBase;
  solution: VisualizationBase;
  shownActions: IAction[];
  usableActions: actionsScatter[];

  attemptTrackData: IAttemptTrackData;
  gameTrackData: IGameTrackData;

  score: number;
  reward: gameReward;

  constructor(cntrMain: HTMLDivElement, game: IGameBoardDescription) {
    this.$container = cntrMain;
    this.$container.dataset.gameId = `${game.gameId}`;
    console.log('NEW GAMEBOARD: ', game);

    // set isGameFinished state
    setIsGameFinished(false);

    // set score and reward
    this.score = 0;
    this.reward = gameReward.noReward;

    this._visHistory = [];
    // this.dataset = dataset;
    // this._dataColumns = getColumnTypesFromArqueroTable(dataset);
    // console.log('data columns: ', this._dataColumns);

    // setup for game
    this._gameId = game.gameId;
    this._numbAttempts = game.attempts;
    this.visualization = game.startVisualization.getCopyofVisualization();
    // this.usableActions = game.usableActions;
    // this.visualization.setUsableActions(this.usableActions);
    this.solution = game.solutionVisualization.getCopyofVisualization();

    this.shownActions = this.visualization.actions;



    this.createGameSetup();
    this.setInitalVisualizationState();
    this.gameTrackData = this.createGameTrackData();
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
    const lastVisDataset = document.createElement('div');
    lastVisDataset.classList.add('vis-dataset');
    this.$lastVis.appendChild(lastVisLabel);
    this.$lastVis.appendChild(lastVisPlot);
    this.$lastVis.appendChild(lastVisDataset);

    // current vis
    this.$currVis = document.createElement('div');
    this.$currVis.id = 'current-vis';
    this.$currVis.classList.add('vis-container');
    const currVisLabel = document.createElement('div');
    currVisLabel.classList.add('vis-label');
    const currVisPlot = document.createElement('div');
    currVisPlot.classList.add('vis-plot');
    const currVisDataset = document.createElement('div');
    currVisDataset.classList.add('vis-dataset');
    this.$currVis.appendChild(currVisLabel);
    this.$currVis.appendChild(currVisPlot);
    this.$currVis.appendChild(currVisDataset);

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

    const numbObj = this.visualization.objectives.length;

    // ------------------------
    // --- LABEL COLUMN
    const colLabel = document.createElement('div');
    colLabel.classList.add('column','label');
    // header action
    const headerActionLabel = document.createElement('div');
    headerActionLabel.innerText = 'Actions';
    // HACK
    // // header action text
    // const headerActionLabelText = document.createElement('div');
    // headerActionLabelText.innerText = 'Actions';
    // headerActionLabelText.classList.add('action-header-text');
    // headerActionLabel.append(headerActionLabelText);
    // // header action rect
    // const headerActionLabelRect = document.createElement('div');
    // headerActionLabelRect.classList.add('action-header-rect');
    // headerActionLabel.append(headerActionLabelRect);

    headerActionLabel.classList.add('row','action-header','header','label');
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
    // confirmElemLabel.classList.add('row','confirm','hide','sticky');
    // confirmElemLabel.classList.add('row','confirm','sticky');
    // confirmElemLabel.dataset.bottomRow = `${(numbObj+1)}`;

    // const confirmBtn = document.createElement('button');
    // confirmBtn.innerText = 'Confirm';
    // confirmBtn.classList.add('confirm-btn');
    // confirmBtn.addEventListener('click', (event) => this.clickConfirmHandler(event));
    // confirmElem.appendChild(confirmBtn);
    colLabel.appendChild(confirmElemLabel);


    // header objective
    const headerObjectiveLabel = document.createElement('div');
    headerObjectiveLabel.innerText = 'Objectives';
    headerObjectiveLabel.classList.add('row','objective-header','header','label','sticky');
    headerObjectiveLabel.dataset.bottomRow = `${(numbObj)}`;
    colLabel.appendChild(headerObjectiveLabel);
    // objectives
    // for(const obj of this.visualization.objectives) {
    for(let i=0; i<numbObj; i++) {
        const obj = this.visualization.objectives[i]
      const objElem = document.createElement('div');
      objElem.innerText = obj.label;
      objElem.dataset.objective = obj.id;
      objElem.classList.add('row','objective','label','sticky');
      objElem.dataset.bottomRow = `${(numbObj-1-i)}`;
      colLabel.appendChild(objElem);
    }
    // add label column to table
    table.appendChild(colLabel);


    // ------------------------
    // --- ATTEMPT COLUMNS
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
      // confirmElem.classList.add('row','confirm','hide','sticky');
      // confirmElem.classList.add('row','confirm','sticky');
      // confirmElem.dataset.bottomRow = `${(numbObj+1)}`;
      const confirmBtn = document.createElement('div');
      confirmBtn.innerText = 'Confirm';
      confirmBtn.classList.add('confirm-btn');
      confirmBtn.addEventListener('click', async (event) => this.clickConfirmHandler(event));
      confirmElem.appendChild(confirmBtn);
      colAttempt.appendChild(confirmElem);

      // header objective
      const headerObjective = document.createElement('div');
      headerObjective.innerText = '';
      headerObjective.classList.add('row','header','sticky');
      headerObjective.dataset.bottomRow = `${(numbObj)}`;
      colAttempt.appendChild(headerObjective);
      // objectives
      // for(const obj of this.visualization.objectives) {
      for(let i=0; i<numbObj; i++) {
        const obj = this.visualization.objectives[i]
        const objElem = document.createElement('div');
        objElem.dataset.objective = obj.id;
        objElem.classList.add('row','objective','result','sticky');
        objElem.dataset.bottomRow = `${(numbObj-1-i)}`;
        const objElemIdicator = document.createElement('div');
        objElemIdicator.classList.add('obj_indicator');
        objElemIdicator.dataset.value = 'none';
        objElem.appendChild(objElemIdicator);
        colAttempt.appendChild(objElem);
      }

      // add attempt column to table
      table.appendChild(colAttempt);
    }


    // ------------------------
    // --- SOLUTION COLUMUN
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
      const toggle = createToggleButton();
      toggle.classList.add('hide');
      actElem.appendChild(toggle);
      actElem.dataset.action = act.id;
      actElem.classList.add('row','action');
      colSolution.appendChild(actElem);
    }

    // confirm container + button
    const confirmElemSolution = document.createElement('div');
    confirmElemSolution.classList.add('row','confirm','hide');
    // confirmElemSolution.classList.add('row','confirm','hide','sticky');
    // confirmElemSolution.classList.add('row','confirm','sticky');
    // confirmElemSolution.dataset.bottomRow = `${(numbObj+1)}`;
    // const confirmBtn = document.createElement('button');
    // confirmBtn.innerText = 'Confirm';
    // confirmBtn.classList.add('confirm-btn');
    // confirmBtn.addEventListener('click', (event) => this.clickConfirmHandler(event));
    // confirmElem.appendChild(confirmBtn);
    colSolution.appendChild(confirmElemSolution);

    // header objective 
    const headerObjectiveSolution = document.createElement('div');
    headerObjectiveSolution.innerText = '';
    headerObjectiveSolution.classList.add('row','header','sticky');
    headerObjectiveSolution.dataset.bottomRow = `${(numbObj)}`;
    colSolution.appendChild(headerObjectiveSolution);
    // objectives
    // for(const obj of this.visualization.objectives) {
    for(let i=0; i<numbObj; i++) {
      const obj = this.visualization.objectives[i]
      const objElem = document.createElement('div');
      objElem.dataset.objective = obj.id;
      objElem.classList.add('row','objective','result','sticky');
      objElem.dataset.bottomRow = `${(numbObj-1-i)}`;
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
        // set current action toggle button to incative
        const toggleBtn = aRow.querySelector('.toggle-btn') as HTMLDivElement;
        toggleBtn.classList.add('inactive');
      }

       // disable confirm
       const confirmBtn = colCurrAct.querySelector('.confirm-btn') as HTMLDivElement;
       if(confirmBtn) {
        confirmBtn.classList.add('disabled','hide');
       }
       
    }
    // show objectives
    const fulfilledObjectives = this.visualization.areAllObjectivesFulfilled();
    const colCurrObj = this.$gameTable.querySelector(`.column.attempt[data-attempt='${this._currAttempt}']`) as HTMLDivElement;
    this.setTableColumnObjectives(colCurrObj, this.visualization);



    // update attempt data -> confirm actions + time + win
    const startActionTrack = this.getTableColumnActions(colCurrObj);
    this.attemptTrackData.confirmActions.push(...startActionTrack);
    this.attemptTrackData.confirmTimestamp = new Date();
    this.attemptTrackData.win = fulfilledObjectives;
    // save attemptTrackData
    this.saveAttemptTrackData();

   



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

      // calculate score and reward
      this.calcScoreAndReward();

      // set isGameFinished state
      setIsGameFinished(true);

      // save game track data
      this.saveGameTrackData(gameEndReason.gameWin);

      
      // show WIN modal
      // const modalGameEnd = document.body.querySelector('#modal-game-end');
      // modalGameEnd.classList.add('show-modal');
      const modalGameWin = document.body.querySelector('.modal.modal-game-win') as HTMLDivElement;
      // TODO set points in modal
      this.setWinModalInfo(modalGameWin);
      modalGameWin.classList.add('is-active');

      // const modalGameResult = document.body.querySelector('.modal.modal-game-result');
      
      // // show win text
      // const gameLose =  modalGameResult.querySelector('.content-game-over');
      // gameLose.classList.add('display-none');
      // const gameWin =  modalGameResult.querySelector('.content-win');
      // gameWin.classList.remove('display-none');
      // // show modal
      // modalGameResult.classList.add('is-active');

    } else {
      // not all objectives fulfilled
      if(this._currAttempt >= this._numbAttempts) {
        // all attempts used -> LOSE / GAME OVER
        this._currAttempt++;

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
        
        // calculate score and reward
        this.calcScoreAndReward();

        // set isGameFinished state
        setIsGameFinished(true);

        // save game track data
        this.saveGameTrackData(gameEndReason.gameOver);
        
        // show LOSE modal
        // const modalGameEnd = document.body.querySelector('#modal-game-end');
        // modalGameEnd.classList.add('show-modal');
        const modalGameOver = document.body.querySelector('.modal.modal-game-over') as HTMLDivElement;
        // TODO set points in modal
        this.setGameOverModalInfo(modalGameOver);
        modalGameOver.classList.add('is-active');
        // const modalGameResult = document.body.querySelector('.modal.modal-game-result');
        
        // // show game over text
        // const gameWin =  modalGameResult.querySelector('.content-win');
        // gameWin.classList.add('display-none');
        // const gameLose =  modalGameResult.querySelector('.content-game-over');
        // gameLose.classList.remove('display-none');
        // // show modal
        // modalGameResult.classList.add('is-active');

      } else {
        // attempts still possible -> NEXT ATTEMPT
        this._currAttempt++;
        // setup attempt data -> basic + start
        this.attemptTrackData = this.createAttemptTrackData();
        // copy vis 
        const copyVis = this.visualization.getCopyofVisualization();
        this.visualization = copyVis;
        // show actions & set actions
        // show confirm
        const colNext = this.$gameTable.querySelector(`.column.attempt[data-attempt='${this._currAttempt}']`) as HTMLDivElement;
        this.setTableColumnActions(colNext,this.visualization);

        // update attempt data -> start actions
        const startActionTrack = this.getTableColumnActions(colNext);
        this.attemptTrackData.startActions.push(...startActionTrack);

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

  setWinModalInfo(winModal: HTMLDivElement) {
    // set points
    const spanPoints = winModal.querySelector('.modal-game-points') as HTMLSpanElement;
    spanPoints.innerText = `${this.score}`;
    // check reward
    const modalReward = winModal.querySelector('.modal-game-reward');
    if(this.reward !== gameReward.noReward) {
      const imgReward = winModal.querySelector('.modal-game-reward-img') as HTMLImageElement;
      imgReward.src = this.getRewardImageLocation(this.reward);
      modalReward.classList.remove('display-none');
    } else {
      modalReward.classList.add('display-none');
    }
    // TODO check new highscore
    // const modalHighscore = winModal.querySelector('.modal-game-highscore');
    // set next game number
    const spanNextGame = winModal.querySelector('.btn-next-number') as HTMLSpanElement;
    const nextGameNr = (this._gameId % 3) +1;
    const nextGameLabel = this.getGameLabelWithId(nextGameNr);
    spanNextGame.innerText = `${nextGameLabel}`;
    // spanNextGame.innerText = `Game ${nextGameNr}`;
  }

  getRewardImageLocation(reward: gameReward): string {
    let rewardImgLocation = '';
    if(reward === gameReward.gold) {
      rewardImgLocation = imgBadgeGold;
    } else if (reward === gameReward.silver) {
      rewardImgLocation = imgBadgeSilver;
    } else if (reward === gameReward.bronze) {
      rewardImgLocation = imgBadgeBronze;
    }
    return rewardImgLocation;
  }

  setGameOverModalInfo(gameOverModal: HTMLDivElement) {
    // set points
    const spanPoints = gameOverModal.querySelector('.modal-game-points') as HTMLSpanElement;
    spanPoints.innerText = `${this.score}`;
    // set next game number
    const spanNextGame = gameOverModal.querySelector('.btn-next-number') as HTMLSpanElement;
    const nextGameNr = (this._gameId % 3) +1;
    const nextGameLabel = this.getGameLabelWithId(nextGameNr);
    spanNextGame.innerText = `${nextGameLabel}`;
  }

  getGameLabelWithId(gameId: number): string {
    let label = `Game ${gameId}`
    const gameBoardDescr = getAllGameBoardDescr();

    const checkGameBoardDescr = gameBoardDescr.filter((elem) => elem.gameId === gameId);
    if(checkGameBoardDescr.length === 1) {
      const currGameBoardDescr = checkGameBoardDescr[0];
      label = currGameBoardDescr.label;
    }

    return label;
  }

  calcScoreAndReward() {
    this.score = (this._numbAttempts - this._currAttempt) + 1;
    this.reward = gameReward.noReward;
    if(this.score === this._numbAttempts) {
      this.reward = gameReward.gold;
    } else if(this.score === (this._numbAttempts - 1) ) {
      this.reward = gameReward.silver;
    } else if(this.score === (this._numbAttempts - 2) ) {
      this.reward = gameReward.bronze;
    }

    console.log('Current score: ', {score: this.score, reward: this.reward});
    this.setScoreAndRewardInfo();
  }

  setScoreAndRewardInfo() {
    // TODO set score and info
    const navGame = $nav.querySelector('.nav-game');

    const ddBtn = navGame.querySelector('.dropdown-btn');
    const ddBtnReward = ddBtn.querySelector('.reward');
    const ddBtnPoints = ddBtn.querySelector('.points');
    
    
    const ddMenu = navGame.querySelector('.dropdown-menu');
    // get current game menu item
    const currMenuItem = ddMenu.querySelector(`.dropdown-menu-item[data-game-id="${this._gameId}"]`) as HTMLDivElement;
    const oldScore = Number(currMenuItem.dataset.score);
    const ddMenuItemReward = currMenuItem.querySelector('.reward');
    const ddMenuItemPoints = currMenuItem.querySelector('.points');
    
    if(this.score > oldScore) {
      // TODO save in local/session storage
      // set menu item score
      currMenuItem.dataset.score = `${this.score}`;

      // set points
      ddBtnPoints.innerHTML = `Points: ${this.score}`;
      ddMenuItemPoints.innerHTML = `Points: ${this.score}`;

      // set rewards
      if(this.reward !== gameReward.noReward) {
        // ddBtnReward.classList.remove(gameReward.bronze, gameReward.silver, gameReward.gold);
        // ddBtnReward.classList.add(this.reward);
        const imgBtn = ddBtnReward.querySelector('.img-reward') as HTMLImageElement;
        // ddMenuItemReward.classList.remove(gameReward.bronze, gameReward.silver, gameReward.gold);
        // ddMenuItemReward.classList.add(this.reward);
        const imgMenuItem = ddMenuItemReward.querySelector('.img-reward') as HTMLImageElement;
        if(this.reward === gameReward.gold) {
          imgBtn.src=imgBadgeGold;
          imgMenuItem.src=imgBadgeGold;
        } else if(this.reward === gameReward.silver) {
          imgBtn.src=imgBadgeSilver;
          imgMenuItem.src=imgBadgeSilver;
        } else if(this.reward === gameReward.bronze) {
          imgBtn.src=imgBadgeBronze;
          imgMenuItem.src=imgBadgeBronze;
        }
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
  
        const toogleBtn = aRow.querySelector('.toggle-btn') as HTMLDivElement;
        toogleBtn.classList.remove('hide');
        const stringValue = currValue ? 'true' : 'false';
        toogleBtn.dataset.value = stringValue;
      }

      // show confirm div
      const confirmCntr = column.querySelector('.confirm')
      if(confirmCntr) {
        confirmCntr.classList.remove('hide');
      }    
    }
  }

  getTableColumnActions(column: HTMLDivElement): {actionId: string, value: boolean}[] {
    const actionState = [] 
    if(column) {
      // set actions
      const actRows = Array.from(column.querySelectorAll('.action')) as HTMLDivElement[];
      for(const aRow of actRows) {
        
        const aid = aRow.dataset.action;
        const toggleBtn = aRow.querySelector('.toggle-btn') as HTMLDivElement;
        const currValue = toggleBtn.dataset.value === 'true' ? true : false;
        actionState.push({
          actionId: aid,
          value: currValue
        })
      } 
    }

    return actionState;
  }

  setTableColumnObjectives(column: HTMLDivElement, vis: VisualizationBase) {
    if(column) {
      const visObjStates = vis.getObjectivesState();
      // console.log('visObjStates',visObjStates);
      // console.log('visActionStates',vis.actions);
      // get row objective
      const objRows = Array.from(column.querySelectorAll('.objective')) as HTMLDivElement[];
      // console.log('objRows',objRows);
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
    // attempt label
    const divLabel = visContainer.querySelector('.vis-label') as HTMLDivElement;
    divLabel.innerText = `${heading}`;
    // visualization
    const divPlot = visContainer.querySelector('.vis-plot') as HTMLDivElement;
    await vis.showVisualization(divPlot);
    // dataset info
    const divDataset = visContainer.querySelector('.vis-dataset') as HTMLDivElement;
    const datasetInfo = vis.currentDatasetInfo;
    const itemMissing = datasetInfo.allItems - datasetInfo.notNullItems;
    const sampledText = datasetInfo.sampled ? `Dataset is sampled, it includes only ${datasetInfo.allItems} items. ` : '';
    divDataset.innerHTML = `Source: Vega's cars dataset. (${sampledText}${itemMissing} items are not shown, due to missing values.)`;
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


  createActionableToggleSwitch(): HTMLDivElement {
    const toggle = createToggleButton();
    toggle.classList.add('hide');
  
    toggle.addEventListener('click', (event) => {
      // console.log("🚀 ~ file: GameBoard.ts:692 ~ toggle.addEventListener ~ event", event);
      event.stopPropagation();

      const eventTarget = event.target as HTMLDivElement;
      let actioToggleBtn = event.target as HTMLDivElement;
      if(eventTarget.classList.contains('toggle-btn-slider')) {
        actioToggleBtn = eventTarget.parentElement as HTMLDivElement;
      }
      const isInactive = actioToggleBtn.classList.contains('inactive');

      if(!isInactive) {
        const currValue = actioToggleBtn.dataset.value === 'true' ? true : false;
        actioToggleBtn.dataset.value = !currValue ? 'true' : 'false';

        const col = this.$gameTable.querySelector(`.column.attempt[data-attempt='${this._currAttempt}']`);
        if(col) {
          // get actions
          const actRows = Array.from(col.querySelectorAll('.action')) as HTMLDivElement[];
          for(const aRow of actRows) {
            // current toggle button value
            const toggleBtn = aRow.querySelector('.toggle-btn') as HTMLDivElement;
            const toggleValue = toggleBtn.dataset.value === 'true' ? true : false;

            const aid = aRow.dataset.action;
            const currAction = this.visualization.getAction(aid);
            const oldValue = currAction.value;
            // set action value
            currAction.value = toggleValue;

            if(oldValue !== toggleValue) {
              const actionChangeTrack = {
                actionId: aid,
                oldValue,
                newValue: toggleValue,
                timestamp: new Date()
              }
              this.attemptTrackData.actionChanges.push(actionChangeTrack);
            }
            // show toggle button
            toggle.classList.remove('hide');
          }

          // update current vis
          const heading = `Attempt ${this._currAttempt} Preview`;
          this.updateVisualizationContainer(this.$currVis,this.visualization, heading);
          
        }
      }
    });

    return toggle;
  }

  async setInitalVisualizationState() {
    // set inital state of game
    // set current attempt
    this._currAttempt = 1;
    // setup attempt data -> basic + start
    this.attemptTrackData = this.createAttemptTrackData();
    // get attempt column 1
    const col = this.$gameTable.querySelector(`.column.attempt[data-attempt='${this._currAttempt}']`) as HTMLDivElement;
    if(col) {
      // set actions
      const actRows = Array.from(col.querySelectorAll('.action')) as HTMLDivElement[];
      for(const aRow of actRows) {
        // get action
        const aid = aRow.dataset.action;
        const currAction = this.visualization.getAction(aid);
        // get action value
        const currValue = currAction.value;
  
        // get toggle button
        const toggleBtn = aRow.querySelector('.toggle-btn') as HTMLDivElement;
        toggleBtn.classList.remove('hide');
        // set toggle button dataset value
        toggleBtn.dataset.value = currValue ? 'true' : 'false';
      }

       // show confirm button
       const confirm = col.querySelector('.confirm')
       if(confirm) {
        confirm.classList.remove('hide');
       }
       
    }

    // update attempt data -> start actions
    const startActionTrack = this.getTableColumnActions(col);
    this.attemptTrackData.startActions.push(...startActionTrack);

    // update visualization in current visualization div
    const heading = `Attempt ${this._currAttempt} Preview`;
    this.updateVisualizationContainer(this.$currVis,this.visualization, heading);

  }

  createAttemptTrackData(): IAttemptTrackData {
    const atTrackDat: IAttemptTrackData = {
      userId: userId,
      gameId: this._gameId,
      attempt: this._currAttempt,
      startTimestamp: new Date(),
      startActions: [],
      actionChanges: [],
      confirmTimestamp: null,
      confirmActions: [],
      win: false
    }

    return atTrackDat;
  }

  createGameTrackData(): IGameTrackData {
    const dateParts = getDateParts(new Date());
    const strDates = `${dateParts.labels.day}${dateParts.labels.month}${dateParts.labels.hour}${dateParts.labels.minutes}${dateParts.labels.seconds}`;
    const gameTrackDat: IGameTrackData = {
      userId: userId,
      gameId: `${this._gameId}-${strDates}`,
      gameNumber: this._gameId,
      gameEndReason: gameEndReason.gameStart,
      startTimestamp: new Date(),
      allAttempts: []
    }

    return gameTrackDat;
  }

  updateGameTrackData() {
    // add to game tracking data
    const copyAttTrackData = deepCopy(this.attemptTrackData);
    this.gameTrackData.allAttempts.push(copyAttTrackData)
  }

  saveAttemptTrackData() {
    // add to attempt data to game tracking data
    this.updateGameTrackData();
    // get current data
    const data = this.attemptTrackData;
    const startDate = data.startTimestamp;
    const day = startDate.getDate();
    const month = startDate.getMonth() + 1;
    const year = startDate.getFullYear();
    const time = `${startDate.getHours()}-${startDate.getMinutes()}-${startDate.getSeconds()}`
    const filename = `${year}-${month}-${day}_${time}_${data.userId}_${data.gameId}_${data.attempt}.json`;


    // postJSONAttemptData(filename, data);
  }

  saveGameTrackData(endReason: gameEndReason) {
    const gameData = this.gameTrackData;
    gameData.gameEndReason = endReason;

    updateUserTrackData(this.gameTrackData);
    checkMinimalSurveyRequirement();

    const userId = gameData.userId;
    const gameId = gameData.gameId;
    const startDate = gameData.startTimestamp;
    
    const day = startDate.getDate();
    const month = startDate.getMonth() + 1;
    const year = startDate.getFullYear();
    const time = `${startDate.getHours()}-${startDate.getMinutes()}-${startDate.getSeconds()}`
    const filename = `${year}-${month}-${day}_${time}_${userId}_${gameId}_all_Attempts.json`;
  
    // postJSONGameData(filename, gameData);
  }

}