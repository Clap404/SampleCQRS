import {PubSub} from "./PubSub";

export abstract class DomainEvent{
    constructor(shopId: ShopId) {
        this.shopId = shopId;
    }

    shopId: ShopId;
}

export class ShopDataReceivedEvent extends DomainEvent {
}

export class ShopDataRequestedEvent extends DomainEvent {
}

export class ShopDataAlreadyReceivedEvent extends DomainEvent {
}

export class BadShopIdDataReceivedEvent extends DomainEvent {
}

export class ShopUrlUpdatedEvent extends DomainEvent {
    constructor(shopId: ShopId, url: string) {
        super(shopId);
        this.url = url;
    }

    url: string;
}

export class ShopNameUpdatedEvent extends DomainEvent {
    constructor(shopId: ShopId, name: string) {
        super(shopId);
        this.name = name;
    }

    name: string;
}

enum RequestState {
    Requested,
    Received,
}

export class SynchronizationAggregate {

    state = {
        requestState: null
    };

    constructor(private shopId: ShopId, history?) {
        history?.forEach(el => this.apply(el));
    }

    apply(event: DomainEvent) {
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
        let event: DomainEvent;
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

    updateUrl(shopId: ShopId, url: string): any {
        console.log(`Command : updateUrl for ${shopId}`)
        const event = new ShopUrlUpdatedEvent(shopId, url);
        this.apply(event);
        return event;
    }
}

// DTOs

export type ShopId = string;

export class ShopData {
    shopId: string;
    contents: string;
}