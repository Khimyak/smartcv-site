// SmartCV — Checkout logic
// Requirements: PayPal JS SDK (with client-id & CAD), jsPDF, EmailJS (public key)
// Notes: replace EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID below.

(function(){
  'use strict';

  // ---------- Config ----------
  const TEMPLATE_PRICES = {
  professional: 4.99,
  creative: 3.99,
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
    funny: "Funny",
    romantic: "Romantic",
    apology: "Apology",
    entertaining: "Entertaining"
  };

  // EmailJS placeholders — replace with your values
  const EMAILJS_PUBLIC_KEY = "YOUR_EMAILJS_PUBLIC_KEY";
  const EMAILJS_SERVICE_ID = "YOUR_EMAILJS_SERVICE_ID";
  const EMAILJS_TEMPLATE_ID = "YOUR_EMAILJS_TEMPLATE_ID";

  // Simple i18n for form labels (extend as needed)
  const I18N = {
    en: {
      fullName: "Full Name",
      jobTitle: "Job Title",
      email: "Email (for receiving files)",
      phone: "Phone",
      location: "City, Province / State",
      purpose: "Resume purpose",
      subsector: "Specialization / trade",
      payNow: "Pay now",
      paidSuccess: "Payment captured. Generating your resume…",
      paidFail: "Payment failed. Please try again.",
      required: "Please fill all required fields."
    },
    uk: {
      fullName: "Повне ім'я",
      jobTitle: "Посада",
      email: "Ел. пошта (для отримання файлів)",
      phone: "Телефон",
      location: "Місто, провінція / штат",
      purpose: "Мета резюме",
      subsector: "Спеціалізація / фах",
      payNow: "Оплатити",
      paidSuccess: "Оплату підтверджено. Генерую резюме…",
      paidFail: "Оплата не вдалася. Спробуйте ще раз.",
      required: "Заповніть усі обов'язкові поля."
    },
    ru: {
      fullName: "Полное имя",
      jobTitle: "Должность",
      email: "Email (для получения файлов)",
      phone: "Телефон",
      location: "Город, провинция / штат",
      purpose: "Цель резюме",
      subsector: "Специализация / направление",
      payNow: "Оплатить",
      paidSuccess: "Оплата подтверждена. Генерация резюме…",
      paidFail: "Не удалось оплатить. Попробуйте ещё раз.",
      required: "Заполните все обязательные поля."
    },
    fr: {
      fullName: "Nom complet",
      jobTitle: "Intitulé du poste",
      email: "Email (pour recevoir les fichiers)",
      phone: "Téléphone",
      location: "Ville, province / État",
      purpose: "But du CV",
      subsector: "Spécialisation / métier",
      payNow: "Payer",
      paidSuccess: "Paiement confirmé. Génération de votre CV…",
      paidFail: "Échec du paiement. Réessayez.",
      required: "Veuillez remplir tous les champs obligatoires."
    }
  };

  // Purpose → subsector options
  const SUBSECTORS = {
    factory: [
      "Assembler", "Machine Operator", "Quality Control", "Forklift Operator"
    ],
    construction: [
      "Welder", "Carpenter", "Drywaller", "Painter", "Plumber", "Electrician (helper)"
    ],
    mechanic: [
      "Auto Mechanic", "Diesel Mechanic", "Tire Technician", "Body Repair (Apprentice)"
    ],
    other: []
  };

  // ---------- Helpers ----------
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  function getQuery() {
    const p = new URLSearchParams(window.location.search);
    return Object.fromEntries(p.entries());
  }

  function numberToCad(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  function setChosenTemplate() {
    const q = getQuery();
    let tpl = (q.template || "").toLowerCase();
    let title = TEMPLATE_TITLES[tpl] || (tpl ? tpl[0].toUpperCase()+tpl.slice(1) : "—");

    // price override by ?price=
    let price = q.price ? parseFloat(q.price) : TEMPLATE_PRICES[tpl];
    if (!isFinite(price)) price = 0;

    $("#tplName").textContent = title;
    $("#tplPrice").textContent = numberToCad(price);
    $("#paypal-amount").value = numberToCad(price);
    return { tpl, title, price };
  }

  function applyI18n(lang) {
    const dict = I18N[lang] || I18N.en;
    $$("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key]) {
        // Label text only (preserve inner input)
        const input = $("input,select,textarea", el);
        if (input) {
          el.childNodes.forEach(n => {
            if (n.nodeType === Node.TEXT_NODE) n.nodeValue = dict[key] + " ";
          });
        } else {
          el.textContent = dict[key];
        }
      }
    });
  }

  function fillSubsectors(purpose) {
    const box = $("#subsector");
    box.innerHTML = "";
    const opts = SUBSECTORS[purpose] || [];
    const blank = document.createElement("option");
    blank.value = ""; blank.textContent = "—";
    box.appendChild(blank);
    opts.forEach(v => {
      const o = document.createElement("option");
      o.value = v; o.textContent = v;
      box.appendChild(o);
    });
  }

  function collectForm() {
    const form = $("#cvForm");
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    // Basic required fields check
    const required = ["fullName","title","email","phone","location"];
    for (const k of required) {
      if (!data[k] || !String(data[k]).trim()) return { ok:false, data, missing: k };
    }
    return { ok:true, data };
  }

  // jsPDF: simple CV output
  async function generatePdf(data, meta) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const L1 = `${data.fullName} — ${data.title}`;
      const L2 = `${data.location} • ${data.phone} • ${data.email}`;
      const L3 = `Purpose: ${data.purpose || "-"} • Specialization: ${data.subsector || "-"}`;

      doc.setFontSize(18);
      doc.text(L1, 14, 18);
      doc.setFontSize(11);
      doc.text(L2, 14, 26);
      doc.text(L3, 14, 34);

      doc.setFontSize(13);
      doc.text("Summary", 14, 46);
      doc.setFontSize(11);
      const summary = data.summary || "Motivated worker with strong work ethic, safety-first mindset, and hands-on experience.";
      doc.text(doc.splitTextToSize(summary, 180), 14, 54);

      doc.setFontSize(13);
      doc.text("Skills", 14, 86);
      doc.setFontSize(11);
      const skills = (data.skills || "Teamwork; Communication; Time management; Basic tools").split(";");
      let y = 94;
      skills.forEach(s => {
        doc.text(`• ${s.trim()}`, 16, y);
        y += 7;
      });

      const fileName = `SmartCV_${(meta.title||"Resume").replace(/\s+/g,'_')}_${Date.now()}.pdf`;
      doc.save(fileName);
      return { ok: true, fileName, blob: doc.output("blob") };
    } catch (e) {
      console.error(e);
      return { ok:false, error: e };
    }
  }

  async function emailConfirmation(data, meta, base64pdf=null) {
    if (!window.emailjs) return { ok:false, error: "EmailJS not loaded" };
    try {
      if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY.startsWith("YOUR_")) {
        console.warn("EmailJS keys are placeholders. Skipping email send.");
        return { ok:true, skipped:true };
      }
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      const params = {
        to_email: data.email,
        to_name: data.fullName || "Customer",
        template_title: meta.title,
        price_cad: numberToCad(meta.price),
        phone: data.phone || "",
        location: data.location || "",
        purpose: data.purpose || "",
        subsector: data.subsector || "",
        // Optional inline attachment (may require EmailJS plan)
        attachment: base64pdf ? `data:application/pdf;base64,${base64pdf}` : ""
      };
      const res = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
      return { ok:true, res };
    } catch (e) {
      console.error(e);
      return { ok:false, error: e };
    }
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function renderPaypal(meta) {
    const amount = numberToCad(meta.price || 0);
    const buttonsEl = document.getElementById("paypal-buttons");
    if (!buttonsEl) return;

    function init() {
      if (!window.paypal || !window.paypal.Buttons) {
        console.warn("PayPal SDK not ready yet, retrying…");
        setTimeout(init, 300);
        return;
      }
      window.paypal.Buttons({
        style: { layout: "vertical", shape: "rect" },
        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [{
              amount: { currency_code: "CAD", value: amount },
              description: `SmartCV — ${meta.title}`
            }]
          });
        },
        onApprove: function(data, actions) {
          return actions.order.capture().then(async function(details) {
            showToast(getI18nText("paidSuccess"));
            const check = collectForm();
            if (!check.ok) { showToast(getI18nText("required")); return; }
            // Generate PDF
            const pdfRes = await generatePdf(check.data, meta);
            let b64 = null;
            if (pdfRes.ok && pdfRes.blob) b64 = await blobToBase64(pdfRes.blob);
            // Send confirmation email (if configured)
            await emailConfirmation(check.data, meta, b64);
          });
        },
        onError: function(err) {
          console.error(err);
          showToast(getI18nText("paidFail"));
        }
      }).render("#paypal-buttons");
    }
    init();
  }

  function getI18nText(key){
    const lang = $("#uiLang")?.value || "en";
    return (I18N[lang] && I18N[lang][key]) ? I18N[lang][key] : (I18N.en[key]||key);
  }

  function showToast(msg) {
    let box = $("#toast");
    if (!box) {
      box = document.createElement("div");
      box.id = "toast";
      document.body.appendChild(box);
    }
    box.textContent = msg;
    box.className = "show";
    setTimeout(() => box.className = "", 3000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Set chosen template & price
    const meta = setChosenTemplate();

    // I18n init
    const uiLang = $("#uiLang");
    applyI18n(uiLang.value);
    uiLang.addEventListener("change", () => applyI18n(uiLang.value));

    // Purpose → subsector
    const purpose = $("#purpose");
    fillSubsectors(purpose.value);
    purpose.addEventListener("change", (e) => fillSubsectors(e.target.value));

    // Render PayPal buttons
    renderPaypal(meta);

    // Fallback manual button (if needed)
    $("#fallbackPay")?.addEventListener("click", async () => {
      const check = collectForm();
      if (!check.ok) { showToast(getI18nText("required")); return; }
      // Simulate payment for testing without PayPal
      showToast("DEV: Simulating payment…");
      const pdfRes = await generatePdf(check.data, meta);
      let b64 = null;
      if (pdfRes.ok && pdfRes.blob) b64 = await blobToBase64(pdfRes.blob);
      await emailConfirmation(check.data, meta, b64);
    });
  });

})();