let size   = {};
let buffer = 16;
let bus    = null;

const addStyle = function(s) {
    const style = document.createElement('style');
    style.textContent = s;
    document.head.appendChild(style);
}

const getSize = function(params) {
    return {
        width: document.body.offsetWidth,
        height: document.body.offsetHeight
    };
}

const setSize = function(frame, size) {
    let buffer  = 0;
    let maxSize = getMaxSize(frame.parentElement);
    if (size.height) {
        if (maxSize.height) {
            var height = Math.min(maxSize.height, size.height+buffer);
        } else {
            var height = size.height+buffer;
        }
        frame.style.height = height+buffer+'px';
    }
}

const updateDocletSize = function(doclet) {
    let size = getMaxSize(doclet.frame);
    let params = {};
    if (size.height) {
        params.maxheight = size.height;
    }
    return doclet.api('/x/hope/seamless/')
    .requestSize(params)
    .then(message => {
        setSize(doclet.frame, message)
    });
}

/**
 * Calculate the maximum width and height an element may occupy
 * before hitting a fixed width/height or max-width/max-height
 */
const getMaxSize = function(frame) {
    let s = getComputedStyle(frame.parentElement);
    let maxWidth = parseInt(s.inlineSize);
    let maxHeight = null;
    if ((s.maxBlockSize && s.maxBlockSize!='none') || s.overflow=='hidden' || s.overflowBlock == 'hidden') {
        maxHeight = s.blockSize;
    }
    // check box-sizing and border/padding of parent
    if (s.boxSizing=='content-box') {
        // subtract border and padding of parent
        maxWidth -= ( parseInt(s.borderInlineStartWidth) + parseInt(s.borderInlineEndWidth) 
            + parseInt(s.paddingInlineStart) + parseInt(s.paddingInlineEnd) 
        );
        if (maxHeight) {
            maxHeight -= ( parseInt(s.borderBlockStartWidth) + parseInt(s.borderBlockEndWidth) 
                + parseInt(s.paddingBlockStart) + parseInt(s.paddingBlockEnd)
            );
        }
    }
    // check margin and border of iframe
    let fs = getComputedStyle(frame);
    if (fs.boxSizing=='content-box') {
        maxWidth -= ( parseInt(fs.borderInlineStartWidth) + parseInt(fs.borderInlineEndWidth) );
        if (maxHeight) {
            maxHeight -= ( parseInt(fs.borderBlockStartWidth) + parseInt(fs.borderBlockEndWidth) );
        }
    }
    let size = {
        width: maxWidth
    };
    if (maxHeight) {
        size.height = maxHeight;
    }
    return size;
}

const debounce = (func, delay) => {
  let inDebounce
  return function() {
    const context = this
    const args = arguments
    clearTimeout(inDebounce)
    inDebounce = setTimeout(() => func.apply(context, args), delay)
  }
}

export const seamless = {
    init: function(bus) {
        init(bus);
    }
}

function init(hopeBus) {
    bus = hopeBus;
    bus.hosted().then(() => {
        addStyle(`
        html {
            margin: 0;
        }
        body {
            margin: 0;
            width: max-content;
            height: max-content;
            max-width: 100vw;
            overflow: hidden;
        }
        `);       
    });
    addStyle(`
        iframe[name] {
            background-color: transparent;
            border: none;
            overflow: hidden;
            padding: 0;
            margin: 0;
            max-width: 100%;
            width: 100%;
        }
    `);

    let seamlessApi = document.hope.api.register('/x/hope/seamless/');
    seamlessApi.requestSize = {
        description: 'Returns a size object with the preferred height and optionally width of this doclet',
        params: {
            'maxWidth': {
                type: 'int'
            },
            'maxHeight': {
                type: 'int'
            }
        },
        return: {
            description: 'An object with the preferred width and height',
            type: 'object'
        },
        callback: function(params) {
            let maxHeight = 'unset';
            if (typeof params.maxHeight != 'undefined') {
                maxHeight = params.maxHeight;
            }
            let promises = [];
            Object.values(document.hope.doclets)
            .forEach(doclet => {
                promises.push(updateDocletSize(doclet));
            });
            return Promise.all(promises).then(() => {
                return getSize();
            });
        }
    }

    seamlessApi.reportSize = {
        description: 'Pushes a new height and optionally width to the host doclet',
        params: {
            'width': {
                type: 'int'
            },
            'height': {
                type: 'int'
            }
        },
        callback: function(params, source) {
            if (!source) {
                return;
            }
            source = document.hope.doclets[source];
            setSize(source.frame, params)
        }
    }

    seamlessApi.addStyle = {
        description: 'Update CSS to add the style string given',
        params: {
            style: {
                type: 'string',
                description: 'The CSS to add to the child doclet'
            }
        },
        callback: function(params) {
            if (params.style) {
                addStyle(params.style);
            }
        }
    }

    // if this document is hosted inside another document
    // then let the host know our size as soon as possible
    // and update the size if for any reason the window is resized
    document.hope.bus.hosted()
    .then(() => {
        let seamlessHostApi = document.hope.host.api('/x/hope/seamless/');
        let size = getSize();
        let reportSize = function() {
            let newSize = getSize();
            if (size.width!=newSize.width || size.height!=newSize.height) {
                seamlessHostApi.reportSize(newSize);
                size = newSize;
            }
        };
        window.setInterval(reportSize, 100);
        window.addEventListener('resize', debounce(reportSize, 250));
    });

    // Whenever our window size changes, request a new size for
    // all child doclets
    window.addEventListener('resize', debounce(function() {
        Object.values(document.hope.doclets)
        .forEach(doclet => {
            updateDocletSize(doclet);
        });
    }, 250));

    // whenever a new doclet is inserted, call requestSize on it
    document.body.addEventListener('hopeDocletsChanged', e => {
        if (e.added.length) {
            e.added.forEach(d => {
                updateDocletSize(d);
            });
        }
    });
}
