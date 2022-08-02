import { VisualizationSpec } from "vega-embed";
import { deepCopy, getColumnTypesFromArqueroTable, uniqueFilter } from "./util";
import { VisType, VisualizationBase } from "./visualizations";

/**
 * Enumeration for the stage in the visualization pipeline, e.g. 'Data Transformation'.
 */
export enum VisPiplineStage {
  dataTransform,
  visualMapping,
  viewTransform
}

/**
 * Enumation for the type of design choice, either an Vega specification ption (start x-axis with 0) or the attribute encoding (x-axis: horsepower).
 */
export enum DesignChoiceType {
  // TODO probably not needed
  option,
  encoding
}


export abstract class designChoiceBase {
  id: string;
  stage: VisPiplineStage;
  type: DesignChoiceType;
  value: boolean | string | number;
  label: string;

  constructor(id: string) {
    this.id = id;
  }

  getCurrentState(): { dcId: string, label:string, type: DesignChoiceType, value: boolean | string | number } {
    return {
      dcId: this.id,
      label: this.label,
      type: this.type,
      value: this.value
    };
  }
  // abstract updateVegaSpec(visualization: VisualizationBase, apply: boolean | string): VisualizationSpec;
  abstract updateVegaSpec(visualization: VisualizationBase): VisualizationSpec;
  // abstract updateVegaSpec(vegaSpec: VisualizationSpec, visType: string, apply: boolean): VisualizationSpec;

}

export abstract class designChoiceOption extends designChoiceBase {
  value: boolean;

  constructor(id: string) {
    super(id);
    this.type = DesignChoiceType.option;
  }

  // getCurrentState(): {dcId: string, type: DesignChoiceType, value: boolean} {
  //   return {
  //     dcId: this.id,
  //     type: this.type,
  //     value: this.value
  //   };
  // }

}

export abstract class designChoiceEncoding extends designChoiceBase {
  value: string;

  constructor(id: string) {
    super(id);
    this.type = DesignChoiceType.encoding;
  }

  // getCurrentState(): {dcId: string, type: DesignChoiceType, value: string} {
  //   return {
  //     dcId: this.id,
  //     type: this.type,
  //     value: this.value
  //   };
  // }

}

// add design choice: sample data -> "transform": [{"sample" : 200}] , https://vega.github.io/vega-lite/docs/sample.html
export class sampleData extends designChoiceOption {

  maxItems: number;

  constructor(maxItems: number) {
    super('sample_data');
    this.value = false;
    this.stage = VisPiplineStage.dataTransform;
    this.label = 'Sample Data (25%)';
    this.maxItems = maxItems;
  }

  // updateVegaSpec(visualization: VisualizationBase, apply: boolean): VisualizationSpec {
  updateVegaSpec(visualization: VisualizationBase): VisualizationSpec {
    const vegaSpec: any = deepCopy(visualization.vegaSpec);
    const type = visualization.type;

    // console.log('VegaSpec: change x scale: ', vegaSpec, this.value);
    // console.log('VegaSpec.encoding: change x scale: ', vegaSpec.encoding);
    // console.log('VegaSpec-all: change x scale: ', vegaSpec.encoding.x.scale.zero);
    // console.log('Type: change x scale: ', type);
    if (type === VisType.Scatter || type === VisType.Line) {
      //if (vegaSpec.encoding && vegaSpec.encoding.x && vegaSpec.encoding.x.scale && vegaSpec.encoding.x.scale.zero) {
      // FIXME add null check for JSON object property  
      // console.log('sample data: ', { before: vegaSpec.transform[0].sample, after: this.value });
      // if (this.value) {
      //   vegaSpec.transform[0].sample = this.value;
      // }
      vegaSpec.transform[0].sample = this.value === true ? Math.round(this.maxItems / 4) : this.maxItems;
      //}
    }

    return vegaSpec as VisualizationSpec;
  }
}

// TODO add design choice: aggregation
// TODO add design choice: convert mpg tp l/100km

// add design choice: x-axis [attribute]
export class xAxisEncoding extends designChoiceEncoding {

  constructor() {
    super('x_axis_encoding');
    this.value = null;
    this.stage = VisPiplineStage.visualMapping;
    this.label = 'x-Axis Encoding';
  }

  // updateVegaSpec(visualization: VisualizationBase, apply: boolean): VisualizationSpec {
  updateVegaSpec(visualization: VisualizationBase): VisualizationSpec {
    const vegaSpec: any = deepCopy(visualization.vegaSpec);
    const type = visualization.type;

    // console.log('VegaSpec: change x scale: ', vegaSpec, this.value);
    // console.log('VegaSpec.encoding: change x scale: ', vegaSpec.encoding);
    // console.log('VegaSpec-all: change x scale: ', vegaSpec.encoding.x.scale.zero);
    // console.log('Type: change x scale: ', type);
    if (type === VisType.Scatter || type === VisType.Line) {
      //if (vegaSpec.encoding && vegaSpec.encoding.x && vegaSpec.encoding.x.scale && vegaSpec.encoding.x.scale.zero) {
      // FIXME add null check for JSON object property  
      // console.log('x-axis encoding: ', { before: vegaSpec.encoding.x.field, after: this.value });
      
      // if (this.value !== null) {
      //   vegaSpec.encoding.x.field = this.value;
      // }

      if(vegaSpec?.encoding?.x?.field) {
        vegaSpec.encoding.x.field = this.value;
      }
      //}
    }

    return vegaSpec as VisualizationSpec;
  }
}


// add design choice: y-axis [attribute]
export class yAxisEncoding extends designChoiceEncoding {

  constructor() {
    super('y_axis_encoding');
    this.value = null;
    this.stage = VisPiplineStage.visualMapping;
    this.label = 'y-Axis Encoding';
  }

  // updateVegaSpec(visualization: VisualizationBase, apply: boolean): VisualizationSpec {
  updateVegaSpec(visualization: VisualizationBase): VisualizationSpec {
    const vegaSpec: any = deepCopy(visualization.vegaSpec);
    const type = visualization.type;

    // console.log('VegaSpec: change x scale: ', vegaSpec, this.value);
    // console.log('VegaSpec.encoding: change x scale: ', vegaSpec.encoding);
    // console.log('VegaSpec-all: change x scale: ', vegaSpec.encoding.x.scale.zero);
    // console.log('Type: change x scale: ', type);
    if (type === VisType.Scatter || type === VisType.Line) {
      //if (vegaSpec.encoding && vegaSpec.encoding.x && vegaSpec.encoding.x.scale && vegaSpec.encoding.x.scale.zero) {
      // FIXME add null check for JSON object property  
      // console.log('y-axis encoding: ', { before: vegaSpec.encoding.y.field, after: this.value });
      
      // if (this.value !== null) {
      //   vegaSpec.encoding.y.field = this.value;
      // }

      if(vegaSpec?.encoding?.y?.field) {
        vegaSpec.encoding.y.field = this.value;
      }
      //}
    }

    return vegaSpec as VisualizationSpec;
  }
}

// add design choice: color [attribute]
export class colorEncoding extends designChoiceEncoding {

  constructor() {
    super('color_encoding');
    this.value = null;
    this.stage = VisPiplineStage.visualMapping;
    this.label = 'Color Encoding';
  }

  // updateVegaSpec(visualization: VisualizationBase, apply: boolean): VisualizationSpec {
  updateVegaSpec(visualization: VisualizationBase): VisualizationSpec {
    const vegaSpec: any = deepCopy(visualization.vegaSpec);
    const type = visualization.type;

    // console.log('VegaSpec: change x scale: ', vegaSpec, this.value);
    // console.log('VegaSpec.encoding: change x scale: ', vegaSpec.encoding);
    // console.log('VegaSpec-all: change x scale: ', vegaSpec.encoding.x.scale.zero);
    // console.log('Type: change x scale: ', type);
    if (type === VisType.Scatter || type === VisType.Line) {
      //if (vegaSpec.encoding && vegaSpec.encoding.x && vegaSpec.encoding.x.scale && vegaSpec.encoding.x.scale.zero) {
      // FIXME add null check for JSON object property  
      // console.log('color encoding: ', { before: vegaSpec.encoding.color.field, after: this.value });
      
      // if (this.value !== null) {
      //   // vegaSpec.encoding.color = { field: '' };
      //   vegaSpec.encoding.color.field = this.value;
      // } else {
      //   // delete vegaSpec.encoding.color;
      //   vegaSpec.encoding.color.field = '';
      // }

      if(vegaSpec?.encoding?.color?.field) {
        vegaSpec.encoding.color.field = this.value;
      }
      //}
    }

    return vegaSpec as VisualizationSpec;
  }
}

// add design choice: sequential/nominal color scale
export class nominalColorScale extends designChoiceOption {

  constructor() {
    super('nominal_color_scale');
    this.value = false;
    this.stage = VisPiplineStage.visualMapping;
    this.label = 'Nominal Color Scale';
  }

  // updateVegaSpec(visualization: VisualizationBase, apply: boolean): VisualizationSpec {
  updateVegaSpec(visualization: VisualizationBase): VisualizationSpec {
    const vegaSpec: any = deepCopy(visualization.vegaSpec);
    const type = visualization.type;

    // type of color encoding when not nominal is used
    let colorTypeNotNominal = 'ordinal';

    // attribute name for color encoding
    const colorEnc = vegaSpec?.encoding?.color?.field;
    if (colorEnc || colorEnc !== '') {
      const types = getColumnTypesFromArqueroTable(visualization.dataset);
      const datasetAttr = types.filter((elem) => elem.label === colorEnc)[0];
      // console.log('Nominal Color Scale: update VegaSpec: ', {colorEnc, datasetAttr});
      if (datasetAttr?.type === 'continuous') {
        // values of the attribute
        const data = visualization.dataset.array(colorEnc);
        const uniqueData = data.filter(uniqueFilter); // get unique values
        if (uniqueData.length > 10) {
          colorTypeNotNominal = 'quantitative';
        }
      }

    }

    // console.log('VegaSpec: change x scale: ', vegaSpec, this.value);
    // console.log('VegaSpec.encoding: change x scale: ', vegaSpec.encoding);
    // console.log('VegaSpec-all: change x scale: ', vegaSpec.encoding.x.scale.zero);
    // console.log('Type: change x scale: ', type);
    if (type === VisType.Scatter || type === VisType.Line) {
      //if (vegaSpec.encoding && vegaSpec.encoding.x && vegaSpec.encoding.x.scale && vegaSpec.encoding.x.scale.zero) {
      // FIXME add null check for JSON object property  
      // console.log('nominal color scale: ', { before: vegaSpec.encoding.color.type, after: this.value === true ? 'nominal' : 'ordinal' });
      // vegaSpec.encoding.color = { type: '' };
      if(vegaSpec?.encoding?.color?.type) {
        vegaSpec.encoding.color.type = this.value === true ? 'nominal' : colorTypeNotNominal;
      }
      //}
    }

    return vegaSpec as VisualizationSpec;
  }

}

// add design choice: lower opacity for mark
export class lowerOpacityMark extends designChoiceOption {

  constructor() {
    super('lower_mark_opacity');
    this.value = false;
    this.stage = VisPiplineStage.visualMapping;
    this.label = 'Lower Opacity for Marks';
  }

  // updateVegaSpec(visualization: VisualizationBase, apply: boolean): VisualizationSpec {
  updateVegaSpec(visualization: VisualizationBase): VisualizationSpec {
    const vegaSpec: any = deepCopy(visualization.vegaSpec);
    const type = visualization.type;

    // console.log('VegaSpec: change x scale: ', vegaSpec, this.value);
    // console.log('VegaSpec.encoding: change x scale: ', vegaSpec.encoding);
    // console.log('VegaSpec-all: change x scale: ', vegaSpec.encoding.x.scale.zero);
    // console.log('Type: change x scale: ', type);
    if (type === VisType.Scatter) {
      //if (vegaSpec.encoding && vegaSpec.encoding.x && vegaSpec.encoding.x.scale && vegaSpec.encoding.x.scale.zero) {
      // FIXME add null check for JSON object property  
      // console.log('lower opacity mark: ', { before: vegaSpec.mark.opacity, after: this.value === true ? 0.7 : 1 });
      vegaSpec.mark.opacity = this.value === true ? 0.4 : 1;
      //}
    }

    return vegaSpec as VisualizationSpec;
  }

}

// TODO add design choice: BP: round bars


// add design choice: SP: decrease mark size
export class decreseMarkSize extends designChoiceOption {

  constructor() {
    super('decrese_mark_size');
    this.value = false;
    this.stage = VisPiplineStage.visualMapping;
    this.label = 'Decreased Mark Size';
  }

  // updateVegaSpec(visualization: VisualizationBase, apply: boolean): VisualizationSpec {
  updateVegaSpec(visualization: VisualizationBase): VisualizationSpec {
    const vegaSpec: any = deepCopy(visualization.vegaSpec);
    const type = visualization.type;

    // console.log('VegaSpec: change x scale: ', vegaSpec, this.value);
    // console.log('VegaSpec.encoding: change x scale: ', vegaSpec.encoding);
    // console.log('VegaSpec-all: change x scale: ', vegaSpec.encoding.x.scale.zero);
    // console.log('Type: change x scale: ', type);
    if (type === VisType.Scatter) {
      //if (vegaSpec.encoding && vegaSpec.encoding.x && vegaSpec.encoding.x.scale && vegaSpec.encoding.x.scale.zero) {
      // FIXME add null check for JSON object property  
      // console.log('decrese mark size: ', { before: vegaSpec.mark.size, after: this.value === true ? 15 : 30 });
      vegaSpec.mark.size = this.value === true ? 15 : 30;
      //}
    }

    return vegaSpec as VisualizationSpec;
  }

}

// add design choice: start with 0 on x-axis
export class startWith0XAxis extends designChoiceOption {

  constructor() {
    super('zeor_x_axis');
    this.value = false;
    this.stage = VisPiplineStage.viewTransform;
    this.label = 'Start x-Axis with 0';
  }

  // updateVegaSpec(visualization: VisualizationBase, apply: boolean): VisualizationSpec {
  updateVegaSpec(visualization: VisualizationBase): VisualizationSpec {
    const vegaSpec: any = deepCopy(visualization.vegaSpec);
    const type = visualization.type;

    // console.log('VegaSpec: change x scale: ', vegaSpec, this.value);
    // console.log('VegaSpec.encoding: change x scale: ', vegaSpec.encoding);
    // console.log('VegaSpec-all: change x scale: ', vegaSpec.encoding.x.scale.zero);
    // console.log('Type: change x scale: ', type);
    if (type === VisType.Scatter) {
      //if (vegaSpec.encoding && vegaSpec.encoding.x && vegaSpec.encoding.x.scale && vegaSpec.encoding.x.scale.zero) {
      // FIXME add null check for JSON object property  
      // console.log('change x scale: ', { before: vegaSpec.encoding.x.scale.zero, after: this.value });
      if(vegaSpec?.encoding?.x?.scale?.zero) {
        vegaSpec.encoding.x.scale.zero = this.value;
      }
      //}
    }

    return vegaSpec as VisualizationSpec;
  }

}
// add design choice: start with 0 on y-axis
export class startWith0YAxis extends designChoiceOption {

  constructor() {
    super('zeor_y_axis');
    this.value = false;
    this.stage = VisPiplineStage.viewTransform;
    this.label = 'Start y-Axis with 0';
  }

  // updateVegaSpec(visualization: VisualizationBase, apply: boolean): VisualizationSpec {
  updateVegaSpec(visualization: VisualizationBase): VisualizationSpec {
    const vegaSpec: any = deepCopy(visualization.vegaSpec);
    const type = visualization.type;

    // console.log('VegaSpec: change y scale: ', vegaSpec);
    // console.log('VegaSpec.encoding: change y scale: ', vegaSpec.encoding);
    // console.log('VegaSpec-all: change y scale: ', vegaSpec.encoding.y.scale.zero);
    // console.log('Type: change y scale: ', type);
    if (type === VisType.Scatter || type === VisType.Line) {
      //if (vegaSpec.encoding && vegaSpec.encoding.y && vegaSpec.encoding.y.scale && vegaSpec.encoding.y.scale.zero) {
      // FIXME add null check for JSON object property  
      // console.log('change y scale: ', { before: vegaSpec.encoding.y.scale.zero, after: this.value });
      if(vegaSpec?.encoding?.y?.scale?.zero) {
        vegaSpec.encoding.y.scale.zero = this.value;
      }
      //}
    }

    return vegaSpec as VisualizationSpec;
  }

}
// add design choice: background color/image
export class addBackgroundColor extends designChoiceOption {

  constructor() {
    super('background_color');
    this.value = false;
    this.stage = VisPiplineStage.viewTransform;
    this.label = 'Add Background Color';
  }

  // updateVegaSpec(visualization: VisualizationBase, apply: boolean): VisualizationSpec {
  updateVegaSpec(visualization: VisualizationBase): VisualizationSpec {
    const vegaSpec: any = deepCopy(visualization.vegaSpec);
    const type = visualization.type;

    // console.log('VegaSpec: change y scale: ', vegaSpec);
    // console.log('VegaSpec.encoding: change y scale: ', vegaSpec.encoding);
    // console.log('VegaSpec-all: change y scale: ', vegaSpec.encoding.y.scale.zero);
    // console.log('Type: change y scale: ', type);
    if (type === VisType.Scatter || type === VisType.Line) {
      //if (vegaSpec.encoding && vegaSpec.encoding.y && vegaSpec.encoding.y.scale && vegaSpec.encoding.y.scale.zero) {
      // FIXME add null check for JSON object property  
      // console.log('add background color: ', { before: vegaSpec.background, after: this.value === true ? '#d4d4d4' : '#FFFFFF' });
      vegaSpec.background = this.value === true ? '#d4d4d4' : '#FFFFFF';
      //}
    }

    return vegaSpec as VisualizationSpec;
  }

}

// add design choice: SP: show legend
export class addLegend extends designChoiceOption {

  constructor() {
    super('legend');
    this.value = false;
    this.stage = VisPiplineStage.viewTransform;
    this.label = 'Add Legend';
  }

  // updateVegaSpec(visualization: VisualizationBase, apply: boolean): VisualizationSpec {
  updateVegaSpec(visualization: VisualizationBase): VisualizationSpec {
    const vegaSpec: any = deepCopy(visualization.vegaSpec);
    const type = visualization.type;

    // TODO force to show a legend even with no color encoding
    // console.log('VegaSpec: change y scale: ', vegaSpec);
    // console.log('VegaSpec.encoding: change y scale: ', vegaSpec.encoding);
    // console.log('VegaSpec-all: change y scale: ', vegaSpec.encoding.y.scale.zero);
    // console.log('Type: change y scale: ', type);
    if (type === VisType.Scatter || type === VisType.Line) {
      //if (vegaSpec.encoding && vegaSpec.encoding.y && vegaSpec.encoding.y.scale && vegaSpec.encoding.y.scale.zero) {
      // FIXME add null check for JSON object property  
      // console.log('add Legend: ', { before: vegaSpec.config.legend.disable, after: !this.value });
      vegaSpec.config.legend.disable = !this.value;
      //}
    }

    return vegaSpec as VisualizationSpec;
  }

}

// TODO add design choice: BP & LP: direct labels vs lagend
// TODO add design choice: Bp: order bars by height