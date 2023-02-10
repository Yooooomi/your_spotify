const fs = require('fs');
const { dirname } = require('path');

function getClassesOfCSS(path) {
  const rg = /\.([a-zA-Z]+)/g;
  const content = fs.readFileSync(path).toString();
  return [...content.matchAll(rg)].map(res => res[1]);
}

function getUsedClassesOfJs(path) {
  const rg = /\Ws\.([a-zA-Z]+)/g;
  const content = fs.readFileSync(path).toString();
  return [...content.matchAll(rg)].map(res => res[1]);
}

function checkBoth(a, b) {
  return fs.existsSync(a) && fs.existsSync(b);
}

function computeIndex(fullindex) {
  const dir = dirname(fullindex);
  const css = `${dir}/index.module.css`;
  const exist = checkBoth(fullindex, css);
  if (!exist) {
    return [[], []];
  }
  const classesCSS = getClassesOfCSS(css);
  const classesJS = getUsedClassesOfJs(fullindex);
  const notUsedCSS = classesCSS.reduce((acc, curr) => {
    if (!classesJS.includes(curr)) {
      acc.push(curr);
    }
    return acc;
  }, []);
  const notUsedJS = classesJS.reduce((acc, curr) => {
    if (!classesCSS.includes(curr)) {
      acc.push(curr);
    }
    return acc;
  }, []);
  return [notUsedCSS, notUsedJS];
}

async function main(indexes) {
  const notUsed = indexes.map(computeIndex);
  console.log('FILE | IN CSS BUT NOT IN JS | IN JS BUT NOT IN CSS');
  notUsed.forEach((nu, k) => {
    if (nu[0].length + nu[1].length > 0) {
      console.log(indexes[k], nu[0], nu[1]);
    }
  });
}

main(process.argv.slice(2));
