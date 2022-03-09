

export enum ObjectiveState {
  correct,
  partial,
  wrong
}

// export class Objective {
//   id: string;
//   label: string;
//   descitption: string;
//   childObjectives: Objective[];
//   designChoices: designChoiceBase[];
//   isHighLevel: boolean;

//   /**
//    * 
//    * @param id id of the objective
//    * @param isHighLevel flag to indicate if it is a high-level objective or not. Default value: FASLE
//    */
//   constructor(id: string, isHighLevel: boolean = false) {
//     this.id = id;
//     this.isHighLevel = isHighLevel;
//     this.childObjectives = [];
//     this.designChoices = [];
//   }

//   isCorrect(): { id: string, state: ObjectiveState, corrDesignChoices: number, numDesignChoices: number } {
//     const amount = this.designChoices.length;

//     const numbOfTrue = this.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
//     const numbOfFalse = this.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
//     const correct = numbOfTrue === 1
//     const corrDesignChoices = correct ? this.designChoices.length : 0;

//     return {
//       id: this.id,
//       state: correct ? ObjectiveState.correct : ObjectiveState.wrong,
//       corrDesignChoices,
//       numDesignChoices: this.designChoices.length
//     };


//   }

// }


// // ***************************************************
// // ************** LOW - LEVEL OBJECTIVE **************
// // ***************************************************

// // objective: reduce overplotting
// export class ReduceOverPlotting extends Objective {

//   /**
//   * 
//   * @param id id of the objective
//   * @param isHighLevel flag to indicate if it is a high-level objective or not. Default value: FASLE
//   */
//   constructor(id: string, isHighLevel: boolean = false) {
//     super(id, isHighLevel);
//     this.label = 'Reduce Overplotting';

//   }

//   isCorrect(): { id: string, state: ObjectiveState, corrDesignChoices: number, numDesignChoices: number } {
//     const amount = this.designChoices.length;

//     const numbOfTrue = this.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
//     const numbOfFalse = this.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
//     const correct = numbOfTrue === 1;
//     const corrDesignChoices = correct ? this.designChoices.length : 0;


//     return {
//       id: this.id,
//       state: correct ? ObjectiveState.correct : ObjectiveState.wrong,
//       corrDesignChoices,
//       numDesignChoices: this.designChoices.length
//     };
//   }
// }


// // objective: nonzero axis distortions
// export class AvoidNonZeroAxis extends Objective {
//   /**
//   * 
//   * @param id id of the objective
//   * @param isHighLevel flag to indicate if it is a high-level objective or not. Default value: FASLE
//   */
//   constructor(id: string, isHighLevel: boolean = false) {
//     super(id, isHighLevel);
//     this.label = 'Avoid Non-Zero Axis Distortions';
//   }

//   isCorrect(): { id: string, state: ObjectiveState, corrDesignChoices: number, numDesignChoices: number } {
//     const amount = this.designChoices.length;

//     const numbOfTrue = this.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
//     const numbOfFalse = this.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
//     const correct = numbOfTrue >= 1;
//     const corrDesignChoices = numbOfTrue;

//     return {
//       id: this.id,
//       state: numbOfTrue === amount ? ObjectiveState.correct : (numbOfTrue >= 1 ? ObjectiveState.partial : ObjectiveState.wrong),
//       corrDesignChoices,
//       numDesignChoices: this.designChoices.length
//     };
//   }
// }

// // objective: show legend
// export class ShowLegend extends Objective {

//   vegaSpec: VisualizationSpec;

//   /**
//   * 
//   * @param id id of the objective
//   * @param isHighLevel flag to indicate if it is a high-level objective or not. Default value: FASLE
//   */
//   constructor(id: string, vegaSpec: VisualizationSpec, isHighLevel: boolean = false) {
//     super(id, isHighLevel);
//     this.label = 'Show Legend'
//     this.vegaSpec = vegaSpec;
//   }

//   isCorrect(): { id: string, state: ObjectiveState, corrDesignChoices: number, numDesignChoices: number } {
//     const amount = this.designChoices.length;

//     const numbOfTrue = this.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
//     const numbOfFalse = this.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
//     const colorEncoding = (this.vegaSpec as any).encoding.color.field;

//     let corr = false;
//     if (colorEncoding === '') {
//       corr = numbOfFalse === 1 ? true : false;
//     } else {
//       corr = numbOfTrue === 1 ? true : false;
//     }


//     return {
//       id: this.id,
//       state: corr ? ObjectiveState.correct : ObjectiveState.wrong,
//       corrDesignChoices: corr ? this.designChoices.length : 0,
//       numDesignChoices: this.designChoices.length
//     };
//   }

// }

// // objective: use the right visual encoding
// export class RightColorEncding extends Objective {

//   vegaSpec: VisualizationSpec;

//   /**
//   * 
//   * @param id id of the objective
//   * @param isHighLevel flag to indicate if it is a high-level objective or not. Default value: FASLE
//   */
//   constructor(id: string, vegaSpec: VisualizationSpec, isHighLevel: boolean = false) {
//     super(id, isHighLevel);
//     this.label = 'Use Right Visual Color Encoding';
//     this.vegaSpec = vegaSpec;
//   }

//   isCorrect(): { id: string, state: ObjectiveState, corrDesignChoices: number, numDesignChoices: number } {
//     const amount = this.designChoices.length;

//     const numbOfTrue = this.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
//     const numbOfFalse = this.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
//     const colorEncoding = (this.vegaSpec as any).encoding.color.field;


//     let corr = false;
//     if (colorEncoding === '') {
//       // if no color encoding -> value does not matter
//       corr = true;
//     } else {
//       // if color encoding -> value has to be true
//       corr = numbOfTrue === 1 ? true : false;
//     }

//     return {
//       id: this.id,
//       state: corr ? ObjectiveState.correct : ObjectiveState.wrong,
//       corrDesignChoices: corr ? this.designChoices.length : 0,
//       numDesignChoices: this.designChoices.length
//     };
//   }
// }

// // add objective: avoid distracting embellishments 
// export class AvoidEmbellishments extends Objective {
//   /**
//   * 
//   * @param id id of the objective
//   * @param isHighLevel flag to indicate if it is a high-level objective or not. Default value: FASLE
//   */
//   constructor(id: string, isHighLevel: boolean = false) {
//     super(id, isHighLevel);
//     this.label = 'Avoid Distracting Embellishments';
//   }

//   isCorrect(): { id: string, state: ObjectiveState, corrDesignChoices: number, numDesignChoices: number } {
//     const amount = this.designChoices.length;

//     const numbOfTrue = this.designChoices.map((elem) => elem.value).filter((elem) => elem === true).length;
//     const numbOfFalse = this.designChoices.map((elem) => elem.value).filter((elem) => { return ((elem === false) || (elem === null)); }).length;
//     const correct = numbOfFalse === this.designChoices.length;
//     const corrDesignChoices = correct ? this.designChoices.length : 0;

//     return {
//       id: this.id,
//       state: correct ? ObjectiveState.correct : ObjectiveState.wrong,
//       corrDesignChoices,
//       numDesignChoices: this.designChoices.length
//     };
//   }
// }

// // TODO add objective: support domain understanding
// // TODO add objective: make comparison easier




// // ***************************************************
// // ************** LOW - LEVEL OBJECTIVE **************
// // ***************************************************
// // objective: avoid adding misinterpretation/confusion
// export class AvoidMisinterpretation extends Objective {
//   /**
//   * 
//   * @param id id of the objective
//   * @param isHighLevel flag to indicate if it is a high-level objective or not. Default value: FASLE
//   */
//   constructor(id: string, isHighLevel: boolean = false) {
//     super(id, isHighLevel);
//     this.label = 'Avoid Misinterpretation';
//   }
// }

// // objective: reduce memory load
// export class ReduceMemoryLoad extends Objective {
//   /**
//   * 
//   * @param id id of the objective
//   * @param isHighLevel flag to indicate if it is a high-level objective or not. Default value: FASLE
//   */
//   constructor(id: string, isHighLevel: boolean = false) {
//     super(id, isHighLevel);
//     this.label = 'Reduce Memory Load';
//   }
// }

