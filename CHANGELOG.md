# Changelog

## 3.0.0
Almost all the packages that `editorconfig-cli` depends on now work starting from node.js version 18.

## 2.0.10
This is the latest version of the package in version two. The second version runs stably on node.js 16. To keep node.js 16 running, `globby` was downgraded to 13.2.2, since `globby: 14` runs on node.js 18+.

## 2.0.9
Corrected an issue where warnings were not properly identified and displayed in yellow instead of the expected red. This was due to a broken import of the "types". Thanks to [Tulio Leao](https://github.com/tupaschoal)

## 2.0.8
- Replaced the hack with `Object.prototype[Symbol.iterator]`
- Update dependencies

## 2.0.7
- Fix typo: `Glogs` -> `Globs`

## 2.0.6
- Update dependencies

## 2.0.5
- Replaced `colors` with `picocolors`

## 2.0.4
- Fixed regular expression for `*.min.*`-files

## 2.0.3
- Restored CLI functionality
- Added ec alias
- Eliminated binary formats

## 2.0.2
- Freshened up the code
  - switched functions to arrow keys
  - abandoned double inversion of the boolean value
  - updated the use of objects
- Removed reports if they are not needed
- Fixed the work of flags
- Revamped the work with options
- Changed from the `glob` package to `globby`.
- Removed default paths for files
- Gave up normalize
- Added `.min.*` files

## 2.0.1
- Updated the dependencies to the latest

## 2.0.0
- Updated dependencies
- Converted to ESM
- Added vulnerability count badge
- Reconfigured linters
- Improved README.md

# 1.0.0
- Added error notifications
- Changed to `const
- Fixed work under Windows
