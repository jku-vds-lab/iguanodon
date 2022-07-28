import ColumnTable from "arquero/dist/types/table/column-table";
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

  constructor(cntrMain: HTMLDivElement, isFreeMode: boolean, dataset: ColumnTable) {
    
    // this.$actObTable = this.createTable();
    this.$container = cntrMain;

    this._dataColumns = getColumnTypesFromArqueroTable(dataset)
    console.log('data columns: ', this._dataColumns);
    this.setupInterface();
    // create the encoding actions
    this.updateEncodings();


    this.addEventListeners();

    // test columns for history
    this.addHistoryColumn();
    this.addHistoryColumn();
    this.addHistoryColumn();
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

  createTable(): HTMLTableElement {
    const $table = document.createElement('table');
    $table.innerHTML = `
      <thead>
        <tr>
          <th id="act-ob-table-th-history" scope="col" colspan="1">History</th>
          <th scope="col">Actions & Objectives</th>
          <th scope="col">Current</th>
        </tr>
      </thead>
      <tbody class="table-actions">
        <tr id="act-vis-type">
          <td>h1</td>
          <td>Visualization Type</td>
          <td id="vis-type-cell"></td>
        </tr>
        <tr>
          <td>h1</td>
          <td>Set X-Axis</td>
          <td>...</td>
        </tr>
      </tbody>
      <tbody class="table-objectives">
        <tr>
          <td>h1</td>
          <td>Reduce Overplotting</td>
          <td>OK</td>
        </tr>
      </tbody>`; 


    // add vis type select with its options to table
    const infoSel = {id: 'vis-select'};
    const visTypeOpt = [
      {value: ''+VisType.Scatter, text: 'Scatterplot'},
      {value: ''+VisType.Line, text: 'Line Chart'},
      {value: ''+VisType.Bar, text: 'Bar Chart'}
    ];
    const $select = this._ceateHTMLSelectWithOptions(infoSel, visTypeOpt);
    // TODO set initial visualization type dynamically
    $select.value = ''+VisType.Scatter

    // add select to table cell
    const $cellVisType = $table.querySelector('#vis-type-cell');
    $cellVisType.appendChild($select);


    return $table;
  }

  addEventListeners() {
    // vis selection
    const selectVis: HTMLSelectElement = this.$actObTable.querySelector('#vis-select');
    selectVis.addEventListener('change', (ev) => {
      this.updateEncodings();
    })
  }

  updateEncodings() {
    const selectVis: HTMLSelectElement = this.$actObTable.querySelector('#vis-select');
    const visType = Number(selectVis.value);

    const xSel = {id: 'x-axis-select'};
    const opts = this._dataColumns.map((elem) => { 
      return {value: elem.label.toLowerCase(), text: elem.label}
    });
    const $xSelect = this._ceateHTMLSelectWithOptions(xSel, opts);

    const ySel = {id: 'y-axis-select'};
    const $ySelect = this._ceateHTMLSelectWithOptions(ySel, opts);

    const colorSel = {id: 'color-select'};
    const $colorSelect = this._ceateHTMLSelectWithOptions(colorSel, opts);


    if(visType === VisType.Scatter) {
      console.log('new value: ', selectVis.value);
      this.addRow(2,'Set X-Axis Encoding', $xSelect);
      this.addRow(3,'Set Y-Axis Encoding', $ySelect);
      this.addRow(4,'Set Color Encoding', $colorSelect);

    } else if (visType === VisType.Line) {
      console.log('new value: ', selectVis.value);
      this.addRow(2,'Set X-Axis Encoding', $xSelect);
      this.addRow(3,'Set Y-Axis Encoding', $ySelect);
      this.addRow(4,'Set Color Encoding', $colorSelect);
    } else {
      console.log('new value: ', selectVis.value);
      this.addRow(2,'Set X-Axis Encoding', $xSelect);
      this.addRow(3,'Set Y-Axis Encoding', $ySelect);
    }
  }

  addRow(posFromTop: number, label: string, currElem: HTMLElement) {
    const tableHeadCellHist: HTMLTableCellElement = this.$actObTable.querySelector('#act-ob-table-th-history');
    const currColSpan = tableHeadCellHist.colSpan;
    console.log('add row: ', {label, currColSpan});

    const bodyAction = this.$actObTable.querySelector('tbody.table-actions');

    // new row that will be added to the table
    const newRow = document.createElement('tr');

    // add all history states
    for(let i=0; i< currColSpan; i++) {
      const cell = document.createElement('td');
      cell.innerHTML = '-';
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
    // add column and increase colspan of the history col
    const rows = Array.from(this.$actObTable.querySelectorAll('tr'));
    for (const row of rows) {
      // use tagName to check if row is in <thead>, https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
      if(row.parentElement.tagName === "THEAD") {
        // row in table head
        const tableHeadCellHist: HTMLTableCellElement = row.querySelector('#act-ob-table-th-history');
        const currColSpan = tableHeadCellHist.colSpan;
        tableHeadCellHist.colSpan = currColSpan + 1;
        console.log('add history column: ', {oldHistStates: currColSpan, newHistStates: currColSpan+1});

      } else {
        // row in table body
        // TODO add the right column values, style, ....
        // TODO add step variable (history steps) to column
        const cell = document.createElement('td');
        cell.innerHTML = 'test';
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