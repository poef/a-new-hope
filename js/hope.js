import { bus } from './hope.bus.js';
//import { seamless } from './hope.seamless.js';
import { api } from './hope.api.js';

const LOADING    = 1;
const CONNECTING = 2
const READY      = 4;

class HopeDoclet {

	constructor(frame, name) {
		this.frame  = frame;
		this.name   = name;
		this.status = LOADING;
	}

	api(api) {
		let self = this;
		let cache = () => {}; // need a function to trap method calls with Proxy.apply()
		let apiHandler = function(api) {
			return {
				get: function(obj, prop) {
					return new Proxy(cache, apiHandler(api+prop+'/')); //@FIXME: handle missing end '/' in api
				},
				apply: function(obj, thisArg, params) {
					return bus.call(api, params[0], self.frame);
				}
			};
		};
		return new Proxy(cache, apiHandler(api));
	}

	connect() {
		return hope.bus.connect(this.frame);
	}
};


export let hope = document.hope = {
	doclets: {},
	bus: bus,
	api: api
};

/**
 * This function is the mutation observer callback that listens for any nodes added or removed
 * in the current document. It then checks for any child nodes (iframes) (or the node itself) that has a
 * data-hope-name="..." attribute. And if so updates the list of hope doclets. This list is
 * exposed as document.hope.doclets.
 */
var handleChanges = function(changes) {
    for (const change of changes) {
        if (change.type=='childList') {
            [].forEach.call(change.addedNodes, node => {
                if (node.querySelectorAll) {
                    [].slice.call(node.querySelectorAll('iframe'))
                    	.forEach(frame => addDoclet(frame));
                }
            });
            [].forEach.call(change.removedNodes, node => {
            	if (node.querySelectorAll) {
            		[].slice.call(node.querySelectorAll('iframe'))
            			.forEach(frame => removeDoclet(frame));
            	}
            });
        }
    }
};

var addDoclet = function(frame) {
	let name = frame.name;
	if (!name) {
		name = 'hope_'+Object.keys(hope.doclets).length+1;
		frame.name = name;
	}
	let hopeDoclet = new HopeDoclet(frame, name);

	bus.connect(hopeDoclet.frame); // must notify listeners in this document that a new document has entered the dom
//	seamless.connect(hopeDoclet.frame);
	if (typeof hope.doclets[name] !== 'undefined') {
		name += '_' + Object.keys(hope.doclets).length+1; //@TODO: prevent names like foo_1_1_1
		frame.name = name;
	}
	hope.doclets[name] = hopeDoclet;
};

var removeDoclet = function(frame) {
	let hopeDoclet = hope.doclets.filter(doc => doc.frame == frame).pop();
	if (!hopeDoclet) {
		//@TODO: throw error? or ignore silently?
	}
//	seamless.disconnect(hopeDoclet);
	bus.disconnect(hopeDoclet); // @TODO: must trigger errors for listeners that are waiting for a response from this document
	delete hope.doclets[name];
};

// add all existing hope documents
[].forEach.call(document.querySelectorAll('iframe'), frame => {
	addDoclet(frame);
});

bus.init();
//seamless.init(bus);
api.init(bus);

var observer = new MutationObserver(handleChanges);
observer.observe(document, {
	subtree: true,
	childList: true
});
