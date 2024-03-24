import { Subscription, Subject } from "rxjs";

export class CustomEmitter<T> {

    private subject = new Subject<T>()

    unsubscribe() {

    }

    subscribe(): Subscription {
        return this.subject.subscribe()
    }

    
    // subscribe(): T {
    //     return null as any;
    // }

    emit(param: T) {
        this.subject.next(param);
    }
}