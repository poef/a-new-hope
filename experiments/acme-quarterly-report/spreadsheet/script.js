import { bus } from '../bus.js';
import { seamless } from '../seamless.js';
import { channel } from '../channel.js';

let rows = 5;
let cols = 5;

for (var i=0; i<=rows; i++) {
    var row = document.querySelector("table").insertRow(-1);
    for (var j=0; j<=cols; j++) {
        var letter = String.fromCharCode("A".charCodeAt(0)+j-1);
        row.insertCell(-1).innerHTML = i&&j ? "<input id='"+ letter+i +"'/>" : i||letter;
    }
}

let hoist = function(s) {
    return s.replaceAll(/([A-Za-z][1-99])/g, 'DATA.$1');
};

var DATA={}, INPUTS=[].slice.call(document.querySelectorAll("input"));
INPUTS.forEach(function(elm) {
    elm.onfocus = function(e) {
        e.target.value = localStorage[e.target.id] || "";
    };
    elm.onblur = function(e) {
        localStorage[e.target.id] = e.target.value;
        computeAll();
    };
    var getter = function() {
        var value = localStorage[elm.id] || "";
        if (value.charAt(0) == "=") {
            return eval(hoist(value.substring(1)));
        } else if (!isNaN(value) && !isNaN(parseFloat(value))) {
            return parseFloat(value);
        } else {
            return value; 
        }
    };
    Object.defineProperty(DATA, elm.id, {get:getter});
    Object.defineProperty(DATA, elm.id.toLowerCase(), {get:getter});
});
(window.computeAll = function() {
    INPUTS.forEach(function(elm) { try { elm.value = DATA[elm.id]; } catch(e) {} });
})();

export const api = {
    getSize: function() {
        return {
            rows: rows,
            cols: cols
        };
    },
    getColumn: function(index) {
        var letter = String.fromCharCode("A".charCodeAt(0)+index-1);
        var result = [];
        for (var i=0;i<=rows;i++) {
            result.push(DATA[letter+i]);
        }
        return result;
    },
    getRow: function(index) {
        var result = [];
        var letter;
        for (var i=0;i<cols;i++) {
            letter = String.fromCharCode("A".charCodeAt(0)+i-1);
            result.push(DATA[letter+index]);
        }
        return result;
    },
    getMatrix: function() {
        let columns = api.getRow(1);
        let rowLabels = api.getColumn(1);
        let result = [];
        let size = api.getSize();
        for (var y=2;y<size.rows;y++) {
            let record = {};
            let row = api.getRow(y);
            for (var x=1;x<=size.cols;x++) {
                record[columns[x]] = row[x]; 
            }
            result.push(record);
        }
        return result;
    }
};

bus.subscribe('/x/spreadsheet/get/size', e => {
    bus.publish('/x/spreadsheet/size', api.getSize(), event.source);
});

bus.subscribe('/x/spreadsheet/get/column', e => {
    bus.publish('/x/spreadsheet/column', api.getColumn(), event.source);
});

bus.subscribe('/x/spreadsheet/get/row', e => {
    bus.publish('/x/spreadsheet/row', api.getRow(), event.source);
});

let dataChannel = null;
bus.subscribe('/x/uae/connect', e => {
    dataChannel = channel[e.data.message.name];

    dataChannel.subscribe('/x/spreadsheet/get/matrix', e => {
        dataChannel.publish('/x/spreadsheet/matrix', {
            matrix: api.getMatrix()
        });
    });
    
    bus.publish('/x/uae/connect-ready', {
        name: e.data.message.name
    }, e.source);
});

console.log(api.getMatrix());