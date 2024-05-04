import type { ILiteEvent } from "./ilite-event";
import { EventSubscription, LiteEvent } from "./lite-event";

export class TestEvent {
    private readonly onSomeEvent = new LiteEvent<string>();
    subscription?: EventSubscription;

    public get SomeEvent(): ILiteEvent<string> {
        return this.onSomeEvent.expose();
    }

    public some() {
        this.onSomeEvent.next("ciao");
    }

    public sub() {
        this.subscription = this.onSomeEvent.subscribe(data => {
            console.log(data);
        });
    }

    public usub() {
        this.subscription?.unsubscribe();
    }
}