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
}
`);

export const seamless = {
    report: function() {
        let size = document.body.getBoundingClientRect();
        return {width:size.width,height:size.height};
    }
}

bus.subscribe('seamless-request-size', function(event) {
    // a parent document asks for our size
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
        frame.style.width  = Math.ceil(message.size.width)+'px';
        frame.style.height = Math.ceil(message.size.height)+'px';
    }
});

Array.from(document.querySelectorAll('iframe[data-uae-seamless]'))
.forEach(frame => {
    frame.addEventListener('load', e => bus.publish('seamless-request-size', {}, frame))
});
