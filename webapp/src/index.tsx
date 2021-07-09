import {Store, Action} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import manifest from './manifest';

// eslint-disable-next-line import/no-unresolved
import {PluginRegistry} from './types/mattermost-webapp';

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        const state = store.getState();
        const config = getConfig(state);
        const siteURL = config.SiteURL;

        const endpoint = `${siteURL}/plugins/${manifest.id}/config`;
        fetch(endpoint).then((r) => r.json()).then((data) => {
            // Note that you should store the result in redux for later use.
            const message = `Plugin received config through API: ${JSON.stringify(data)}`;
            alert(message);
        });

        const websocketEventName = 'setting_changed';
        const fullEventName = `custom_${manifest.id}_${websocketEventName}`;
        registry.registerWebSocketEventHandler(fullEventName, (event) => {
            // Update the config value in redux at this time.
            const message = `Plugin received config through websockets: ${JSON.stringify(event.data)}`;
            alert(message);
        });
    }
}

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
    }
}

window.registerPlugin(manifest.id, new Plugin());
