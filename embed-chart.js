(function() {
  var container = document.createElement('div');
  container.style.height = '100%';
  container.style.width = '100%';
  container.style.position = 'relative';

  var iframe = document.createElement('iframe');
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.left = '0';

  // Get the ticker from the script tag data attribute
  var scriptTag = document.currentScript;
  var ticker = scriptTag.getAttribute('data-ticker') || 'AAPL';

  iframe.src = 'https://raw.githack.com/ranieldemstein/test-chart/main/index.html?ticker=' + encodeURIComponent(ticker);

  container.appendChild(iframe);
  document.body.appendChild(container);
})();
