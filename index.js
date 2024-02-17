#!/usr/bin/env node

import {existsSync, lstat, readFile} from "node:fs";
import {resolve as pathResolve} from "node:path";
import {inspect, format} from "node:util";

import Validator from "lintspaces";
import {default as types} from "lintspaces/src/constants/types.js";
import {program} from "commander";
import {globby} from "globby";
import picocolors from "picocolors";

const VERBOSE_KEYS = [`-v`, `--verbose`];
const VERBOSE = process.argv.some((element) => VERBOSE_KEYS.includes(element));
const DEFAULT_EDITORCONFIG_NAME = `.editorconfig`;
const JSON_CONFIG_PROPERTY_NAME = `editorconfig-cli`;
const DEFAULT_JSON_FILENAME = `package.json`;
const GLOB_EXCLUDING_BINARIES = `!**.{ico,gif,png,jpg,jpeg,webp,avif,pdf,woff,woff2}`;

const log = {
  fatal(message) {
    console.log(picocolors.red(message));
    process.exit(1);
  },
  info: console.log,
  error: console.warn,
  debug: (message) => {
    if (VERBOSE) {
      console.log(message);
    }
  }
};

const resolve = (filename) => {
  const resolved = pathResolve(filename);
  return existsSync(resolved) ? resolved : null;
};

const checkEditorConfig = function (filename) {
  const filePath = resolve(filename);

  if (!filePath) {
    log.fatal(`Error: Specified .editorconfig "${filename}" doesn\'t exist`);
    return null;
  }

  log.info(`Using \'.editorconfig\' from: "${filePath}"`);

  // BC! .editorconfig lib inside is looking for all possible paths relatively
  // So there is no way to pass absolute path
  // Absolute path will break on WinOS
  return filename;
};

const collect = (value, previous) => previous.concat([value]);

program
  .usage(`[options] \<file ... or 'glob'\>`)
  .option(`-e, --editorconfig <file>`, `pass configuration file.\n!Warning! absolute paths are not supported or will break on Windows OS.`, checkEditorConfig, checkEditorConfig(DEFAULT_EDITORCONFIG_NAME))
  .option(`-i, --ignores <profile-name or regexp...>`, `ignoring profiles. Like ('js-comments'|'java-comments'|'xml-comments'|'html-comments'|...).`, collect, [`js-comments`, `html-comments`])
  .option(`-j, --json <file>`, `load GLOBs from JSON file. If no input passed, then it tries to find array in package.json`, DEFAULT_JSON_FILENAME)
  .option(`-x, --exclude <regexp...>`, `exclude files by patterns.`, collect, [`.*\\.min\\..*`])
  .option(VERBOSE_KEYS.join(`, `), `verbose output`)
  .parse();

const settings = program.opts();

log.debug(`Using settings: ${inspect(settings, {depth: 2})}`);
log.debug(`Passed args: '${program.args}'`);

let exitCode = 0;

process.on(`beforeExit`, () => {
  process.exit(exitCode);
});

const printReport = (report) => {
  for (const [filename, info] of Object.entries(report)) {
    log.error(picocolors.underline(picocolors.red(`\nFile: ${filename}`)));

    for (const [, line] of Object.entries(info)) {
      for (const err of line) {
        const type = err.type;

        const isWarning = type.toLowerCase() === types.WARNING;
        const typeColor = isWarning ? picocolors.red(type) : picocolors.yellow(type);

        if (isWarning) {
          exitCode = 1;
        }

        log.error(format(`Line: %s %s [%s]`, err.line, err.message, typeColor));
      }
    }
  }
};

const validate = (filePath) => {
  log.debug(`Loading ${filePath}...`);

  lstat(filePath, (err, stat) => {
    if (err) {
      throw err;
    }

    if (!(stat.isDirectory())) {
      log.debug(`Validating '${filePath}'...`);
      const validator = new Validator(settings);
      validator.validate(filePath);
      printReport(validator.getInvalidFiles());
    }
  });
};

const excludes = settings.exclude.map((regexp) => new RegExp(regexp));

const onFile = (file) => {
  const myPath = file;

  const matches = excludes.some((exclude) => {
    log.debug(`Testing file '${myPath}' on '${exclude.toString()}'`);

    const excluded = exclude.test(myPath);
    if (excluded) {
      log.info(`File: ${myPath} [${picocolors.green(`excluded`)}]`);
    }

    return excluded;
  });

  if (!matches) {
    validate(myPath);
  }
};

const processInput = function (args) {
  for (const it of args) {
    const resolved = resolve(it);
    if (resolved) {
      validate(resolved);
    } else {
      log.debug(`Calling GLOB: ${it}`);
      let globs = [it, GLOB_EXCLUDING_BINARIES];
      globby(globs, {gitignore: true})
        .then(
            (files) => {
              files.forEach(onFile);
            },
            (err) => {
              throw err;
            }
        );
    }
  }
};

const args = Array.isArray(program.args) ? program.args : [program.args];
if (args.length === 0) {
  const found = resolve(settings.json);
  readFile(found, `utf8`, (err, data) => {
    log.debug(`Reading GLOBs from file: '${found}...`);
    try {
      if (err) {
        throw err;
      }

      const patterns = JSON.parse(data)[JSON_CONFIG_PROPERTY_NAME];
      if (!patterns || patterns.length === 0) {
        log.info(`GLOBs not found. Checking all unexcluded files...`);
        processInput([`**`, `.**`]);
      } else {
        log.info(`Loaded GLOBs from '${found}': ${patterns}`);
        processInput(patterns);
      }
    } catch (e) {
      log.error(picocolors.red(`Failed to read JSON file: ${e}`));
    }
  });
} else {
  processInput(args);
}
