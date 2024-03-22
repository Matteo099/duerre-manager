import type { App } from "vue";

const fnc = {
    callAsWorker: (_fnc: Function, ...args: any[]): Promise<any> => {
        return new Promise((resolve, reject) => {
            const code = `self.onmessage = e => self.postMessage((${_fnc.toString()}).call(...e.data));`,
                blob = new Blob([code], { type: "text/javascript" }),
                worker = new Worker(window.URL.createObjectURL(blob));
            worker.onmessage = e => (resolve(e.data), worker.terminate());
            worker.onerror = e => (reject(e.message), worker.terminate());
            worker.postMessage(args);
        });
    }
}

const exts = { fnc };
const extensions = {
    install: (app: App) => {
        app.provide("$exts", exts);
    }
}
export const useExts = () => exts;
export default extensions;