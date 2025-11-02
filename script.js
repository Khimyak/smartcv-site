// SmartCV — Checkout logic (robust)
(function(){
  'use strict';

  // Prices to match homepage
  const TEMPLATE_PRICES = {
    professional: 4.99,
    creative: 9.99,
    vippack: 59.99,
    funny: 2.00,
    romantic: 2.00,
    apology: 2.00,
    entertaining: 3.00
  };
  const TEMPLATE_TITLES = {
    professional: "Professional",
    creative: "Creative",
    vippack: "VIP Pack",
    funny: "Funny CV",
    romantic: "Romantic CV",
    apology: "Apology CV",
    entertaining: "Entertaining"
  };

  // EmailJS placeholders (optional)
  const EMAILJS_PUBLIC_KEY = "YOUR_EMAILJS_PUBLIC_KEY";
  const EMAILJS_SERVICE_ID = "YOUR_EMAILJS_SERVICE_ID";
  const EMAILJS_TEMPLATE_ID = "YOUR_EMAILJS_TEMPLATE_ID";

  const I18N = {
    en: {fullName:"Full Name",jobTitle:"Job Title",email:"Email (for receiving files)",phone:"Phone",location:"City, Province / State",purpose:"Resume purpose",subsector:"Specialization / trade",paidSuccess:"Payment captured. Generating your resume…",paidFail:"Payment failed. Please try again.",required:"Please fill all required fields."},
    uk: {fullName:"Повне ім'я",jobTitle:"Посада",email:"Ел. пошта (для отримання файлів)",phone:"Телефон",location:"Місто, провінція / штат",purpose:"Мета резюме",subsector:"Спеціалізація / фах",paidSuccess:"Оплату підтверджено. Генерую резюме…",paidFail:"Оплата не вдалася. Спробуйте ще раз.",required:"Заповніть усі обов'язкові поля."}
  };

  const SUBSECTORS = {
    factory:["Assembler","Machine Operator","Quality Control","Forklift Operator"],
    construction:["Welder","Carpenter","Drywaller","Painter","Plumber","Electrician (helper)"],
    mechanic:["Auto Mechanic","Diesel Mechanic","Tire Technician","Body Repair (Apprentice)"],
    other:[]
  };

  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

  function getQuery(){
    const p = new URLSearchParams(window.location.search);
    return Object.fromEntries(p.entries());
  }
  function normalizeTemplateName(t){
    if(!t) return "";
    t = String(t).toLowerCase();
    if (t === "vip" || t === "vip-pack" || t==="vip_pack") return "vippack";
    return t;
  }
  function numberToCad(n){ return (Math.round(n*100)/100).toFixed(2); }

  function setChosenTemplate(){
    const q = getQuery();
    let tpl = normalizeTemplateName(q.template || "");
    if(!tpl){
      // fallback from localStorage (if user came from index)
      const last = localStorage.getItem("smartcv_last_template");
      if(last) tpl = normalizeTemplateName(last);
    }
    const title = TEMPLATE_TITLES[tpl] || "—";
    let price = q.price ? parseFloat(q.price) : TEMPLATE_PRICES[tpl];
    if(!isFinite(price) || price <= 0) price = TEMPLATE_PRICES[tpl];

    $("#tplName").textContent = title || "—";
    $("#tplPrice").textContent = (isFinite(price)? numberToCad(price) : "—");
    if(!tpl || !TEMPLATE_PRICES[tpl]){
      const warn = $("#missingTpl"); if (warn) warn.style.display = "block";
    }
    return { tpl, title, price: isFinite(price)? price : 0 };
  }

  function applyI18n(lang){
    const dict = I18N[lang] || I18N.en;
    $$("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      if(!key || !dict[key]) return;
      const input = $("input,select,textarea", el);
      if(input){
        el.childNodes.forEach(n=>{ if(n.nodeType===Node.TEXT_NODE) n.nodeValue = dict[key]+" "; });
      } else {
        el.textContent = dict[key];
      }
    });
  }

  function fillSubsectors(purpose){
    const box = $("#subsector"); box.innerHTML="";
    const blank = document.createElement("option"); blank.value=""; blank.textContent="—"; box.appendChild(blank);
    (SUBSECTORS[purpose]||[]).forEach(v=>{ const o=document.createElement("option"); o.value=v; o.textContent=v; box.appendChild(o); });
  }

  function collectForm(){
    const form=$("#cvForm");
    const fd=new FormData(form);
    const data=Object.fromEntries(fd.entries());
    for(const k of ["fullName","title","email","phone","location"]){
      if(!data[k]||!String(data[k]).trim()) return {ok:false,data,missing:k};
    }
    return {ok:true,data};
  }

  async function generatePdf(data, meta){
    try{
      const { jsPDF } = window.jspdf; const doc = new jsPDF();
      doc.setFontSize(18); doc.text(`${data.fullName} — ${data.title}`,14,18);
      doc.setFontSize(11);
      doc.text(`${data.location} • ${data.phone} • ${data.email}`,14,26);
      doc.text(`Purpose: ${data.purpose||"-"} • Specialization: ${data.subsector||"-"}`,14,34);
      doc.setFontSize(13); doc.text("Summary",14,46);
      doc.setFontSize(11); const summary=data.summary||"Motivated worker with strong work ethic, safety-first mindset, and hands-on experience.";
      doc.text(doc.splitTextToSize(summary,180),14,54);
      const fileName=`SmartCV_${(meta.title||"Resume").replace(/\\s+/g,'_')}_${Date.now()}.pdf`;
      doc.save(fileName);
      return {ok:true};
    }catch(e){ console.error(e); return {ok:false,error:e}; }
  }

  function showToast(msg){
    let box=$("#toast"); if(!box){box=document.createElement("div"); box.id="toast"; document.body.appendChild(box);}
    box.textContent=msg; box.className="show"; setTimeout(()=>box.className="",3000);
  }
  function getI18nText(key){ const lang=$("#uiLang")?.value||"en"; const dict=I18N[lang]||I18N.en; return dict[key]||key; }

  function renderPaypal(meta){
    const buttonsEl=$("#paypal-buttons"); if(!buttonsEl) return;
    function init(){
      if(!window.paypal || !window.paypal.Buttons){ setTimeout(init,250); return; }
      const amount = numberToCad(meta.price || 0);
      window.paypal.Buttons({
        style:{ layout:"vertical", shape:"rect" },
        createOrder:(data,actions)=>actions.order.create({
          purchase_units:[{ amount:{ currency_code:"CAD", value: amount }, description:`SmartCV — ${meta.title||"Resume"}` }]
        }),
        onApprove:(data,actions)=>actions.order.capture().then(async ()=>{
          showToast(getI18nText("paidSuccess"));
          const check=collectForm(); if(!check.ok){ showToast(getI18nText("required")); return; }
          await generatePdf(check.data, meta);
        }),
        onError:(err)=>{ console.error(err); showToast(getI18nText("paidFail")); }
      }).render("#paypal-buttons");
    }
    init();
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    const meta = setChosenTemplate();
    // I18n
    const uiLang=$("#uiLang"); applyI18n(uiLang.value); uiLang.addEventListener("change",()=>applyI18n(uiLang.value));
    // Purpose
    const purpose=$("#purpose"); fillSubsectors(purpose.value); purpose.addEventListener("change",e=>fillSubsectors(e.target.value));
    // PayPal
    renderPaypal(meta);
  });
})();