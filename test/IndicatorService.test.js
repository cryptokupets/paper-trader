require("mocha");
const { assert } = require("chai");
const { IndicatorService } = require("../lib/IndicatorService");

describe.skip("IndicatorService", () => {
    it.skip("test", function (done) {
        this.timeout(5000);
        // TODO добавить отдельный класс Advisor, который генерирует события совет
        // TODO при первом запуске не должно быть трейдов задним числом, только в текущий момент
        // это значит, что необходимо загрузить первоначальные данные, оставить только нужные для расчета и вычислить совет
        const service = new IndicatorService({
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
        });
        service.onData((data) => {
            console.log(data);
        });
        service.start();

        setTimeout(() => {
            service.stop().then(() => {
                done();
            });
        }, 1000);
    });
});
