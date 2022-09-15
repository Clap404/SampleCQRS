import {DomainEvent, ShopId} from "./SynchronizationAggregate";
import {Handler, ShopAdminHandler} from "./Projections";

export class PubSub {
    constructor(public eventStore : EventStore) {}

    subscriptions : Handler[] = [];

    publish(event: DomainEvent) {
        this.eventStore.store(event)
        this.subscriptions.forEach((handler) => {
            handler.handleEvent(event);
        })
    }

    subscribe(handler: Handler) {
        this.subscriptions.push(handler);
    }
}

export class EventStore {

    eventQueue: DomainEvent[] = [];

    store(event: DomainEvent) {
        this.eventQueue.push(event);
        return true;
    }

    getById(shopId: ShopId): DomainEvent[] {
        return this.eventQueue.filter((event) => event.shopId === shopId);
    }
}