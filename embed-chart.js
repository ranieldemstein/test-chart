window.createChartWidget = function(config) {
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
      setLegendText(config.ticker, formatDate(param.time), formatP
