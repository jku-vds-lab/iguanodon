import ColumnTable from "arquero/dist/types/table/column-table"
import { getDataCars, getSampledDataCars } from "./dataCars"
import { IActionVisConfig, actionsScatter, Scatterplot } from "./Scatterplot"
import { niceName } from "./util"
import { VisType, VisualizationBase } from "./visualizations"
import * as aq from 'arquero';
import { aqFullDataset, aqSampledDataset } from "./index"
import { IGameBoardDescription } from "./GameBoard"

export interface IGameDescription {
  gameId: number,
  visualizationType: VisType,
  datasets: {
    fullDataset: ColumnTable,
    sampledDataset: ColumnTable
  }
  encodings: {
    x: string,
    y: string,
    color: string
  }
  usableActions: actionsScatter[],
  startConfig: IActionVisConfig[],
  solutionConfig: IActionVisConfig[]
}

export function getGameBoardDescriptions(): IGameBoardDescription[] {
  const gameboards: IGameBoardDescription[] = [];

  gameboards.push(craeteGameBoardDescription(createGame1Description(),10));
  gameboards.push(craeteGameBoardDescription(createGame2Description(),10));
  gameboards.push(craeteGameBoardDescription(createGame3Description(),10));

  return gameboards;
}

function craeteGameBoardDescription(gameDescr: IGameDescription, attempts: number): IGameBoardDescription {
  let gameBoardDescr: IGameBoardDescription = null;
  
  if(gameDescr.visualizationType === VisType.Scatter) {
    // create visualization
    const startVisualization = new Scatterplot(gameDescr.datasets.fullDataset,gameDescr.datasets.sampledDataset, gameDescr.encodings.x, gameDescr.encodings.y, gameDescr.encodings.color);
  
    // set usable actions
    startVisualization.setUsableActions(gameDescr.usableActions);

    // set startVisualization action states
    startVisualization.setMutlipleActions(gameDescr.startConfig);

    // create solution visualization
    const solutionVisualization = startVisualization.getCopyofVisualization();
    // set solution actions for the solution visualization
    solutionVisualization.setMutlipleActions(gameDescr.solutionConfig);

    gameBoardDescr =  {
      gameId: gameDescr.gameId,
      attempts,
      startVisualization,
      solutionVisualization
    }
  } else {
    gameBoardDescr =  null;
  }

  return gameBoardDescr;
}

function createGame1Description(): IGameDescription {
  const gameId = 1;
  const visualizationType = VisType.Scatter;

  const carsDatasets = getCarsDatasets();
  const encodings = {
    x: 'Horsepower',
    y: 'Miles per gallon',
    color: null
  }

  const usableActions = [
    actionsScatter.DecreaseMarkSize,
    actionsScatter.AddBackgroundColor,
    actionsScatter.LightenGridLines,
    actionsScatter.HorizontalTextForAxis,
    actionsScatter.WriteAbbreviationsOut
  ];

  const startConfig = [
    { id: actionsScatter.DecreaseMarkSize, value: false },
    { id: actionsScatter.AddBackgroundColor, value: false },
    { id: actionsScatter.LightenGridLines, value: true },
    { id: actionsScatter.HorizontalTextForAxis, value: false },
    { id: actionsScatter.WriteAbbreviationsOut, value: false }
  ];
  
  const solutionConfig = [
    { id: actionsScatter.DecreaseMarkSize, value: true },
    { id: actionsScatter.AddBackgroundColor, value: false },
    { id: actionsScatter.LightenGridLines, value: true },
    { id: actionsScatter.HorizontalTextForAxis, value: true },
    { id: actionsScatter.WriteAbbreviationsOut, value: true }
  ];

  return {
    gameId,
    visualizationType,
    datasets: carsDatasets,
    encodings,
    usableActions,
    startConfig,
    solutionConfig
  }
}

function createGame2Description(): IGameDescription {
  const gameId = 2;
  const visualizationType = VisType.Scatter;

  const carsDatasets = getCarsDatasets();
  const encodings = {
    x: 'Horsepower',
    y: 'Miles per gallon',
    color: 'Origin'
  }

  const usableActions = [
    actionsScatter.DecreaseMarkSize,
    actionsScatter.ChangeMarkToRing,
    actionsScatter.AddBackgroundColor,
    actionsScatter.LightenGridLines,
    actionsScatter.HorizontalTextForAxis,
    actionsScatter.AddLegend,
    actionsScatter.ApplyNominalColors,
    actionsScatter.AddLegendBorder,
  ];

  const startConfig = [
    { id: actionsScatter.DecreaseMarkSize, value: true },
    { id: actionsScatter.ChangeMarkToRing, value: true },
    { id: actionsScatter.AddBackgroundColor, value: true },
    { id: actionsScatter.LightenGridLines, value: false },
    { id: actionsScatter.HorizontalTextForAxis, value: true },
    { id: actionsScatter.AddLegend, value: true },
    { id: actionsScatter.ApplyNominalColors, value: false },
    { id: actionsScatter.AddLegendBorder, value: true }
  ];
  
  const solutionConfig = [
    { id: actionsScatter.DecreaseMarkSize, value: false },
    { id: actionsScatter.ChangeMarkToRing, value: true },
    { id: actionsScatter.AddBackgroundColor, value: false },
    { id: actionsScatter.LightenGridLines, value: true },
    { id: actionsScatter.HorizontalTextForAxis, value: true },
    { id: actionsScatter.AddLegend, value: true },
    { id: actionsScatter.ApplyNominalColors, value: true },
    { id: actionsScatter.AddLegendBorder, value: false }
  ];

  return {
    gameId,
    visualizationType,
    datasets: carsDatasets,
    encodings,
    usableActions,
    startConfig,
    solutionConfig
  }
}

function createGame3Description(): IGameDescription {
  const gameId = 3;
  const visualizationType = VisType.Scatter;

  const carsDatasets = getCarsDatasets();
  const encodings = {
    x: 'Horsepower',
    y: 'Miles per gallon',
    color: 'Origin'
  }

  const usableActions = [
    actionsScatter.SampleData,
    actionsScatter.DecreaseMarkSize,
    actionsScatter.DecreaseMarkOpacity,
    actionsScatter.ChangeMarkToRing,
    actionsScatter.AggregateDataPoints,
    actionsScatter.AddBackgroundColor,
    actionsScatter.LightenGridLines,
    actionsScatter.HorizontalTextForAxis,
    actionsScatter.WriteAbbreviationsOut,
    actionsScatter.AddLegend,
    actionsScatter.ApplyNominalColors,
    actionsScatter.AddLegendBorder,
    actionsScatter.AddLegendTitle,
  ];

  const startConfig = [
    { id: actionsScatter.SampleData, value: false },
    { id: actionsScatter.DecreaseMarkSize, value: true },
    { id: actionsScatter.DecreaseMarkOpacity, value: true },
    { id: actionsScatter.ChangeMarkToRing, value: true },
    { id: actionsScatter.AggregateDataPoints, value: false },
    { id: actionsScatter.AddBackgroundColor, value: false },
    { id: actionsScatter.LightenGridLines, value: false },
    { id: actionsScatter.HorizontalTextForAxis, value: false },
    { id: actionsScatter.WriteAbbreviationsOut, value: false },
    { id: actionsScatter.AddLegend, value: false },
    { id: actionsScatter.ApplyNominalColors, value: true },
    { id: actionsScatter.AddLegendBorder, value: true },
    { id: actionsScatter.AddLegendTitle, value: false }
  ];
  
  const solutionConfig = [
    { id: actionsScatter.SampleData, value: false },
    { id: actionsScatter.DecreaseMarkSize, value: false },
    { id: actionsScatter.DecreaseMarkOpacity, value: true },
    { id: actionsScatter.ChangeMarkToRing, value: false },
    { id: actionsScatter.AggregateDataPoints, value: false },
    { id: actionsScatter.AddBackgroundColor, value: false },
    { id: actionsScatter.LightenGridLines, value: true },
    { id: actionsScatter.HorizontalTextForAxis, value: true },
    { id: actionsScatter.WriteAbbreviationsOut, value: true },
    { id: actionsScatter.AddLegend, value: true },
    { id: actionsScatter.ApplyNominalColors, value: true },
    { id: actionsScatter.AddLegendBorder, value: false },
    { id: actionsScatter.AddLegendTitle, value: true }
  ];

  return {
    gameId,
    visualizationType,
    datasets: carsDatasets,
    encodings,
    usableActions,
    startConfig,
    solutionConfig
  }
}

function getCarsDatasets(): {fullDataset: ColumnTable, sampledDataset: ColumnTable} {
//   const fullDataset = getDataCars();
//   const sampledDataset = getSampledDataCars();
  
//   // full datasset 
//   let aqFullDataset = aq.from(fullDataset);
//   let aqSampledDataset = aq.from(sampledDataset);
  
//   // get column names
//   const colNames = aqFullDataset.columnNames();
//   const colNiceNames = colNames.map((elem) => {return {[elem]: niceName(elem)}});
  
//   // rename columns
//   aqFullDataset = aqFullDataset.rename(colNiceNames);
//   aqSampledDataset = aqSampledDataset.rename(colNiceNames);

  return {
    fullDataset: aqFullDataset,
    sampledDataset: aqSampledDataset
  }
}
