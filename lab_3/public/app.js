(function() {
  const loadBtn = document.getElementById('loadBtn');
  const productsEl = document.getElementById('products');
  const statusEl = document.getElementById('status');

  function setStatus(text) {
    statusEl.textContent = 'Status: ' + text;
  }

  function renderProducts(list) {
    productsEl.innerHTML = '';
    if (!Array.isArray(list) || list.length === 0) {
      productsEl.innerHTML = '<p>No cars found.</p>';
      return;
    }
    list.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product';
      const name = escapeHtml(p.name || 'Unknown');
      const brand = escapeHtml(p.brand || 'Unknown');
      const id = escapeHtml(String(p.id || ''));
      const price = escapeHtml(String(p.price || ''));
      div.innerHTML = `<h3>${name}</h3><div>Brand: ${brand}</div><div>ID: ${id}</div><div>Price: $${price}</div>`;
      productsEl.appendChild(div);
    });
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, ch =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" })[ch]
    );
  }

  function loadProductsNative() {
    setStatus('Loading (native)...');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/products', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            renderProducts(data);
            setStatus('Success (native)');
          } catch (e) {
            setStatus('Parse error (native)');
          }
        } else {
          setStatus('Server error (native): ' + xhr.status);
        }
      }
    };
    xhr.send();
  }

  function loadProductsJQuery() {
    if (window.jQuery) {
      setStatus('Loading (jQuery)...');
      $.ajax({
        url: '/api/products',
        method: 'GET',
        dataType: 'json'
      }).done(data => {
        renderProducts(data);
        setStatus('Success (jQuery)');
      }).fail((jqXHR, textStatus) => {
        setStatus('Error (jQuery): ' + textStatus);
      });
      return;
    }

    
    setStatus('jQuery not found, using fetch fallback');
    fetch('/api/products')
      .then(resp => resp.json())
      .then(data => {
        renderProducts(data);
        setStatus('Success (fetch fallback)');
      })
      .catch(err => setStatus('Error (fetch fallback): ' + err.message));
  }

  function getSelectedMethod() {
    const radios = document.getElementsByName('method');
    for (let i=0; i<radios.length; i++) if (radios[i].checked) return radios[i].value;
    return 'native';
  }

  loadBtn.addEventListener('click', () => {
    const method = getSelectedMethod();
    productsEl.innerHTML = '';
    if (method === 'native') loadProductsNative();
    else loadProductsJQuery();
  });

})();
