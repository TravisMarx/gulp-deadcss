/**
 * DeadCSS Task
 * -------------------------------------
 * Travis Marx
 *
 * @description
 * Remove unused css
 * Search css files for class names, map through given source html files, regex match, remove if none found
 @ todo: Error handling, improve search for more correct matching
 */

// Const
const PLUGIN_NAME = 'gulp-deadcss';

// Exports
// -------------------------------------
module.exports = deadcss;

// Modules
// -------------------------------------
const glob = require("glob-all");
const fs = require('fs');
const through = require('through2');


// Regular Expressions
// -------------------------------------
const classBody = /([^}{\/]+[.].*[{](.|\n)[^}]+[}])/g;
const classNames = /([.](.[^\s|>|,|:|\[|\.]+))/gi;
const cssComment = /(\/\* *).*[\w\W\s\n][^\*\/]+(\*\/)/gmi;
const deadLineClean = /^\s*[\r\n]/gm;
// const classBodyRegex = /^([.](.|\n)[^}]+)[}]/gmi;
// const selectorRegex = /([.][^(\d|))](.[^("|'|\s|>|,|:|)]+))/i;
// const findMultipleClasses = /((\s)(.[^("|'|\s)]+))/gi;
// const classReplace = /(class=("|'))/i;
// const classRegex = /(class=("|')(.[^("|')]+)(("|')))/gi;


// DeadCSS Fn
// -------------------------------------
function deadcss(files) {

    var stream = through.obj(function(file, enc, cb) {

    	// Stringify buffer contents
        var contents = file.contents.toString();

        // Transform content
        var result = cssStream(files, contents);
        result = result._readableState.buffer.toString();
        file.contents = Buffer.from(result);

        // Push file to next plugin
        this.push(file);

        // Tell stream we're done
        cb();
    });

    return stream;

}

// DeadCSS Stream Fn
// -------------------------------------
function cssStream(files, css) {
    var matches = css.match(classBody);
    files = glob.sync(files);

    // Map class matches through files to search
    matches.map(function(o) {
        var foundCount = 0;
        var classToSearch = o.match(classNames);

        if (classToSearch) {
            classToSearch.map(function(cssClass) {
                var plainClass = cssClass.slice(1);

                files.map(function(file) {
                    file = fs.readFileSync(file, 'utf8');
                    if (file.indexOf(plainClass) !== -1) {
                        foundCount++;
                    }
                })
            })
        }
        if (foundCount === 0) {
            css = css.replace(o, "");
        }
    })

    // Remove comments and empty lines
    css = css.replace(cssComment, "").replace(deadLineClean, "");

    // Write stream and return
    var stream = through();
    stream.write(css);
    return stream;
}

