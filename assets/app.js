const body=document.body,root=document.documentElement,header=document.querySelector('.site-header'),toggle=document.querySelector('.menu-toggle');
root.classList.add('js');
requestAnimationFrame(()=>body.classList.add('page-ready'));

let ticking=false;
const scrollState=()=>{
  header?.classList.toggle('scrolled',scrollY>12);
  ticking=false;
};
const requestScrollState=()=>{
  if(!ticking){
    requestAnimationFrame(scrollState);
    ticking=true;
  }
};
scrollState();
addEventListener('scroll',requestScrollState,{passive:true});

toggle?.addEventListener('click',()=>{
  body.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded',body.classList.contains('menu-open'));
});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>body.classList.remove('menu-open')));

const revealTargets=document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale,.stagger');
const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){
    entry.target.classList.add('in');
    io.unobserve(entry.target);
  }
}),{threshold:.16,rootMargin:'0px 0px -8% 0px'});
revealTargets.forEach((target,index)=>{
  target.style.setProperty('--reveal-order',Math.min(index%4,3));
  io.observe(target);
});

document.querySelectorAll('.faq-button').forEach(button=>button.addEventListener('click',()=>{
  const item=button.closest('.faq-item'),open=item.classList.toggle('open');
  button.setAttribute('aria-expanded',open);
}));

const bindDiagnosticForms=()=>document.querySelectorAll('[data-diagnostic-form]').forEach(form=>{
  if(form.dataset.bound)return;
  form.dataset.bound='true';
  form.addEventListener('submit',event=>{
    event.preventDefault();
    form.parentElement.querySelector('.success')?.classList.add('show');
  });
});
bindDiagnosticForms();

const modalHtml=`<div class="modal-backdrop" data-process-modal aria-hidden="true"><div class="process-modal" role="dialog" aria-modal="true" aria-labelledby="process-modal-title"><div class="modal-head"><div><h2 id="process-modal-title">Analiza tu proceso.</h2><p>Cuéntanos dónde hay trabajo manual, errores o falta de control.</p></div><button class="modal-close" type="button" aria-label="Cerrar formulario" data-close-modal>×</button></div><form class="form" data-diagnostic-form><div class="field"><label for="modal-nombre">Nombre completo *</label><input id="modal-nombre" name="nombre" required autocomplete="name" placeholder="Tu nombre"></div><div class="field"><label for="modal-empresa">Empresa *</label><input id="modal-empresa" name="empresa" required autocomplete="organization" placeholder="Nombre de tu empresa"></div><div class="field"><label for="modal-correo">Correo electrónico *</label><input id="modal-correo" name="correo" type="email" required autocomplete="email" placeholder="nombre@empresa.com"></div><div class="field"><label for="modal-telefono">Teléfono</label><input id="modal-telefono" name="telefono" type="tel" autocomplete="tel" placeholder="+52 ..."></div><div class="field full"><label for="modal-problema">¿Qué proceso o problema quieres mejorar? *</label><textarea id="modal-problema" name="problema" required placeholder="Cuéntanos cómo lo hacen hoy..."></textarea></div><div class="field full"><label>Impacto actual</label><div class="choice-grid"><label class="choice"><input type="checkbox" name="impacto" value="tiempo"><span>Consume tiempo</span></label><label class="choice"><input type="checkbox" name="impacto" value="errores"><span>Genera errores</span></label><label class="choice"><input type="checkbox" name="impacto" value="control"><span>Falta control</span></label><label class="choice"><input type="checkbox" name="impacto" value="otro"><span>Otro</span></label></div></div><div class="field full"><button class="btn btn-blue btn-send" type="submit">Enviar proceso</button></div></form><div class="success">Gracias. Revisaremos la información que compartiste.</div></div></div>`;
document.body.insertAdjacentHTML('beforeend',modalHtml);
bindDiagnosticForms();

const modal=document.querySelector('[data-process-modal]');
const closeModal=()=>{
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden','true');
  body.classList.remove('modal-open');
};
const openModal=()=>{
  modal?.classList.add('open');
  modal?.setAttribute('aria-hidden','false');
  body.classList.add('modal-open');
  modal?.querySelector('input')?.focus();
};
document.querySelectorAll('a.btn[href="contacto.html"]').forEach(a=>a.addEventListener('click',event=>{
  event.preventDefault();
  body.classList.remove('menu-open');
  openModal();
}));
document.querySelectorAll('.diagnostic-line').forEach(item=>{
  item.setAttribute('role','button');
  item.tabIndex=0;
  item.addEventListener('click',openModal);
  item.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){
      event.preventDefault();
      openModal();
    }
  });
});
modal?.addEventListener('click',event=>{
  if(event.target===modal||event.target.closest('[data-close-modal]'))closeModal();
});
addEventListener('keydown',event=>{
  if(event.key==='Escape')closeModal();
});

document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href]');
  if(!link||link.target==='_blank'||link.hasAttribute('download'))return;
  const url=new URL(link.href,location.href);
  const isSamePage=url.pathname===location.pathname&&url.search===location.search;
  if(url.origin!==location.origin||url.protocol!==location.protocol)return;
  if(isSamePage&&url.hash){
    const target=document.querySelector(url.hash);
    if(target){
      event.preventDefault();
      body.classList.remove('menu-open');
      target.scrollIntoView({behavior:'smooth',block:'start'});
      history.pushState(null,'',url.hash);
    }
    return;
  }
  if(url.href===location.href||url.hash&&isSamePage)return;
  event.preventDefault();
  body.classList.add('page-leaving');
  setTimeout(()=>{location.href=url.href},260);
});

if(matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.image-stage,.hero-media').forEach(el=>{
    el.addEventListener('mousemove',event=>{
      const rect=el.getBoundingClientRect(),x=((event.clientX-rect.left)/rect.width-.5)*5,y=((event.clientY-rect.top)/rect.height-.5)*5;
      el.style.transform=`translate3d(${x}px,${y}px,0)`;
    });
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });
}
