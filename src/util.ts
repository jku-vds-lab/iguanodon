import ColumnTable from "arquero/dist/types/table/column-table";

/**
 * Deep copy function for TypeScript.
 * SOURCE: https://stackoverflow.com/a/51592360/2549748
 * Function licensed under CC-BY-SA 4.0, see https://stackoverflow.com/help/licensing
 * License is available at https://creativecommons.org/licenses/by-sa/4.0/
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export const deepCopy = <T>(target: T): T => {
  if (target === null) {
    return target;
  }
  if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  }
  if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => { cp.push(v); });
    return cp.map((n: any) => deepCopy<any>(n)) as any;
  }
  if (typeof target === 'object') {
    const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
    Object.keys(cp).forEach((k) => {
      cp[k] = deepCopy<any>(cp[k]);
    });
    return cp as T;
  }
  return target;
};

// export const deepCopy = <T>(target: T): T => {
//   return structuredClone(target);
// }


export function niceName(label: string): string {
  const niceLabel =  label
    .split('_')
    .map((l) => l[0].toLowerCase() + l.slice(1))
    .join(' ');


  return niceLabel[0].toUpperCase() + niceLabel.slice(1);
}

export function getAbbreviations(name: string): string {
  let abbrev: string = name;

  if (name === "Name" ) {
    abbrev = "N"
  }else if (name === "Miles per gallon" ) {
    abbrev = "MPG"
  }else if (name === "Cylinders" ) {
    abbrev = "CYL"
  }else if (name === "Displacement" ) {
    abbrev = "DISP"
  }else if (name === "Horsepower" ) {
    abbrev = "HP"
  }else if (name === "Weight in lbs" ) {
    abbrev = "Wt in lbs"
  }else if (name === "Acceleration" ) {
    abbrev = "ACCEL"
  }else if (name === "Year" ) {
    abbrev = "YR"
  }else if (name === "Origin" ) {
    abbrev = "ORIG"
  }


  return abbrev;
}

/**
 * SOURCE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random 
 * Function that returns integer values from 0 to may (inclusive 0, exclusive max)
 * @param max 
 * @returns 
 */
export function getRandomInt(max): number {
  return Math.floor(Math.random() * max);
}


export function getRandomBoolean(): boolean {
  return Math.random() < 0.5 ? false : true;
}

/**
 * 
 * @param maxNumber lenght of array, with vales from 0 to maxNumber-1
 * @param numbElements number of unique elements from the 0 to maxNumber-1 array
 * @returns 
 */
export function getUniqueRandomValuesFrom0toN(maxNumber: number, numbElements: number): number[] {
  const arr = [];
  let res = [];
  for (let i = 0; i < maxNumber; i++) {
    arr.push(i);
  }

  if (maxNumber > numbElements) {
    for (let i = 0; i < numbElements;) {
      const random = getRandomInt(maxNumber);
      if (res.indexOf(arr[random]) === -1) {
        res.push(arr[random])
        i++;
      }
    }
  } else {
    res = arr;
  }

  return res;
}

export function writeToClipboard(text: string) {
  navigator.clipboard.writeText(`${text}`).then(
    () => {
      /* clipboard successfully set */
    },
    () => {
      /* clipboard write failed */
    }
  );
}

/**
 * 
 * @param arr array with values
 * @param numbElements number of unique elements from array
 * @returns 
 */
export function getUniqueRandomValuesFromArray(arr: any[], numbElements: number): any[] {
  let res = [];

  const maxNumber = arr.length;
  if (maxNumber > numbElements) {
    for (let i = 0; i < numbElements;) {
      const random = getRandomInt(maxNumber);
      if (res.indexOf(arr[random]) === -1) {
        res.push(arr[random])
        i++;
      }
    }
  } else {
    res = arr;
  }

  return res;
}


export function isDate(data) {
  return (new Date(data).toString() !== 'Invalid Date');
}
/**
 * Retruns the different parts of the date either as numbers or as labels with a leading 0.
 * - day: 1-31
 * - month: 1-12
 * - year: full year (4 digits)
 * - weekday: 0 for Sunday, 1 for Monday, 2 for Tuesday, and so on
 * - hour: 0-23
 * - minutes: 0-59
 * - seconds: 0-59
 * - milliseconds: 0-999
 * @param date 
 * @returns 
 */
export function getDateParts(date: Date) {
  return {
    numbers: {
      day: date.getDate(),
      month: (date.getMonth() + 1),
      year: date.getFullYear(),
      weekday: date.getDay(),
      hour: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
      milliseconds: date.getMilliseconds()
    },
    labels: {
      day: date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`,
      month: (date.getMonth() + 1) < 10 ? `0${date.getMonth()+1}` : `${date.getMonth()+1}`,
      year: `${date.getFullYear()}`,
      weekday: `${date.getDay()}`,
      hour: date.getHours() < 10 ? `0${date.getHours()}` : `${date.getHours()}`,
      minutes: date.getMinutes() < 10 ? `0${date.getMinutes()}` : `${date.getMinutes()}`,
      seconds: date.getSeconds() < 10 ? `0${date.getSeconds()}` : `${date.getSeconds()}`,
      milliseconds: date.getMilliseconds() < 100 ?  (date.getMilliseconds() < 10 ? `00${date.getMilliseconds()}` : `0${date.getMilliseconds()}` ) : `${date.getMilliseconds()}`
    }
  }
}

export function getType(data, column) {
  for (const d of data) {
    const value = d[column];
    if (value == null) {
      continue;
    }
    if (typeof value === 'number') {
      return 'continuous';
    }
    if (value instanceof Date) {
      return 'date';
    }
    if (isDate(value)) {
      return 'date';
    }
    return 'categorical';
  }
}

export function getColumnTypesFromJSON(data) {
  return Object.keys(data[0] || {}).map((d) => {
    return {
      label: d,
      type: getType(data, d)
    };
  });
}

export function getColumnTypesFromArqueroTable(table: ColumnTable) {
  const data = table.objects();
  return Object.keys(data[0] || {}).map((d) => {
    return {
      label: d,
      type: getType(data, d)
    };
  });
}

export function uniqueFilter(value, index, self) {
  return self.indexOf(value) === index;
}

export function convexHull(points: { x: number, y: number }[]) {
  if (points.length < 3) return points;

  let hull = [];
  let tmp;

  // Find leftmost point
  tmp = points[0];
  for (const p of points) if (p.x < tmp.x) tmp = p;

  hull[0] = tmp;

  let endpoint, secondlast;
  let min_angle, new_end;

  endpoint = hull[0];
  secondlast = { x: endpoint.x, y: endpoint.y + 10 };

  do {
    min_angle = Math.PI; // Initial value. Any angle must be lower that 2PI
    for (const p of points) {
      tmp = polarAngle(secondlast, endpoint, p);

      if (tmp <= min_angle) {
        new_end = p;
        min_angle = tmp;
      }
    }

    if (new_end != hull[0]) {
      hull.push(new_end);
      secondlast = endpoint;
      endpoint = new_end;
    }
  } while (new_end != hull[0]);

  return hull;
}

export function polarAngle(a, b, c) {
  let x = (a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y);
  let y = (a.x - b.x) * (c.y - b.y) - (c.x - b.x) * (a.y - b.y);
  return Math.atan2(y, x);
}

export function caculateAreaPolygone(points: { x: number, y: number }[]) {
  // https://en.wikipedia.org/wiki/Shoelace_formula
  const numbPoints = points.length;
  let doubleArea = 0;

  for (let i = 0; i < numbPoints; i++) {
    const p = points[i];

    let np = points[0];
    if (i < numbPoints - 1) {
      np = points[i + 1];
    }

    const tempArea = p.x * np.y - np.x * p.y;
    doubleArea = doubleArea + tempArea;

  }
  return doubleArea / 2;
}

export function calculatePointsOverlap(points: { idx: number, x: number, y: number, r: number, width: number, height: number }[]): { overlapArea: number, overlapPoints: number } {
  let overlapArea = 0;
  let overlapPoints = 0;
  const overlapPointsArr: number[] = [];

  for (let i = 0; i < points.length; i++) {
    // no calculation for last point
    if (i < points.length - 1) {
      const p = points[i];
      const xMin = p.x - p.width;
      const xMax = p.x + p.width;
      const yMin = p.y - p.height;
      const yMax = p.y + p.height;

      const pointToCompare = points.slice(i + 1)

      const neighbours = pointToCompare.filter((elem) => {
        return elem.x > xMin && elem.x < xMax && elem.y > yMin && elem.y < yMax;
      });

      let currPointOverlapArea = 0;
      for (const np of neighbours) {
        currPointOverlapArea = currPointOverlapArea + calculateOverlapBetween2Points(p, np);
        overlapPointsArr.push(p.idx, np.idx);
      }

      overlapArea = overlapArea + currPointOverlapArea;
    }

  }


  // only get uniqe points
  const uniquePoints = overlapPointsArr.filter((val, ind, arr) => arr.indexOf(val) === ind);
  overlapPoints = uniquePoints.length;
  // console.log('unique overlapPointsArr: ', uniquePoints.length);

  return {
    overlapPoints,
    overlapArea
  };
}

export function calculateOverlapBetween2Points(pA: { x: number, y: number, r: number }, pB: { x: number, y: number, r: number }): number {
  // distance between points -> hypot calculates the sqrt(x² + y²)
  const d = Math.hypot(pB.x - pA.x, pB.y - pA.y);

  if (d < pA.r + pB.r) {

    // because r is for both points the same
    const r = pA.r;

    // calculate area of circle wedge
    const aWedge = r * r * Math.acos(d / (2 * r));

    // calculate area of triangle in circle wedge
    const aTri = d / 4 * Math.sqrt(4 * r * r - d * d);

    // calculate area of circle segment = circle wedge - triangle
    const aSeg = aWedge - aTri;

    // overlapping area is the double of segment, beause of the area from the other circle
    return 2 * aSeg;
  }
  return 0
}

export function createToggleButton(): HTMLDivElement {
  const toggleBtn = document.createElement('div');
  toggleBtn.classList.add('toggle-btn');
  toggleBtn.dataset.value = 'false';

  const toggleBtnSlider = document.createElement('div');
  toggleBtnSlider.classList.add('toggle-btn-slider');
  toggleBtn.append(toggleBtnSlider);

  return toggleBtn;
}

export function getMaxDomainRoundedTens(data: any[], propName: string): number {
  const maxDomain = Math.max(...data.map((elem) => elem[propName]));
  const tenth = maxDomain / 10;
  const roundedTenth = Math.round(tenth);
  let maxDomainTens = roundedTenth * 10
  if(maxDomain === maxDomainTens) {
    maxDomainTens += 10;
  }
  
  return maxDomainTens;
}
