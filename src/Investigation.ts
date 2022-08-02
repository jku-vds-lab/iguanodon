import ColumnTable from "arquero/dist/types/table/column-table";
import { Scatterplot } from "./Scatterplot";
import { getColumnTypesFromArqueroTable } from "./util";
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
    // update the encodings in the table
    this.updateEncodings();
    this.updateVisualizations();


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

  addEventListeners() {
    // vis selection
    const selectVis: HTMLSelectElement = this.$actObTable.querySelector('#vis-select');
    selectVis.addEventListener('change', (ev) => {
      this.addHistoryColumn();
      this.updateEncodings();
      this.updateVisualizations();
    });

    // encoding selection
    const selectEncs: HTMLSelectElement[] = Array.from(this.$actObTable.querySelectorAll('.encoding-selecion'));
    for(const sel of selectEncs) {
      sel.addEventListener('change', (ev) => {
        this.addHistoryColumn();
        this.updateVisualizations();
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
      // table data cell
      const elemTd = document.createElement('td');
      elemTd.appendChild($xSelect);
      this.addRow(2,'x-axis-encoding','Set X-Axis Encoding', elemTd);
    }

    if(!yEncRow) {
      // console.log('yEncRow: ',yEncRow);
      // table data cell
      const elemTd = document.createElement('td');
      elemTd.appendChild($ySelect);
      this.addRow(3,'y-axis-encoding','Set Y-Axis Encoding', elemTd);
    }

    
    if(visType === VisType.Scatter || visType === VisType.Line) {
      // for Scatterplot and Line chart, all encodings are used (x,y,color)
      // add color endoding
      if(!cEncRow) {
        // console.log('cEncRow: ',cEncRow);
        // table data cell
        const elemTd = document.createElement('td');
        elemTd.appendChild($colorSelect);
        this.addRow(4,'color-encoding','Set Color Encoding', elemTd);
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

  async updateVisualizations() {
    console.log('update Visualization');
    const selectVis: HTMLSelectElement = this.$actObTable.querySelector('#vis-select');
    const selectX: HTMLSelectElement = this.$actObTable.querySelector('#x-axis-select');
    const selectY: HTMLSelectElement = this.$actObTable.querySelector('#y-axis-select');
    const selectC: HTMLSelectElement = this.$actObTable.querySelector('#color-select');
 
    // console.log('dataset Investigation: ', this.dataset);
    const scatter = new Scatterplot('test', this.dataset, selectX.value, selectY.value, selectC.value);

    const newStep = this._visHistory.length+1;
    this._visHistory.push({step: newStep, score: 0, visualization: scatter});

    // clear current Vis container
    this.$currVis.textContent = '';

    // create container for new visualization
    const visItem = document.createElement('div');
    visItem.classList.add('vis-item');
    // add vis container to vis strip
    this.$currVis.appendChild(visItem);

    console.log('visHistory: ', this._visHistory);
    await scatter.showVisualization(visItem);
  }

  updateActions() {

  }

  removeRow(rowId: string) {
    const rowElement: HTMLTableRowElement = this.$actObTable.querySelector(`#${rowId}`);

    if(rowElement) {
      rowElement.remove();
    }


  }
  addRow(posFromTop: number, rowId: string, label: string, currElem: HTMLElement) {
    const tableHeadCellHist: HTMLTableCellElement = this.$actObTable.querySelector('#act-ob-table-th-history');
    const currColSpan = tableHeadCellHist ? tableHeadCellHist.colSpan : 0;
    console.log('add row: ', {label, currColSpan});

    const bodyAction = this.$actObTable.querySelector('tbody.table-actions');

    // new row that will be added to the table
    const newRow = document.createElement('tr');
    newRow.id = rowId;

    // add all history states
    for(let i=0; i< currColSpan; i++) {
      const cell = document.createElement('td');
      cell.innerHTML = '';
      newRow.appendChild(cell);
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
    const numbSteps = allSteps.length;
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
        const elemCurrState = row.querySelector('.current-state');
        console.log('add Hist Col: current State: ', elemCurrState);
        let currStateVal = '';
        if(elemCurrState?.tagName === "SELECT") {
          // vistype and encodings
          const select = elemCurrState as HTMLSelectElement;
          currStateVal = select.options[select.selectedIndex].text;
        } else {
          // actions and objectives
          currStateVal = ''+currStep;
        }

        // TODO add step variable (history steps) to column
        const cell = document.createElement('td');
        cell.classList.add(`${currStep}`,'history-cell');
        cell.innerHTML = currStateVal;
        cell.title = currStateVal;
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