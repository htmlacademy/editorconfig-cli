const Validator = require('lintspaces');
const path = require('path');

const validatorOptions = {editorconfig: path.join(__dirname, '.editorconfig')};
const validator = new Validator(validatorOptions);

const glob = require('glob');

const argv = require('minimist')(process.argv.slice(2));
console.dir(argv);
argv._.map(function (filename) {
  return path.join(__dirname, filename);
}).forEach(function (file) {
  console.info(`Validating: ${file}`);
  validator.validate(file);
});
console.dir(validator.getInvalidFiles(), {depth: null});
