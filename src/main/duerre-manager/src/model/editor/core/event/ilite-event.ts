import type { EventSubscription } from "./lite-event";

export type EventHandler<T> = {(data: T) :void}; 
export interface ILiteEvent<T> {
    subscribe(handler: EventHandler<T>): EventSubscription;
    unsubscribe(handler: EventHandler<T>): void;
}