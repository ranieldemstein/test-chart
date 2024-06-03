(function() {
  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = callback;
    script.onerror = function() {
      console.error('Error loading script:', src);
    };
    document.head.appendChild(script);
  }

  function initializeChartWidget(config) {
    loadScript('https://raw.githack.com/ranieldemstein/test-chart/main/stock-chart.js', function() {
      if (typeof window.createChartWidget === 'function') {
        window.createChartWidget(config);
      } else {
        console.error('Chart widget script did not load correctly.');
      }
    });
  }

  window.createChartWidget = initializeChartWidget;
})();
