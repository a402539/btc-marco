import './styles/main.scss';
import { init_ticker } from './components/ticker.js';
import { get_past_prices, request_again } from './request.js';
import { analysis } from './analysis.js';
import { Chart } from './obj/chart.js';
import { Curve } from './obj/graph.js';
import * as CONST from './CONST.js';

export var curr_interval = undefined;

/**
 * Initialization for the app. Creates the charts, fetches initial data.
 */
async function init () {
  /** Ticker name **/
  const name_text = document.createElement('span');
  name_text.classList.add('text');

  // Initialize something here to avoid spacing changing on load
  name_text.innerHTML = CONST.DEFAULT_TICKER;

  /** Ticker popup **/
  const ticker_wrapper = document.createElement('div');
  const ticker_popup_wrapper = document.createElement('div');
  const ticker_popup = document.createElement('div');

  ticker_popup_wrapper.classList.add('ticker_popup_wrapper');
  ticker_popup_wrapper.style.display = 'none';
  ticker_popup.classList.add('ticker_popup');

  ticker_wrapper.appendChild(name_text);
  ticker_wrapper.appendChild(ticker_popup_wrapper);
  ticker_popup_wrapper.appendChild(ticker_popup);

  /** Timescale **/
  const timescale_wrapper = document.createElement('div');

  /** Main container **/
  const main_container = document.createElement('div');
  main_container.classList.add('main');

  main_container.appendChild(ticker_wrapper);
  main_container.appendChild(timescale_wrapper);

  document.body.appendChild(main_container);

  /** Add charts **/
  let chart_price = new Chart (
    CONST.CHART_WIDTH, 
    CONST.CHART_HEIGHT, 
    CONST.CHART_WRAPPER_CLASS, 
    true
  );

  document.body.appendChild(chart_price.chart_wrapper);

  let chart_indicator_top = new Chart (
    CONST.CHART_WIDTH, 
    CONST.CHART_HEIGHT/2, 
    CONST.CHART_WRAPPER_CLASS_INDICATOR
  );
  document.body.appendChild(chart_indicator_top.chart_wrapper);

  let chart_indicator_bot = new Chart (
    CONST.CHART_WIDTH, 
    CONST.CHART_HEIGHT/2, 
    CONST.CHART_WRAPPER_CLASS_INDICATOR,
    true
  );

  document.body.appendChild(chart_indicator_bot.chart_wrapper);

  plot_ticker (
    CONST.DEFAULT_TICKER, 
    CONST.TIMESCALE_LIST[3],
    name_text, 
    chart_price, 
    chart_indicator_top, 
    chart_indicator_bot
  );

  // Fires off ticker popup setup
  init_ticker (
    name_text, 
    ticker_popup_wrapper, 
    ticker_popup,
    chart_price, 
    chart_indicator_top, 
    chart_indicator_bot
  );
}

/**
 * Plots the ticker and analysis on the charts. 
 * @param {string} ticker Ticker to plot. Must be valid in the Coinbase API
 */
export async function plot_ticker (
  ticker,
  timescale,
  name_text,
  chart_price,
  chart_indicator_top,
  chart_indicator_bot
) {
  // Draws the charts
  let data_response = await get_past_prices(ticker, timescale);
  let price_data = data_response.map(elem => (elem[1] + elem[2])/2);
  let time_data = data_response.map(elem => elem[0]);

  chart_price.plot_curve(
    new Curve(time_data, price_data), 
    'price', 
    CONST.BLUE_LIGHT, 
    CONST.LINE_WIDTH_XXXTRA_THIQQ,
    0.1
  );

  chart_price.add_layer(CONST.CHART_LAYER_OVERLAY);

  analysis(data_response, chart_price, chart_indicator_top, chart_indicator_bot);

  // Save this ticker value
  name_text.value = ticker;

  // Kicks off price fetching
  curr_interval = request_again(name_text, ticker);
}

// Startup the app
init();