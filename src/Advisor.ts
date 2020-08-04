import { EventEmitter } from "events";
import moment from "moment";
import "moment-round";
import { Hitbtc, ICandle } from "./Hitbtc";
import { IndicatorService } from "./IndicatorService";
import { StrategyDataItem } from "./StrategyDataItem";
import { Timer } from "./Timer";

export interface IAdvice {
    time: string;
    side: string;
}

export class Advisor extends EventEmitter {
    public exchange: string;
    public currency: string;
    public asset: string;
    public period: number;
    public indicatorInputs: Array<{
        key: string;
        name: string;
        options: number[];
    }>;
    public warmup: number;
    public strategy: (data: StrategyDataItem[]) => string;

    private timer: Timer;
    private side?: string;
    private strategyData: StrategyDataItem[] = [];

    public constructor(data?: {
        exchange?: string;
        currency?: string;
        asset?: string;
        period?: number;
        indicatorInputs?: Array<{
            key: string;
            name: string;
            options: number[];
        }>;
        warmup?: number;
        strategy?: (data: StrategyDataItem[]) => string;
    }) {
        super();
        Object.assign(this, data);
    }

    public start() {
        // при наступлении времени загрузить свечи в нужном количестве, вычислить необходимые индикаторы, получить один совет, если изменился, то сгенерировать событие
        const {
            exchange,
            currency,
            asset,
            period,
            indicatorInputs,
            warmup,
            strategy,
        } = this;

        const timer = new Timer({ period });
        timer.onTime(async (time) => {
            // загрузить свечи
            // здесь известно нужное количество, поэтому лучше передавать не начало и конец, а количество данных
            const endMoment = moment.utc().floor(period, "minutes");
            const indicatorsStart = indicatorInputs
                .map((e) => IndicatorService.getStart(e))
                .reduce((previousValue, currentValue) =>
                    Math.max(previousValue, currentValue)
                );

            const limit = indicatorsStart + warmup + 1;
            const candles: ICandle[] = await Hitbtc.getCandles({
                currency,
                asset,
                period,
                end: endMoment.toISOString(),
                limit,
            });
            // текущее время не должно попадать, т.к. время здесь соответствует началу интервала
            const strategyData: StrategyDataItem[] = [];

            for (let i = 0; i <= warmup; i++) {
                // вычислить индикаторы
                // сервис индикаторов должен вернуть нужное число точек
                const strategyCandles = candles.slice(i); // FIXME
                const indicators = await IndicatorService.calculate(
                    strategyCandles,
                    indicatorInputs
                );
                const strategyDataItem: StrategyDataItem = new StrategyDataItem(
                    {
                        time: strategyCandles[0].time,
                        indicators,
                    }
                );
                strategyData.push(strategyDataItem);
            }

            // вычислить совет
            const side = strategy(strategyData);

            // сравнить с прошлым советом
            if (side !== this.side) {
                this.side = side;
                this._emitAdvice({ time, side });
            }
        });
        this.timer = timer;
        this.timer.start();
    }

    public stop() {
        this.timer.stop();
    }

    public onAdvice(listner: (advice: IAdvice) => void) {
        this.on("advice", listner);
    }

    public offAdvice(listner: (advice: IAdvice) => void) {
        this.off("advice", listner);
    }

    private _emitAdvice(advice: IAdvice) {
        this.emit("advice", advice);
    }
}
