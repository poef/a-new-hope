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

export const seamless = {
    report: function() {
        let size = document.body.getBoundingClientRect();
        return {width:Math.ceil(size.width),height:Math.ceil(size.height)};
    },
    resize: function() {
        let size = seamless.report();
        Array.from(document.querySelectorAll('iframe[data-uae-seamless]'))
        .forEach(frame => {
            frame.addEventListener(
                'load',
                e => bus.publish(
                    'seamless-request-size',
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

let size = seamless.report();
let buffer=10;

bus.subscribe('seamless-request-size', function(event) {
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
    bus.publish(
        'seamless-report-size', 
        {
            size: seamless.report(),
            frame: event.data.target
        }, 
        event.source
    );
});

bus.subscribe('seamless-report-size', function(event) {
    // a child document is returning its size
    let message = event.data.message;
    let frame = document.querySelector('iframe[name="'+message.frame+'"]');
    if (frame) {
        frame.style.width  = Math.ceil(message.size.width+buffer)+'px';
        frame.style.height = Math.ceil(message.size.height+buffer)+'px';
    }
});

seamless.resize();
window.onresize = seamless.resize;