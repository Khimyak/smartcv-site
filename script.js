// smartcv minimal stable script.js
(function(){
  'use strict';
  const PRICE_MAP = {
    professional: 4.99,
    creative: 9.99,
    vippack: 59.99,
    funny: 2.00,
    romantic: 2.00,
    apology: 2.00,
    entertaining: 3.00
  };
  const TITLE_MAP = {
    professional: "Professional",
    creative: "Creative",
    vippack: "VIP Pack",
    funny: "Funny CV",
    romantic: "Romantic CV",
    apology: "Apology CV",
    entertaining: "Entertaining"
  };
  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
  function getQuery(){return Object.fromEntries(new URLSearchParams(location.search).entries());}
  function normalize(t){if(!t)return"";t=t.toLowerCase();if(["vip","vip-pack","vip_pack"].includes(t))return"vippack";return t;}
  function money(n){return (Math.round(n*100)/100).toFixed(2);}
  function setChosen(){
    const q=getQuery();const tpl=normalize(q.template||localStorage.getItem('smartcv_last_template')||"");
    const name=TITLE_MAP[tpl]||"—";const price=(tpl in PRICE_MAP)?PRICE_MAP[tpl]:NaN;
    $("#tplName").textContent=name;$("#tplPrice").textContent=isFinite(price)?money(price):"—";
    const warn=$("#missingTpl");if((!tpl||!(tpl in PRICE_MAP))&&warn)warn.style.display="block";
    return{tpl,title:name,price:isFinite(price)?price:0};
  }
  function prepareInputs(){
    $$('input[type="text"],input[type="email"],input[type="tel"],textarea').forEach(el=>{
      el.setAttribute('autocapitalize','off');el.setAttribute('autocorrect','off');
      el.setAttribute('spellcheck','false');el.setAttribute('autocomplete','off');
      if(!el.hasAttribute('inputmode'))el.setAttribute('inputmode','text');
    });
  }
  function mountPayPal(meta){
    const mount=$("#paypal-buttons");if(!mount)return;
    const tryRender=()=>{
      if(!window.paypal||!window.paypal.Buttons){setTimeout(tryRender,200);return;}
      const amount=money(meta.price||0);
      try{
        window.paypal.Buttons({
          style:{layout:'vertical',shape:'rect'},
          createOrder:(d,a)=>a.order.create({purchase_units:[{amount:{currency_code:'CAD',value:amount},description:`SmartCV — ${meta.title||'Resume'}`}] }),
          onApprove:(d,a)=>a.order.capture().then(()=>alert('Payment captured successfully.')),
          onError:(err)=>alert('PayPal error: '+err)
        }).render(mount);
      }catch(e){console.error(e);$("#paypal-warn").textContent="PayPal render error";}
    };
    tryRender();
  }
  document.addEventListener('DOMContentLoaded',()=>{const meta=setChosen();prepareInputs();mountPayPal(meta);});
})();