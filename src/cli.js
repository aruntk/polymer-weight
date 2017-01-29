import program from 'commander';
import path from 'path';
import fs from 'fs';
import { parseFile } from './links';

program
  .version('0.0.1')
  .option('-p, --path', 'path to starting file/folder')
  .parse(process.argv);

let sourcePath = program.source ? path.resolve(program.source): process.cwd();
const store = {};
try {
  const stat = fs.stat(sourcePath);
  const isDir = stat.isDirectory();
  const indexPath = isDir ? path.resolve(sourcePath, './index.html') : sourcePath;
  const store = {};
  parseFile(indexPath, store).then((r)=> {
    console.log(r);
  });
}
catch(e) {
  throw e;
}


