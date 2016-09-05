#! /usr/bin/env node
const Validator = require('lintspaces');
const path = require('path');

const validatorOptions = {editorconfig: path.join(__dirname, '.editorconfig')};
const validator = new Validator(validatorOptions);

const glob = require('glob');

var unparsedArgv = process.argv;
console.dir(unparsedArgv);
const argv = require('minimist')(unparsedArgv.slice(2));
console.dir(argv);
argv._.map(function (filename) {
  return path.join(__dirname, filename);
}).forEach(function (file) {
  console.info(`Validating: ${file}`);
  validator.validate(file);
});
var invalidFiles = validator.getInvalidFiles();
if (invalidFiles.length > 0) {
  console.error();
  console.dir(invalidFiles, {depth: null});
}
