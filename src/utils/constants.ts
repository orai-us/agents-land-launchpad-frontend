import { ChartingLibraryFeatureset } from "@/charting_library";

const RED = "#FF6767";
const GREEN = "#47D0A5";
export const DEFAULT_PERIOD = "4h";

const chartStyleOverrides = [
  "candleStyle",
  "hollowCandleStyle",
  "haStyle",
].reduce((acc: Record<string, string | boolean>, cv) => {
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

export const chartOverrides = {
  "paneProperties.background": "#161a25",
  "paneProperties.backgroundGradientStartColor": "#161a25",
  "paneProperties.backgroundGradientEndColor": "#161a25",
  "paneProperties.backgroundType": "solid",
  "paneProperties.vertGridProperties.style": 2,
  "paneProperties.horzGridProperties.style": 2,
  "mainSeriesProperties.priceLineColor": "#3a3e5e",
  "paneProperties.topMargin": 12,
  "paneProperties.bottomMargin": 2,
  "scalesProperties.fontSize": 12,
  "scalesProperties.showSymbolLabels": true,
  "scalesProperties.showStudyLastValue": true,

  ...chartStyleOverrides,
};

export const disabledFeaturesOnMobile: ChartingLibraryFeatureset[] = [
  "header_saveload",
  "header_fullscreen_button",
  "left_toolbar",
];

export const disabledFeatures: ChartingLibraryFeatureset[] = [
  "volume_force_overlay",
  "create_volume_indicator_by_default",
  "header_compare",
  "display_market_status",
  "show_interval_dialog_on_key_press",
  "header_symbol_search",
  "header_quick_search",
  "popup_hints",
  "use_localstorage_for_settings",
  // "right_bar_stays_on_scroll",
  // "symbol_info",
];

export const enabledFeatures: ChartingLibraryFeatureset[] = [
  "side_toolbar_in_fullscreen_mode",
  "header_in_fullscreen_mode",
  "hide_left_toolbar_by_default",
  "items_favoriting",
  "study_templates",
  "study_symbol_ticker_description",
  "study_overlay_compare_legend_option",
  "go_to_date",
];
