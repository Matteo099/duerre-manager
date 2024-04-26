import type { EventHandler, ILiteEvent } from "./ilite-event";

export class LiteEvent<T> implements ILiteEvent<T> {
    private handlers: { (data: T): void; }[] = [];

    public subscribe(handler: EventHandler<T>): EventSubscription {
        this.handlers.push(handler);
        return new EventSubscription(this, handler);
    }

    public unsubscribe(handler: EventHandler<T>): void {
        const index = this.handlers.indexOf(handler);
        if (index !== -1) {
            this.handlers.splice(index, 1);
        }
    }

    public unsubscribeAll() {
        this.clear();
    }

    public next(data: T) {
        [...this.handlers].forEach(h => h(data))
    }

    public clear() {
        this.handlers = [];
    }

    public expose(): ILiteEvent<T> {
        return this;
    }
}

export class EventSubscription {

    constructor(
        private readonly liteEvent: LiteEvent<any>,
        private readonly handler: EventHandler<any>
    ) { }

    public unsubscribe(): void {
        this.liteEvent.unsubscribe(this.handler);
    }
}