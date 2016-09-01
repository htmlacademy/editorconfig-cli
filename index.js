const editorconfig = require('editorconfig');
const path = require('path');
const filePath = path.join(__dirname, '/index.js');

console.info(`Filepath: ${filePath}`);

   var Validator = require('lintspaces');


editorconfig.parse(filePath).then(function (result) {
               console.log(result);
    var validatorOptions = {
        endOfLine: result['end_of_line'],
        trailingspaces: result['trim_trailing_whitespace'],
        indentation: result['indent_style'] === 'space' ? 'spaces' : 'tabs',
        spaces: result['indent_size']
    };
          console.info(validatorOptions);
    var validator = new Validator(validatorOptions);
    validator.validate(filePath);

    console.log(validator.getInvalidFiles());
});
