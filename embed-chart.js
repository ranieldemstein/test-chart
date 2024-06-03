(function() {
  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = callback;
    script.src = src;
    document.head.appendChild(script);
  }

  function createChart(containerId, ticker) {
    console.log('Creating chart for ticker:', ticker);
    loadScript('https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js', function() {
      loadScript('https://raw.githack.com/ranieldemstein/test-chart/main/stock-chart.js', function() {
        // The container for the chart
        var container = document.getElementById(containerId);
        if (!container) {
          console.error('Container element not found');
          return;
        }

        container.innerHTML = '<div id="chart" style="height: 100%; width: 100%; position: relative;"></div>';
        var chartElement = document.getElementById('chart');

        const chart = LightweightCharts.createChart(chartElement, {
          width: container.clientWidth,
          height: container.clientHeight,
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

        // Fetch and set stock data
        fetchStockData(ticker, '1D').then(data => areaSeries.setData(data));

        function fetchStockData(ticker, range) {
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

          return fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?apiKey=${apiKey}`)
            .then(response => response.json())
            .then(data => {
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
            })
            .catch(error => {
              console.error('Fetch error', error);
              return [];
            });
        }
      });
    });
  }

  window.createChartWidget = function(config) {
    createChart(config.containerId, config.ticker);
  };
})();
