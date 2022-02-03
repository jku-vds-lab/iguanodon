import { designChoiceBase } from "./designChoices";


export class Objective {
  id: string;
  childObjectives: Objective[];
  designChoices: designChoiceBase[];


  constructor(id: string) {
    this.id = id;
    this.childObjectives = [];
    this.designChoices = [];
  }

}

// TODO add objective: reduce overplotting
// TODO add objective: nonzero axis distortions
// TODO add objective: make comparison easier
// TODO add objective: avoid adding misinterpretation/confusion
// TODO add objective: avoid distracting embellishments
// TODO add objective: use the right visual encoding
// TODO add objective: avoid taxing memory
// TODO add objective: support domain understanding