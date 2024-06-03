(function() {
  console.log("Embed script loaded");
  
  var container = document.createElement('div');
  container.style.height = '100vh'; // Ensure the container fills the viewport height
  container.style.width = '100vw'; // Ensure the container fills the viewport width
  container.style.position = 'relative';
  container.style.overflow = 'hidden';  // Ensure no overflow issues
  console.log("Container created");

  var iframe = document.createElement('iframe');
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.src = 'https://raw.githack.com/ranieldemstein/test-chart/main/index.html?ticker=' + encodeURIComponent('AAPL'); // Change 'AAPL' to your default ticker
  iframe.allowTransparency = 'true';
  iframe.style.background = 'transparent';
  console.log("Iframe created with src: " + iframe.src);

  container.appendChild(iframe);
  document.body.appendChild(container);
  console.log("Iframe appended to container");
})();
