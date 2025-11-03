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

// === SmartCV PayPal robust mount (FINAL) ===
(function(){
  'use strict';
  var $ = function(s,root){ return (root||document).querySelector(s); };

  function ensureContainers(){
    var mount = $('#paypal-button-container');
    if(!mount){
      mount = document.createElement('div');
      mount.id = 'paypal-button-container';
      (document.querySelector('main')||document.body).appendChild(mount);
    }
    var warn = $('#paypal-warn');
    if(!warn){
      warn = document.createElement('div');
      warn.id = 'paypal-warn';
      warn.style.cssText = 'margin-top:8px;color:#faa';
      mount.after(warn);
    }
    return {mount: mount, warn: warn};
  }

  function getMeta(){
    var q = new URL(location.href).searchParams;
    var plan = (q.get('plan')||'vippack').toLowerCase();
    var PRICE = { professional:4.99, creative:9.99, vippack:59.99, funny:2.00, romantic:2.00, apology:2.00, entertaining:3.00 };
    var TITLE = { professional:'Professional', creative:'Creative', vippack:'VIP Pack', funny:'Funny', romantic:'Romantic', apology:'Apology', entertaining:'Entertaining' };
    return { price:(PRICE[plan]||59.99), title:(TITLE[plan]||'VIP Pack') };
  }

  function waitPayPal(cb, fail){
    var tries = 0;
    (function loop(){
      if(window.paypal && window.paypal.Buttons) return cb();
      if(++tries > 60) return fail && fail('PayPal SDK не завантажився (перевір client-id & components=buttons & currency=CAD)');
      setTimeout(loop, 250);
    })();
  }

  function mount(){
    var meta = getMeta();
    var ui = ensureContainers();
    waitPayPal(function(){
      try{
        window.paypal.Buttons({
          style:{layout:'vertical', shape:'rect'},
          createOrder: function(d,a){ return a.order.create({ purchase_units:[{ amount:{ currency_code:'CAD', value: meta.price.toFixed(2) }, description: 'SmartCV — '+meta.title }] }); },
          onApprove: function(d,a){ return a.order.capture().then(function(){ alert('Оплата успішна. Файл буде згенеровано.'); }); },
          onError: function(err){ console.error(err); ui.warn.textContent = 'Помилка PayPal: '+err; }
        }).render('#paypal-button-container');
      }catch(e){
        console.error(e);
        ui.warn.textContent = 'PayPal render error (перевір контейнер і client-id у SDK)';
      }
    }, function(msg){ ensureContainers().warn.textContent = msg; });
  }

  document.addEventListener('DOMContentLoaded', mount);
})();
// === End SmartCV PayPal robust mount (FINAL) ===
