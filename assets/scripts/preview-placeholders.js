export function initPreviewPlaceholders(){
  const preview=new URLSearchParams(location.search).has('preview');
  if(!preview)return;
  document.documentElement.classList.add('preview-mode');
  document.querySelectorAll('[data-preview-placeholder]').forEach(el=>el.hidden=false);
}
