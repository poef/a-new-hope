// inspector prototype

let hope = {
	doclets: function() {
		let result = {};
		Object.keys(document.hope.doclets).forEach(name => { 
			let status = document.hope.doclets[name].status;
			result[name] = status;
		});
		return result;
	},
	debugger: function() {
		document.hope.bus.debug = !document.hope.bus.debug; //toggle
		return document.hope.bus.debug;
	},
	script: function(id) {
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
	updateScript: function(id, value) {
		let script = document.querySelector('script[id='+id+']');
		script.remove();
		script = document.createElement('script');
		script.id = id;
		document.body.appendChild(script);		
		script.innerHTML = value;
	},
	scripts: function() {
		let scripts = document.querySelectorAll('script[id]');
		return Array.from(scripts).map(s => s.id);
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
			callback: function() {
				return hope.doclets();
			}
		}
		inspectorApi.debugger = {
			callback: function() {
				//FIXME: this breaks, as debugger() returns a boolean, not an object
				// and bus.reply tries to add a property 'replyTo' to the return message
				// the bus should add a header or envelope to the message
				return hope.debugger();
			}
		}
		inspectorApi.script = {
			callback: function(params) {
				return hope.script(params.id);
			}
		}
		inspectorApi.scripts = {
			callback: function() {
				return hope.scripts();
			}
		}
	});
});