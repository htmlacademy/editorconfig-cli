#!/usr/bin/env node
const Validator = require('lintspaces');
const types = require('lintspaces/lib/constants/types');
const path = require('path');
const fs = require('fs');
const program = require('commander');
const glob = require('glob-fs');
const util = require('util');
// Colors https://www.npmjs.com/package/colors
require('colors');

const VERBOSE_KEYS = ['-v', '--verbose'];
const VERBOSE = process.argv.find((element) => {
    return VERBOSE_KEYS.indexOf(element) >= 0;
  }) !== undefined;
const DEFAULT_EDITORCONFIG_NAME = '.editorconfig';
const JSON_CONFIG_PROPERTY_NAME = 'editorconfig-cli';
const DEFAULT_JSON_FILENAME = 'package.json';


//Iterate over object props
Object.prototype[Symbol.iterator] = function*() {
  for (let key of Object.keys(this)) {
    yield([key, this[key]])
  }
};

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

let collect = (value, memo) => {
  memo.push(value);
  return memo;
};

program
  .usage('[options] \<file ... or \'glob\'\>')
  .option('-e, --editorconfig <file>',
    'pass .editorconfig (by default it will look in \'./.editorconfig\')',
    checkEditorConfig)
  .option('-i, --ignores <profile-name or regexp>', 'ignoring profiles. Like (\'js-comments\'' +
    '|\'java-comments\'|\'xml-comments\'|\'html-comments\'|...). Defaults are \'js-comments\'|\'html-comments\'',
    ['js-comments', 'html-comments'])
  .option('-j, --json <file>', 'load GLOBs from JSON file. If no input passed, then it tries to find array in package.json')
  .option('-x, --exclude <regexp>', 'exclude files by pattern. Default \'normalize.*\'', collect, ['/normalize.*'])
  .option(VERBOSE_KEYS.join(', '), 'verbose output')
  .parse(process.argv);

let settings = {
  editorconfig: program.editorconfig || checkEditorConfig(DEFAULT_EDITORCONFIG_NAME),
  ignores: program.ignores,
  json: program.json || DEFAULT_JSON_FILENAME,
  exclude: program.exclude || []
};

log.debug(`Using settings: ${util.inspect(settings, {depth: 2})}`);
log.debug(`Passed args: '${program.args}'`);

let exitCode = 0;

process.on('beforeExit', () => {
  process.exit(exitCode);
});

let printReport = function (report) {
  for (let [filename, info] of report) {
    log.error(util.format('\nFile: %s', filename).red.underline);

    for (let [index, line] of info) {
      for (let err of line) {
        let type = err.type;

        let warn = type.toLowerCase() === types.WARNING;
        type = warn ? type.red : type.green;

        if (warn) {
          exitCode = 1;
        }

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

let excludes = settings.exclude.map((regexp) => {
  return new RegExp(regexp);
});

let onFile = function (file) {
  let myPath = file.path;

  let matches = excludes.find((exclude) => {
    log.debug(`Testing file '${file.path}' on '${exclude.toString()}'`);

    let excluded = exclude.test(file.path);
    if (excluded) {
      log.info(`File: ${file.path} [${'excluded'.green}]`);
    }

    return excluded;
  });

  if (!matches) {
    validate(myPath);
  }
};

let processInput = function (args) {
  for (let it of args) {
    var resolved = resolve(it);
    if (resolved) {
      validate(resolved);
    } else {
      log.debug(`Calling GLOB: ${it}`);
      let myGlob = glob({gitignore: true});
      myGlob.readdirStream(it).on('data', onFile);
    }
  }
};

let args = Array.isArray(program.args) ? program.args : [program.args];
if (args.length === 0) {
  let found = resolve(settings.json);
  fs.readFile(found, 'utf8', (err, data) => {
    log.debug(`Reading GLOBs from file: '${found}...`);
    try {
      if (err) throw err;
      var globs = JSON.parse(data)[JSON_CONFIG_PROPERTY_NAME];
      if (!globs || globs.length === 0) {
        log.info('Nothing to do =(');
        program.help();
      } else {
        log.info(`Loaded GLOBs from '${found}': ${globs}`);
        processInput(globs);
      }
    } catch (e) {
      log.error(`Failed to read JSON file: ${e}`.red);
    }
  })
} else {
  processInput(args);
}
