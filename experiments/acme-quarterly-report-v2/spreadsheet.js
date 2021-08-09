import { hope } from '/a-new-hope/js/hope.js';

function loadScript(script) {
    return new Promise((resolve, reject) => {
        let scriptEl = document.createElement('script');
        scriptEl.src=script;
        scriptEl.addEventListener('load', () => resolve(scriptEl), false);
        scriptEl.addEventListener('error', () => reject(scriptEl), false);
        document.querySelector('head').appendChild(scriptEl);
    });
}

function loadStylesheet(stylesheet) {
    return new Promise((resolve, reject) => {
        let linkEl = document.createElement('link');
        linkEl.href= stylesheet;
        linkEl.rel = "stylesheet";
        linkEl.addEventListener('load', () => resolve(linkEl), false);
        linkEl.addEventListener('error', () => reject(linkEl), false);
        document.querySelector('head').appendChild(linkEl);
    });
}

/**
 * This loads the content from the document. The content is stored inside
 * a comment, so the browser doesn't try to render it. It contains a JSON
 * string with the column definitions and rows of data. 
 */
function loadData() {
    let nodes = Array.from(document.head.childNodes).concat(Array.from(document.body.childNodes));
    for (var i=0,l=nodes.length;i<l;i++) {
        if (nodes[i].nodeType==Node.COMMENT_NODE) {
            return JSON.parse(nodes[i].textContent);
        }
    }
    return {};
}

let sheet = null;

Promise.all([
    loadScript('https://bossanova.uk/jspreadsheet/v4/jexcel.js'),
    loadStylesheet('https://bossanova.uk/jspreadsheet/v4/jexcel.css'),
    loadScript('https://jsuites.net/v4/jsuites.js'),
    loadStylesheet('https://jsuites.net/v4/jsuites.css')
]).then(() => {
    let spreadsheet = document.createElement('div');
    spreadsheet.id="jSpreadsheetRoot";
    document.body.appendChild(spreadsheet);
    sheet = jspreadsheet(spreadsheet, Object.assign({
        onchange: updateChange
    }, loadData()));
});

export const api = {
    getTable: function() {
        console.log(sheet.getHeaders());
        console.log(sheet.getData());
        console.log(sheet.getConfig());
        return [sheet.getConfig().columns.map(c => c.title)].concat(sheet.getData());
    }
};

/**
 * Hope specific code. Register a spreadsheet api to call and send updates/changes 
 * to the host doclet, if available.
 */

let hopeApi = hope.api.register('/x/jspreadsheet/')
hopeApi.getTable = {
    callback: function(params) {
        return api.getTable();
    }
};

let sendUpdates = false;
hope.bus.hosted().then(() => {
    // set up change messages to host
    sendUpdates = true;
});

function updateChange(instance, cell, x, y, value) {
    if (sendUpdates) {
        document.hope.host.api('/x/hope/event/').change({
            x: x,
            y: y,
            value: value
        });
    }
}

