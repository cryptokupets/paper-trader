import * as request from "request-promise-native";

const BASE_URL = "https://api.hitbtc.com/api/2/";

export interface ICandle {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface ITicker {
    ask: number;
    bid: number;
}

function convertPeriod(period: number): string {
    let timeframe;
    switch ("" + period) {
        case "1":
            timeframe = "M1";
            break;

        case "3":
            timeframe = "M3";
            break;

        case "5":
            timeframe = "M5";
            break;

        case "15":
            timeframe = "M15";
            break;

        case "30":
            timeframe = "M30";
            break;

        case "60":
            timeframe = "H1";
            break;

        case "240":
            timeframe = "H4";
            break;
    }
    return timeframe;
}

export class Hitbtc {
    public static async getCandles({
        currency,
        asset,
        period, // в минутах
        end, // исключая
        limit,
    }: {
        currency: string;
        asset: string;
        period: number;
        end: string;
        limit: number; // не более 1000
    }): Promise<ICandle[]> {
        const options = {
            baseUrl: BASE_URL,
            url: `public/candles/${asset.toUpperCase()}${currency.toUpperCase()}`,
            qs: {
                period: convertPeriod(period),
                sort: "DESC",
                till: end,
                limit,
            },
        };

        return limit
            ? (JSON.parse(await request.get(options)) as Array<{
                  timestamp: string;
                  open: string;
                  max: string;
                  min: string;
                  close: string;
                  volume: string;
              }>).map((e) => {
                  return {
                      time: e.timestamp,
                      open: +e.open,
                      high: +e.max,
                      low: +e.min,
                      close: +e.close,
                      volume: +e.volume,
                  };
              })
            : [];
    }

    public static async getTicker({
        currency,
        asset,
    }: {
        currency: string;
        asset: string;
    }): Promise<ITicker> {
        const options = {
            baseUrl: BASE_URL,
            url: `public/ticker/${asset.toUpperCase()}${currency.toUpperCase()}`,
        };

        const {
            ask,
            bid,
        }: {
            ask: string;
            bid: string;
        } = JSON.parse(await request.get(options));

        return {
            ask: +ask,
            bid: +bid,
        };
    }
}
