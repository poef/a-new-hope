//todo: proxy maken voor bus calls ala simply.api.proxy


let listeners = {
    host: {
        call: {},
        match: {},
        finish: {}
    }
};

let host = null;

function getTarget(target) {
    if (typeof target == 'string') {
        let n = target;
        if (target==='host') {
            target = host;
        } else if (target!='*') {
            target = document.querySelector('iframe[name="'+target.replace('"','&quot;')+'"]');
            if (!target) {
                throw new Error('Could not find an iframe with name '+n);
            }
        }
    }
    return target;
}

function getRegexpFromRoute(route) {
    return new RegExp('^'+route.replace(/:\w+/g, '([^/]+)').replace(/:\*/, '(.*)'));
}

function parseRoute(path) {
    let matchParams = /:(\w+|\*)/g;
    let matches=[], params=[];
    do {
        matches = matchParams.exec(path);
        if (matches) {
            params.push(matches[1]);
        }
    } while(matches);
    return {
        match:  getRegexpFromRoute(path),
        params: params
    };
}

function matchPath(match, params, path) {
    let matches = match.exec(path);
    let args = false;
    if (matches && matches.length) {
        args = {};
        params.forEach(function(key, i) {
            if (key=='*') {
                key = 'remainder';
            }
            args[key] = matches[i+1];
        });
    }
    return args;
}

function startListening(global) {
    global.addEventListener('message', function(event) {
        var path   = event.data.path;
        var target = event.data.target ? event.data.target : 'host';
        var source = event.data.source;
        if (bus.debug) {
            console.log('bus:', '['+(source?source:'host')+' -> '+target+']', name, event.data.message);
        }
        if (listeners[target]) {
            ['match','call','finish'].forEach(action => {
                if (listeners[target][action]) {
                    let defintions = listeners[target][action];
                    for (var i=0,l=definitions.length;i<l;i++) {
                        let args = matchPath(definitions[i].match, definitions[i].params, path);
                        if (args) {
                            event.data.args = args;
                            if (definitions.callback(event) === false) {
                                break;
                            }
                        }
                    }
                }
            });
        }
    });
}

const bus = {
    /**
     * Listen for incoming messages
     * @param definition describes the messages you want to listen to
     * definition format is 
     * {
     *    path: '/message/path',
     *    action: 'call', //default 
     *    target: 'host', //default
     *    callback: (e) => { ... }
     * }
     */
    listen: function(definition, callback) {        
        if (!definition.path) {
            throw new Error('No message path specified');
        }
        if (!definition.action) {
            definition.action = 'call';
        }
        if (['match','call','finish'].indexOf(definition.action)==-1) {
            throw new Error('Unknown action '+definition.action);
        }
        if (!definition.target) {
            definition.target = host;
        }
        if (target = getTarget(definition.target)) {
            if (!listeners[target]) {
                listeners[target] = {
                    call: {},
                    match: {},
                    finish: {}
                };
            }
            Object.assign(definition, parseRoute(definition.path));
            listeners[target][definition.action].push(definition);
        }
    },
    removeListener: function(definition, callback) {
        //FIMXE: tbd
    },
    send: function(definition, transfer=[]) {
        //path, data, target="host"
        if (!definition.path) {
            throw new Error('No message path specified');
        }
        if (!definition.target) {
            definition.target = host;
        }
        if (target = getTarget(definition.target)) {
            if (uae.bus.debug) {
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
                path: definition.path,
                origin: ''+window.location.href,
                target: target.name,
                source: window.name,
                message: message
            }, "*", transfer);
        }
    },
    initialize: function(global=this) {
        startListening(global);
        uae.bus.listen('/x/uae/init/', function(event) {
            host = event.source;
        });
        Array.from(document.body.querySelectorAll('iframe')).forEach(f => {
            uae.bus.send('/x/uae/init/', {}, f); // in case frame is already loaded
            f.addEventListener('onload', e => {
                uae.bus.send('/x/uae/init/', {}, f); // means potentially this message is sent/handled twice
            });
        });
    }
}

export default bus;