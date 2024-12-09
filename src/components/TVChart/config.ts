export const SUPPORTED_RESOLUTIONS = {
  1: "1m",
  5: "5m",
  15: "15m",
  30: "30m",
  60: "1h",
  120: "2h",
  240: "4h",
  360: "6h",
  480: "8h",
  1440: "1d",
};

export const FAVORITES_INTERVAL = ["5", "15", "60", "240", "1440"];

export const CHART_PERIODS = {
  "1m": 60,
  "5m": 60 * 5,
  "15m": 60 * 15,
  "30m": 60 * 30,
  "1h": 60 * 60,
  "2h": 60 * 60 * 2,
  "4h": 60 * 60 * 4,
  "6h": 60 * 60 * 6,
  "8h": 60 * 60 * 8,
  "1d": 60 * 60 * 24,
};

export const LAST_BAR_REFRESH_INTERVAL = 15000; // 15 seconds
export const TV_CHART_RELOAD_INTERVAL = 15 * 60 * 1000; // 15 minutes
export const DEFAULT_LIBRARY_URL =
  "https://chart.oraidex.io/charting_library.standalone.js";

export const EVENT_CHART_SOCKET = "updateChart";

const RED = "#fa3c58";
const GREEN = "#0ecc83";
export const DEFAULT_PERIOD = "4h";
export const DARK_BACKGROUND_CHART = "#1b1c1a";
export const LIGHT_BACKGROUND_CHART = "#fff";

export enum PERIOD_TO_MINUTE {
  "1m" = 1,
  "5m" = 5,
  "15m" = 15,
  "30m" = 30,
  "1h" = 60,
  "2h" = 120,
  "4h" = 240,
  "6h" = 360,
  "8h" = 480,
  "24h" = 1440,
}

const chartStyleOverrides = [
  "candleStyle",
  "hollowCandleStyle",
  "haStyle",
].reduce((acc, cv) => {
  acc[`mainSeriesProperties.${cv}.drawWick`] = true;
  acc[`mainSeriesProperties.${cv}.drawBorder`] = false;
  acc[`mainSeriesProperties.${cv}.upColor`] = GREEN;
  acc[`mainSeriesProperties.${cv}.downColor`] = RED;
  acc[`mainSeriesProperties.${cv}.wickUpColor`] = GREEN;
  acc[`mainSeriesProperties.${cv}.wickDownColor`] = RED;
  acc[`mainSeriesProperties.${cv}.borderUpColor`] = GREEN;
  acc[`mainSeriesProperties.${cv}.borderDownColor`] = RED;
  return acc;
}, {});

const chartOverrides = {
  "paneProperties.background": "#16182e",
  "paneProperties.backgroundGradientStartColor": "#16182e",
  "paneProperties.backgroundGradientEndColor": "#16182e",
  "paneProperties.backgroundType": "solid",
  "paneProperties.vertGridProperties.style": 2,
  "paneProperties.horzGridProperties.style": 2,
  "mainSeriesProperties.priceLineColor": "#3a3e5e",

  "mainSeriesProperties.showCountdown": false,

  "mainSeriesProperties.barStyle.dontDrawOpen": true,
  "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,
  "mainSeriesProperties.hollowCandleStyle.drawWick": false,
  "mainSeriesProperties.haStyle.barColorsOnPrevClose": false,
  // "paneProperties.legendProperties.showSeriesTitle": false,
  "paneProperties.legendProperties.showSeriesOHLC": true,
  "paneProperties.legendProperties.showStudyTitles": true,
  // "paneProperties.legendProperties.showStudyValues": true,
  "paneProperties.topMargin": 12,
  "paneProperties.bottomMargin": 2,
  "scalesProperties.fontSize": 12,
  "scalesProperties.showSymbolLabels": false,
  "scalesProperties.showStudyLastValue": false,
  ...chartStyleOverrides,
};

export const defaultChartProps = {
  locale: "en",
  library_path: "https://chart.oraidex.io/",
  clientId: "tradingview.com",
  userId: "public_user_id",
  fullscreen: true,
  overrides: chartOverrides,
  disabled_features: ["use_localstorage_for_settings"],
  enabled_features: [],
  favorites: {
    intervals: FAVORITES_INTERVAL,
  },
  drawings_access: {
    type: "black" as "black" | "white",
    tools: [{ name: "Regression Trend", grayed: true }],
  },
};

// export const customConfigChart = {
//     symbol: name,
//     debug: false,
//     datafeed: getDataFeed({ pairIndex, name, token, customPeriodParams }),
//     theme: "dark",
//     locale: "en",
//     container: elem,
//     library_path: `${location.protocol}//${location.host}/libraries/charting_library/`,
//     loading_screen: {
//       backgroundColor: "#111114",
//       foregroundColor: "#111114",
//     },
//     enabled_features: enabledFeatures,
//     disabled_features: disabledFeatures,
//     client_id: "tradingview.com",
//     user_id: "public_user_id",
//     fullscreen: false,
//     autosize: true,
//     custom_css_url: "/tradingview-chart.css",
//     overrides: chartOverrides,
//     interval: "1D" as ResolutionString,
//   };
