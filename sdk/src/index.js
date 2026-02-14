import { createUI } from './ui.js';
import { Store } from './store.js';

window.Blitsum = {
    init: (config = {}) => {
        console.log('Blitsum SDK Initialized', config);
        Store.setState({ config });
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            createUI();
        } else {
            window.addEventListener('DOMContentLoaded', createUI);
        }
    }
};
