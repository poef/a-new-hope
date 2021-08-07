// inspector prototype
let hope = {
	help: 'Available methods: doclets(name|optional), debugger(), script("id|optional","value|optional"), tree()',
	doclets: function(name=null) {
		if (name) {
			return document.hope.doclets[name];
		}
		return Object.values(document.hope.doclets);
	},
	debugger: function() {
		document.hope.bus.debug = !document.hope.bus.debug; //toggle
		return { debugger: document.hope.bus.debug }; //@FIXME: must return an object, as bus.reply wants to add the property 'replyTo', switch to header/body seperation in message
	},
	script: function(id=null, value=null) {
		if (!id) {
			let scripts = document.querySelectorAll('script[id]');
			return Array.from(scripts).map(s => s.id);
		}
		if (value) {
			let script = document.querySelector('script[id='+id+']');
			script.remove();
			script = document.createElement('script');
			script.id = id;
			document.body.appendChild(script);		
			script.innerHTML = value;
			return true;
		}
		// if a script with this id doesn't exist yet, then
		// create a new script tag with the given name as id
		// open a new tab with an editor with the contents of this script tag
		// onsave update the script tag with the contents of the editor
		let script = document.querySelector('script[id='+id+']');
		if (!script) {
			let script = document.createElement('script');
			script.id = id;
			document.body.appendChild(script);
		}
		let editor = `
<strong>editor ${id}</strong><br><textarea id="script_${id}"></textarea><button onClick="save()">Save</button>`;
		let save = `function save() {
	window.opener.hope.script('${id}', document.getElementById('script_${id}').value);
}`;
		let editorWindow = window.open('',id);
		editorWindow.document.body.innerHTML = editor;
		let saveScript = editorWindow.document.createElement('script');
		saveScript.innerHTML = save;
		editorWindow.document.body.appendChild(saveScript);
		editorWindow.focus();
		return {};
	},
	tree: function() {
		//TODO: this call is now automatically forwarded to child doclets
		//but to support reflection and other stuff we should be able
		//to forward any call to a sub sub doclet and get the result back
		let tree = {};
		let promises = [];
		hope.doclets().forEach(doclet => {
			promises.push(
				doclet.api('/x/hope/inspector/')
				.tree()
				.then(subtree => { 
					tree[doclet.name] = Object.assign(doclet, subtree, {
						debugger: () => doclet.api('/x/hope/inspector/').debugger(),
						script: (...params) => doclet.api('/x/hope/inspector/').script.apply(null, params)
					});
					 //@TODO: check security risks by passing Doclet object to parent documents
					return subtree;
				})
			);
		});
		return Promise.all(promises).then(() => {
			Object.keys(tree).forEach(name => {
				hope[name] = tree[name];
			})
			return tree;
		});
	},
	updateTree: function(tree) {
		if (document.hope.host) {
			document.hope.host.api('/x/hope/inspector/').updateTree({tree: tree});
		}
	}
}

let apiHandler = {
	get: function(obj, prop) {
		if (typeof obj[prop] == 'undefined') {
			if (document.hope.doclets[prop]) {
				obj[prop] = document.hope.doclets[prop];
			}
		}
		return obj[prop];
	}
};

window.hope = hope;
export default hope;

window.setTimeout(() => {
	let inspectorApi = document.hope.api.register('/x/hope/inspector/');
	document.hope.bus.hosted().then(() => {
		inspectorApi.debugger = {
			description: "Toggles the bus console debug output on or off inside this doclet.",
			callback: function() {
				//FIXME: this breaks, as debugger() returns a boolean, not an object
				// and bus.reply tries to add a property 'replyTo' to the return message
				// the bus should add a header or envelope to the message
				return hope.debugger();
			}
		}
		inspectorApi.script = {
			description: `With no params, this will return a list of scripts inside this doclet.
With only the params.id set to the id of a script, it will open an editor for that script.
With the params.value set, it will update the script to the given value and reload it.`,
			params: {
				name: {
					type: "string",
					description: "The id of a script to edit or update"
				},
				value: {
					type: "string",
					description: "The contents to write to the script"
				}
			},
			callback: function(params) {
				return hope.script(params.name, params.value);
			}
		}
		inspectorApi.tree = {
			description: "Returns an object with the tree structure of (active) doclets.",
			callback: function() {
				return hope.tree();
			}
		}
	});
	inspectorApi.updateTree = {
		callback: function(params, sourceFrame) {
			hope[sourceFrame.name] = params.tree;
		}
	}

	document.hope.bus.subscribe('/x/hope/bus/init/ready/', event => {
		let source = event.data.source;
		if (source) {
			let doclet = document.hope.doclets[source];
			if (doclet) {
				doclet.api('/x/hope/inspector/').tree()
				.then(subtree => {
					delete subtree.replyTo; //@FIXME: add header/envelope to messages so we don't have to do this
					hope[doclet.name] = Object.assign(doclet, subtree, {
						debugger: () => doclet.api('/x/hope/inspector/').debugger(),
						script: (id=null, value=null) => doclet.api('/x/hope/inspector/').script({ name: id, value: value})
					});
					return subtree;
				}).then(subtree => {
					document.hope.bus.hosted().then(() => {
						document.hope.host.api('/x/hope/inspector/').updateTree({tree:subtree});
					});
				});
			}
		}
	});
},1);