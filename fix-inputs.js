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