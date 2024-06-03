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

    // Load the Lightweight Charts library
    loadScript('https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js', function() {
      console.log('Loaded lightweight-charts library');
      
      var container = document.getElementById(containerId);
      if (!container) {
        console.error('Container element not found');
        return;
      }

      container.innerHTML = `
        <div id="chart" style="height: calc(100% - 40px); width: 100%; position: relative;"></div>
        <div id="controls-container" style="height: 40px; display: flex; justify-content: center; align-items: center;">
          <button class="chart-button" data-range="1D">1D</button>
          <button class="chart-button" data-range="1W">1W</button>
          <button class="chart-button" data-range="1M">1M</button>
          <button class="chart-button" data-range="1Y">1Y</button>
        </div>
      `;
      var chartElement = document.getElementById('chart');
      console.log('Container for chart initialized');

      const chart = LightweightCharts.createChart(chartElement, {
        width: chartElement.clientWidth,
        height: chartElement.clientHeight,
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

      fetchStockData(ticker, '1D').then(data => {
        console.log('Data fetched:', data);
        areaSeries.setData(data);
      }).catch(error => {
        console.error('Error fetching data:', error);
      });

      function fetchStockData(ticker, range) {
        const apiKey = '9htrZy1d7DYcG21DJKi6YwCo1_rCMfN8';
        const now = new Date();
        let fromDate;
        let multiplier;
        let timespan;

        switch (range) {
          case '1D':
            fromDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); 
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

        console.log(`Fetching data from ${fromDate} to ${toDate} for ticker ${ticker}`);

        return fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?apiKey=${apiKey}`)
          .then(response => response.json())
          .then(data => {
            if (data.results) {
              const results = data.results.map(item => ({
                time: item.t / 1000,
                value: item.c,
              }));

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
            throw error;
          });
      }

      document.querySelectorAll('.chart-button').forEach(button => {
        button.addEventListener('click', function() {
          const range = this.getAttribute('data-range');
          fetchStockData(ticker, range).then(data => {
            areaSeries.setData(data);
          });
        });
      });
    });
  }

  window.createChartWidget = function(config) {
    createChart(config.containerId, config.ticker);
  };
})();
