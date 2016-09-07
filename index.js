#! /usr/bin/env node
const Validator = require('lintspaces');
const path = require('path');
const fs = require('fs');
const program = require('commander');

// Colors https://www.npmjs.com/package/colors
require('colors');

const VERBOSE_KEYS = ['-v', '--verbose'];
const VERBOSE = process.argv.find((element) => {
    return VERBOSE_KEYS.indexOf(element) >= 0;
  }) !== undefined;

let log = {
  'fatal': (message) => {
    console.log(message.red, filename);
    process.exit(1);
  },
  'info': console.log,
  'debug': (message) => {
    if(VERBOSE) {
      console.log(message);
    }
  }
};

var exists = function (filename) {
  filename = filename || '.editorconfig';
  var filePath = path.resolve(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    log.fatal('Error: Specified .editorconfig "%s" doesn\'t exist');
  }
  log.debug(`Using \'.editorconfig\' from: ${filePath}`);
  return filePath;
};

program
  .usage('[options] \<file ... or \'glob\'\>')
  .option('-e, --editorconfig',
    'Pass .editorconfig (by default it will look in ./.editorconfig',
    exists)
  .option('-i, --ignores', 'Ignoring profiles. Like (\'js-comments\'' +
    '|\'java-comments\'|\'xml-comments\'|\'html-comments\'|...). Defaults are \'js-comments\'|\'html-comments\'',
    ['js-comments', 'html-comments'])
  .option(VERBOSE_KEYS.join(', '), 'Verbose output')
  .parse(process.argv);

log.debug(`Verbose: ${program.verbose}`);
log.debug(`Args: ${program.args}`);


// program.editorconfig = program.editorconfig ||;

const validator = new Validator(program);

const glob = require('glob');

var unparsedArgv = process.argv;
log.debug(unparsedArgv);
const argv = require('minimist')(unparsedArgv.slice(2));
argv._.map(function (filename) {
  return path.join(__dirname, filename);
}).forEach(function (file) {
  log.info(`Validating: ${file}`);
  validator.validate(file);
});

var invalidFiles = validator.getInvalidFiles();
if (invalidFiles.length > 0) {
  log.info(invalidFiles, {depth: null});
}
