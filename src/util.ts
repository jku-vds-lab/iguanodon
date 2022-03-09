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
  if (typeof target === 'object' && target !== {}) {
    const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
    Object.keys(cp).forEach((k) => {
      cp[k] = deepCopy<any>(cp[k]);
    });
    return cp as T;
  }
  return target;
};

/**
 * SOURCE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random 
 * Function that returns integer values from 0 to may (inclusive 0, exclusive max)
 * @param max 
 * @returns 
 */
export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
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
  return (new Date(data).toString() !== "Invalid Date");
}

export function getType(data, column) {
  for (const d of data) {
    const value = d[column];
    if (value == null) continue;
    if (typeof value === "number") return "continuous";
    if (value instanceof Date) return "date";
    if (isDate(value)) return "date";
    return "categorical";
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