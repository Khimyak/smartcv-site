// fix-inputs.js — stabilize iPhone text input focus
(function(){
  document.addEventListener('focusin',function(e){
    const t=e.target;if(!t)return;
    if(['INPUT','TEXTAREA'].includes(t.tagName)){
      t.setAttribute('autocapitalize','off');
      t.setAttribute('autocorrect','off');
      t.setAttribute('spellcheck','false');
      t.setAttribute('autocomplete','off');
      if(!t.hasAttribute('inputmode'))t.setAttribute('inputmode','text');
    }
  },true);
})();

// === SmartCV caret/paypal FINAL PATCH BEGIN ===
// Force LTR/plaintext so text doesn't reverse on iOS when typing
(function(){
  'use strict';
  function injectLTRCSS(){
    var css = "input,textarea{direction:ltr !important;unicode-bidi:plaintext !important;text-align:left !important}";
    var s = document.createElement('style'); s.setAttribute('data-smartcv','ltr-fix'); s.textContent = css;
    document.head.appendChild(s);
  }
  function hardenInputs(){
    var fields = document.querySelectorAll('input[type="text"], input:not([type]), textarea');
    fields.forEach(function(el){
      el.autocapitalize='off'; el.autocorrect='off'; el.spellcheck=false;
      if(!el.getAttribute('inputmode')) el.setAttribute('inputmode','text');
      // caret visible on dark themes
      el.style.caretColor = el.style.caretColor || '#fafafa';
      // stick caret when other scripts reset selection to 0
      if(!el.__smartcv_wired){
        el.__smartcv_wired = true;
        var lastLen = el.value.length;
        el.addEventListener('input', function(){
          var prev = lastLen; lastLen = el.value.length;
          requestAnimationFrame(function(){
            try{
              var atStart = el.selectionStart===0 && el.selectionEnd===0;
              var grew = lastLen > (typeof prev==='number'?prev:lastLen);
              if(atStart && grew){
                var pos = el.value.length;
                el.setSelectionRange(pos,pos);
              }
            }catch(_){}
          });
        }, true);
        // If external code mutates value attribute
        var mo = new MutationObserver(function(){
          requestAnimationFrame(function(){
            try{
              if(el.selectionStart===0 && el.value && el.value.length>0){
                var pos = el.value.length;
                el.setSelectionRange(pos,pos);
              }
            }catch(_){}
          });
        });
        mo.observe(el, {attributes:true, attributeFilter:['value']});
        // iOS tap focus shim
        document.addEventListener('touchend', function(e){
          var t=e.target; if(t===el) setTimeout(function(){ el.focus(); },0);
        }, {passive:true});
      }
    });
  }
  document.addEventListener('DOMContentLoaded', function(){ injectLTRCSS(); hardenInputs(); });
  new MutationObserver(hardenInputs).observe(document.documentElement,{subtree:true,childList:true});
})();
// === SmartCV caret/paypal FINAL PATCH END ===
