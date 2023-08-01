# editorconfig-cli

[![Vulnerabilities count][vulnerabilities-image]][vulnerabilities-url]

Simple command line interface (CLI) for [.editorconfig](https://editorconfig.org) based on the node-lintspaces module.

Uses `.editorconfig` by default from current directory. To change default location use `-e` argument.
Supports [GLOB format](https://github.com/isaacs/node-glob).

## Install

Globaly:

```shell
npm i -g @htmlacademy/editorconfig-cli
```

Or localy in the project:

```shell
npm i -D @htmlacademy/editorconfig-cli
```

## Help

```shell
$ npx editorconfig-cli --help

  Usage: editorconfig-cli [options] <file ... or 'glob'>

  Options:
  -e, --editorconfig <file>                   pass configuration file.
                                              !Warning! absolute paths are not supported or will break on Windows OS. (default: ".editorconfig")
  -i, --ignores <profile-name or regexp...>   ignoring profiles. Like ('js-comments'|'java-comments'|'xml-comments'|'html-comments'|...). (default: ["js-comments","html-comments"])
  -j, --json <file>                           load GLOBs from JSON file. If no input passed, then it tries to find array in package.json (default: "package.json")
  -x, --exclude <regexp...>                   exclude files by patterns. (default: [`.*\\.min\\..*`])
  -v, --verbose                               verbose output
  -h, --help                                  display help for command
```

## Example Commands

Check all files in the project except those with the `.min.` suffix and listed in `./.gitignore`, using `./.editorconfig` as the settings:

```shell
editorconfig-cli
```

The same as above, but only JavaScript files:

```shell
editorconfig-cli **/*.js
```

The same as above, but with [GLOB format](https://github.com/isaacs/node-glob):

```shell
editorconfig-cli '**/*.js'
```

Load GLOBs from `package.json`:

```shell
editorconfig-cli
```

Format of JSON with GLOBs:

File: `glob.json`

```json
{
  "editorconfig-cli": [
    "./*.html",
    "./*.json",
    "./img/**/*.svg",
    "./js/**/*.js",
    "./less/**/*.less",
    "./sass/**/*.{sass,scss}",
    "./postcss/**/*.{css,pcss}"
  ]
}
```

Pass `glob.json` to CLI:

```shell
editorconfig-cli -j glob.json
```

## Ignores

lintspaces supports [built-in ignores](https://github.com/schorfES/node-lintspaces#ignores-option).

Using built in ignores can be done like so:

```shell
editorconfig-cli -i 'js-comments' -i 'c-comments'
```

If parameters are omitted, then `js-comments` and `html-comments` are used.

[vulnerabilities-url]: https://snyk.io/test/github/htmlacademy/editorconfig-cli
[vulnerabilities-image]: https://snyk.io/test/github/htmlacademy/editorconfig-cli/badge.svg
