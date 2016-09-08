#! /usr/bin/env node
const Validator = require('lintspaces');
const types = require('lintspaces/lib/constants/types');
const path = require('path');
const fs = require('fs');
const program = require('commander');
const glob = require('glob-fs')({gitignore: true});
const util = require('util');

//Iterate over object props
Object.prototype[Symbol.iterator] = function*() {
  for (let key of Object.keys(this)) {
    yield([key, this[key]])
  }
};

// Colors https://www.npmjs.com/package/colors
require('colors');

const VERBOSE_KEYS = ['-v', '--verbose'];
const VERBOSE = process.argv.find((element) => {
    return VERBOSE_KEYS.indexOf(element) >= 0;
  }) !== undefined;

let log = {
  'fatal': (message) => {
    console.log(message.red);
    process.exit(1);
  },
  'info': console.log,
  'error': console.warn,
  'debug': (message) => {
    if (VERBOSE) {
      console.log(message);
    }
  }
};

const DEFAULT_EDITORCONFIG_NAME = '.editorconfig';

let resolve = function (filename) {
  let resolved = path.resolve(filename);
  return fs.existsSync(resolved) ? resolved : null;
};

let checkEditorConfig = function (filename) {
  let filePath = resolve(filename);

  log.info(`Using \'.editorconfig\' from: "${filePath}"`);

  if (!filePath) {
    log.fatal(`Error: Specified .editorconfig "${filename}" doesn\'t exist`);
  }

  return filePath;
};

program
  .usage('[options] \<file ... or \'glob\'\>')
  .option('-e, --editorconfig <file>',
    'Pass .editorconfig (by default it will look in ./.editorconfig',
    checkEditorConfig)
  .option('-i, --ignores <profile-name or regexp>', 'Ignoring profiles. Like (\'js-comments\'' +
    '|\'java-comments\'|\'xml-comments\'|\'html-comments\'|...). Defaults are \'js-comments\'|\'html-comments\'',
    ['js-comments', 'html-comments'])
  .option(VERBOSE_KEYS.join(', '), 'Verbose output')
  .parse(process.argv);

let settings = {
  editorconfig: program.editorconfig || checkEditorConfig(DEFAULT_EDITORCONFIG_NAME),
  ignores: program.ignores
};

log.debug(`Verbose: ${util.inspect(settings, {depth: 2})}`);
log.debug(`Args: '${program.args}'`);

let printReport = function (report) {
  for (let [filename, info] of report) {
    log.error(util.format('\nFile: %s', filename).red.underline);

    for (let [index, line] of info) {
      for (let err of line) {
        let type = err.type;

        type = type.toLowerCase() === types.WARNING ? type.red : type.green;

        log.error(util.format('Line: %s %s [%s]', err.line, err.message, type));
      }
    }
  }

};

let validate = (path) => {
  fs.lstat(path, (err, stat) => {
    if (!(stat.isDirectory())) {
      log.debug(`Validating '${path}'...`);
      let validator = new Validator(settings);
      validator.validate(path);
      printReport(validator.getInvalidFiles());
    }
  });
};

let onFile = function (file) {
  validate(file.path);
};

if (program.args === '') program.help();

let args = Array.isArray(program.args) ? program.args : [program.args];
args.forEach((it) => {
  var resolved = resolve(it);

  if (resolved) {
    validate(resolved);
  } else {
    glob.readdirStream(it, {}).on('data', onFile);
  }
});
