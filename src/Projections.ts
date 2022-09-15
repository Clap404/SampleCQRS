import {ShopId, ShopUrlUpdatedEvent} from "./SynchronizationAggregate";

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

export class ShopAdminHandler {
    shopAdminRepo: ShopAdminRepository

    // # DependencyInjectionLife
    constructor(shopAdminRepo: ShopAdminRepository) {
        this.shopAdminRepo = shopAdminRepo
    }

    handleUrlUpdatedEvent(shopUrlUpdatedEvent: ShopUrlUpdatedEvent) {
        this.shopAdminRepo.set(shopUrlUpdatedEvent.shopId, {url: shopUrlUpdatedEvent.url})
    }
}

// DTO
export type ShopAdminProjection = {
    shopId: ShopId,
    url: string,
    name: string,
    lastUpdate: Date
}