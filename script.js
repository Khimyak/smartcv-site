// SmartCV — no-preview flow with templates, PayPal, jsPDF, optional EmailJS
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

// If not VIP, additional price per recommendation letter (set to 0 if you don't want to charge extra)
const LETTER_PRICE_EACH = 0.00;   // CAD
const LETTERS_COUNT = 2;

// EmailJS (optional). Fill these to enable sending PDFs by email automatically.
const EMAILJS_PUBLIC_KEY = "YOUR_EMAILJS_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_EMAILJS_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_EMAILJS_TEMPLATE_ID";
// Your EmailJS template should accept fields: to_email, subject, message, and supports attachments.
// Some EmailJS plans are required for attachments. If sending fails, files still auto-download locally.

let chosenKey = null;
let chosen = null; // template object
let lastFormData = null;

// Init
document.addEventListener("DOMContentLoaded", () => {
  initTemplateFromURL();
  initEmailJS();
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
  // Update UI
  document.getElementById("tplName").textContent = chosen.name;
  const tplPriceEl = document.getElementById("tplPrice");
  tplPriceEl.textContent = chosen.price.toFixed(2);
}

// Validate form before payment
function formValid() {
  const form = document.getElementById("cvForm");
  return form.reportValidity();
}

function renderPayPal() {
  if (!window.paypal || !window.paypal.Buttons) {
    console.error("PayPal SDK не завантажився. Перевірте client-id.");
    return;
  }
  window.paypal.Buttons({
    style: { layout: "vertical" },
    onClick: function (data, actions) {
      // Must be valid before proceeding
      if (!formValid()) {
        return actions.reject();
      }
      // Cache form data
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
      return actions.order.capture().then(async function (details) {
        try {
          const needLetters = document.getElementById("needLetters").checked || !!chosen.lettersIncluded;
          // Generate PDFs
          const files = [];
          const cvBlob = generateCVpdf(lastFormData, chosenKey);
          const cvName = safeFileName((lastFormData.fullName || "SmartCV") + "_CV.pdf");
          files.push({ name: cvName, blob: cvBlob });

          if (needLetters) {
            const l1 = generateLetterPdf(lastFormData, 1);
            const l2 = generateLetterPdf(lastFormData, 2);
            files.push({ name: safeFileName((lastFormData.fullName || "SmartCV") + "_Letter_1.pdf"), blob: l1 });
            files.push({ name: safeFileName((lastFormData.fullName || "SmartCV") + "_Letter_2.pdf"), blob: l2 });
          }

          // Auto-download locally
          for (const f of files) downloadBlob(f.blob, f.name);

          // Try to send via EmailJS (optional)
          await trySendEmail(lastFormData.email, files);

          alert("Готово! Файли завантажені. Також ми надіслали їх на вашу email-адресу (якщо налаштовано).");
        } catch (e) {
          console.error(e);
          alert("Оплата пройшла. Виникла помилка під час генерації/надсилання файлів. Зверніться в підтримку.");
        }
      });
    },
    onError: function (err) {
      console.error(err);
      alert("Помилка оплати. Спробуйте ще раз.");
    }
  }).render("#paypal-container");
}

function buildOrderDescription(needLetters, total) {
  const base = `SmartCV — ${TEMPLATES[chosenKey].name}`;
  const addon = (needLetters || TEMPLATES[chosenKey].lettersIncluded) ? " + 2 рекомендаційні листи" : "";
  return `${base}${addon} • Разом: ${total} CAD`;
}

function safeFileName(name) {
  return (name || "file").replace(/[^\w\-.]+/g, "_");
}

// ---------- PDF GENERATION ----------
function generateCVpdf(data, styleKey) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;

  const line = (text, size = 12, bold = false, addY = 18) => {
    doc.setFont("Helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 515);
    for (const l of lines) { doc.text(l, margin, y); y += addY; }
  };

  // Simple style variants via headings
  line(data.fullName || "", 22, true, 26);
  line(data.title || "", 12, false, 18);
  line(`${data.email || ""} • ${data.phone || ""} • ${data.location || ""}`, 10, false, 16);
  y += 8;

  line("ПРО МЕНЕ", 12, true);
  line((data.summary || ""), 11, false);

  y += 6; line("ДОСВІД РОБОТИ", 12, true);
  line((data.experience || ""), 11, false);

  if ((data.education || "").trim()) {
    y += 6; line("ОСВІТА", 12, true);
    line((data.education || ""), 11, false);
  }
  if ((data.skills || "").trim()) {
    y += 6; line("НАВИЧКИ", 12, true);
    line((data.skills || "").split(",").map(s => s.trim()).filter(Boolean).join(", "), 11, false);
  }

  // Footer style hint
  y += 10;
  line(`Стиль: ${TEMPLATES[styleKey].name}`, 9, false, 14);

  return doc.output("blob");
}

function generateLetterPdf(data, number) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  let y = margin;

  const line = (text, size = 12, bold = false, addY = 18) => {
    doc.setFont("Times", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 480);
    for (const l of lines) { doc.text(l, margin, y); y += addY; }
  };

  line(`Recommendation Letter #${number}`, 16, true, 22);
  line(`To whom it may concern,`, 12, false);
  y += 8;
  line(`${data.fullName || "The candidate"} has demonstrated strong professional qualities as a ${data.title || "specialist"}.`, 12);
  line(`We observed reliability, teamwork and dedication. We believe ${data.fullName || "the candidate"} would be a valuable addition to any organization.`, 12);
  y += 8;
  line(`Sincerely,`, 12);
  line(`SmartCV Team`, 12, true);

  return doc.output("blob");
}

// ---------- Email sending via EmailJS ----------
// Convert Blob to Base64 data URL
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]); // remove "data:...;base64,"
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function trySendEmail(toEmail, files) {
  if (!window.emailjs || EMAILJS_PUBLIC_KEY === "YOUR_EMAILJS_PUBLIC_KEY") return; // not configured
  try {
    // Build attachments (Base64)
    const attachments = [];
    for (const f of files) {
      const base64 = await blobToBase64(f.blob);
      attachments.push({ name: f.name, data: base64 });
    }
    const subject = "Ваші файли SmartCV";
    const message = "Дякуємо за покупку! Файли також були автоматично завантажені у ваш браузер.";
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: toEmail,
      subject,
      message,
      attachments: JSON.stringify(attachments) // your EmailJS template must handle this
    });
  } catch (e) {
    console.warn("EmailJS send failed:", e);
  }
}

// ---------- Helpers ----------
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}
