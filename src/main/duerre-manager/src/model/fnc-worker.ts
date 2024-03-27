export class FncWorker {
    public readonly promise: Promise<any>
    public readonly worker: Worker;

    constructor(
        _fnc: Function,
        ...args: any[]
    ) {
        const code = `self.onmessage = e => self.postMessage((${_fnc.toString()}).call(...e.data));`;
        const blob = new Blob([code], { type: "text/javascript" });
        const worker = new Worker(window.URL.createObjectURL(blob));
        this.worker = worker;
        this.promise = new Promise((resolve, reject) => {
            worker.onmessage = e => (resolve(e.data), worker.terminate());
            worker.onerror = e => (reject(e.message), worker.terminate());
            worker.postMessage(args);
        });
    }

    public terminate() {
        this.worker.terminate();
    }
}