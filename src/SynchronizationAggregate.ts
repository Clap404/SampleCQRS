export abstract class Event {
    constructor(shopId: string) {
        this.shopId = shopId;
    }

    shopId: string;
}

export class ShopDataReceivedEvent extends Event {
}

export class ShopDataRequestedEvent extends Event {
}

export class ShopDataAlreadyReceivedEvent extends Event {
}

export class BadShopIdDataReceivedEvent extends Event {
}

type ShopId = string;

enum RequestState {
    Requested,
    Received,
}

export class SynchronizationAggregate {

    private shopId: ShopId;

    state = {
        requestState: null
    };

    constructor(shopId: ShopId, history?) {
        this.shopId = shopId;
        history?.forEach(el => this.apply(el));
    }

    apply(event: Event) {
        switch (event.constructor.name) {
            case "ShopDataRequestedEvent" :
                this.state.requestState = RequestState.Requested;
                break;
            case "ShopDataReceivedEvent" :
                this.state.requestState = RequestState.Received;
                break;
            case "BadShopIdDataReceivedEvent" :
                break;
            case "ShopDataAlreadyReceivedEvent" :
                break;
        }
    }

    requestData(shopId: string): ShopDataRequestedEvent {
        console.log(`Command : requestData for ${shopId}`)
        const event = new ShopDataRequestedEvent(shopId);
        this.apply(event)
        return event;
    }

    receiveData(shopData: ShopData): any {
        console.log(`Command : receiveData for ${shopData.shopId}`)
        let event: Event;
        if (shopData.shopId !== this.shopId) {
            event = new BadShopIdDataReceivedEvent(shopData.shopId);
        } else if (this.state.requestState === RequestState.Requested) {
            event = new ShopDataReceivedEvent(shopData.shopId);
        } else if (this.state.requestState === RequestState.Received) {
            event = new ShopDataAlreadyReceivedEvent(shopData.shopId);
        }
        this.apply(event);
        return event;
    }
}

// DTOs

export class ShopData {
    shopId: string;
    contents: string;
}