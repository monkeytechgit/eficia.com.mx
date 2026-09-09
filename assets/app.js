const body=document.body,root=document.documentElement,header=document.querySelector('.site-header'),toggle=document.querySelector('.menu-toggle');
root.classList.add('js');
requestAnimationFrame(()=>body.classList.add('page-ready'));

document.querySelectorAll('.nav-links > a[href="contacto.html"]').forEach(contactLink=>{
  if(contactLink.parentElement?.querySelector('a[href="proyectos.html"]'))return;
  contactLink.insertAdjacentHTML('beforebegin','<a href="proyectos.html">Proyectos</a>');
});

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

const SUPABASE_CONTACT_LEADS_URL='https://ocydhmnlomnibdruinhb.supabase.co/rest/v1/contact_leads';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jeWRobW5sb21uaWJkcnVpbmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzI5MjMsImV4cCI6MjEwMzI0ODkyM30.W690DRzkw0f_iWdyPjy4vvWCeVHcPsLxqA8SiDAYr7Y';
const EMAILJS_API_URL='https://api.emailjs.com/api/v1.0/email/send';
const EMAILJS_SERVICE_ID='service_mr6qhfy';
const EMAILJS_TEMPLATE_ID='template_y4y0gl8';
const EMAILJS_PUBLIC_KEY='5vTFdcXJ0G3y7ZaPs';
const impactMap={
  tiempo:'consume_tiempo',
  consume_tiempo:'consume_tiempo',
  errores:'genera_errores',
  genera_errores:'genera_errores',
  control:'falta_control',
  falta_control:'falta_control',
  otro:'otro'
};
const impactLabels={
  consume_tiempo:'Ahorrar tiempo',
  genera_errores:'Reducir errores',
  falta_control:'Tener más control',
  otro:'Otro'
};
const getFieldValue=(form,name)=>String(new FormData(form).get(name)||'').trim();
const getLeadData=form=>{
  const currentImpact=[...new Set([...form.querySelectorAll('input[name="impacto"]:checked')].map(input=>impactMap[input.value]).filter(Boolean))];
  return {
    full_name:getFieldValue(form,'nombre'),
    company:getFieldValue(form,'empresa'),
    email:getFieldValue(form,'correo'),
    phone:getFieldValue(form,'telefono')||null,
    process_problem:getFieldValue(form,'problema'),
    current_impact:currentImpact,
    impact_labels:currentImpact.map(value=>impactLabels[value]||value)
  };
};
const showFormMessage=(form,message,isError=false)=>{
  const messageEl=form.parentElement.querySelector('.success');
  if(!messageEl)return;
  messageEl.textContent=message;
  messageEl.classList.toggle('error',isError);
  messageEl.classList.add('show');
};
const setFormSubmitting=(form,isSubmitting)=>{
  const modalDialog=form.closest('.process-modal');
  const loadingOverlay=modalDialog?.querySelector('[data-modal-loading]');
  form.classList.toggle('is-submitting',isSubmitting);
  form.querySelectorAll('input,textarea,select,button').forEach(control=>{control.disabled=isSubmitting});
  if(modalDialog){
    modalDialog.classList.toggle('is-submitting',isSubmitting);
    modalDialog.setAttribute('aria-busy',isSubmitting?'true':'false');
  }
  loadingOverlay?.setAttribute('aria-hidden',isSubmitting?'false':'true');
};
const setModalView=view=>{
  if(!modal)return;
  const formView=modal.querySelector('[data-modal-form-view]');
  const successView=modal.querySelector('[data-modal-success-view]');
  formView?.toggleAttribute('hidden',view!=='form');
  successView?.toggleAttribute('hidden',view!=='success');
  modal.querySelector('.process-modal')?.classList.toggle('success-mode',view==='success');
  modal.querySelector('.process-modal')?.setAttribute('aria-labelledby',view==='success'?'success-modal-title':'process-modal-title');
};
const showLeadSuccess=()=>{
  if(!modal)return;
  setModalView('success');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  body.classList.add('modal-open');
  modal.querySelector('[data-success-continue]')?.focus();
};
const submitLead=async lead=>{
  const response=await fetch(SUPABASE_CONTACT_LEADS_URL,{
    method:'POST',
    headers:{
      apikey:SUPABASE_ANON_KEY,
      authorization:`Bearer ${SUPABASE_ANON_KEY}`,
      'content-type':'application/json',
      prefer:'return=minimal'
    },
    body:JSON.stringify({
      full_name:lead.full_name,
      company:lead.company,
      email:lead.email,
      phone:lead.phone,
      process_problem:lead.process_problem,
      current_impact:lead.current_impact
    })
  });
  if(!response.ok)throw new Error(await response.text());
};
const sendLeadNotification=async lead=>{
  const response=await fetch(EMAILJS_API_URL,{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
      service_id:EMAILJS_SERVICE_ID,
      template_id:EMAILJS_TEMPLATE_ID,
      user_id:EMAILJS_PUBLIC_KEY,
      template_params:{
        title:'Nueva solicitud de cotización',
        name:lead.full_name,
        email:lead.email,
        nombre:lead.full_name,
        empresa:lead.company,
        correo:lead.email,
        telefono:lead.phone||'No proporcionado',
        producto:'Análisis de proceso',
        cantidad:'No aplica',
        entrega:'Por definir',
        descripcion:[
          lead.process_problem,
          `Impacto actual: ${lead.impact_labels.length?lead.impact_labels.join(', '):'No especificado'}`
        ].join('\n\n')
      }
    })
  });
  if(!response.ok)throw new Error(await response.text());
};

const bindDiagnosticForms=()=>document.querySelectorAll('[data-diagnostic-form]').forEach(form=>{
  if(form.dataset.bound)return;
  form.dataset.bound='true';
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const button=form.querySelector('button[type="submit"]');
    const lead=getLeadData(form);
    button.dataset.label=button.dataset.label||button.textContent;
    setFormSubmitting(form,true);
    button.setAttribute('aria-busy','true');
    button.classList.add('is-loading');
    button.textContent='Enviando...';
    form.parentElement.querySelector('.success')?.classList.remove('show','error');
    try{
      const results=await Promise.allSettled([
        submitLead(lead),
        sendLeadNotification(lead)
      ]);
      if(results.every(result=>result.status==='rejected')){
        throw results[0].reason;
      }
      results.forEach(result=>{
        if(result.status==='rejected')console.warn('Un canal de envío falló.',result.reason);
      });
      form.reset();
      showLeadSuccess();
    }catch(error){
      console.error('No se pudo enviar la solicitud.',error);
      showFormMessage(form,'No pudimos enviar tu información. Inténtalo de nuevo en un momento.',true);
    }finally{
      setFormSubmitting(form,false);
      button.removeAttribute('aria-busy');
      button.classList.remove('is-loading');
      button.textContent=button.dataset.label;
    }
  });
});
bindDiagnosticForms();

const modalHtml=`<div class="modal-backdrop" data-process-modal aria-hidden="true"><div class="process-modal" role="dialog" aria-modal="true" aria-labelledby="process-modal-title"><div data-modal-form-view><div class="modal-head"><div><h2 id="process-modal-title">Analiza tu proceso.</h2><p>Cuéntanos dónde hay trabajo manual, errores o falta de control.</p></div><button class="modal-close" type="button" aria-label="Cerrar formulario" data-close-modal>×</button></div><form class="form" data-diagnostic-form><div class="field"><label for="modal-nombre">Nombre completo *</label><input id="modal-nombre" name="nombre" required autocomplete="name" placeholder="Tu nombre"></div><div class="field"><label for="modal-empresa">Empresa *</label><input id="modal-empresa" name="empresa" required autocomplete="organization" placeholder="Nombre de tu empresa"></div><div class="field"><label for="modal-correo">Correo electrónico *</label><input id="modal-correo" name="correo" type="email" required autocomplete="email" placeholder="nombre@empresa.com"></div><div class="field"><label for="modal-telefono">Teléfono</label><input id="modal-telefono" name="telefono" type="tel" autocomplete="tel" placeholder="+52 ..."></div><div class="field full"><label for="modal-problema">¿Qué proceso o problema quieres mejorar? *</label><textarea id="modal-problema" name="problema" required placeholder="Cuéntanos cómo lo hacen hoy..."></textarea></div><div class="field full"><label>Impacto actual</label><div class="choice-grid"><label class="choice"><input type="checkbox" name="impacto" value="consume_tiempo"><span>Consume tiempo</span></label><label class="choice"><input type="checkbox" name="impacto" value="genera_errores"><span>Genera errores</span></label><label class="choice"><input type="checkbox" name="impacto" value="falta_control"><span>Falta control</span></label><label class="choice"><input type="checkbox" name="impacto" value="otro"><span>Otro</span></label></div></div><div class="field full"><button class="btn btn-blue btn-send" type="submit">Enviar proceso</button></div></form><div class="success">Gracias. Revisaremos la información que compartiste.</div></div><div class="modal-success-view" data-modal-success-view hidden><button class="modal-close" type="button" aria-label="Cerrar confirmación" data-close-modal>×</button><div class="success-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"></path></svg></div><h2 id="success-modal-title">Solicitud enviada</h2><p>Se ha enviado correctamente la solicitud. Revisaremos la información y te contactaremos pronto.</p><div class="success-actions"><button class="btn btn-outline" type="button" data-close-modal>Cancelar</button><button class="btn btn-blue" type="button" data-success-continue>Continuar</button></div></div></div></div>`;
document.body.insertAdjacentHTML('beforeend',modalHtml);
bindDiagnosticForms();

const modal=document.querySelector('[data-process-modal]');
modal?.querySelector('.process-modal')?.insertAdjacentHTML('beforeend','<div class="modal-loading-overlay" data-modal-loading role="status" aria-live="polite" aria-hidden="true"><div class="modal-loader" aria-hidden="true"></div><p>Enviando solicitud...</p></div>');
const closeModal=()=>{
  if(modal?.querySelector('.process-modal.is-submitting'))return;
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden','true');
  body.classList.remove('modal-open');
  setModalView('form');
};
const openModal=()=>{
  setModalView('form');
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
  if(event.target.closest('[data-success-continue]')){
    closeModal();
    location.href='servicios.html';
  }
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

/* Eficia v4 — Services dropdown */
const serviceDropdown=document.querySelector('.nav-dropdown');
const serviceDropdownToggle=document.querySelector('.nav-dropdown-toggle');
if(serviceDropdown && serviceDropdownToggle){
  const closeServiceDropdown=()=>{
    serviceDropdown.classList.remove('open');
    serviceDropdownToggle.setAttribute('aria-expanded','false');
  };
  serviceDropdownToggle.addEventListener('click',event=>{
    if(matchMedia('(max-width:760px)').matches){
      event.preventDefault();
      const open=serviceDropdown.classList.toggle('open');
      serviceDropdownToggle.setAttribute('aria-expanded',String(open));
    }
  });
  document.addEventListener('click',event=>{
    if(!serviceDropdown.contains(event.target)) closeServiceDropdown();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape') closeServiceDropdown();
  });
  addEventListener('resize',()=>{
    if(!matchMedia('(max-width:760px)').matches) closeServiceDropdown();
  },{passive:true});
}

/* Keep mobile navigation ARIA state synchronized after navigation. */
document.querySelectorAll('.nav-links a').forEach(link=>link.addEventListener('click',()=>{
  toggle?.setAttribute('aria-expanded','false');
  serviceDropdown?.classList.remove('open');
  serviceDropdownToggle?.setAttribute('aria-expanded','false');
}));
