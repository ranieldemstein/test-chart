document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const stockTicker = urlParams.get('ticker') || 'AAPL';

  async function fetchStockData(range) {
    const apiKey = '9htrZy1d7DYcG21DJKi6YwCo1_rCMfN8';
    const now = new Date();
    let fromDate;
    let multiplier;
    let timespan;

    switch (range) {
      case '1D':
        fromDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // Look back up to 5 days
        multiplier = 5;
        timespan = 'minute';
        break;
      case '1W':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        multiplier = 30;
        timespan = 'minute';
        break;
      case '1M':
        fromDate = new Date(now.getTime());
        fromDate.setMonth(now.getMonth() - 1);
        multiplier = 1;
        timespan = 'day';
        break;
      case '1Y':
        fromDate = new Date(now.getTime());
        fromDate.setFullYear(now.getFullYear() - 1);
        multiplier = 1;
        timespan = 'day';
        break;
      default:
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        multiplier = 5;
        timespan = 'minute';
    }

    fromDate = fromDate.toISOString().split('T')[0];
    const toDate = new Date().toISOString().split('T')[0];

    console.log(`Fetching data from ${fromDate} to ${toDate} for range ${range}`);

    try {
      const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${stockTicker}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?apiKey=${apiKey}`);
      const data = await response.json();
      console.log('Data fetched:', data);

      if (data.results) {
        const results = data.results.map(item => ({
          time: item.t / 1000,
          value: item.c,
        }));

        // Filter for the most recent market day
        if (range === '1D') {
          const latestDay = new Date(Math.max(...results.map(item => item.time * 1000)));
          const startOfDay = new Date(latestDay.setHours(0, 0, 0, 0));
          const endOfDay = new Date(latestDay.setHours(23, 59, 59, 999));
          return results.filter(item => item.time * 1000 >= startOfDay && item.time * 1000 <= endOfDay);
        }

        return results;
      } else {
        console.error('No data results', data);
        return [];
      }
    } catch (error) {
      console.error('Fetch error', error);
      return [];
    }
  }

  function createStockChart() {
    const chartElement = document.getElementById('chart');
    if (!chartElement) {
      console.error('Chart element not found');
      return;
    }

    const chart = LightweightCharts.createChart(chartElement, {
      width: chartElement.clientWidth,
      height: 550,
      layout: {
        textColor: 'white',
        background: { type: 'solid', color: 'transparent' },
      },
      rightPriceScale: {
        scaleMargins: {
          top: 0.4,
          bottom: 0.15,
        },
      },
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: false,
        },
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: false,
        pinch: false,
      },
    });

    const areaSeries = chart.addAreaSeries({
      topColor: '#06cbf8',
      bottomColor: 'rgba(6, 203, 248, 0.28)',
      lineColor: '#06cbf8',
      lineWidth: 2,
      crossHairMarkerVisible: false,
    });

    const legend = document.getElementById('legend');
    const symbolName = stockTicker;

    function formatDate(timestamp) {
      const date = new Date(timestamp * 1000);
      if (currentRange === '1D') {
        return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      } else {
        return date.toLocaleDateString('en-US');
      }
    }

    function formatPrice(price) {
      return price.toFixed(2);
    }

    function setLegendText(name, date, price) {
      legend.innerHTML = `<div style="font-size: 18px; font-weight: bold;">${name}</div>
                          <div>${date}</div>
                          <div style="font-size: 24px; margin-top: 5px;">${price}</div>`;
    }

    chart.subscribeCrosshairMove(param => {
      if (!param || !param.time) {
        const lastData = areaSeries.data().slice(-1)[0];
        if (lastData) {
          setLegendText(symbolName, formatDate(lastData.time), formatPrice(lastData.value));
        }
        return;
      }
      const price = param.seriesData.get(areaSeries);
      if (price) {
        setLegendText(symbolName, formatDate(param.time), formatPrice(price.value));
      }
    });

    async function setChartRange(range) {
      currentRange = range;
      const stockData = await fetchStockData(range);
      areaSeries.setData(stockData);
      if (range === '1D') {
        chart.applyOptions({
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: (time, tickMarkType, locale) => {
              const date = new Date(time * 1000);
              return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            },
          },
        });
      } else {
        chart.applyOptions({
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: (time, tickMarkType, locale) => {
              const date = new Date(time * 1000);
              return date.toLocaleDateString('en-US');
            },
          },
        });
      }
      const lastData = stockData[stockData.length - 1];
      if (lastData) {
        setLegendText(symbolName, formatDate(lastData.time), formatPrice(lastData.value));
      }
      chart.timeScale().fitContent();
    }

    setChartRange('1D'); // Set 1D as default

    const container = document.getElementById('buttons-container');
    const ranges = ['1D', '1W', '1M', '1Y'];
    ranges.forEach(range => {
      const button = document.createElement('button');
      button.innerText = range;
      button.style = 'font-family: Arial, sans-serif; font-size: 16px; padding: 8px 16px; margin: 5px; border: none; background-color: #f0f3fa; border-radius: 5px; cursor: pointer;';
      button.addEventListener('click', () => setChartRange(range));
      button.addEventListener('mouseover', () => button.style.backgroundColor = '#e0e3eb');
      button.addEventListener('mouseout', () => button.style.backgroundColor = '#f0f3fa');
      button.addEventListener('mousedown', () => button.style.backgroundColor = '#d0d3db');
      button.addEventListener('mouseup', () => button.style.backgroundColor = '#e0e3eb');
      container.appendChild(button);
    });

    const priceButton = document.getElementById('toggle-price');
    const percentageButton = document.getElementById('toggle-percentage');

    priceButton.addEventListener('click', () => {
      chart.priceScale('right').applyOptions({
        mode: LightweightCharts.PriceScaleMode.Normal,
      });
    });

    percentageButton.addEventListener('click', () => {
      chart.priceScale('right').applyOptions({
        mode: LightweightCharts.PriceScaleMode.Percentage,
      });
    });
  }

  createStockChart();
});
