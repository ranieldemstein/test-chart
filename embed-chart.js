(function() {
  window.createChartWidget = function(config) {
    var container = document.getElementById(config.containerId);
    if (!container) {
      console.error('Container element not found');
      return;
    }

    var iframe = document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.src = 'https://raw.githack.com/ranieldemstein/test-chart/main/index.html?ticker=' + encodeURIComponent(config.ticker);
    container.appendChild(iframe);
  };
})();
