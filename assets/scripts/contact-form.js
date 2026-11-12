export function initContactForm() {
  const form=document.querySelector('[data-contact-form]'); if(!form)return;
  const status=form.querySelector('[data-form-status]');
  form.addEventListener('submit', async event=>{
    event.preventDefault();
    if(!form.reportValidity()) return;
    if(form.elements.website?.value) return;
    const endpoint=form.dataset.endpoint||'';
    const values=Object.fromEntries(new FormData(form).entries());
    if(endpoint){
      status.textContent='Sending your enquiry…';
      try { const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(values)}); if(!response.ok)throw new Error(); location.assign('/thank-you.html'); }
      catch { status.textContent='We could not send your enquiry just now. Please email info@creativenerds.in.'; }
    } else {
      const subject=encodeURIComponent(`Website enquiry: ${values.name} — ${values.need}`);
      const body=encodeURIComponent(`Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone}\nHelp needed: ${values.need}\nBudget: ${values.budget}\n\nProject details:\n${values.message}`);
      status.textContent='Your email app will open with the enquiry details ready to send.';
      location.href=`mailto:info@creativenerds.in?subject=${subject}&body=${body}`;
    }
  });
}
