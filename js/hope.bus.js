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

/**
 * Listen for incoming messages, using the postMessage api. If there are subscribers
 * for a message name, call these in order.
 */
function init() {
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

    /*
     * Listen for incoming bus init messages, so we can setup a connection back
     * to the host for this document. Once setup, trigger the hostedCallbacks
     * setup with bus.hosted() (which returns a Promise).
     */
    bus.subscribe('/x/hope/bus/init/', event => {
        // the toplevel window has no name, so it should never set the host
        // reference, since a child iframe could then set the host to itself
        // and once set, don't change the host again
        if (window.name && !host && event.source) {
            host = event.source;
            bus.publish('/x/hope/bus/init/ready/', {}, event.source);
            hostedCallbacks.forEach(f => f());
            hostedCallbacks = [];
        }
    });

}

export const bus = {
    debug: false,
    init: init,
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
        subscriptions[messageName] = subscriptions[messageName].filter(data => data.callback==callback && data.target==target);
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
            target: targetName,
            source: window.name,
            message: message //FIXME: make sure message is clonable, e.g. using JSON
        }, "*", transfer);
    },
    /**
     * Sends a message to the target and returns a Promise that is
     * triggered when a reply to this exact message is received.
     * @FIXME: adding the message id and replyTo in the message itself is a problem
     * - it is too easy to mess up, just add a message header/envelope with meta information like this
     */
    call: function(messageName, message={}, target=null, transfer=[]) {
        //@TODO: datastructure is now not optimized to handle call/reply-once 
        //but this will probably be the main use, so this is a candidate for
        //performance optimization.
        message.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER); //@TODO: maybe use UUID? or 0-pad the number, for ease of scanning in logs
        return new Promise(function(resolve, reject) {
            let timeoutHandler = window.setTimeout(() => {
                bus.unsubscribe(messageName, resolver, target);
                reject(new Error('message reply timeout '+messageName));
            }, 10000); // timeout is 10 seconds. @TODO: turn into an option/parameter?
            let resolver = event => {
                if (event.data.message.replyTo==message.id) {
                    bus.unsubscribe(messageName, resolver, target);
                    window.clearTimeout(timeoutHandler);
                    resolve(event.data.message);
                }
            };
            bus.subscribe(messageName, resolver, target);
            bus.publish(messageName, message, target, transfer);
        });
    },
    /**
     * Send a reply to an incoming message.
     */
    reply: function(sourceMessageId, sourceMessageName, replyMessage, target, transfer=[]) {
        if (!replyMessage) {
            replyMessage = {};
        }
        replyMessage.replyTo = sourceMessageId;
        bus.publish(sourceMessageName, replyMessage, target, transfer);
    },
    hosted: function() {
        // @TODO: this will potentially leak memory by keeping hostedCallbacks 
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
    },
    /*
     * Try to setup a connection with the child frames. They need a message
     * to have a reference back to this host. The onload event doesn't guarantee
     * that the iframe bus is already listening, it might be busy with other
     * javascript code. So try again after an interval (0.5s) untill a response is
     * received or the timeout is reached (10s).
     */
    connect: function(frame) {
        return new Promise((resolve, reject) => {

            let tryInit = frame => {
                bus.publish('/x/hope/bus/init/', {}, frame);
            };

            let initRoutine;

            bus.subscribe('/x/hope/bus/init/ready/', event => {
                clearInterval(initRoutine);
                initRoutine = null;
                resolve(frame);
            }, frame);

            initRoutine = setInterval(() => { tryInit(frame) }, 500);
            
            setTimeout(() => {
                if (initRoutine) {
                    clearInterval(initRoutine);
                    initRoutine = null;
                    reject(new Error('Bus initialization error: could not connect to '+frame.name));
                }
            }, 10000);

            frame.addEventListener('onload', e => tryInit(frame));
        });
    },
    disconnect: function(frame) {
        //@TODO: implement this
    }
};