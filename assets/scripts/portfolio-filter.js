export function initPortfolioFilter() {
  const buttons=document.querySelectorAll('[data-project-filter]'); const cards=document.querySelectorAll('[data-project-category]');
  buttons.forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.projectFilter;
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    cards.forEach(card=>{card.hidden=filter!=='all'&&card.dataset.projectCategory!==filter;});
  }));
}
