(function() {
  var chartWidgetConfig = {
    ticker: 'AAPL',  // Default ticker
    containerId: 'chart-widget-container',  // ID of the container div
    srcUrl: 'https://raw.githack.com/ranieldemstein/test-chart/main/index.html'  // URL to your index.html
  };

  // Function to load the iframe with the chart
  function loadChartWidget() {
    var container = document.getElementById(chartWidgetConfig.containerId);
    if (!container) {
      console.error('Container element not found');
      return;
    }

    // Clear the container if there's any existing iframe
    container.innerHTML = '';

    var iframe = document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '500px';  // Set the height you desire
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.src = chartWidgetConfig.srcUrl + '?ticker=' + encodeURIComponent(chartWidgetConfig.ticker);
    container.appendChild(iframe);
  }

  // Load the chart widget on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    loadChartWidget();
  });
})();
