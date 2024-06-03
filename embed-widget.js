(function() {
  function loadChartWidget(config) {
    var container = document.getElementById(config.containerId);
    if (!container) {
      console.error('Container element not found');
      return;
    }

    // Clear the container if there's any existing chart
    container.innerHTML = '';

    var iframe = document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '500px'; // You can adjust this height as needed
    iframe.src = config.srcUrl + '?ticker=' + encodeURIComponent(config.ticker);

    container.appendChild(iframe);
  }

  window.createChartWidget = loadChartWidget;
})();
