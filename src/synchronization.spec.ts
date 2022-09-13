import {
    BadShopIdDataReceivedEvent,
    DataIsRequestedEvent,
    ShopData,
    ShopDataReceivedEvent,
    SynchronizationAggregate
} from "./SynchronizationAggregate";

describe('synchronisation', () => {
    it('should raise DataIsRequested when request data', () => {
        const synchronization: SynchronizationAggregate = new SynchronizationAggregate();

        const shopId = "nbouerf";

        const event = synchronization.requestData(shopId);

        expect(event).toBeInstanceOf(DataIsRequestedEvent);
    });

    it('should raise ShopDataReceived when receive data with the goOod shopId', () => {
        const shopData = {
            shopId : "nbouerf",
            contents : "ZeData"
        } ;

        const history = [new DataIsRequestedEvent(shopData.shopId)];

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

    })
});
