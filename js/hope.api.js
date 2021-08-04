// hope.api
let hopeBus = null;

let apiHandler = function(apiName) {
	return {
		get: function(obj, prop) {
			return obj[prop];
		},
		set: function(obj, prop, value) {
			// FIXME: add error handling
			// - should exceptions be caught and sent as a result?
			// - or should only returned errors be sent?
			// setup listener for this message
			hopeBus.subscribe(apiName+prop+'/', event => {
				if (event.data.message.replyTo) {
					return;
				}
				let result = obj[prop].callback(event.data.message, event.data.source)
				if (!!result && typeof result.then === 'function') {
					result.then(result => {
						if (event.data.message.id) {
							hopeBus.reply(event.data.message.id, event.data.name, result, event.data.source);
						}
					}); //FIXME: add a catch here
				} else {
					if (event.data.message.id) {
						hopeBus.reply(event.data.message.id, event.data.name, result, event.data.source);
					}
				}
			});
			// add data for the api
			return Reflect.set(...arguments);
		}
	}
};

export const api = {
	register: apiName => {
		// setup listener for api introspection for this apiName
		// then return a proxy to add methods
		// an api only has methods that receive messages and may
		// send messages
		// @TODO: force apiName to be a clean path starting and ending with '/'
		let registeredApi = new Proxy({}, apiHandler(apiName));
		registered[apiName] = registeredApi;
		return registeredApi;
	},
	init: bus => {
		hopeBus = bus;
		let reflect = api.register('/x/hope/reflect/');
		reflect.list = {
			description: 'Returns a list of API\'s supported by this doclet',
			callback: function() {
				return Object.keys(registered);
			}
		};

		let getReflectionData = function(api) {
			return JSON.parse(JSON.stringify(api));
		};

		reflect.get = {
			description: 'Return a description of a specific API',
			params: {
				api: {
					description: 'The name of an API',
					type: 'string'
				}
			},
			return: {
				description: 'A list of API messages',
				type: 'object'
			},
			callback: function(params) {
				if (!params.api) {
					throw new Error('Missing \'api\' parameter to \'reflect.get\'');
				}
				if (!registered[params.api]) {
					throw new Error('No API found by the name \''+params.api+'\'');
				}
				return getReflectionData(registered[params.api]);
			}
		};
	}
};

let registered = {};

