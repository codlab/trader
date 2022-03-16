"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradeConfigArray = void 0;
const configs = [
    {
        from: 'EUR',
        to: 'ETH',
        buy_coef: 0.995,
        sell_coef: 1.028,
        maximum_price_change_percent: 10,
        maximum_balance_used: 200,
    },
    {
        from: 'EUR',
        to: 'XRP',
        buy_coef: 0.995,
        sell_coef: 1.028,
        maximum_price_change_percent: 8,
        maximum_balance_used: 100,
    },
    {
        from: 'EUR',
        to: 'LTC',
        buy_coef: 0.995,
        sell_coef: 1.028,
        maximum_price_change_percent: 5,
        maximum_balance_used: 60,
    },
    {
        from: 'EUR',
        to: 'BTC',
        buy_coef: 0.995,
        sell_coef: 1.028,
        maximum_price_change_percent: 10,
        maximum_balance_used: 200,
    },
    {
        from: 'USD',
        to: 'DOGE',
        buy_coef: 0.995,
        sell_coef: 1.028,
        maximum_price_change_percent: 5,
        maximum_balance_used: 100,
    },
    {
        from: 'EUR',
        to: 'DASH',
        buy_coef: 0.995,
        sell_coef: 1.028,
        maximum_price_change_percent: 10,
        maximum_balance_used: 160,
    },
    {
        from: 'USD',
        to: 'ADA',
        buy_coef: 0.995,
        sell_coef: 1.028,
        maximum_price_change_percent: 5,
        maximum_balance_used: 60,
    },
    {
        from: 'USD',
        to: 'SHIB',
        buy_coef: 0.995,
        sell_coef: 1.028,
        maximum_price_change_percent: 20,
        maximum_balance_used: 200,
    },
    {
        from: 'USD',
        to: 'MANA',
        buy_coef: 0.985,
        sell_coef: 1.028,
        maximum_price_change_percent: 20,
        maximum_balance_used: 60,
    },
    {
        from: 'USD',
        to: 'OMG',
        buy_coef: 0.985,
        sell_coef: 1.028,
        maximum_price_change_percent: 20,
        maximum_balance_used: 60,
    },
    {
        from: 'USD',
        to: 'TRX',
        buy_coef: 0.985,
        sell_coef: 1.028,
        maximum_price_change_percent: 20,
        maximum_balance_used: 60,
    },
];
function getTradeConfigArray() {
    return configs.map((c) => (Object.assign({}, c)));
}
exports.getTradeConfigArray = getTradeConfigArray;
//# sourceMappingURL=TradeConfigArray.js.map