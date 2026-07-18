// Runs blocking in <head> so a stored light preference applies before first
// paint (no dark flash). Dark is the default and needs no attribute. Kept as
// a same-origin file because the CSP forbids inline scripts.
;(function () {
  try {
    if (localStorage.getItem('jw-theme') === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
      var m = document.querySelector('meta[name="theme-color"]')
      if (m) m.setAttribute('content', '#f4f1ea')
    }
  } catch (e) {
    /* storage unavailable: stay dark */
  }
})()
