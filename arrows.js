/* Little arrow icon. Wherever the site shows an arrow character (→ or ←), this swaps in one small icon that takes the
   colour and size of the text around it. It runs on every page, including cards drawn by other scripts. */
(function(){
  if (window.__hsvArrows) return; window.__hsvArrows = true;
  var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>" +
            "<path d='M1 12H13.5' stroke='#000' stroke-width='2.2' fill='none'/><path d='M11 4C12.9 8.6 16.8 11 23 12C16.8 13 12.9 15.4 11 20C12.4 16 12.4 8 11 4Z' fill='#000'/></svg>";
  var url = "url(\"data:image/svg+xml," + encodeURIComponent(svg) + "\")";
  var st = document.createElement('style');
  st.textContent = ".hsv-ar{display:inline-block;width:1.2em;height:1.2em;vertical-align:-.25em;margin:-.2em 0;background:currentColor;" +
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
