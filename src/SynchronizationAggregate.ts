import {strict} from "assert";

export abstract class Event {
    constructor(shopId: string) {
        this.shopId = shopId;
    }

    shopId: string;
}

export class ShopDataReceivedEvent extends Event {
}

export class DataIsRequestedEvent extends Event {
}

export class BadShopIdDataReceivedEvent extends Event {
}

export class SynchronizationAggregate {

    history: Event[];
    state: {
        shopsBeingRequested: string[],
    } = {shopsBeingRequested: []}

    constructor(history?) {
        this.history = history || [];
        history?.forEach(el => this.apply(el));
    }

    apply(event: Event) {
        switch (event.constructor.name) {
            case "DataIsRequestedEvent" :
                this.state.shopsBeingRequested.push(event.shopId);
                break;
            case "ShopDataReceivedEvent" :
                const shopIndex = this.state.shopsBeingRequested.findIndex((el) => el === event.shopId);
                this.state.shopsBeingRequested.splice(shopIndex, 1);
                break;
            case "BadShopIdDataReceivedEvent" :
                break;
        }
    }

    requestData(shopId: string): DataIsRequestedEvent {
        console.log(`Command : requestData for ${shopId}`)
        const event = new DataIsRequestedEvent(shopId);
        this.history.push(event);
        this.apply(event)
        return event;
    }

    receiveData(shopData: ShopData): any {
        console.log(`Command : receiveData for ${shopData.shopId}`)
        const shopIndex = this.state.shopsBeingRequested.findIndex((el) => el === shopData.shopId);
        let event: Event;
        if (shopIndex >= 0) {
            event = new ShopDataReceivedEvent(shopData.shopId);
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