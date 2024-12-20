import { WriteFileOptions, existsSync, writeFileSync } from "fs";
import { Logger } from "./logger";

export function initFileWrite(
  outputFile: string,
  initValue: string,
  options: WriteFileOptions
) {
  const name = createFileName(outputFile);

  Logger.debug(name);
  writeFileSync(name, initValue, options);

  Logger.info("init end. file name is " + name);

  return name;
}

function createFileName(fileName: string = "temp.txt") {
  let ret = fileName;
  if (existsSync(ret)) {
    Logger.debug("[createFileName] fileName exist : " + ret);
    const idxOfExtension = ret.lastIndexOf(".");
    const fileName = ret.substring(0, idxOfExtension);
    const extension = ret.substring(idxOfExtension);
    ret = nameFile(fileName, extension);

    Logger.debug("[createFileName] new : " + ret);
    return ret;
  }

  return ret;

  function nameFile(name: string, extension: string, num: number = 2) {
    const newName = name + num + extension;

    if (existsSync(newName)) {
      return nameFile(name, extension, ++num);
    }

    return newName;
  }
}

export function getFileName(filePath: string, pathDelimiter: string = "/") {
  const pathList = filePath.split(pathDelimiter);
  const fileName = pathList[pathList.length - 1];

  return fileName;
}
