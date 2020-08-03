require("mocha");
const { assert } = require("chai");
const { PaperTrader } = require("../lib/index");

describe("PaperTrader", () => {
    // TODO при первом запуске не должно быть трейдов задним числом, только в текущий момент
    // это значит, что необходимо загрузить первоначальные данные, оставить только нужные для расчета и вычислить совет
    it("test", function (done) {
        this.timeout(600000);
        const options = {
            currencyAvailable: 1,
            assetAvailable: 0,
            exchange: "hitbtc",
            currency: "USD",
            asset: "BTC",
            period: 1,
            indicatorInputs: [
                {
                    key: "max",
                    name: "max",
                    options: [2],
                },
            ],
            warmup: 1,
            strategy: (data) => {
                const max0 = data[0].indicator("max")[0];
                const max1 = data[1].indicator("max")[0];
                return max1 > max0 ? "buy" : "sell";
            },
        };

        const trader = new PaperTrader(options);
        trader.onTrade((trade) => {
            console.log(trade);
        });
        trader.start();

        setTimeout(() => {
            trader.stop().then(() => {
                done();
            });
        }, 590000);
    });
});
