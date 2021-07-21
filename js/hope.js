import { bus } from './hope.bus.js';
import { seamless } from './hope.seamless.js';

class HopeDoc {
	static const LOADING = 1;
	static const READY   = 10;

	constructor(frame, name) {
		this.frame  = frame;
		this.name   = name;
		this.status = HopeDoc.LOADING;
	}

	api(api) {
		let self = this;
		let apiHandler = function(api) ({
			get: function(obj, prop) {
				return new Proxy({}, apiHandler(api+prop+'/')); //@FIXME: handle missing end '/' in api
			},
			apply: function(obj, thisArg, params) {
				return bus.call(api, params, self.frame);
			}
		};
		return new Proxy({}, apiHandler(api));
	}
};


document.hope = (function() {
	var hopeDocuments = {};

	/**
	 * This function is the mutation observer callback that listens for any nodes added or removed
	 * in the current document. It then checks for any child nodes (iframes) (or the node itself) that has a
	 * data-hope-name="..." attribute. And if so updates the list of hope documents. This list is
	 * exposed as document.hope.documents.
	 * If two or more iframes share the same data-hope-name, the entry in hope.documents is turned into an
	 * array. If after removal of an iframe such an array contains just one document, the array is turned
	 * into a direct reference to the document again.
	 * @NOTE: perhaps it is simpler to disallow documents with the same name and throw an error?
	 */
	var handleChanges = function(changes) {
        for (const change of changes) {
            if (change.type=='childList') {
                [].forEach.call(change.addedNodes, node => {
                    if (node.querySelectorAll) {
                        [].slice.call(node.querySelectorAll('iframe'))
                        	.forEach(frame => addDocument(frame));
                    }
                });
                [].forEach.call(change.removedNodes, node => {
                	if (node.querySelectorAll) {
                		[].slice.call(node.querySelectorAll('iframe'))
                			.forEach(frame => removeDocument(frame));
                	}
                });
            }
        }
   	};

   	var addDocument = function(frame) {
    	let name = frame.name;
    	if (!name) {
    		name = 'hope_'+Object.keys(hopeDocuments).length+1;
    		frame.name = name;
    	}
   		let hopeDoc = new HopeDoc(frame, name);

    	bus.connect(hopeDoc.frame); // must notify listeners in this document that a new document has entered the dom
    	seamless.connect(hopeDoc.frame);
    	if (typeof hopeDocuments[name] !== 'undefined') {
    		name += '_' + Object.keys(hopeDocuments).length+1; //@TODO: prevent names like foo_1_1_1
    		frame.name = name;
    	}
   		hopeDocuments[name] = hopeDoc;
   	};

   	var removeDocument = function(frame) {
		let hopeDoc = hopeDocuments.filter(doc => doc.frame == frame).pop();
		if (!hopeDoc) {
			//@TODO: throw error? or ignore silently?
		}
		seamless.disconnect(hopeDoc);
		bus.disconnect(hopeDoc); // @TODO: must trigger errors for listeners that are waiting for a response from this document
		delete hopeDocuments[name];
   	};

   	// add all existing hope documents
   	[].forEach.call(document.querySelectorAll('iframe'), frame => {
   		addDocument(frame);
   	});

	bus.init();
	seamless.init(bus);

	var observer = new MutationObserver(handleChanges);
	observer.observe(document, {
		subtree: true,
		childList: true
	});

	return {
		documents: hopeDocuments,
		bus: bus
	}
})();

export default document.hope;