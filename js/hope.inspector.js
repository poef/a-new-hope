/**
 * Hope Inspector prototype
 */
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
			script = document.createElement('script');
			script.id = id;
			document.body.appendChild(script);
		}
		let editorWindow = window.open('',id);
		if (editorWindow.editor) { // if this window is already open, don't reload it, re-use it.
			editorWindow.editor.setValue(script.innerHTML);
			editorWindow.focus();
		} else {
			let scriptSource = script.innerHTML.replace(/"/g,'\\"');
			let editor = `
<head>
<title>${id}</title>
<style>
	html, body {
		margin: 0;
		padding: 0;
		border: 0;
		height: 100%;
	}
	.CodeMirror {
		height: 100vh !important;
	}
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.2/codemirror.min.js" integrity="sha512-6Q5cHfb86ZJ3qWx47Pw7P5CN1/pXcBMmz3G0bXLIQ67wOtRF7brCaK5QQLPz2CWLBqjWRNH+/bV5MwwWxFGxww==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.2/codemirror.min.css" integrity="sha512-xIf9AdJauwKIVtrVRZ0i4nHP61Ogx9fSRAkCLecmE2dL/U8ioWpDvFCAy4dcfecN72HHB9+7FfQj3aiO68aaaw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.2/theme/night.min.css" integrity="sha512-pacIk0A3c7l/KD0Belz3UTv/3cE2R57Se/sxKFG/4aJklknJisL7uY5rgMs/ReMOGUjVC8EnSLgjlPxtXN2atA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.2/addon/hint/javascript-hint.min.js" integrity="sha512-HB0sEfERI4Pe2z7rbx7JVGS0SEEGbnAbV+9X0bs3Hs9R/nCYartwJQg16bK1P0jPsMzbiXjT+kYNHYLCsHQ8HA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.2/addon/lint/javascript-lint.min.js" integrity="sha512-zwusqVz1qn+JyCHc09C0naAEMMZKn3K8deUOpDMnC4WCM59kfg8rmF+dJNyNW9AmfIELag6MeALrEBD33rJVpA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.2/mode/javascript/javascript.min.js" integrity="sha512-9mEZ3vO6zMj0ub2Wypnt8owrHeoJCH22MkzeJ9eD3hca8/Wlqo5pEopI6HloA0F53f/RkRkHs8TyZMxbwVmnFw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
</head>
<body>
<script>
var editor = CodeMirror(document.body, {
	value: "${scriptSource}",
	theme: "night",
	lineNumbers: true
});
window.addEventListener('keydown', e => {
	console.log(e.key+' '+e.ctrlKey+' '+e.altKey);
	if (e.key=='s' && e.ctrlKey && e.altKey) {
	    window.opener.hope.script('${id}', editor.getValue());
	    e.preventDefault();
	    return false;
	}
});
</script></body>`;
			editorWindow.document.write(editor);
		}
		return {};
	},
	tree: function() {
		let tree = {};
		let promises = [];
		hope.doclets().forEach(doclet => {
			promises.push(
				doclet.api('/x/hope/inspector/')
				.tree()
				.then(subtree => { 
					tree[doclet.name] = Object.assign({}, doclet, subtree, {
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
			// if this document is a doclet hosted in another document, update the host tree as well
			hope.updateTree(hope);
		}
	}

	// update the local hope tree and the host hope tree when subdoclets connect
	document.hope.bus.subscribe('/x/hope/bus/init/ready/', event => {
		let source = event.data.source;
		if (source) {
			let doclet = document.hope.doclets[source];
			if (doclet) {
				doclet.api('/x/hope/inspector/').tree()
				.then(subtree => {
					delete subtree.replyTo; //@FIXME: add header/envelope to messages so we don't have to do this
					hope[doclet.name] = Object.assign({}, doclet, subtree, {
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