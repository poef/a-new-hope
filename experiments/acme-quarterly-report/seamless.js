import { bus } from './bus.js';

function addStyle(s) {
    const style = document.createElement('style');
    style.textContent = s;
    document.head.appendChild(style);
}

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

let size = {};
let buffer=16;

function getSize() {
    let rect = document.body.getBoundingClientRect();
    return {width:Math.ceil(rect.width),height:Math.ceil(rect.height)};
}

export const seamless = {
    report: function(frame) {
        size = getSize();
        bus.publish('/x/uae/seamless/report-size', {
            size: size,
            frame: frame ? frame : window.name
        });
        return size;
    },
    resize: function() {
        size = getSize();
        console.log('resize', size);
        Array.from(document.querySelectorAll('iframe[data-uae-seamless]'))
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
        frame.style.width  = Math.ceil(message.size.width+buffer)+'px';
        frame.style.height = Math.ceil(message.size.height+buffer)+'px';
    }
});

const debounce = (func, delay) => {
  let inDebounce
  return function() {
    const context = this
    const args = arguments
    clearTimeout(inDebounce)
    inDebounce = setTimeout(() => func.apply(context, args), delay)
  }
}

seamless.resize();
window.addEventListener('resize', debounce(seamless.resize, 250));