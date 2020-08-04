import { ICandle } from "exchange-service";
import * as tulind from "tulind";

interface IIndicatorItem {
    time: string;
    values: number[];
}

function getStart(name: string, options: number[]): number {
    return tulind.indicators[name].start(options) as number;
}

async function getIndicators(
    candles: ICandle[],
    name: string,
    options: number[]
): Promise<IIndicatorItem[]> {
    const indicatorOutputs = await (tulind.indicators[name].indicator(
        (tulind.indicators[name].input_names as string[]).map((e) =>
            candles.map((c) => (c as any)[e === "real" ? "close" : e])
        ),
        options
    ) as Promise<number[][]>); // некоторые индикаторы возвращают несколько рядов данных, например, MACD

    const length = indicatorOutputs[0].length;
    const indicators: IIndicatorItem[] = [];

    // перебирать начиная с последнего элемента
    for (let i = 1; i <= length; i++) {
        indicators.push({
            time: candles[candles.length - i].time,
            values: indicatorOutputs.map((e) => e[length - i]),
        });
    }

    return indicators.reverse();
}

export class IndicatorService {
    public static getStart({
        name,
        options,
    }: {
        name: string;
        options: number[];
    }): number {
        return getStart(name, options);
    }
    // вычисляет только одну точку
    public static async calculate(
        candles: ICandle[], // на входе должно быть в обратном порядке
        indicatorInputs: Array<{
            key: string;
            name: string;
            options: number[];
        }>
    ): Promise<
        Array<{
            key: string;
            name: string;
            options: number[];
            outputs: number[];
        }>
    > {
        return Promise.all(
            indicatorInputs.map(
                (indicatorInput) =>
                    new Promise<{
                        key: string;
                        name: string;
                        options: number[];
                        outputs: number[];
                    }>((resolve) => {
                        const { key, name, options } = indicatorInput;
                        const start = 1 + getStart(name, options);
                        const candles1 = candles
                            .slice(0, start)
                            .reverse();
                        if (candles1.length < start) {
                            resolve({
                                key,
                                name,
                                options,
                                outputs: [],
                            });
                        } else {
                            getIndicators(candles1, name, options).then(
                                (indicatorOutput) => {
                                    resolve({
                                        key,
                                        name,
                                        options,
                                        outputs: indicatorOutput[0].values,
                                    });
                                }
                            );
                        }
                    })
            )
        );
    }
}
