/* Little arrow icon. Wherever the site shows an arrow character (→ or ←), this swaps in one small icon that takes the
   colour and size of the text around it. It runs on every page, including cards drawn by other scripts. */
(function(){
  if (window.__hsvArrows) return; window.__hsvArrows = true;
  var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#000' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'>" +
            "<circle cx='3.6' cy='12' r='1.2' fill='#000' stroke='none'/><path d='M8 12h10'/><path d='M13.4 6.6L18.8 12l-5.4 5.4'/></svg>";
  var url = "url(\"data:image/svg+xml," + encodeURIComponent(svg) + "\")";
  var st = document.createElement('style');
  st.textContent = ".hsv-ar{display:inline-block;width:1.25em;height:1.25em;vertical-align:-.28em;margin:-.2em 0;background:currentColor;" +
    "-webkit-mask:" + url + " center/contain no-repeat;mask:" + url + " center/contain no-repeat;transition:transform .2s;}" +
    ".hsv-ar.l{transform:scaleX(-1);}";
  document.head.appendChild(st);

  var RE = /[→←]/, SKIP = /^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE|NOSCRIPT|CODE|PRE|SVG)$/;
  function skip(n){ for (; n && n.nodeType === 1; n = n.parentNode) { if (SKIP.test(n.nodeName.toUpperCase())) return true; if (n.isContentEditable) return true; } return false; }
  function swap(node){
    var parts = node.nodeValue.split(/([→←])/), frag = document.createDocumentFragment();
    parts.forEach(function(p){
      if (p === '→' || p === '←') { var i = document.createElement('span'); i.className = 'hsv-ar' + (p === '←' ? ' l' : ''); i.setAttribute('aria-hidden', 'true'); frag.appendChild(i); }
      else if (p) frag.appendChild(document.createTextNode(p));
    });
    node.parentNode.replaceChild(frag, node);
  }
  function run(root){
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, null), hit = [], n;
    while ((n = w.nextNode())) { if (RE.test(n.nodeValue) && !skip(n.parentNode)) hit.push(n); }
    hit.forEach(swap);
  }
  var queued = false;
  function later(){ if (queued) return; queued = true; (window.requestAnimationFrame || setTimeout)(function(){ queued = false; run(); }); }
  function start(){ run(); new MutationObserver(later).observe(document.body, {childList: true, subtree: true, characterData: true}); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
