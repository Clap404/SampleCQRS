import {DomainEvent, ShopId} from "./SynchronizationAggregate";
import {Handler, ShopAdminHandler} from "./Projections";
import {
    AppendExpectedRevision,
    EventData,
    EventStoreDBClient,
    FORWARDS,
    jsonEvent,
    JSONEventType,
    ResolvedEvent,
    START
} from "@eventstore/db-client";
import {JSONEventData} from "@eventstore/db-client/dist/types/events";
import {classToPlain, instanceToPlain} from "class-transformer";

export class PubSub {
    constructor(public eventStore: EventStore) {
    }

    subscriptions: Handler[] = [];

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

export interface IEventStore {
    store(event: DomainEvent): Promise<any>
    getById(shopId: ShopId): Promise<DomainEvent[]>
}

export class EventStore implements IEventStore {

    eventQueue: DomainEvent[] = [];

    store(event: DomainEvent) {
        this.eventQueue.push(event);
        return Promise.resolve(true);
    }

    getById(shopId: ShopId): Promise<DomainEvent[]> {
        return Promise.resolve(this.eventQueue.filter((event) => event.shopId === shopId));
    }
}

export class RealEventStore implements IEventStore{

    private eventStoreClient : EventStoreDBClient

    constructor() {
        this.eventStoreClient = EventStoreDBClient.connectionString(process.env.EVENTSTORE_CONNECTION_STRING)
    }

    async getById(shopId: ShopId): Promise<any[]> {
        const stream = this.eventStoreClient.readStream(`synchronization-${shopId}`);

        return new Promise((resolve, reject) => {
            const streamEvents: ResolvedEvent[] = [];

            stream.on("data", (data) => streamEvents.push(data));
            stream.on("end", () => resolve(streamEvents));
            stream.on("error", (err) => reject(err));
        })
    }

    async store(event: DomainEvent): Promise<AppendExpectedRevision> {

        const eventStoreEvent = jsonEvent({
            type: event.constructor.name,
            data: instanceToPlain(event),
            metadata: {
                timestamp : new Date().toISOString()
            },
            revision: event.sequenceNumber
        });

        const appendResult = await this.eventStoreClient.appendToStream(`synchronization-${event.shopId}`, eventStoreEvent, {
            expectedRevision: event.sequenceNumber
        })

        return appendResult.nextExpectedRevision
    }

    async clean(shopId): Promise<any> {
        return this.eventStoreClient.deleteStream(`synchronization-${shopId}`);
    }
 }