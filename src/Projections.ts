import {DomainEvent, ShopId, ShopNameUpdatedEvent, ShopUrlUpdatedEvent} from "./SynchronizationAggregate";

export interface Handler {
    handleEvent(event: DomainEvent);
}

export class ShopAdminRepository {
    shopAdminProjectionRepository: {
        [key: ShopId]: ShopAdminProjection
    } = {}

    get(shopId: ShopId): ShopAdminProjection {
        return this.shopAdminProjectionRepository[shopId] || null;
    }

    set(shopId: ShopId, shopAdmin: Partial<ShopAdminProjection>): void {
        this.shopAdminProjectionRepository[shopId] = {
            ...this.shopAdminProjectionRepository[shopId],
            ...shopAdmin
        }
    }
}

export class ShopAdminHandler implements Handler{
    shopAdminRepo: ShopAdminRepository

    // # DependencyInjectionLife
    constructor(shopAdminRepo: ShopAdminRepository) {
        this.shopAdminRepo = shopAdminRepo
    }

    handleEvent(event: DomainEvent) {
        if(event instanceof ShopUrlUpdatedEvent) {
            this.handleUrlUpdatedEvent(event)
        } else if(event instanceof ShopNameUpdatedEvent) {
            this.handleNameUpdatedEvent(event)
        }
    }

    handleUrlUpdatedEvent(shopUrlUpdatedEvent: ShopUrlUpdatedEvent) {
        this.shopAdminRepo.set(shopUrlUpdatedEvent.shopId, {url: shopUrlUpdatedEvent.url})
    }

    handleNameUpdatedEvent(shopUrlUpdatedEvent: ShopNameUpdatedEvent) {
        this.shopAdminRepo.set(shopUrlUpdatedEvent.shopId, {name: shopUrlUpdatedEvent.name})
    }
}

// DTO
export type ShopAdminProjection = {
    shopId: ShopId,
    url: string,
    name: string,
    lastUpdate: Date
}