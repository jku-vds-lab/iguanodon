import ColumnTable from "arquero/dist/types/table/column-table";
import { ActionType } from "./designChoices";
import { ObjectiveState } from "./Objective";
import { Scatterplot } from "./Scatterplot";
import { getColumnTypesFromArqueroTable, getUniqueRandomValuesFrom0toN, getUniqueRandomValuesFromArray } from "./util";
import { VisType, VisualizationBase } from "./visualizations";



export class Investigation {
  
  private _visHistory: { step: number, score: number, visualization: VisualizationBase }[];
  // $visMultiPreview: HTMLDivElement;
  // $visHoverPreview: HTMLDivElement;

  $container: HTMLDivElement;
  $currVis: HTMLDivElement;
  $nextVis: HTMLDivElement;
  $wrapperTable: HTMLDivElement;
  $cntrTable: HTMLDivElement;
  $wrapperPreview: HTMLDivElement;
  $previewVis: HTMLDivElement;

  $actObTable: HTMLTableElement;


  private _dataColumns: {label: string, type: string}[]
  dataset: ColumnTable;
  private _numbPreviews: number = 3;

  constructor(cntrMain: HTMLDivElement, isFreeMode: boolean, dataset: ColumnTable) {
    
    // this.$actObTable = this.createTable();
    this.$container = cntrMain;

    this._visHistory = [];
    this.dataset = dataset;
    this._dataColumns = getColumnTypesFromArqueroTable(dataset)
    console.log('data columns: ', this._dataColumns);

    // setup all elemtens and their containers:
    // current Vis, next Vis, table, previews
    this.setupInterface();
    this.setupInitialVisualization();


    this.addEventListeners();

    // test columns for history
    // this.addHistoryColumn();
    // this.addHistoryColumn();
    // this.addHistoryColumn();
  }

  setupInterface() {
    // current vis
    this.$currVis = document.createElement('div');
    this.$currVis.id = 'current-vis';

    // next vis
    this.$nextVis = document.createElement('div');
    this.$nextVis.id = 'next-vis';

    // table
    this.$wrapperTable = document.createElement('div'); // lower half
    this.$wrapperTable.id = 'wrapper-table';
    
    this.$cntrTable = document.createElement('div'); // container for table
    this.$cntrTable.id = 'cntr-table';
    
    this.$actObTable = this.createTable();
    this.$actObTable.id = 'act-ob-table';

    this.$cntrTable.appendChild(this.$actObTable);
    this.$wrapperTable.appendChild(this.$cntrTable);

    // preview
    this.$wrapperPreview = document.createElement('div'); // right side
    this.$wrapperPreview.id = 'wrapper-preview';

    this.$previewVis = document.createElement('div');
    this.$previewVis.id = 'preview-vis';
    this.$wrapperPreview.appendChild(this.$previewVis);

    // preview vis containers
    for(let i=0; i<this._numbPreviews; i++) {
      const preVisOpt = document.createElement('div');
      preVisOpt.classList.add('preview-option',`pos-${i+1}`);
      this.$previewVis.appendChild(preVisOpt);
    }

    // add dom elements to container
    this.$container.appendChild(this.$currVis);
    this.$container.appendChild(this.$nextVis);
    this.$container.appendChild(this.$wrapperTable);
    this.$container.appendChild(this.$wrapperPreview);
  }

  createTable(starVisType: VisType = VisType.Scatter): HTMLTableElement {
    const $table = document.createElement('table');
    $table.innerHTML = `
      <thead>
        <tr>
          <th scope="col">Actions & Objectives</th>
          <th scope="col">Current</th>
        </tr>
      </thead>
      <tbody class="table-actions">
        <tr id="act-vis-type">
          <td>Visualization Type</td>
          <td id="vis-type-cell"></td>
        </tr>
      </tbody>
      <tbody class="table-objectives">
      </tbody>`; 

    // <th id="act-ob-table-th-history" scope="col" colspan="1">History</th>
    // <td>h1</td>
    // <tr>
    //   <td>h1</td>
    //   <td>Set X-Axis</td>
    //   <td>...</td>
    // </tr>
    // <tr>
    //   <td>h1</td>
    //   <td>Reduce Overplotting</td>
    //   <td>OK</td>
    // </tr>

    // add vis type select with its options to table
    const infoSel = {id: 'vis-select', classes: ['current-state']};
    const visTypeOpt = [
      {value: ''+VisType.Scatter, text: 'Scatterplot'},
      {value: ''+VisType.Line, text: 'Line Chart'},
      {value: ''+VisType.Bar, text: 'Bar Chart'}
    ];
    const $select = this._ceateHTMLSelectWithOptions(infoSel, visTypeOpt);
    // set initial visualization type dynamically
    $select.value = ''+starVisType;

    // add select to table cell
    const $cellVisType = $table.querySelector('#vis-type-cell');
    $cellVisType.appendChild($select);


    return $table;
  }

  setupInitialVisualization() {
    // update the encodings in the table
    this.updateEncodings();
    const selectVis: HTMLSelectElement = this.$actObTable.querySelector('#vis-select');
    const selectX: HTMLSelectElement = this.$actObTable.querySelector('#x-axis-select');
    const selectY: HTMLSelectElement = this.$actObTable.querySelector('#y-axis-select');
    const selectC: HTMLSelectElement = this.$actObTable.querySelector('#color-select');
  
    // console.log('dataset Investigation: ', this.dataset);
    // create visualizations dynamically (scatter, line, bar)
    const scatter = new Scatterplot(this.dataset, selectX.value, selectY.value, selectC.value);
    
    // this.addHistoryColumn();
    this.updateVisualizations(scatter);

  }

  addEventListeners() {
    // vis selection
    const selectVis: HTMLSelectElement = this.$actObTable.querySelector('#vis-select');
    selectVis.addEventListener('change', (ev) => {
      // this.addHistoryColumn();
      this.updateEncodings();

      const selectVis: HTMLSelectElement = this.$actObTable.querySelector('#vis-select');
      const selectX: HTMLSelectElement = this.$actObTable.querySelector('#x-axis-select');
      const selectY: HTMLSelectElement = this.$actObTable.querySelector('#y-axis-select');
      const selectC: HTMLSelectElement = this.$actObTable.querySelector('#color-select');
    
      // console.log('dataset Investigation: ', this.dataset);
      // create visualizations dynamically (scatter, line, bar)
      const scatter = new Scatterplot(this.dataset, selectX.value, selectY.value, selectC.value);
    
      this.updateVisualizations(scatter);
    });

    // encoding selection
    const selectEncs: HTMLSelectElement[] = Array.from(this.$actObTable.querySelectorAll('.encoding-selecion'));
    for(const sel of selectEncs) {
      sel.addEventListener('change', (ev) => {
        // this.addHistoryColumn();


        // const selectVis: HTMLSelectElement = this.$actObTable.querySelector('#vis-select');
        const selectX: HTMLSelectElement = this.$actObTable.querySelector('#x-axis-select');
        const selectY: HTMLSelectElement = this.$actObTable.querySelector('#y-axis-select');
        const selectC: HTMLSelectElement = this.$actObTable.querySelector('#color-select');
     
        // console.log('dataset Investigation: ', this.dataset);
        // create visualizations dynamically (scatter, line, bar)
        // const scatter = new Scatterplot('test', this.dataset, selectX.value, selectY.value, selectC.value);
        // console.log('-----****------');
        // console.log('selection Change: ', scatter.designChoices['x_axis_encoding']);
        // console.log('-----****------');

        const currentState = this._visHistory[this._visHistory.length-1];
        const currVisualization = currentState.visualization;
        // const newName = `vis-${this._visHistory.length}`;
        // const newVis = currVisualization.getCopyofVisualization();

        
        const encodings = [
          {field: 'x', value: selectX.value},
          {field: 'y', value: selectY.value},
          {field: 'color', value: selectC.value},
        ];
        // newVis.setEncodings(encodings);
        const newVis = currVisualization.getCopyofVisualizationWithChangedEncodings(encodings);
        // [ ] update vegaSpec based on encodings
        // const newVis = currVisualization.getVisualizationCopyWithEncodingsAndActions(newName,encodings);


         // update history
        // this.addHistoryColumn();
        this.updateVisualizations(newVis);
      });
    }
  }

  updateEncodings() {
    console.log('update Encoding');
    const selectVis: HTMLSelectElement = this.$actObTable.querySelector('#vis-select');
    const visType = Number(selectVis.value);

    this.updateEncodingRows(visType);
  }

  updateEncodingRows(visType: VisType) {
    //get current attibure of dataset
    const opts = this._dataColumns.map((elem) => { 
      return {value: elem.label, text: elem.label}
    });

    // add empty option
    opts.unshift({value: 'null', text: ''});

    const xSel = {id: 'x-axis-select', classes: ['encoding-selecion', 'current-state']};
    const $xSelect = this._ceateHTMLSelectWithOptions(xSel, opts);

    const ySel = {id: 'y-axis-select', classes: ['encoding-selecion', 'current-state']};
    const $ySelect = this._ceateHTMLSelectWithOptions(ySel, opts);

    const colorSel = {id: 'color-select', classes: ['encoding-selecion', 'current-state']};
    const $colorSelect = this._ceateHTMLSelectWithOptions(colorSel, opts);

    // check if encoding rows exist
    const xEncRow: HTMLTableRowElement = this.$actObTable.querySelector('#x-axis-encoding');
    const yEncRow: HTMLTableRowElement = this.$actObTable.querySelector('#y-axis-encoding');
    const cEncRow: HTMLTableRowElement = this.$actObTable.querySelector('#color-encoding');

    
    // for all charts x and y encodings are used
    if(!xEncRow) {
      // console.log('xEncRow: ',xEncRow);
      const elemTd = document.createElement('td');
      elemTd.appendChild($xSelect)
      this.addRow('actions',2,'x-axis-encoding', ['encoding'],'Set X-Axis Encoding', elemTd);
    }

    if(!yEncRow) {
      // console.log('yEncRow: ',yEncRow);
      const elemTd = document.createElement('td');
      elemTd.appendChild($ySelect)
      this.addRow('actions', 3,'y-axis-encoding', ['encoding'],'Set Y-Axis Encoding', elemTd);
    }

    
    if(visType === VisType.Scatter || visType === VisType.Line) {
      // for Scatterplot and Line chart, all encodings are used (x,y,color)
      // add color endoding
      if(!cEncRow) {
        // console.log('cEncRow: ',cEncRow);
        const elemTd = document.createElement('td');
        elemTd.appendChild($colorSelect)
        this.addRow('actions', 4,'color-encoding', ['encoding'],'Set Color Encoding', elemTd);
      }
  
      // this.addRow(2,'x-axis-encoding','Set X-Axis Encoding', $xSelect);
      // this.addRow(3,'y-axis-encoding','Set Y-Axis Encoding', $ySelect);
      // this.addRow(4,'color-encoding','Set Color Encoding', $colorSelect);

    } else if (visType === VisType.Bar) {
      // for Bar chart only x and y encodings are used
      // make sure color encoding is removed
      if(cEncRow) {
        // console.log('cEncRow: ',xEncRow);
        this.removeRow('color-encoding');
      }
      // this.addRow(2,'x-axis-encoding','Set X-Axis Encoding', $xSelect);
      // this.addRow(3,'y-axis-encoding','Set Y-Axis Encoding', $ySelect);
      // this.addRow(4,'color-encoding','Set Color Encoding', $colorSelect);
    } 
    //else {
    //   this.addRow(2,'x-axis-encoding','Set X-Axis Encoding', $xSelect);
    //   this.addRow(3,'y-axis-encoding','Set Y-Axis Encoding', $ySelect);
    // }
  }

  async updateVisualizations(visualization: VisualizationBase) {
    this.addHistoryColumn();
    console.log('update Visualization');

    const newStep = this._visHistory.length+1;
    this._visHistory.push({step: newStep, score: 0, visualization});

    // clear current Vis container
    this.$currVis.textContent = '';

    // create container for new visualization
    const visItem = document.createElement('div');
    visItem.classList.add('vis-item');
    // add vis container to vis strip
    this.$currVis.appendChild(visItem);

    console.log('visHistory: ', this._visHistory);
    const encodings = visualization.getEncodings();
    const xEnc = encodings.filter((elem) => elem.field === 'x')[0];
    const yEnc = encodings.filter((elem) => elem.field === 'y')[0];
    console.log('select values: ', {x: xEnc.value, y: yEnc.value});
    // TODO check for all visualizations
    if(xEnc.value !== '' && yEnc.value !== '') {
      this.updateActions();
    }

    // 

    // TODO add loading animation
    console.log('show visualization in: ', visItem);
    await visualization.showVisualization(visItem);

    // TODO update objectives
    if(xEnc.value !== '' && yEnc.value !== '') {
      this.updateObjectives();
    }
  }

  updateActions() {
    // remove other preview actions
    this.removePreviewRows();

    // get design choices state
    const currentState = this._visHistory[this._visHistory.length-1];
    const currVisualization = currentState.visualization;
    // only get action without encodings
    const currVisActions = currVisualization.actions.filter((elem) => elem.type === ActionType.Option);
    console.log('update Action: current visualizations: ', currVisualization);
    console.log('update Action: current actions: ', currVisActions);
    console.groupCollapsed('action previews')
    // const actionSelection = getUniqueRandomValuesFrom0toN(currVisActions.length, this._numbPreviews);
    // console.log('Selected actions for preview: ', actionSelection);
    
    // existing actions
    const existingActions = Array.from(this.$actObTable.querySelectorAll('tr.action'));
    const existingActionIds = existingActions.map((elem) => elem.id);
    console.log('Existing actions: ', existingActionIds);

    // new preview actions
    const newActions =  currVisActions.filter((elem) => existingActionIds.indexOf(elem.id) === -1);
    console.log('filtered actions: ', newActions);
    const actionSelection = getUniqueRandomValuesFromArray(newActions, this._numbPreviews) as { dcId: string, label:string, type: ActionType, value: boolean | string | number }[];
    console.log('Selected actions for preview: ', actionSelection);

   

    // add previews with table entries
    const divPreviews = Array.from(this.$previewVis.querySelectorAll('.preview-option')) as HTMLDivElement[];
    

    // create the preview rows
    const previews: {cell: HTMLElement, vis: VisualizationBase}[] = [];
    for(const currASel of actionSelection) {
      const tdAction = document.createElement('td');
      tdAction.classList.add('current-state');
      tdAction.innerText = '?'
      tdAction.dataset.aid = `${currASel.dcId}`;
      // tdAction.dataset.value = `${currASel.value}`;
      this.addActionRow(currVisualization.type, `${currASel.dcId}`, ['action', 'preview'] ,`${currASel.label}`, tdAction);

      // new visualization
      const preVis = currVisualization.getCopyofVisualization()
      const desC = preVis.getAction(currASel.dcId);
      console.log('vis action: ', {currASel, desC});

      if (desC.type === ActionType.Option) {
        desC.value = !desC.value;
      }
      previews.unshift({cell: tdAction, vis: preVis});
    }

    // TODO select existing actions if not enough new ones can be added

    // add preview visualizations
    divPreviews.forEach(async (divElem, i) => {
      divElem.textContent = ''; // clear elements
      const currPreview = previews[i];

      const visCntr = document.createElement('div');
      visCntr.classList.add('cntr-preview-vis');
      divElem.appendChild(visCntr);

      currPreview.vis.showVisualization(visCntr);

      // add action listerner
      this.addActionEventListener(currPreview.cell, currPreview.vis);
      
    });

    // divPreviews.forEach(async (divElem, i) => {

    //   // table entry
    //   // const aInx = actionSelection[i];
    //   // const currASel = currVisActions[aInx];
    //   const currASel = actionSelection[i];
    //   console.log('--------------');
    //   // console.log('table action: ', {aInx, currASel});
    //   console.log('table action: ', {currASel});
    //   const tdAction = document.createElement('td');
    //   tdAction.classList.add('current-state');
    //   tdAction.innerText = '?'
    //   tdAction.dataset.aid = `${currASel.dcId}`;
    //   // tdAction.dataset.value = `${currASel.value}`;
    //   this.addActionRow(currVisualization.type, `${currASel.dcId}`, ['action', 'preview'] ,`${currASel.label}`, tdAction);
      


    //   // preview
    //   divElem.textContent = ''; // clear elements

    //   const visCntr = document.createElement('div');
    //   visCntr.classList.add('cntr-preview-vis');
    //   divElem.appendChild(visCntr);
      
    //   const preVis = currVisualization.getCopyofVisualization(`preview-${i}`)
    //   // reverse the order for the visualizations
    //   // const aSelId = actionSelection[(this._numbPreviews-1)-i];

    //   // const desC = preVis.designChoices[aSelId];
    //   // const desC = preVis.getDesignChoicesBasedOnId([aSelId.dcId])[0];
    //   const desC = preVis.getDesignChoicesBasedOnId([currASel.dcId])[0];
    //   // console.log('vis action: ', {aSelId, desC});
    //   console.log('vis action: ', {currASel, desC});
    //   // const desC = preVis.getDesignChoicesBasedOnId([`${aSelId}`])[0];

    //   if (desC.type === DesignChoiceType.option) {
    //     // console.log('design choice: ', { i, id: desC.id, old: desC.value.toString(), new: (!desC.value).toString() });
    //     desC.value = !desC.value;
    //     // visCntrLabel.innerHTML = desC.label;
    //   }
    //   preVis.showVisualization(visCntr);

    //   // add action listerner
    //   this.addActionEventListener(tdAction, preVis);

    // });
    console.groupEnd();
    // for(const aInx of actionSelection) {
    // }

  }

  addActionEventListener(actionElem: HTMLElement, newVisualization: VisualizationBase) {
    // click
    actionElem.addEventListener('click', (event) => {
      console.log('new Visualization and ActionElem: ', {actionElem, newVisualization});
      
      // remove preview
      actionElem.parentElement.classList.remove('preview');
      // remove other preview actions
      this.removePreviewRows();

      actionElem.innerText = '';
      const actionId = actionElem.dataset.aid;
      const action = newVisualization.getAction(`${actionId}`);
      actionElem.dataset.value = `${action.value}`;
      console.log('new Visualization action: ', action);
      // update history
      // this.addHistoryColumn();
      // add visualization to history
      this.updateVisualizations(newVisualization);

      // update actions
      // this.updateActions();
    });
  }

  removePreviewRows() {
    const previewActions = Array.from(this.$actObTable.querySelectorAll('.action.preview'));
    // console.group('remove preview rows');
    for(const pAct of previewActions) {
      this.removeRow(pAct.id);
    }
    // console.groupEnd();
  }

  updateObjectives() {
    // get current visualization
    const currentState = this._visHistory[this._visHistory.length-1];
    const currVisualization = currentState.visualization;
    
    // existing objectives
    const existingObjective = Array.from(this.$actObTable.querySelectorAll('tr.objective'));
    const existingObjectiveIds = existingObjective.map((elem) => elem.id);
    console.log('Existing objectives: ', existingObjectiveIds);

    const currVisObjectives = currVisualization.getObjectivesState();
    console.log('current Objective: ', currVisObjectives);

    // new preview actions
    // const newObjectives =  currVisObjectives.filter((elem) => existingObjectiveIds.indexOf(elem.id) === -1);
    // console.log('newObjectives: ', newObjectives);
 

    // go through all objecives of visualizatin
    for(const obj of currVisObjectives) {
      // check if row already exists
      const currObjRow = existingObjective.filter((elem) => elem.id === obj.id);

      if(currObjRow.length === 1)  {
        // row exists
        // update all existing objectives
        const currCell = currObjRow[0].querySelector('.current-state') as HTMLElement;
        currCell.dataset.value = `${this.convertObjStateToString(obj.state)}`;;

      } else {
        // row does ont exist
        // add rows for the non existing objecives
        // -> set values for the newly created objective
        const tdObjective = document.createElement('td');
        tdObjective.classList.add('current-state');
        tdObjective.dataset.value = `${this.convertObjStateToString(obj.state)}`;
        this.addObjectiveRow(`${obj.id}`, ['objective'] ,`${obj.label}`, tdObjective);
      }

      
    }
    // TODO handle ojective rows that have no state in current visualization  
    

  }

  convertObjStateToString(objState: ObjectiveState): string {
    if(objState === ObjectiveState.correct) return 'correct';
    if(objState === ObjectiveState.partial) return 'partial';
    if(objState === ObjectiveState.wrong) return 'wrong';
  }

  removeRow(rowId: string) {
    const rowElement: HTMLTableRowElement = this.$actObTable.querySelector(`#${rowId}`);
    // console.log('remove row with Id: ', rowId);
    if(rowElement) {      
      rowElement.remove();
      // console.log('row removed: ', rowId);
    }


  }

  addActionRow(visType: VisType, rowId: string, classes: string[], label: string, currElem: HTMLElement) {
    if(visType === VisType.Bar) {
      // visualization: bar
      this.addRow('actions', 4, rowId, classes, label, currElem);
    } else {
      // visualization: scatter & line
      this.addRow('actions',5, rowId, classes, label, currElem);
    }
  }

  addObjectiveRow(rowId: string, classes: string[], label: string, currElem: HTMLElement) {
    this.addRow('objectives', 4, rowId, classes, label, currElem);
  }

  addRow(type: string, posFromTop: number, rowId: string, classes: string[], label: string, currElem: HTMLElement) {
    const tableHeadCellHist: HTMLTableCellElement = this.$actObTable.querySelector('#act-ob-table-th-history');
    const currColSpan = tableHeadCellHist ? tableHeadCellHist.colSpan : 0;
    console.log('add row: ', {label, currColSpan});

    const bodyAction = this.$actObTable.querySelector(`tbody.table-${type}`);

    // new row that will be added to the table
    const newRow = document.createElement('tr');
    newRow.id = rowId;
    if(classes && classes.length > 0) newRow.classList.add(...classes);

    // add all history states
    for(let i=0; i< currColSpan; i++) {
      const cell = document.createElement('td');
      cell.innerHTML = '';
      newRow.appendChild(cell);
      cell.classList.add(`step-${i+1}`,'history-cell');
    }

    // add label to the row
    const cellLabel = document.createElement('td');
    cellLabel.innerHTML = label;
    newRow.appendChild(cellLabel);
    
    // add currElement into the current column of the new row
    newRow.appendChild(currElem);

    // add new row after first row in table
    const numbChildren = bodyAction.children.length;
    const position = posFromTop-1; // because the first row has index 0 not 1
    // console.log('positions:',{numbChildren, posFromTop, position});
    if(numbChildren > position) {
      bodyAction.children[position].insertAdjacentElement('beforebegin', newRow);
    } else {
      bodyAction.appendChild(newRow);
    }

  }


  addHistoryColumn() {
    console.log('add History Column: ', this._visHistory);
    // find the step number
    const allSteps = this._visHistory.map((elem) => elem.step);
    console.log('allSteps: ', allSteps);
    const numbSteps = allSteps.length+1;
    const currStep = numbSteps > 0 ? allSteps[numbSteps-1] : 1;

    // check if history columns already exist
    const currTableHeadHist = this.$actObTable.querySelector('#act-ob-table-th-history');

    if(!currTableHeadHist) {
      const tableHead =  this.$actObTable.querySelector('thead');
      const tableHeadRow = tableHead.querySelector('tr');
      const tableHeadCellHist = document.createElement('th');
      tableHeadCellHist.id = 'act-ob-table-th-history';
      tableHeadCellHist.scope = 'col';
      tableHeadCellHist.colSpan = 0;
      tableHeadCellHist.innerHTML = 'History';
      tableHeadRow.insertBefore(tableHeadCellHist, tableHeadRow.children[0]);

      // <thead>
      //   <tr>
      //     <th id="act-ob-table-th-history" scope="col" colspan="1">History</th>
    }

    // add column and increase colspan of the history col
    // select all rows in table
    const rows = Array.from(this.$actObTable.querySelectorAll('tr'));
    // go throu all the rows
    for (const row of rows) {
      // use tagName to check if row is in <thead>, https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
      if(row.parentElement.tagName === "THEAD") {
        // row in table head
        const tableHeadCellHist: HTMLTableCellElement = row.querySelector('#act-ob-table-th-history');
        // const currColSpan = tableHeadCellHist.colSpan;
        // tableHeadCellHist.colSpan = currColSpan + 1;
        // console.log('add history column: ', {oldHistStates: currColSpan, newHistStates: currColSpan+1});
        tableHeadCellHist.colSpan = numbSteps;
        // console.log('add history column: ', {oldHistStates: numbSteps-1, newHistStates: numbSteps});

      } else {
        // row in table body
        
        // TODO add the right column values, style, ....
        // get the current state value
        const elemCurrState = row.querySelector('.current-state') as HTMLElement;
        // console.log('add Hist Col: current State: ', elemCurrState);

         // add step variable (history steps) to column
         const cell = document.createElement('td');
         cell.classList.add(`step-${currStep}`,'history-cell');

        if(elemCurrState?.tagName === "SELECT") {
          // vistype and encodings
          const select = elemCurrState as HTMLSelectElement;
          const currStateVal = select.options[select.selectedIndex].text;
          cell.innerHTML = currStateVal.substring(0,2);
          cell.title = currStateVal;
        } else {
          // actions and objectives
          cell.dataset.value = elemCurrState.dataset.value;
        }

        const numbChildren = row.children.length;
        const numbColBeforeHist = 2;
        row.children[numbChildren-numbColBeforeHist].insertAdjacentElement('beforebegin', cell);
      }
    }
  }

  private _ceateHTMLSelectWithOptions(select: {id?: string, name?: string, classes?: string[]}, options: {id?: string, value: string, text: string, classes?: string[]}[]): HTMLSelectElement {
    // create HTML Select
    const $select = document.createElement('select');
    if(select.id) $select.id = select.id;
    if(select.name) $select.name = select.name;
    if(select.classes && select.classes.length > 0) $select.classList.add(...select.classes);

    // add options to select
    for(const op of options) {
      const $opt= document.createElement('option');
      $opt.value = op.value;
      $opt.innerText = op.text;
      if(op.id) $opt.id = op.id;
      if(op.classes && op.classes.length > 0) $opt.classList.add(...op.classes);
      $select.append($opt);
    }
    // const $optS= document.createElement('option');
    // $optS.value = ''+VisType.Scatter;
    // $optS.innerText = 'Scatterplot';
    // const $optL= document.createElement('option');
    // $optL.value = ''+VisType.Line;
    // $optL.innerText = 'Line Chart';
    // const $optB= document.createElement('option');
    // $optB.value = ''+VisType.Bar;
    // $optB.innerText = 'Bar Chart';

    // $select.append($optS, $optL, $optB);

    return $select;
  }

}