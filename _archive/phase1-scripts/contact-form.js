export function initContactForm() {
  document.querySelectorAll('form[data-static-form]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    const value = name => form.querySelector(`[name="${name}"]`)?.value || '';
    const subject = encodeURIComponent(`Project enquiry: ${value('need') || 'Creative Nerds'}`);
    const body = encodeURIComponent(`Name: ${value('name')}\nEmail: ${value('email')}\nI'm looking for: ${value('need')}\nBudget range: ${value('budget')}\n\nProject details:\n${value('message')}`);
    location.href = `mailto:info@creativenerds.in?subject=${subject}&body=${body}`;
  }));
}
