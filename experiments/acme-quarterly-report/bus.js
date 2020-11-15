window.addEventListener('message', function(event) {
    var name = event.data.name;
    if (name && subscriptions[name]) {
        subscriptions[name].forEach(c => c(event));
    }
});

let subscriptions = {};
let host = null;

export const bus = {
    subscribe: function(messageName, callback) {
        if (!subscriptions[messageName]) {
            subscriptions[messageName] = [];
        }
        subscriptions[messageName].push(callback);
    },
    unsubscribe: function(messageName, callback) {
        if (!subscriptions[messageName]) { return }
        subscriptions[messagename] = subscriptions[messageName].filter(c => c==callback);
    },
    publish: function(messageName, message, target=null, transfer=[]) {
        if (!target) {
            target = host;
        }
        let w,n;
        if (typeof target == 'string') {
            n = target;
            if (target==='host') {
                target = host;
            } else {
                target = document.querySelector('iframe[name="'+target.replace('"','&quot;')+'"]');
            }
        }
        if (!target) {
            throw new Error('Could not find an iframe with name '+n);
        }

        if (target.contentWindow) {
            w = target.contentWindow;
        } else {
            w = target;
        }
        w.postMessage({
            name: messageName,
            origin: ''+window.location.href,
            target: target.name,
            message: message
        }, "*", transfer);
    }
};

bus.subscribe('uae-init', function(event) {
    host = event.source;
});

Array.from(document.body.querySelectorAll('iframe')).forEach(f => {
    f.addEventListener('onload', e => { 
        bus.publish('uae-init', {}, f);
    });
});