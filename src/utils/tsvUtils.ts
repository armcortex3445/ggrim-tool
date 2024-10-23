import { readFileSync } from "fs";

export function transformTSVFileToObjectList<T>(
  tsvFile: string,
  validKeys: (keyof T)[]
) {
  const readBuffer = readFileSync(tsvFile, "utf-8");
  const rawData = readBuffer.split("\n");
  const tsvColumns = rawData[0].split("\t") as (keyof T)[];

  const isValid = validKeys.every((key) => tsvColumns.includes(key));
  if (!isValid) {
    throw Error(
      `[transformTSVFileToObjectList] tsv Column is not matched to validKeys. \n` +
        `tsvColumns : ${JSON.stringify(tsvColumns, null, 2)}` +
        `validKeys : ${JSON.stringify(validKeys, null, 2)}`
    );
  }

  const data = rawData.slice(1);
  const objList: T[] = [];
  let row = 1;

  data.forEach((str) => {
    const arr = str.split("\t");
    const obj: T = {} as T;
    validKeys.forEach((key) => {
      const value = arr.at(tsvColumns.indexOf(key));
      if (!value) {
        throw Error(
          `[transformTSVFileToObjectList] key is invalid. value is falsy.\n` +
            `row : ${row} , key : ${key.toString()} , value : ${value}`
        );
      }
      obj[key] = JSON.parse(value) as T[keyof T];
    });

    objList.push(obj);
    row++;
  });

  return objList;
}
