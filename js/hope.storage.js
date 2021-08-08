let subsystems = {};

export const storage = {
	register: function(name, factory) {
		subsystems[name] = factory;
	},
	subsystem: function(name) {
		if (typeof subsystems[name] === 'function') {
			return subsystems[name]();
		}
		throw new Error('Subsystem '+name+' not found');
	}
}

storage.register('put', function() {
	let url = document.location;
	let options = {
		method: 'PUT'
	};
	let subsystem = {
		connect: function(newUrl='', newOptions=null) {
			if (url) {
				url = newUrl;
			}
			if (newOptions) {
				options = Object.assign(options, newOptions)
			}
			return subsystem;
		},
		write: function(data) {
			if (typeof data === 'undefined') {
				data = document.documentElement.outerHTML;
			} else if (typeof data !== 'string') {
				data = JSON.stringify(data);
			}
			return fetch(url, Object.assign({}, options, {
				body: data
			}));
		}
	};
	return subsystem;
});
