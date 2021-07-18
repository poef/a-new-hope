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
    },
    report: function(frame) {
        return bus.hosted().then(() => {
            size = getSize();
            bus.publish('/x/uae/seamless/report-size', {
                size: size,
                frame: frame ? frame : window.name
            });
        });
    },
    resize: function() {
        size = getSize();
        //@TODO: this should use a higher level api
        // e.g.
        /*
            document.hope
            .sendAll('/x/hope/seamless/request-size', { maxSize: (size.with-buffer)})
            .then((frame,message) => {
                if (message.size.width) {
                    frame.style.width  = Math.ceil(message.size.width+buffer)+'px';
                }
                if (message.size.height) {
                    frame.style.height = Math.ceil(message.size.height+buffer)+'px';
                }
            })
        */
        Object.values(document.hope.documents)
        .flat()
        .forEach(frame => {
            bus.publish(
                '/x/uae/seamless/request-size',
                {
                    'max-size': {
                        width: size.width-buffer
                    }
                }, 
                frame
            );
            frame.addEventListener(
                'load',
                e => bus.publish(
                    '/x/uae/seamless/request-size',
                    {
                        'max-size': {
                            width: size.width-buffer
                        }
                    }, 
                    frame
                )
            )
        });
    }
}



function init(hopeBus) {
    bus = hopeBus;
    addStyle(`
    iframe[data-uae-seamless] {
        background-color: transparent;
        border: none;
        overflow: hidden;
        padding: 0;
        margin: 0;
        max-width: 100%;
    }
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

    bus.subscribe('/x/uae/seamless/request-size', function(event) {
        // a parent document asks for our size
        let maxSize = event.data.message['max-size'];
        let maxWidth = maxSize.width ? maxSize.width+'px' : 'unset';
        let maxHeight = maxSize.height ? maxSize.height+'px' : 'unset';
        addStyle(`
    body {
        max-width: ${maxWidth};
        max-height: ${maxHeight};
    }
    `);
        seamless.report(event.data.target);
    });

    bus.subscribe('/x/uae/seamless/report-size', function(event) {
        // a child document is returning its size
        let message = event.data.message;
        let frame = document.querySelector('iframe[name="'+message.frame+'"]');
        if (frame) {
            if (message.size.width) {
                frame.style.width  = Math.ceil(message.size.width+buffer)+'px';
            }
            if (message.size.height) {
                frame.style.height = Math.ceil(message.size.height+buffer)+'px';
            }
        }
        seamless.report();
    });

    seamless.resize();
    window.addEventListener('resize', debounce(seamless.resize, 250));
}
