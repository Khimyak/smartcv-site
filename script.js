// SmartCV — 10 UI languages, no-preview flow, sector selection
// ---- CONFIG ----
const TEMPLATES = {
  professional: { name: "Professional", price: 4.99 },
  creative:     { name: "Creative", price: 9.99 },
  vip:          { name: "VIP Pack", price: 59.99, lettersIncluded: true },
  funny:        { name: "Funny CV", price: 2.00 },
  romantic:     { name: "Romantic CV", price: 2.00 },
  apology:      { name: "Apology CV", price: 2.00 },
  entertaining: { name: "Entertaining", price: 3.00 }
};
const LETTER_PRICE_EACH = 0.00;
const LETTERS_COUNT = 2;

// EmailJS (optional). Fill to enable email sending with attachments.
const EMAILJS_PUBLIC_KEY = "YOUR_EMAILJS_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_EMAILJS_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_EMAILJS_TEMPLATE_ID";

// UI translations (labels)
const I18N = {
  en: { fullName:"Full Name", jobTitle:"Job Title", email:"Email (for receiving files)", phone:"Phone",
        location:"City, Province / State", about:"About Me", experience:"Work Experience", education:"Education",
        skills:"Skills (comma separated)", addLetters:"Add Recommendation Letters (2 pcs)",
        purpose:"Resume purpose", subsector:"Specialization / trade",
        paySuccess:"Done! Files downloaded. We also sent them to your email (if configured).",
        payError:"Payment succeeded, but a generation/email error occurred. Please contact support.",
        payFail:"Payment error. Please try again." },
  fr: { fullName:"Nom et prénom", jobTitle:"Intitulé du poste", email:"E‑mail (pour recevoir les fichiers)", phone:"Téléphone",
        location:"Ville, Province / État", about:"À propos de moi", experience:"Expérience professionnelle", education:"Formation",
        skills:"Compétences (séparées par des virgules)", addLetters:"Ajouter des lettres de recommandation (2)",
        purpose:"Objectif du CV", subsector:"Spécialisation / métier",
        paySuccess:"Terminé ! Les fichiers ont été téléchargés. Nous vous les avons aussi envoyés par e‑mail (si configuré).",
        payError:"Paiement réussi, mais une erreur de génération/e‑mail s’est produite. Contactez le support.",
        payFail:"Erreur de paiement. Veuillez réessayer." },
  es: { fullName:"Nombre completo", jobTitle:"Puesto", email:"Correo (para recibir archivos)", phone:"Teléfono",
        location:"Ciudad, Provincia / Estado", about:"Sobre mí", experience:"Experiencia laboral", education:"Educación",
        skills:"Habilidades (separadas por comas)", addLetters:"Agregar cartas de recomendación (2)",
        purpose:"Propósito del CV", subsector:"Especialidad / oficio",
        paySuccess:"¡Listo! Archivos descargados. También los enviamos a tu correo (si está configurado).",
        payError:"El pago se realizó, pero ocurrió un error de generación/correo. Contacta soporte.",
        payFail:"Error de pago. Inténtalo de nuevo." },
  ar: { fullName:"الاسم الكامل", jobTitle:"المسمى الوظيفي", email:"البريد الإلكتروني (لتلقي الملفات)", phone:"الهاتف",
        location:"المدينة، المقاطعة/الولاية", about:"نبذة عني", experience:"الخبرة العملية", education:"التعليم",
        skills:"المهارات (مفصولة بفواصل)", addLetters:"إضافة خطابي توصية (2)",
        purpose:"هدف السيرة الذاتية", subsector:"التخصص / الحرفة",
        paySuccess:"تم! تم تنزيل الملفات. كما أرسلناها إلى بريدك الإلكتروني (إن وُجد).",
        payError:"نجحت عملية الدفع، لكن حدث خطأ في التوليد/البريد. يرجى التواصل مع الدعم.",
        payFail:"خطأ في الدفع. حاول مرة أخرى." },
  zh: { fullName:"姓名", jobTitle:"职位", email:"邮箱（用于接收文件）", phone:"电话",
        location:"城市，省/州", about:"自我介绍", experience:"工作经历", education:"教育",
        skills:"技能（用逗号分隔）", addLetters:"添加推荐信（2封）",
        purpose:"简历用途", subsector:"专业 / 工种",
        paySuccess:"完成！文件已下载。如已配置，也已发送到您的邮箱。",
        payError:"支付成功，但生成/发送邮件时出错。请联系支持。",
        payFail:"支付错误。请重试。" },
  hi: { fullName:"पूरा नाम", jobTitle:"पद", email:"ईमेल (फ़ाइल प्राप्त करने के लिए)", phone:"फ़ोन",
        location:"शहर, प्रांत/राज्य", about:"मेरे बारे में", experience:"कार्य अनुभव", education:"शिक्षा",
        skills:"कौशल (कॉमा से अलग)", addLetters:"सिफारिश पत्र जोड़ें (2)",
        purpose:"रिज्यूमे का उद्देश्य", subsector:"विशेषज्ञता / ट्रेड",
        paySuccess:"हो गया! फ़ाइलें डाउनलोड हो गईं। (यदि सेट किया है) ईमेल पर भी भेज दिया।",
        payError:"भुगतान सफल, पर जेनरेशन/ईमेल में त्रुटि। कृपया सहायता से संपर्क करें।",
        payFail:"भुगतान त्रुटि। फिर से प्रयास करें।" },
  tl: { fullName:"Buong Pangalan", jobTitle:"Trabaho", email:"Email (para matanggap ang files)", phone:"Telepono",
        location:"Lungsod, Probinsya / Estado", about:"Tungkol sa Akin", experience:"Karanasan sa Trabaho", education:"Edukasyon",
        skills:"Skills (nakahiwalay sa kuwit)", addLetters:"Magdagdag ng Recommendation Letters (2)",
        purpose:"Layunin ng Resume", subsector:"Espesyalisasyon / trade",
        paySuccess:"Tapos na! Na‑download ang files. Naipadala rin sa email mo (kung naka‑set).",
        payError:"Matagumpay ang bayad pero nagka‑error sa generation/email. Kontakin ang support.",
        payFail:"Error sa bayad. Pakiulit." },
  pt: { fullName:"Nome completo", jobTitle:"Cargo", email:"E‑mail (para receber os arquivos)", phone:"Telefone",
        location:"Cidade, Província / Estado", about:"Sobre mim", experience:"Experiência profissional", education:"Educação",
        skills:"Habilidades (separadas por vírgulas)", addLetters:"Adicionar cartas de recomendação (2)",
        purpose:"Objetivo do currículo", subsector:"Especialização / ofício",
        paySuccess:"Concluído! Arquivos baixados. Também enviados por e‑mail (se configurado).",
        payError:"Pagamento concluído, mas ocorreu um erro na geração/e‑mail. Contate o suporte.",
        payFail:"Erro no pagamento. Tente novamente." },
  ru: { fullName:"Полное имя", jobTitle:"Должность", email:"Email (для получения файлов)", phone:"Телефон",
        location:"Город, Провинция / Штат", about:"О себе", experience:"Опыт работы", education:"Образование",
        skills:"Навыки (через запятую)", addLetters:"Добавить рекомендательные письма (2)",
        purpose:"Цель резюме", subsector:"Специализация / рабочая профессия",
        paySuccess:"Готово! Файлы скачаны. Также отправили на email (если настроено).",
        payError:"Платёж прошёл, но произошла ошибка при генерации/отправке. Свяжитесь с поддержкой.",
        payFail:"Ошибка оплаты. Попробуйте ещё раз." },
  uk: { fullName:"Ім’я та прізвище", jobTitle:"Посада", email:"Email (для отримання файлів)", phone:"Телефон",
        location:"Місто, провінція/штат", about:"Про мене", experience:"Досвід роботи", education:"Освіта",
        skills:"Навички (через кому)", addLetters:"Додати рекомендаційні листи (2 шт)",
        purpose:"Мета резюме", subsector:"Спеціалізація / фах",
        paySuccess:"Готово! Файли завантажені. Також надіслали на ваш email (якщо налаштовано).",
        payError:"Оплата пройшла, але сталася помилка генерації/надсилання. Зв’яжіться з підтримкою.",
        payFail:"Помилка оплати. Спробуйте ще раз." }
};

// Headings for generated PDFs (output EN/FR only)
const HEADINGS = {
  en: { about: "ABOUT ME", experience: "WORK EXPERIENCE", education: "EDUCATION", skills: "SKILLS", purpose: "PURPOSE", specialization: "SPECIALIZATION" },
  fr: { about: "À PROPOS DE MOI", experience: "EXPÉRIENCE PROFESSIONNELLE", education: "FORMATION", skills: "COMPÉTENCES", purpose: "OBJECTIF", specialization: "SPÉCIALISATION" }
};

// Subsector options by purpose
const SUBSECTORS = {
  factory: [
    "Assembly","Machine operator","CNC operator","Quality control","Packaging","Warehouse",
    "Forklift","Maintenance","Production line lead","Food processing","Electronics assembly"
  ],
  construction: [
    "Welder","Electrician","Plumber","Carpenter","Framing","Drywaller","Taping","Painter",
    "Roofer","Siding","Masonry / Bricklaying","Concrete Finisher","Formwork","Steel Fixer (Rebar)",
    "Tiling","Flooring","Landscaping","Excavation","Heavy equipment operator","Surveying",
    "HVAC Installer","Insulation","Scaffolding","Demolition","Glazing"
  ],
  mechanic: [
    "Auto mechanic","Diesel","Heavy equipment","Industrial maintenance","Small engines",
    "Motorcycle","Bicycle","Marine","Aviation","Rail","HVAC technician"
  ]
};

let chosenKey = null;
let chosen = null;
let lastFormData = null;

document.addEventListener("DOMContentLoaded", () => {
  initTemplateFromURL();
  initEmailJS();
  initLangControls();
  initPurposeControls();
  renderPayPal();
});

function initEmailJS() {
  if (window.emailjs && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY") {
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
}

function initTemplateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get("template") || "professional";
  chosenKey = key in TEMPLATES ? key : "professional";
  chosen = TEMPLATES[chosenKey];
  document.getElementById("tplName").textContent = chosen.name;
  document.getElementById("tplPrice").textContent = chosen.price.toFixed(2);
}

function initLangControls() {
  const uiLangSel = document.getElementById("uiLang");
  applyUILang(uiLangSel.value);
  uiLangSel.addEventListener("change", e => applyUILang(e.target.value));
}
function applyUILang(lang) {
  const dict = I18N[lang] || I18N.en;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      // update leading text node of label
      const labelText = dict[key];
      const node = el.childNodes[0];
      if (node && node.nodeType === Node.TEXT_NODE) node.textContent = labelText + "\\n";
      else el.childNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE) n.textContent = labelText + "\\n"; });
    }
  });
}

function initPurposeControls() {
  const purpose = document.getElementById("purpose");
  const subsector = document.getElementById("subsector");
  const refill = () => {
    const val = purpose.value;
    subsector.innerHTML = "<option value=''>—</option>";
    (SUBSECTORS[val] || []).forEach(opt => {
      const o = document.createElement("option");
      o.value = opt; o.textContent = opt; subsector.appendChild(o);
    });
  };
  purpose.addEventListener("change", refill);
  refill();
}

function formValid() {
  const form = document.getElementById("cvForm");
  return form.reportValidity();
}

function renderPayPal() {
  if (!window.paypal || !window.paypal.Buttons) {
    console.error("PayPal SDK not loaded. Check client-id.");
    return;
  }
  window.paypal.Buttons({
    style: { layout: "vertical" },
    onClick: function (data, actions) {
      if (!formValid()) return actions.reject();
      const form = document.getElementById("cvForm");
      lastFormData = Object.fromEntries(new FormData(form).entries());
      return actions.resolve();
    },
    createOrder: function (data, actions) {
      const needLetters = document.getElementById("needLetters").checked;
      const extraLetters = (!chosen.lettersIncluded && needLetters) ? LETTERS_COUNT * LETTER_PRICE_EACH : 0;
      const total = (chosen.price + extraLetters).toFixed(2);
      return actions.order.create({
        purchase_units: [{
          amount: { value: total, currency_code: "CAD" },
          description: buildOrderDescription(needLetters, total)
        }]
      });
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(async function () {
        try {
          const needLetters = document.getElementById("needLetters").checked || !!chosen.lettersIncluded;
          const resumeLang = (document.getElementById("cvLang").value || "en");

          // Generate files
          const files = [];
          const cvBlob = generateCVpdf(lastFormData, chosenKey, resumeLang);
          const cvName = safeFileName((lastFormData.fullName || "SmartCV") + "_CV.pdf");
          files.push({ name: cvName, blob: cvBlob });

          if (needLetters) {
            const l1 = generateLetterPdf(lastFormData, 1, resumeLang);
            const l2 = generateLetterPdf(lastFormData, 2, resumeLang);
            files.push({ name: safeFileName((lastFormData.fullName || "SmartCV") + "_Letter_1.pdf"), blob: l1 });
            files.push({ name: safeFileName((lastFormData.fullName || "SmartCV") + "_Letter_2.pdf"), blob: l2 });
          }

          // Download locally
          for (const f of files) downloadBlob(f.blob, f.name);
          // Try to email
          await trySendEmail(lastFormData.email, files);

          alert((I18N["en"]).paySuccess); // success message in English (or could switch by UI lang if desired)
        } catch (e) {
          console.error(e);
          alert((I18N["en"]).payError);
        }
      });
    },
    onError: function (err) {
      console.error(err);
      alert((I18N["en"]).payFail);
    }
  }).render("#paypal-container");
}

function buildOrderDescription(needLetters, total) {
  const base = `SmartCV — ${TEMPLATES[chosenKey].name}`;
  const addon = (needLetters || TEMPLATES[chosenKey].lettersIncluded) ? " + 2 letters" : "";
  return `${base}${addon} • Total: ${total} CAD`;
}

function safeFileName(name) { return (name || "file").replace(/[^\w\-.]+/g, "_"); }

// ---------- PDF GENERATION (resumeLang = en|fr) ----------
function generateCVpdf(data, styleKey, lang) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;
  const H = HEADINGS[lang] || HEADINGS.en;

  const line = (text, size = 12, bold = false, addY = 18) => {
    doc.setFont("Helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 515);
    for (const l of lines) { doc.text(l, margin, y); y += addY; }
  };

  line(data.fullName || "", 22, true, 26);
  line(data.title || "", 12, false, 18);
  line(`${data.email || ""} • ${data.phone || ""} • ${data.location || ""}`, 10, false, 16);
  y += 8;

  // Purpose & specialization
  const nicePurpose = (data.purpose || "").replace(/^./, c=>c.toUpperCase());
  const niceSpec = data.subsector || "";
  if (nicePurpose) { line(H.purpose, 12, true); line(nicePurpose, 11, false); }
  if (niceSpec) { line(H.specialization, 12, true); line(niceSpec, 11, false); }

  y += 6; line(H.about, 12, true);
  line((data.summary || ""), 11, false);

  y += 6; line(H.experience, 12, true);
  line((data.experience || ""), 11, false);

  if ((data.education || "").trim()) {
    y += 6; line(H.education, 12, true);
    line((data.education || ""), 11, false);
  }
  if ((data.skills || "").trim()) {
    y += 6; line(H.skills, 12, true);
    line((data.skills || "").split(",").map(s => s.trim()).filter(Boolean).join(", "), 11, false);
  }

  y += 10;
  line(`Style: ${TEMPLATES[styleKey].name}`, 9, false, 14);

  return doc.output("blob");
}

function generateLetterPdf(data, number, lang) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  let y = margin;

  const en = (lang === "en");
  const fr = (lang === "fr");

  const line = (text, size = 12, bold = false, addY = 18) => {
    doc.setFont("Times", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 480);
    for (const l of lines) { doc.text(l, margin, y); y += addY; }
  };

  line(en ? `Recommendation Letter #${number}` : `Lettre de recommandation #${number}`, 16, true, 22);
  line(en ? `To whom it may concern,` : `À qui de droit,`, 12);
  y += 8;

  if (en) {
    line(`${data.fullName || "The candidate"} has demonstrated strong professional qualities as a ${data.title || "specialist"}.`, 12);
    line(`We observed reliability, teamwork and dedication. We believe ${data.fullName || "the candidate"} would be a valuable addition to any organization.`, 12);
  } else {
    line(`${data.fullName || "Le/la candidat(e)"} a démontré de solides qualités professionnelles en tant que ${data.title || "spécialiste"}.`, 12);
    line(`Nous avons constaté de la fiabilité, de l’esprit d’équipe et de l’engagement. Nous pensons que ${data.fullName || "le/la candidat(e)"} serait un atout précieux pour toute organisation.`, 12);
  }

  y += 8;
  line(en ? `Sincerely,` : `Cordialement,`, 12);
  line(en ? `SmartCV Team` : `Équipe SmartCV`, 12, true);

  return doc.output("blob");
}

// ---------- Email via EmailJS ----------
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
async function trySendEmail(toEmail, files) {
  if (!window.emailjs || EMAILJS_PUBLIC_KEY === "YOUR_EMAILJS_PUBLIC_KEY") return;
  try {
    const attachments = [];
    for (const f of files) {
      const base64 = await blobToBase64(f.blob);
      attachments.push({ name: f.name, data: base64 });
    }
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: toEmail,
      subject: "Your SmartCV files",
      message: "Thanks for your purchase! Files were also automatically downloaded in your browser.",
      attachments: JSON.stringify(attachments)
    });
  } catch (e) {
    console.warn("EmailJS send failed:", e);
  }
}

// ---------- Helpers ----------
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
}
