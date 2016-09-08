editorconfig-cli
================

Simple command line interface (CLI) for [.editorconfig](http://editorconfig.org) based on the node-lintspaces module. 
Uses `.editorconfig` by default from current directory. To change default location use `-e` argument.
Supports [GLOB format](https://github.com/isaacs/node-glob).

## Install
```
$ npm install -g @htmlacademy/check-editorconfig
```


## Help
```
zeckson@mac ~/d/editorconfig-cli (master)> check-editorconfig --help                                                                                14:54:16

  Usage: check-editorconfig [options] <file ... or 'glob'>

  Options:

    -h, --help                              output usage information
    -e, --editorconfig <file>               pass .editorconfig (by default it will look in './.editorconfig')
    -i, --ignores <profile-name or regexp>  ignoring profiles. Like ('js-comments'|'java-comments'|'xml-comments'|'html-comments'|...). Defaults are 'js-comments'|'html-comments'
    -v, --verbose                           verbose output

```

## Example Commands

Check all JavaScript files recursively, using `./.editorconfig` as settings:

```
check-editorconfig **/*.js
```

The same as above but with [GLOB format](https://github.com/isaacs/node-glob):

```
check-editorconfig '**/*.js'
```

## Ignores
lintspaces supports [built-in ignores](https://github.com/schorfES/node-lintspaces#ignores-option).

Using built in ignores can be done like so:

```
check-editorconfig -i 'js-comments' -i 'c-comments'
```

If parameters are omitted, then `js-comments` and `html-comments` are used. 
