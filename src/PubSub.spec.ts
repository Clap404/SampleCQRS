import {
    DomainEvent,
    ShopDataRequestedEvent,
    ShopUrlUpdatedEvent,
    SynchronizationAggregate
} from "./SynchronizationAggregate";
import {EventStore, PubSub, RealEventStore} from "./PubSub";
import {ShopAdminHandler} from "./Projections";
import { mock } from 'jest-mock-extended';
import {SynchronizationCommandHandler} from "./SynchronizationCommandHandler";
import * as dotenv from 'dotenv';
import {randomUUID} from "crypto";
import {AppendExpectedRevision, NO_STREAM, STREAM_EXISTS} from "@eventstore/db-client";

describe("pubsub", () => {
    let eventStore;

    const dummySequence = STREAM_EXISTS

    beforeEach(() => {
        eventStore = new EventStore();
    })

    it("should store events when publish event", () => {
        const shopId = "shopId"
        const url = "https://gaagle.fr"

        const pubsub = new PubSub(eventStore);
        const event = new ShopUrlUpdatedEvent(shopId,dummySequence ,url);
        pubsub.publish(event);

        expect(eventStore.getById(shopId)).toEqual([event]);
    })

    it("should call handlers publish event", () => {
        const shopId = "shopId"
        const url = "https://gaagle.fr"
        const handler = mock<ShopAdminHandler>();

        const pubsub = new PubSub(eventStore);
        pubsub.subscribe(handler);

        const event = new ShopUrlUpdatedEvent(shopId, dummySequence,url);
        pubsub.publish(event);

        expect(handler.handleEvent).toBeCalledTimes(1);
        expect(handler.handleEvent).toBeCalledWith(event);
    })
})

describe("realEventStore e2e", () => {

    let envBackup = process.env;
    let eventStore: RealEventStore;
    const shopId = `nbouerf`

    beforeAll(() => {
        dotenv.config( { path: '.env'})
        eventStore = new RealEventStore();
    })

    afterAll(() => {
        process.env = envBackup;
    })

    afterEach(async () => {
        await eventStore.clean(shopId);
    })

    it("Should return all events", async () => {
        const eventsToStore = [
            new ShopUrlUpdatedEvent(shopId, NO_STREAM,"http://gnierf.de"),
            new ShopDataRequestedEvent(shopId, STREAM_EXISTS),
        ]

        for (const e of eventsToStore) {
            await eventStore.store(e);
        }

        const events = await eventStore.getById(shopId);

        expect(events.length).toBe(2);
        //expect(events.map((it) => it.event.data)).toEqual(eventsToStore);
    })

    it("Should throw when storing an event with an already exisint sequence id", async () => {

        const event1 = new ShopUrlUpdatedEvent(shopId, NO_STREAM,"http://gnierf.de")
        const nextSequenceNumber = await eventStore.store(event1)

        const event2 = new ShopDataRequestedEvent(shopId, nextSequenceNumber)
        const event2Again = new ShopDataRequestedEvent(shopId, nextSequenceNumber)
        await eventStore.store(event2)
        await eventStore.store(event2Again)

        const events = await eventStore.getById(shopId);

        expect(events.map((it) => it.event.data.shopId)).toEqual([event1, event2].map(it => it.shopId));
    })
})

describe("pubsub e2e", () => {
    let eventStore;

    beforeEach(() => {
        eventStore = new EventStore();
    })

    it("should create ShopAdminProjection projection when send command", () => {
        const shopId = "shopId"
        const url = "https://gaagle.fr"
        const handler = mock<ShopAdminHandler>();

        const aggregate = new SynchronizationAggregate(shopId);
        const pubsub = new PubSub(eventStore);
        pubsub.subscribe(handler);

        const event = aggregate.updateUrl(shopId, url);
        pubsub.publish(event);

        expect(handler.handleEvent).toBeCalledTimes(1);
        expect(handler.handleEvent).toBeCalledWith(event);
    })

    it("same but better", () => {
        const shopId = "shopId"
        const url = "https://gaagle.fr"
        const eventHandler = mock<ShopAdminHandler>();

        const aggregate = new SynchronizationAggregate(shopId);
        const pubsub = new PubSub(eventStore);
        const commandHandler = new SynchronizationCommandHandler(pubsub, aggregate);

        commandHandler.updateUrl(shopId, url)

        expect(eventHandler.handleEvent).toBeCalledTimes(1);
    })
})
