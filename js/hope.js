import { bus } from './hope.bus.js';
import { seamless } from './hope.seamless.js';

document.hope = (function() {
	var hopeDocuments = {};

	bus.init();
	seamless.init(bus);

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
                        [].slice.call(node.querySelectorAll('iframe[data-hope-name]'))
                        	.forEach(hopeDoc => addDocument(hopeDoc));
                    }
                });
                [].forEach.call(change.removedNodes, node => {
                	if (node.querySelectorAll) {
                		[].slice.call(node.querySelectorAll('iframe[data-hope-name]'))
                			.forEach(hopeDoc => removeDocument(hopeDoc));
                	}
                });
            }
        }
   	};

   	var addDocument = function(hopeDoc) {
    	let name = hopeDoc.dataset.hopeName;
    	if (!name) {
    		name = 'hope_'+Object.keys(hopeDocuments).length+1;
    		hopeDoc.dataset.hopeName = name;
    	}
    	bus.connect(hopeDoc); // must notify listeners in this document that a new document has entered the dom
    	seamless.connect(hopeDoc);
    	if (Array.isArray(hopeDocuments[name])) {
    		hopeDocuments[name].push(hopeDoc);
    	} else if (typeof hopeDocuments[name] !== 'undefined') {
    		// duplicate name
    		hopeDocuments[name] = [
    			hopeDocuments[name],
    			hopeDoc
    		];
    	} else {
    		hopeDocuments[name] = hopeDoc;
    	}
   	};

   	var removeDocument = function(hopeDoc) {
		let name = hopeDoc.dataset.hopeName;
		seamless.disconnect(hopeDoc);
		bus.disconnect(hopeDoc); // @TODO: must trigger errors for listeners that are waiting for a response from this document
		if (Array.isArray(hopeDocuments[name])) {
			hopeDocuments[name] = hopeDocuments[name].filter(doc => doc == hopeDoc);
			if (hopeDocuments[name].length === 1) {
				hopeDocuments[name] = hopeDocuments[name].pop();
			} else if (hopeDocuments[name].length === 0) {
				delete hopeDocuments[name];
			}
		} else {
			delete hopeDocuments[name];
		}
   	};

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