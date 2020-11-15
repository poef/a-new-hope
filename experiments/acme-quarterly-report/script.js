import { bus } from './bus.js';
import { seamless } from './seamless.js';
import { channel } from './channel.js';

window.bus = bus;
window.seamless = seamless;
window.channel = channel;

window.addEventListener('load', function() {
    Array.from(document.querySelectorAll('iframe[data-uae-connect]')).forEach(f => {
        let name = f.dataset.uaeConnect;
        let target = document.querySelector('iframe[name="'+name+'"]');
        if (target) {
            let channelName = f.name+'-'+name;
            let channel = new MessageChannel();
            bus.subscribe('/x/uae/connect-ready', e => {
                bus.publish('/x/uae/connect-ready', {
                    name: channelName+'[1]'
                }, target);
            }, f);
            
            bus.subscribe('/x/uae/connect-ready', e => {
                bus.publish('/x/uae/connect-ready', {
                    name: channelName+'[2]'
                }, f);
            }, target);
            
            bus.publish('/x/uae/connect', {
                name: channelName+'[1]'
            }, f, [channel.port1]);
            
            bus.publish('/x/uae/connect', {
                name: channelName+'[2]'
            }, target, [channel.port2]);
        }
    });
});