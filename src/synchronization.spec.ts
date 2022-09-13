import {
    BadShopIdDataReceivedEvent,
    ShopDataRequestedEvent,
    ShopData,
    ShopDataReceivedEvent,
    SynchronizationAggregate, ShopDataAlreadyReceivedEvent
} from "./SynchronizationAggregate";

describe('synchronisation', () => {
    it('should raise DataIsRequested when request data', () => {
        const synchronization: SynchronizationAggregate = new SynchronizationAggregate();

        const shopId = "nbouerf";

        const event = synchronization.requestData(shopId);

        expect(event).toBeInstanceOf(ShopDataRequestedEvent);
    });

    it('should raise ShopDataReceived when receive data with the goOod shopId', () => {
        const shopData = {
            shopId : "nbouerf",
            contents : "ZeData"
        } ;

        const history = [new ShopDataRequestedEvent(shopData.shopId)];

        const synchronization: SynchronizationAggregate = new SynchronizationAggregate(history);

        const event = synchronization.receiveData(shopData);

        expect(event).toBeInstanceOf(ShopDataReceivedEvent);
    });

    it("should raise BadShopDataReceived when receive data from wrong shop id", () => {
        const synchronization: SynchronizationAggregate = new SynchronizationAggregate();

        synchronization.requestData("rightShopId");

        const shopData = {
            shopId : "wrongShopId",
            contents : "ZeData"
        } ;

        const event = synchronization.receiveData(shopData);

        expect(event).toBeInstanceOf(BadShopIdDataReceivedEvent);
    })

    it("should raise DataAlreadyReceived when receive data already received", () => {
        const shopData = {
            shopId : "nbouerf",
            contents : "ZeData"
        } ;

        const history = [new ShopDataRequestedEvent(shopData.shopId), new ShopDataReceivedEvent(shopData.shopId)];

        const synchronization: SynchronizationAggregate = new SynchronizationAggregate(history);

        const event = synchronization.receiveData(shopData);

        expect(event).toBeInstanceOf(ShopDataAlreadyReceivedEvent);
    })
});
