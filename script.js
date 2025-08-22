// ==== config ====
const PRICES = { professional: 4.99, creative: 9.99, vip: 59.99 };
const SERVICE_ID = 'service_a4l15o';
const TEMPLATE_ID = 'template_4tz7vbw';

const qs = new URLSearchParams(location.search);
const plan = (qs.get('plan') || 'professional').toLowerCase();
document.getElementById('planBadge').textContent = `${plan} — $${PRICES[plan] ?? PRICES.professional}`;

const form = document.getElementById('cvForm');
const prepareBtn = document.getElementById('prepareBtn');
const resetBtn = document.getElementById('resetBtn');
const payBlock = document.getElementById('payBlock');
const doneBlock = document.getElementById('doneBlock');
const sentTo = document.getElementById('sentTo');
const links = document.getElementById('links');
const statusBox = document.getElementById('status');

let resumeData = null;
let pdfBlob = null;
let docxBlob = null;

resetBtn.addEventListener('click', () => { payBlock.style.display='none'; doneBlock.style.display='none'; });

prepareBtn.addEventListener('click', async () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const category = document.getElementById('category').value.trim();
  const details = document.getElementById('details').value.trim();
  const recommend = document.getElementById('recommend').checked;
  const language = document.getElementById('outputLanguage').value.trim();

  if(!name || !email || !category || !details || !language){
    alert('Please fill all required fields.');
    return;
  }

  resumeData = { name, email, category, details, recommend, language, plan, price: PRICES[plan] ?? PRICES.professional };
  // Generate files now (so user can download instantly after payment)
  const files = await generateFiles(resumeData);
  pdfBlob = files.pdf; docxBlob = files.docx;

  payBlock.style.display='block';
  renderPayPal(resumeData.price);
});

function renderPayPal(amount){
  // Avoid double-render
  if (document.querySelector('#paypal-button-container iframe')) return;
  paypal.Buttons({
    style: { layout:'vertical', color:'gold', shape:'rect', label:'paypal' },
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [ { amount: { value: String(amount) }, description: `SmartCV ${plan} resume` } ]
      });
    },
    onApprove: async (data, actions) => {
      try {
        const order = await actions.order.capture();
        statusBox.textContent = 'Payment successful. Preparing your files...';
        await sendEmailWithAttachments(resumeData, pdfBlob, docxBlob);
        showDownloadLinks(resumeData.email, pdfBlob, docxBlob);
        statusBox.textContent = 'Files sent to your email.';
      } catch (e) {
        console.error(e);
        alert('Error after payment. Please contact support.');
      }
    },
    onError: (err) => {
      console.error(err);
      alert('Payment error. Please try again.');
    }
  }).render('#paypal-button-container');
}

async function generateFiles(data){
  // --- PDF via jsPDF ---
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pad = 14, lh = 8;
  doc.setFont('helvetica','bold'); doc.setFontSize(18);
  doc.text(`Resume — ${data.name}`, pad, pad);
  doc.setFont('helvetica','normal'); doc.setFontSize(12);
  let y = pad + 10;
  const lines = [
    `Target: ${data.category}`,
    `Language: ${data.language}`,
    `Recommendation letters: ${data.recommend ? 'Yes' : 'No'}`,
    '',
    'Details:',
    data.details
  ];
  lines.forEach(line => { doc.text(doc.splitTextToSize(line, 180), pad, y); y += lh * Math.ceil(doc.getTextDimensions(line).h / lh + 0.6); });
  const pdf = doc.output('blob');

  // --- DOCX via docx ---
  const { Document, Packer, Paragraph, HeadingLevel, TextRun } = window.docx;
  const docxDoc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ text: `Resume — ${data.name}`, heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: `Target: ${data.category}` }),
        new Paragraph({ text: `Language: ${data.language}` }),
        new Paragraph({ text: `Recommendation letters: ${data.recommend ? 'Yes' : 'No'}` }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'Details:', heading: HeadingLevel.HEADING_2 }),
        ...data.details.split('\\n').map(line => new Paragraph({ children: [ new TextRun(line) ] })),
      ]
    }]
  });
  const docxBuf = await Packer.toBlob(docxDoc);
  return { pdf, docx: docxBuf };
}

function blobToBase64(blob){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]); // strip data: prefix
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function sendEmailWithAttachments(data, pdf, docx){
  // Convert to base64
  const pdfB64 = await blobToBase64(pdf);
  const docxB64 = await blobToBase64(docx);
  const templateParams = {
    to_name: data.name,
    to_email: data.email,
    name: data.name,
    message: `Thank you for using SmartCV. Plan: ${data.plan} ($${data.price}).`,
    // EmailJS attachments format
    'attachments': [
      { name: `SmartCV_${data.name.replace(/\\s+/g,'_')}.pdf`, data: pdfB64 },
      { name: `SmartCV_${data.name.replace(/\\s+/g,'_')}.docx`, data: docxB64 }
    ]
  };
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
}

function showDownloadLinks(email, pdf, docx){
  doneBlock.style.display = 'block';
  sentTo.textContent = email;
  links.innerHTML = '';
  const a1 = document.createElement('a');
  a1.className='btn'; a1.download='SmartCV_Resume.pdf';
  a1.href = URL.createObjectURL(pdf);
  a1.textContent = 'Download PDF';
  const a2 = document.createElement('a');
  a2.className='btn'; a2.download='SmartCV_Resume.docx';
  a2.href = URL.createObjectURL(docx);
  a2.textContent = 'Download DOCX';
  links.appendChild(a1); links.appendChild(a2);
}
