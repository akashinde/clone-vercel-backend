import path from 'path'
// import { convertPath2Posix, getAllFiles } from "./utils";
import fs from 'fs';
import { uploadFile } from './aws';

// const result = getAllFiles(path.join(__dirname, `output/1734882573481`));

// const filePath = fs.readFileSync(path.join(__dirname, result[0]));

// console.log(files)

// path.posix;

// (async () => {
//     // console.log(convertPath(result[0]))
//     await uploadFile(result[0], path.join(__dirname, result[0]));
// })()