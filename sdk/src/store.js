export const Store = {
    state: {
        isOpen: false,
        isVoiceMode: false,
        config: {}
    },
    listeners: [],

    getState() {
        return this.state;
    },

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    },

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    },

    notify() {
        this.listeners.forEach((listener) => listener(this.state));
    },
};
