window.createChartWidget = function(config) {
  console.log("createChartWidget called with config:", config);
  
  var container = document.getElementById(config.containerId);
  if (!container) {
    console.error('Container element not found');
    return;
  }

  var chartContainer = document.createElement('div');
  chartContainer.id = 'chart-container';
  chartContainer.style.height = '100%';
  chartContainer.style.width = '100%';
  chartContainer.style.position = 'relative';
  container.appendChild(chartContainer);

  var chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth,
    height: chartContainer.clientHeight,
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
      pressedMouseMove: false,
      horzTouchDrag: false,
      vertTouchDrag: false,
    },
    handleScale: {
      axisPressedMouseMove: false,
      mouseWheel: false,
      pinch: false,
    },
  });

  var areaSeries = chart.addAreaSeries({
    topColor: '#06cbf8',
    bottomColor: 'rgba(6, 203, 248, 0.28)',
    lineColor: '#06cbf8',
    lineWidth: 2,
    crossHairMarkerVisible: false,
  });

  var legend = document.createElement('div');
  legend.id = 'legend';
  legend.style.position = 'absolute';
  legend.style.top = '10px';
  legend.style.left = '10px';
  legend.style.zIndex = '1';
  legend.style.fontSize = '14px';
  legend.style.fontFamily = 'Arial, sans-serif';
  legend.style.color = 'white';
  chartContainer.appendChild(legend);

  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    if (config.currentRange === '1D') {
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
        setLegendText(config.ticker, formatDate(lastData.time), formatPrice(lastData.value));
      }
      return;
    }
    const price = param.seriesData.get(areaSeries);
    if (price) {
      setLegendText(config.ticker, formatDate(param.time), formatPrice(price.value));
    }
  });

  async function fetchStockData(range) {
    console.log("Fetching stock data for range:", range);
    
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

    try {
      const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${config.ticker}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?apiKey=${apiKey}`);
      const data = await response.json();
      console.log("Data fetched:", data);
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

  async function setChartRange(range) {
    console.log("Setting chart range to:", range);
    
    config.currentRange = range;
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
      setLegendText(config.ticker, formatDate(lastData.time), formatPrice(lastData.value));
    }
    chart.timeScale().fitContent();
  }

  setChartRange('1D'); // Set 1D as default

  var buttonContainer = document.createElement('div');
  buttonContainer.id = 'buttons-container';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexDirection = 'row';
  buttonContainer.style.gap = '8px';
  buttonContainer.style.position = 'absolute';
  buttonContainer.style.bottom = '10px';
  buttonContainer.style.left = '10px';
  chartContainer.appendChild(buttonContainer);

  ['1D', '1W', '1M', '1Y'].forEach(range => {
    var button = document.createElement('button');
    button.innerText = range;
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '12px';
    button.style.padding = '6px 12px';
    button.style.border = 'none';
    button.style.backgroundColor = 'rgba(6, 203, 248, 0.5)';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.color = 'black';
    button.addEventListener('click', () => setChartRange(range));
    buttonContainer.appendChild(button);
  });

  var toggleContainer = document.createElement('div');
  toggleContainer.id = 'toggle-container';
  toggleContainer.style.display = 'flex';
  toggleContainer.style.flexDirection = 'row';
  toggleContainer.style.gap = '8px';
  toggleContainer.style.position = 'absolute';
  toggleContainer.style.bottom = '10px';
  toggleContainer.style.right = '10px';
  chartContainer.appendChild(toggleContainer);

  var priceButton = document.createElement('button');
  priceButton.id = 'toggle-price';
  priceButton.innerText = '$';
  priceButton.style.fontFamily = 'Arial, sans-serif';
  priceButton.style.fontSize = '12px';
  priceButton.style.padding = '6px 12px';
  priceButton.style.border = 'none';
  priceButton.style.backgroundColor = 'rgba(6, 203, 248, 0.5)';
  priceButton.style.borderRadius = '5px';
  priceButton.style.cursor = 'pointer';
  priceButton.style.color = 'black';
  toggleContainer.appendChild(priceButton);

  var percentageButton = document.createElement('button');
  percentageButton.id = 'toggle-percentage';
  percentageButton.innerText = '%';
  percentageButton.style.fontFamily = 'Arial, sans-serif';
  percentageButton.style.fontSize = '12px';
  percentageButton.style.padding = '6px 12px';
  percentageButton.style.border = 'none';
  percentageButton.style.backgroundColor = 'rgba(6, 203, 248, 0.5)';
  percentageButton.style.borderRadius = '5px';
  percentageButton.style.cursor = 'pointer';
  percentageButton.style.color = 'black';
  toggleContainer.appendChild(percentageButton);

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

  console.log("Chart widget initialized.");
};
