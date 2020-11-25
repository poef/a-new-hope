/**
 * List of subscriptions, keyed on the message name.
 */
let subscriptions = {};

/**
 * Reference to the host document, the window opener. This is set through the 
 * /x/uae/bus/init/ message. It is only set if the window.name is empty and it
 * is only set once.
 */
let host = null;

/**
 * Array of resolvers to run when this document is connected to a host document.
 */
let hostedCallbacks = [];

/**
 * Listen for incoming messages, using the postMessage api. If there are subscribers
 * for a message name, call these in order.
 */
window.addEventListener('message', function(event) {
    var name = event.data.name;
    var target = event.data.target ? event.data.target : 'host';
    var source = event.data.source;
    if (name && subscriptions[name]) {
        if (bus.debug) {
            console.log('bus:', '['+target+' <- '+(source?source:'host')+']', name, event.data.message);
        }
        subscriptions[name].forEach(data => {
            if (data.target=='*' || data.target.name==source) {
                data.callback(event);
            }
        });
    } else {
        if (bus.debug) {
            console.log('bus dropped:','['+target+' <- '+(source?source:'host')+']', name, event.data.message);
        }
    }
});

/**
 * both subscribe and publish accept a target name or a target frame
 * this function resolves that to a target name. A special target is
 * 'host', which is guaranteed to send a message to the host document
 * if there is one.
 */
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
    debug: true,
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
        let targetName = 'host';
        if (target && target.name) {
            targetName = target.name;
        }
        let resolvedTarget = getTarget(target);
        if (!resolvedTarget) {
            if (bus.debug) {
                console.log('bus dropped:', '['+(source?source:'host')+' -> '+targetName+']', messageName, message);
            }
            return;
        }
        if (bus.debug) {
            let source = window.name;
            console.log('bus:', '['+(source?source:'host')+' -> '+targetName+']', messageName, message);
        }
        let w;
        if (resolvedTarget.contentWindow) {
            w = resolvedTarget.contentWindow;
        } else {
            w = resolvedTarget;
        }
        w.postMessage({
            name: messageName,
            origin: ''+window.location.href,
            target: resolvedTarget.name,
            source: window.name,
            message: message
        }, "*", transfer);
    },
    hosted: function() {
        //TODO: this will potentially leak memory by keeping hostedCallbacks 
        // in the root document (host) which never get resolved
        // after a certain timeout, assume this document is the root
        // and clean up the callbacks and don't accept new ones
        // silently ignore them? Or trigger the reject?
        if (!host) {
            return new Promise((resolve) => {
                hostedCallbacks.push(function() {
                    resolve();
                });
            });
        } else {
            return new Promise((resolve) => {
                resolve(); // immediately resolve as the bus is already ready
            });
        }
    }
};

/*
 * Listen for incoming bus init messages, so we can setup a connection back
 * to the host for this document. Once setup, trigger the hostedCallbacks
 * setup with bus.hosted() (which returns a Promise).
 */
bus.subscribe('/x/uae/bus/init/', event => {
    // the toplevel window has no name, so it should never set the host
    // reference, since a child iframe could then set the host to itself
    // and once set, don't change the host again
    if (window.name && !host && event.source) {
        host = event.source;
        bus.publish('/x/uae/bus/init/ready/', {}, event.source);
        hostedCallbacks.forEach(f => f());
        hostedCallbacks = [];
    }
});

/*
 * This listens for child frames reporting back, so you know
 * they have a connection to the host.
 */
bus.subscribe('/x/uae/bus/init/ready/', event => {
    if (frames[event.data.source]) {
        console.log('bus: connected '+event.data.source);
        clearInterval(frames[event.data.source]);
        delete frames[event.data.source];
    } else {
        console.error('bus: unknown frame responding: '+event.data.source);
    }
});

/*
 * Try to setup a connection with the child frames. They need a message
 * to have a reference back to this host. The onload event doesn't guarantee
 * that the iframe bus is already listening, it might be busy with other
 * javascript code. So try again after an interval (0.5s) untill a response is
 * received or the timeout is reached (10s).
 */
let frames = {};
Array.from(document.body.querySelectorAll('iframe')).forEach(f => {
    let tryInit = f => {
        bus.publish('/x/uae/bus/init/', {}, f);
    };

    frames[f.name] = setInterval(() => { tryInit(f) }, 500);
    setTimeout(() => {
        if (frames[f.name]) {
            clearInterval(frames[f.name]);
            delete frames[f.name];
            console.error('bus error: frame '+f.name+' is not responding, giving up.');
        }
    }, 10000);
    f.addEventListener('onload', e => { 
        bus.publish('/x/uae/bus/init/', {}, f);
    });
});