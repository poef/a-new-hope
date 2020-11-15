window.addEventListener('message', function(event) {
    var name = event.data.name;
    var target = event.data.target ? event.data.target : 'host';
    var source = event.data.source;
    if (bus.debug) {
        console.log('bus:', '['+(source?source:'host')+' -> '+target+']', name, event.data.message);
    }
    if (name && subscriptions[name]) {
        subscriptions[name].forEach(data => {
            if (data.target=='*' || data.target.name==source) {
                data.callback(event);
            }
        });
    }
});

let subscriptions = {};
let host = null;

function getTarget(target) {
    if (!target) {
        target = host;
    }
    let n;
    if (typeof target == 'string') {
        n = target;
        if (target==='host') {
            target = host;
        } else if (target!='*') {
            target = document.querySelector('iframe[name="'+target.replace('"','&quot;')+'"]');
        }
    }
    if (!target) {
        throw new Error('Could not find an iframe with name '+n);
    }
    return target;
}

export const bus = {
    debug: false,
    subscribe: function(messageName, callback, target='*') {
        if (!subscriptions[messageName]) {
            subscriptions[messageName] = [];
        }
        target = getTarget(target);
        subscriptions[messageName].push({
            callback: callback,
            target: target
        });
    },
    unsubscribe: function(messageName, callback, target='*') {
        if (!subscriptions[messageName]) { return }
        subscriptions[messagename] = subscriptions[messageName].filter(data => data.callback==callback && data.target==target);
    },
    publish: function(messageName, message, target=null, transfer=[]) {
        target = getTarget(target);
        if (bus.debug) {
            let source = window.name;
            console.log('bus:', '['+(source?source:'host')+' -> '+target.name+']', messageName, message);
        }
        let w;
        if (target.contentWindow) {
            w = target.contentWindow;
        } else {
            w = target;
        }
        w.postMessage({
            name: messageName,
            origin: ''+window.location.href,
            target: target.name,
            source: window.name,
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