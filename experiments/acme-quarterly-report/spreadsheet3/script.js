import { bus } from '../bus.js';
import { seamless } from '../seamless.js';
import { channel } from '../channel.js';

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
let readyCallbacks = [];

function init() {
    Promise.all([
        loadScript('https://bossanova.uk/jspreadsheet/v4/jexcel.js'),
        loadScript('https://jsuites.net/v4/jsuites.js'),
        loadStylesheet('https://bossanova.uk/jspreadsheet/v4/jexcel.css'),
        loadStylesheet('https://jsuites.net/v4/jsuites.css')
    ]).then(e => {
        let spreadsheet = document.createElement('div');
        spreadsheet.id="jExcelRoot";
        document.body.appendChild(spreadsheet);
        sheet = jexcel(spreadsheet, loadData());
        seamless.report();
        readyCallbacks.forEach(f => f());
        readyCallbacks = [];
    });
}

init();

function apiReady() {
    if (sheet) {
        return new Promise(resolve => {
            resolve();
        });
    } else {
        return new Promise(resolve => {
            readyCallbacks.push(f => {
                resolve();
            });
        });
    }
}

export const api = {
    getTable: function() {
        console.log(sheet.getHeaders());
        console.log(sheet.getData());
        console.log(sheet.getConfig());
        return [sheet.getConfig().columns.map(c => c.title)].concat(sheet.getData());
    }
};

window.dataChannel = null;
bus.subscribe('/x/uae/channel/connect/', e => {
    dataChannel = channel[e.data.message.name];
    dataChannel.debug = true;
       
    dataChannel.subscribe('/x/spreadsheet/get/table', e => {
        apiReady().then(() => {
            dataChannel.publish('/x/spreadsheet/table', {
                table: api.getTable()
            });
        });
    });

    bus.publish('/x/uae/channel/connect/ready/', {
        name: e.data.message.name
    }, e.source);
});