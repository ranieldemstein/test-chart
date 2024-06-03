(function() {
  var container = document.createElement('div');
  container.style.height = '100%';
  container.style.width = '100%';
  container.style.position = 'relative';

  var iframe = document.createElement('iframe');
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.src = 'https://raw.githack.com/your-github-username/ranieldemstein/main/index.html?ticker=' + encodeURIComponent('AAPL'); // Change 'AAPL' to your default ticker

  container.appendChild(iframe);
  document.body.appendChild(container);
})();
