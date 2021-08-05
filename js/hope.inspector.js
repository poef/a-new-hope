// inspector prototype

let hope = {
	doclets: function(name=null) {
		if (name) {
			return document.hope.doclets[name];
		}
		return Object.values(document.hope.doclets);
	},
	debugger: function() {
		document.hope.bus.debug = !document.hope.bus.debug; //toggle
		return document.hope.bus.debug;
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
	window.opener.hope.updateScript('${id}', document.getElementById('script_${id}').value);
}`;
		let editorWindow = window.open('',id);
		editorWindow.document.body.innerHTML = editor;
		let saveScript = editorWindow.document.createElement('script');
		saveScript.innerHTML = save;
		editorWindow.document.body.appendChild(saveScript);
		editorWindow.focus();
		return editorWindow;
	},
	tree: function() {
		//TODO: this call is now automatically forwarded to child doclets
		//but to support reflection and other stuff we should be able
		//to forward any call to a sub sub doclet and get the result back
		let tree = {};
		let promises = [];
		hope.doclets().forEach(d => {
			promises.push(
				d.api('/x/hope/inspector/')
				 .tree()
				 .then(m => { 
				 	tree[d.name] = m;
				 	return m;
				 })
			);
		});
		return Promise.all(promises).then(() => {
			return tree;
		});
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

let inspector = new Proxy(hope, apiHandler);

window.hope = inspector;
export default inspector;

window.setTimeout(() => {
	document.hope.bus.hosted().then(() => {
		let inspectorApi = document.hope.api.register('/x/hope/inspector/');
		inspectorApi.doclets = {
			description: "Returns an array of doclets embedded inside this doclet.",
			callback: function() {
				return hope.doclets();
			}
		}
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
				id: {
					type: "string",
					description: "The id of a script to edit or update"
				},
				value: {
					type: "string",
					description: "The contents to write to the script"
				}
			},
			callback: function(params) {
				return hope.script(params.id, params.value);
			}
		}
		inspectorApi.tree = {
			description: "Returns an object with the tree structure of (active) doclets.",
			callback: function() {
				return hope.tree();
			}
		}
	});
});