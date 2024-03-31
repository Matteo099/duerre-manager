import type { IDieDataDao } from "./manager/models/idie-data-dao";

export class FncWorker {
    public readonly promise: Promise<any>
    public readonly worker: Worker;

    constructor(
        _fnc: Function,
        ...args: any[]
    ) {
        // Function to clone non-clonable objects
        const cloneIfPossible = (value: any) => {
            try {
                return JSON.parse(JSON.stringify(value));
            } catch (error) {
                return value; // Return original value if cloning fails
            }
        };

        // Clone each argument in the array
        const clonedArgs = args.map(cloneIfPossible);

        const code = `
                    self.onmessage = e => {
                        const result = (${_fnc.toString()}).apply(null, e.data);
                        self.postMessage(result);
                    }`;
        const blob = new Blob([code], { type: "text/javascript" });
        const worker = new Worker(window.URL.createObjectURL(blob));
        this.worker = worker;
        this.promise = new Promise((resolve, reject) => {
            worker.onmessage = e => (resolve(e.data), worker.terminate());
            worker.onerror = e => (reject(e.message), worker.terminate());
            worker.postMessage(clonedArgs);
        });
    }

    public terminate() {
        this.worker.terminate();
    }
}