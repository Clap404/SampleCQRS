import {ShopDataRequestedEvent, ShopUrlUpdatedEvent, SynchronizationAggregate} from "./SynchronizationAggregate";
import {ShopAdminHandler, ShopAdminRepository} from "./Projections";

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

})