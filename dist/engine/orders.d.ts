import { Database } from '../database';
import Order from '../database/models/order';
import { AbstractExchange } from '../exchanges/AbstractExchange';
import { Devise } from '../exchanges/defs';
export default class Orders {
    private exchange;
    private database;
    private loaded;
    private orders;
    constructor(exchange: AbstractExchange, database: Database);
    list(from: Devise, to: Devise): Promise<{
        from: Devise;
        to: Devise;
        orders: Order[];
    }>;
    init(): Promise<void>;
    fetch(from: Devise, to: Devise): Promise<Order[]>;
    filter(from: Devise, to: Devise): Order[];
}
