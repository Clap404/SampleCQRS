import {ShopId, SynchronizationAggregate} from "./SynchronizationAggregate";
import {PubSub} from "./PubSub";

export class SynchronizationCommandHandler {
    constructor(private pubSub: PubSub, private aggregate: SynchronizationAggregate) {
    }

    updateUrl(shopId: ShopId, url: string) {
        const event = this.aggregate.updateUrl(shopId, url);
        this.pubSub.publish(event);
    }
}