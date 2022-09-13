import {strict} from "assert";

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

export class SynchronizationAggregate {

    history: Event[];
    state: {
        shopsBeingRequested: string[],
        shopsDataReceived: string[],
    } = {shopsBeingRequested: [], shopsDataReceived: []}

    constructor(history?) {
        this.history = history || [];
        history?.forEach(el => this.apply(el));
    }

    apply(event: Event) {
        switch (event.constructor.name) {
            case "ShopDataRequestedEvent" :
                this.state.shopsBeingRequested.push(event.shopId);
                break;
            case "ShopDataReceivedEvent" :
                const shopIndex = this.state.shopsBeingRequested.findIndex((el) => el === event.shopId);
                this.state.shopsBeingRequested.splice(shopIndex, 1);
                this.state.shopsDataReceived.push(event.shopId);
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
        this.history.push(event);
        this.apply(event)
        return event;
    }

    receiveData(shopData: ShopData): any {
        console.log(`Command : receiveData for ${shopData.shopId}`)
        let event: Event;
        if (this.state.shopsBeingRequested.indexOf(shopData.shopId) >= 0) {
            event = new ShopDataReceivedEvent(shopData.shopId);
        } else if (this.state.shopsDataReceived.indexOf(shopData.shopId) >= 0) {
            event = new ShopDataAlreadyReceivedEvent(shopData.shopId);
        } else {
            event = new BadShopIdDataReceivedEvent(shopData.shopId);
        }
        this.history.push(event);
        this.apply(event);
        return event;
    }
}

// DTOs

export class ShopData {
    shopId: string;
    contents: string;
}