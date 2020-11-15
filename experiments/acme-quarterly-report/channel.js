import { bus } from './bus.js';

export var channel = {};

bus.subscribe('/x/uae/connect', e => {
    channel[e.data.message.name] = new Channel(e.ports[0], e.data.message.name);
});

function Channel(port, channelName) {
    this.port = port;
    this.subscriptions = {};
    this.port.onmessage = e => {
        if (e.data && e.data.name && this.subscriptions[e.data.name]) {
            this.subscriptions[e.data.name].forEach(f => f(e));
        } else {
            console.log('no channel subscription for '+e.data.name+' on '+channelName);
        }
    };
}

Channel.prototype.subscribe = function(messageName, callback) {
    if (!this.subscriptions[messageName]) {
        this.subscriptions[messageName] = [];
    }
    this.subscriptions[messageName].push(callback);
}

Channel.prototype.publish = function(messageName, data, transfer=[]) {
    this.port.postMessage({
        name: messageName,
        message: data
    }, transfer);
}

