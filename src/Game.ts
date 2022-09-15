import ColumnTable from "arquero/dist/types/table/column-table";
import { Barchart } from "./BarChart";
import { getDataCars } from "./dataCars";
import { ActionType } from "./designChoices";
import { ObjectiveState } from "./Objective";
import { Scatterplot } from "./Scatterplot";
import { getColumnTypesFromArqueroTable, getUniqueRandomValuesFrom0toN, getUniqueRandomValuesFromArray } from "./util";
import { IAction, VisType, VisualizationBase } from "./visualizations";
import * as aq from 'arquero';
import { getDataStock } from "./dataStock";
import { Linechart } from "./LineChart";


export class Game {
  
  private _visHistory: { step: number, score: number, visualization: VisualizationBase }[];
  
  $container: HTMLDivElement;

  private _dataColumns: {label: string, type: string}[]
  dataset: ColumnTable;
  private _numbAttempts: number = 10;

  constructor(cntrMain: HTMLDivElement, isFreeMode: boolean, dataset: ColumnTable) {
    this.$container = cntrMain;

    this._visHistory = [];
    this.dataset = dataset;
    this._dataColumns = getColumnTypesFromArqueroTable(dataset);
    console.log('data columns: ', this._dataColumns);

  }
}
