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

describe("pubsub", () => {
    let eventStore;

    beforeEach(() => {
        eventStore = new EventStore();
    })

    it("should store events when publish event", () => {
        const shopId = "shopId"
        const url = "https://gaagle.fr"

        const pubsub = new PubSub(eventStore);
        const event = new ShopUrlUpdatedEvent(shopId, url);
        pubsub.publish(event);

        expect(eventStore.getById(shopId)).toEqual([event]);
    })

    it("should call handlers publish event", () => {
        const shopId = "shopId"
        const url = "https://gaagle.fr"
        const handler = mock<ShopAdminHandler>();

        const pubsub = new PubSub(eventStore);
        pubsub.subscribe(handler);

        const event = new ShopUrlUpdatedEvent(shopId, url);
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

    afterEach(() => {
        eventStore.clean(shopId);
    })

    it("Should return all events", async () => {
        const eventsToStore = [
            new ShopUrlUpdatedEvent(shopId, "http://gnierf.de"),
            new ShopDataRequestedEvent(shopId),
        ]

        for (const e of eventsToStore) {
            await eventStore.store(e);
        }

        const events = await eventStore.getById(shopId);

        expect(events.map((it) => it.event.data)).toEqual(eventsToStore);
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
