const fs = require('fs');
const path = require('path');

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

function getEmptyRulesets(path) {
  const rg = /(\..+)\s*{\s*}/g;
  const content = fs.readFileSync(path).toString();
  return [...content.matchAll(rg)].map(res => res[1]);
}

function checkBoth(a, b) {
  return fs.existsSync(a) && fs.existsSync(b);
}

function computeIndex(fullindex) {
  const dir = path.dirname(fullindex);
  if (!dir) {
    return [[], [], []];
  }
  const css = `${dir}/index.module.css`;
  const found = checkBoth(fullindex, css);
  if (!found) {
    return [[], [], []];
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
  const emptyRulsets = getEmptyRulesets(css);
  return [notUsedCSS, notUsedJS, emptyRulsets];
}

async function main(indexes) {
  const notUsed = indexes.map(computeIndex);
  console.log('FILE | IN CSS BUT NOT IN JS | IN JS BUT NOT IN CSS | EMPTY RULESET');
  notUsed.forEach((nu, k) => {
    if (nu[0].length + nu[1].length + nu[2].length > 0) {
      console.log(indexes[k], nu[0], nu[1], nu[2]);
    }
  });
  const nbErrors = notUsed.reduce((acc, curr) => acc + curr.some(e => e.length > 0), 0);
  console.log(`${nbErrors} errors found`);
  process.exit(nbErrors > 0 ? 1 : 0);
}

main(process.argv.slice(2));
