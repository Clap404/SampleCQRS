import {AppendExpectedRevision} from "@eventstore/db-client";
import {Exclude} from "class-transformer";

export abstract class DomainEvent {
    @Exclude()
    sequenceNumber: AppendExpectedRevision

    constructor(public shopId: ShopId, sequenceNumber: AppendExpectedRevision) {
        this.sequenceNumber = sequenceNumber
    }
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
    constructor(shopId: ShopId, sequenceNumber: AppendExpectedRevision, public url: string) {
        super(shopId, sequenceNumber);
    }
}

export class ShopNameUpdatedEvent extends DomainEvent {
    constructor(shopId: ShopId, sequenceNumber: AppendExpectedRevision, public name: string) {
        super(shopId, sequenceNumber);
    }
}

enum RequestState {
    Requested,
    Received,
}

export class SynchronizationAggregate {

    state = {
        requestState: null,
        sequenceNumber: null
    };

    constructor(private shopId: ShopId, history?) {
        history?.forEach(el => this.apply(el));
    }

    apply(event: DomainEvent) {
        this.state.sequenceNumber = event.sequenceNumber;
        // we could check the sequence number as we re-hydrate the aggregate here
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
        const event = new ShopDataRequestedEvent(shopId, this.state.sequenceNumber);
        this.apply(event)
        return event;
    }

    receiveData(shopData: ShopData): any {
        console.log(`Command : receiveData for ${shopData.shopId}`)
        let event: DomainEvent;
        if (shopData.shopId !== this.shopId) {
            event = new BadShopIdDataReceivedEvent(shopData.shopId, this.state.sequenceNumber);
        } else if (this.state.requestState === RequestState.Requested) {
            event = new ShopDataReceivedEvent(shopData.shopId, this.state.sequenceNumber);
        } else if (this.state.requestState === RequestState.Received) {
            event = new ShopDataAlreadyReceivedEvent(shopData.shopId, this.state.sequenceNumber);
        }
        this.apply(event);
        return event;
    }

    updateUrl(shopId: ShopId, url: string): any {
        console.log(`Command : updateUrl for ${shopId}`)
        const event = new ShopUrlUpdatedEvent(shopId, this.state.sequenceNumber, url);
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