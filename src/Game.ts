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
  label: string,
  visualizationType: VisType,
  datasets: {
    fullDataset: ColumnTable,
    sampledDataset: ColumnTable
  },
  // datasets: {
  //   fullDataset: IDataCar[],
  //   sampledDataset: IDataCar[]
  // },
  encodings: {
    x: string,
    y: string,
    color: string
  }
  usableActions: actionsScatter[],
  startConfig: IActionVisConfig[],
  solutionConfig: IActionVisConfig[]
}

export function getGameBoardDescriptions(isSurvey: boolean): IGameBoardDescription[] {
  const gameboards: IGameBoardDescription[] = [];

  gameboards.push(craeteGameBoardDescription(createGame1Description(isSurvey),10));
  gameboards.push(craeteGameBoardDescription(createGame2Description(isSurvey),10));
  gameboards.push(craeteGameBoardDescription(createGame3Description(isSurvey),10));

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
      label: gameDescr.label,
      attempts,
      startVisualization,
      solutionVisualization
    }
  } else {
    gameBoardDescr =  null;
  }

  return gameBoardDescr;
}

function createGame1Description(isSurvey: boolean): IGameDescription {
  const gameId = 1;
  const label = isSurvey ? 'Game 1' : 'Tufte Game';
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
    { id: actionsScatter.AddBackgroundColor, value: true },
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
    label,
    visualizationType,
    datasets: carsDatasets,
    encodings,
    usableActions,
    startConfig,
    solutionConfig
  }
}

function createGame2Description(isSurvey: boolean): IGameDescription {
  const gameId = 2;
  const label = isSurvey? 'Game 2' : 'Few Game';
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
    label,
    visualizationType,
    datasets: carsDatasets,
    encodings,
    usableActions,
    startConfig,
    solutionConfig
  }
}

function createGame3Description(isSurvey: boolean): IGameDescription {
  const gameId = 3;
  const label = isSurvey ? 'Game 3' : 'Mixed Game';
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
    label,
    visualizationType,
    datasets: carsDatasets,
    encodings,
    usableActions,
    startConfig,
    solutionConfig
  }
}

function getCarsDatasets(): {fullDataset: ColumnTable, sampledDataset: ColumnTable} {
  return {
    fullDataset: aqFullDataset,
    sampledDataset: aqSampledDataset
  }
}

// function getCarsDatasets(): {fullDataset: IDataCar[], sampledDataset: IDataCar[]} {
//   return {
//     fullDataset: allCars,
//     sampledDataset: sampledCars
//   }
// }
