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
    console.log(message.red, filename);
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
  let resolved = path.resolve(__dirname, filename);
  return fs.existsSync(resolved) ? resolved : null;
};

let exists = function (filename) {
  let filePath = resolve(filename || DEFAULT_EDITORCONFIG_NAME);
  log.debug(`Using \'.editorconfig\' from: ${filePath}`);
  if (!filePath) {
    log.fatal('Error: Specified .editorconfig "%s" doesn\'t exist');
  }
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

let settings = {
  editorconfig: program.editorconfig || resolve(DEFAULT_EDITORCONFIG_NAME),
  ignores: program.ignores
};

log.debug(`Verbose: ${util.inspect(settings, {depth: 2})}`);
log.debug(`Args: ${program.args}`);

let processInvalidFiles = function (invalidFiles) {
  log.debug(invalidFiles);
  if (!invalidFiles) return;
  for (let [filename, info] of invalidFiles) {
    log.error(util.format('\nFile: %s', filename).red.underline);

    for (let [index, line] of info) {
      for (let err of line) {
        let errType = err.type;

        if (errType.toLowerCase() === types.WARNING) {
          errType = errType.red;
        } else {
          errType = errType.green;
        }

        log.error(util.format('Line: %s %s [%s]', err.line, err.message, errType));
      }
    }
  }

};

let onFile = function (file) {
  log.debug(`Got file: ${resolve(file)}`);
  fs.lstat(resolve(file), (err, stat) => {
    if (!(stat.isDirectory())) {
      let val = new Validator(settings);
      val.validate(file);
      processInvalidFiles(val.getInvalidFiles());
    }
  });
};
let args = Array.isArray(program.args) ? program.args : [program.args];
args.forEach((it) => {
  log.debug(`Globbing arg: ${it}`);
  if (resolve(it)) {
    onFile(it)
  } else {
    glob.readdirStream(it, {}).on('data', onFile);
  }
});
