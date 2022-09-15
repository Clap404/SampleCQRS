import {
    ShopDataRequestedEvent,
    ShopNameUpdatedEvent,
    ShopUrlUpdatedEvent,
    SynchronizationAggregate
} from "./SynchronizationAggregate";
import {ShopAdminHandler, ShopAdminRepository} from "./Projections";
import {name} from "ts-jest/dist/transformers/hoist-jest";

describe('projections', () => {

    let shopAdminRepo: ShopAdminRepository

    beforeEach(() => {
        shopAdminRepo = new ShopAdminRepository();
    })

    it("Given no ShopAdminProjection in ShopAdminRepository when ShopAdminHandler receive urlUpdated then create ShopAdmin", () => {
        const shopAdminHandler = new ShopAdminHandler(shopAdminRepo);
        const url = "http://gaagle.com"

        const urlUpdatedEvent = new ShopUrlUpdatedEvent("shopId", url);

        expect(shopAdminRepo.get("shopId")).toBeNull();
        shopAdminHandler.handleUrlUpdatedEvent(urlUpdatedEvent);
        expect(shopAdminRepo.get("shopId").url).toBe(url);
    })

    it("Given ShopAdminProjection with url in ShopAdminRepository when ShopAdminEventHandler receive nameUpdate then update ShopAdminProjection", () => {
        const shopAdminHandler = new ShopAdminHandler(shopAdminRepo);

        const url = "http://gaagle.com"
        const shopId = "shopId"
        const name = "thename"
        shopAdminRepo.set(shopId, {url})

        const nameUpdatedEvent = new ShopNameUpdatedEvent("shopId", name);

        expect(shopAdminRepo.get("shopId").url).toBeTruthy();
        shopAdminHandler.handleNameUpdatedEvent(nameUpdatedEvent);
        expect(shopAdminRepo.get("shopId").name).toBe(name);
        expect(shopAdminRepo.get("shopId").url).toBeTruthy();
    })
})