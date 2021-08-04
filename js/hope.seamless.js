let size   = {};
let buffer = 16;
let bus    = null;

const addStyle = function(s) {
    const style = document.createElement('style');
    style.textContent = s;
    document.head.appendChild(style);
}

const getSize = function() {
    let rect = document.body.getBoundingClientRect();
    return {width:Math.ceil(rect.width),height:Math.ceil(rect.height)};
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
            max-height: 100vh;
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
            let maxWidth = 'unset';
            let maxHeight = 'unset';
            if (typeof params.maxWidth != 'undefined') {
                maxWidth = params.maxWidth;
            }
            if (typeof params.maxHeight != 'undefined') {
                maxHeight = params.maxHeight;
            }
            addStyle(`
            body {
                max-width: ${maxWidth};
                max-height: ${maxHeight};
            }
            `);
            let size = getSize();
            Object.values(document.hope.doclets)
            .forEach(doclet => {
                doclet.api('/x/hope/seamless/').requestSize({
                    maxWidth: size.width,
                    maxHeight: size.height
                })
                .then(message => {
                    if (message.width) {
                        doclet.frame.style.width = Math.ceil(message.width+buffer)+'px';
                    }
                    if (message.height) {
                        doclet.frame.style.height = Math.ceil(message.height+buffer)+'px';
                    }
                });
            });
            return size; //FIXME: wiat for all child doclets to respond to requestSize, then getSize() again.
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
            let maxSize = getSize();
            if (params.width) {
                source.frame.style.width = params.width+buffer+'px';
            }
            if (params.height) {
                source.frame.style.height = params.height+buffer+'px';
            }
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
        let size = getSize();
        Object.values(document.hope.doclets)
        .forEach(doclet => {
            doclet.api('/x/hope/seamless/').requestSize({
                maxWidth: size.width,
                maxHeight: size.height
            })
            .then(message => {
                if (message.width) {
                    doclet.frame.style.width = Math.ceil(message.width+buffer)+'px';
                }
                if (message.height) {
                    doclet.frame.style.height = Math.ceil(message.height+buffer)+'px';
                }
            });
        });
    }, 250));

    // FIXME: whenever a new doclet is inserted, call requestSize on it
    // This should probably be an event of hope.js e.g. hopeDocletsChanged

}
