import cex from "../config/cex";
import CEX from 'cexio-api-node';
import BigNumber from "bignumber.js";

export type OrderType = "buy"|"sell";

export const DeviseNames = ["EUR", "USD", "BTC", "BCH", "ETH", "XRP", "LTC", "DASH", "DOGE", "ADA", "SHIB"] as const;

type DeviseReadOnly = typeof DeviseNames
type ElementType < T extends ReadonlyArray < unknown > > = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never

export type Devise = ElementType<typeof DeviseNames>

export interface AccountBalanceValue {
  available: BigNumber, orders: BigNumber
}

type record = Record<Devise, AccountBalanceValue>

export interface AccountBalance {
  timestamp: number,
  balances: record
}

export interface ShortOrder {
  id: string,
  time: number,
  type: OrderType,
  price: BigNumber,
  amount: BigNumber,
  pending: BigNumber | null,
  symbol1: Devise,
  symbol2: Devise
}

export interface Ticker {
  timestamp: BigNumber,
  low: BigNumber,
  high: BigNumber,
  last: BigNumber,
  volume: BigNumber,
  volume30d: BigNumber,
  bid: number,
  ask: number,
  priceChange: BigNumber,
  priceChangePercentage: BigNumber,
  pair: string
}
const RETRIES = 3;

export default class Cex {

  public static instance = new Cex();
  cexAuth: any;
  private constructor() {
    this.cexAuth = new CEX(cex.clientId, cex.api, cex.secret).promiseRest;
  }

  asBigNumber(str: string): BigNumber {
    return new BigNumber(str || "0");
  }

  setAvailableOrders(objIn: any, objOut: record): void {
    const keys_in_objIn = Object.keys(objIn);

    DeviseNames.forEach(name => {
      if(!keys_in_objIn.includes(name)) console.error("Invalid name, not found in the keys: " + name, keys_in_objIn);

      const value = objIn[name];
      if(value && value.available && value.orders) {
        objOut[name] = {
          available: new BigNumber(value.available),
          orders: new BigNumber(value.orders) 
        }
      }
    });
  }

  private toShortOrder(raw: any): ShortOrder {
    const obj: any = {};
    ["id", "type", "symbol1", "symbol2"].forEach(k => obj[k] = raw[k]);
    ["time"].forEach(k => obj[k] = parseInt(raw[k] || 0));
    ["price","amount","pending"].forEach(k => obj[k] = new BigNumber(raw[k]));
    return obj;
  }

  private wrap<TYPE>(promise:Promise<TYPE>): Promise<TYPE> {
    return new Promise((resolve, reject) => {
      promise.then(d => setTimeout(() => resolve(d), 1500))
      .catch(err => setTimeout(() => reject(err), 1500));
    })
  }

  open_orders = async (): Promise<ShortOrder[]> => {
    const result: any[] = await this.wrap(this.cexAuth.open_orders(null));
    if(result && result.length > 0) return result.map(o => this.toShortOrder(o));
    return [];
  }

  place_order = async (left: Devise, right: Devise, type: OrderType, amount: number, price: number): Promise<ShortOrder> => {
    //will try at most 3 times in case of connection reset
    return this.place_order_check(left, right, type, amount, price, RETRIES);
  }

  private async place_order_check(left: Devise, right: Devise, type: OrderType, amount: number, price: number, number_retry: number): Promise<ShortOrder> {
    try {
      const order = await this.wrap(this.cexAuth.place_order(left+"/"+right, type, amount, price, null));
      return this.toShortOrder(order);
    } catch(e) {
      const error = `${e}`;
      if(!number_retry || number_retry < 0 || !(error.indexOf("CONN") >= 0)) throw e;
      const retries = number_retry - 1;
      await this.wait((RETRIES - retries) * 1000);
      return await this.place_order_check(left, right, type, amount, price, retries);
    }
  }

  cancel_order = async (id: string): Promise<boolean> => {
    return !!(await this.wrap(this.cexAuth.cancel_order(id)));
  }

  account_balance = async (): Promise<AccountBalance> => {
    const result: any = await this.wrap(this.cexAuth.account_balance());
    var object: AccountBalance = {
      timestamp: parseInt(result.timestamp),
      balances: {} as record
    };

    //take every Devises
    DeviseNames.forEach(value => object.balances[value] = { available: new BigNumber(0), orders: new BigNumber(0) })

    this.setAvailableOrders(result, object.balances);
    return object;
  }

  private async wait(time: number): Promise<void> {
    if(time <= 0) return;

    return new Promise((resolve) => {
      console.log(`waiting for ${time}ms`);
      setTimeout(() => resolve(), time);
    })
  }

  ticker = async (left: Devise, right: Devise): Promise<Ticker> => {
    const result: any = await this.wrap(this.cexAuth.ticker(left+"/"+right));
    const obj: any = { pair: result.pair };
    ["timestamp", "low", "high", "last", "volume",
      "volume30d", "bid", "ask", "priceChange",
      "priceChangePercentage"].forEach(k => obj[k] = new BigNumber(result[k]));

    return obj;    
  }
}