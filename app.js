(function(){
  const tabs=[
    {id:'home',label:'Home',content:'homeContent'},
    {id:'vehicles',label:'Vehicles',content:'vehiclesContent'},
    {id:'health',label:'Health',content:'healthContent'},
    {id:'finance',label:'Finance',content:'financeContent'},
    {id:'ids',label:'IDs & Docs',content:'idsContent'},
    {id:'pets',label:'Pets',content:'petsContent'},
    {id:'other',label:'Other',content:'otherContent'}
  ];
  const byId=(id)=>document.getElementById(id);
  const splash=byId('splash'), main=byId('main'), detail=byId('detail'), tabsEl=byId('tabs'), titleEl=byId('activeTitle');
  const refs={
    home:{addBtn:byId('addBtnHome'),list:byId('homeList'),hint:byId('homeHint'),banner:byId('homeBanner')},
    vehicles:{addBtn:byId('addBtnVehicles'),list:byId('vehiclesList'),hint:byId('vehiclesHint'),banner:byId('vehiclesBanner')},
    health:{addBtn:byId('addBtnHealth'),list:byId('healthList'),hint:byId('healthHint'),banner:byId('healthBanner')},
    finance:{addBtn:byId('addBtnFinance'),list:byId('financeList'),hint:byId('financeHint'),banner:byId('financeBanner')},
    ids:{addBtn:byId('addBtnIds'),list:byId('idsList'),hint:byId('idsHint'),banner:byId('idsBanner')},
    pets:{addBtn:byId('addBtnPets'),list:byId('petsList'),hint:byId('petsHint'),banner:byId('petsBanner')},
    other:{addBtn:byId('addBtnOther'),list:byId('otherList'),hint:byId('otherHint'),banner:byId('otherBanner')},
  };
  const overlay=byId('overlay'), modal=byId('modal'), closeBtn=byId('closeModal');
  const fTitle=byId('fTitle'), fType=byId('fType'), fDesc=byId('fDesc'), fStart=byId('fStart'), fRenewal=byId('fRenewal'), saveBtn=byId('saveRecord');
  const detailWrap=byId('detailWrap'), backBtn=byId('backBtn'), editFromDetail=byId('editFromDetail'), delFromDetail=byId('deleteFromDetail'), calFromDetail=byId('calendarFromDetail');
  const cOv=byId('confirmOverlay'), cPop=byId('confirmPopup'), cCancel=byId('confirmCancel'), cDelete=byId('confirmDelete');

  const STORAGE='lifesafe_light_v112';
  let data={home:[],vehicles:[],health:[],finance:[],ids:[],pets:[],other:[]};
  let active='home', editing=null, viewing=null, pendingDel=null;

  function load(){try{const raw=localStorage.getItem(STORAGE); if(raw) data={...data,...(JSON.parse(raw)||{})};}catch(e){}}
  function save(){try{localStorage.setItem(STORAGE, JSON.stringify(data));}catch(e){}}
  function fmtDate(v){if(!v) return ''; try{return new Date(v+'T00:00:00').toLocaleDateString();}catch(e){return v;}}
  function daysTo(v){if(!v) return Infinity; const t=new Date();t.setHours(0,0,0,0);const d=new Date(v+'T00:00:00');return Math.floor((d-t)/86400000);}
  function past(v){return daysTo(v)<0;}
  function soon(v){const n=daysTo(v);return n>=0&&n<=7;}

  function toggleHint(tab){ const r=refs[tab]; if(!r) return; r.hint?.classList.toggle('hidden',(data[tab]||[]).length>0); }
  function banner(tab){ const r=refs[tab],arr=data[tab]||[]; const soonN=arr.filter(x=>soon(x.renewalDate)).length; const expN=arr.filter(x=>past(x.renewalDate)).length; if(!r||!r.banner) return; if(soonN||expN){ r.banner.textContent='Heads up: '+[soonN?`${soonN} due within 7 days`:null,expN?`${expN} expired`:null].filter(Boolean).join(' · '); r.banner.classList.remove('hidden'); } else { r.banner.classList.add('hidden'); r.banner.textContent=''; } }

  function openModal(mode){ overlay.classList.remove('hidden'); modal.classList.remove('hidden'); requestAnimationFrame(()=>{overlay.classList.add('show'); modal.classList.add('show');}); if(mode==='edit'){ } else { editing=null; fTitle.value=''; fType.value=''; fDesc.value=''; fStart.value=''; fRenewal.value=''; } }
  function closeModal(){ overlay.classList.remove('show'); modal.classList.remove('show'); setTimeout(()=>{overlay.classList.add('hidden'); modal.classList.add('hidden');},150); }

  function openConfirm(tab,id){ pendingDel={tab,id}; cOv.classList.remove('hidden'); cPop.classList.remove('hidden'); requestAnimationFrame(()=>{cOv.classList.add('show'); cPop.classList.add('show');}); }
  function closeConfirm(){ cOv.classList.remove('show'); cPop.classList.remove('show'); setTimeout(()=>{cOv.classList.add('hidden'); cPop.classList.add('hidden');},150); pendingDel=null; }
  cCancel.addEventListener('click', closeConfirm);
  cOv.addEventListener('click', closeConfirm);
  cDelete.addEventListener('click', ()=>{ if(!pendingDel) return; reallyRemove(pendingDel.tab,pendingDel.id); closeConfirm(); });

  function gUrl(rec){ if(!rec.renewalDate) return null; const ymd=rec.renewalDate.replace(/-/g,''); const s=ymd+'T100000', e=ymd+'T110000'; const p=new URLSearchParams({action:'TEMPLATE', text:rec.title||'LifeSafe Renewal', details:(rec.type?`Type: ${rec.type}\n`:'')+(rec.desc||'')}); p.set('dates',`${s}/${e}`); return `https://calendar.google.com/calendar/render?${p.toString()}`; }
  function openG(rec){ const u=gUrl(rec); if(u) window.open(u,'_blank','noopener'); }

  function renderList(tab){
    const r=refs[tab], arr=data[tab]||[]; r.list.innerHTML=''; toggleHint(tab); banner(tab);
    if(arr.length===0){ const empty=document.createElement('div'); empty.className='centerText'; empty.textContent='No records yet'; r.list.appendChild(empty); return; }
    arr.forEach(rec=>{
      const card=document.createElement('div'); card.className='card';
      const top=document.createElement('div'); top.className='cardTop';
      const left=document.createElement('div'); const right=document.createElement('div'); right.className='actions';
      const h=document.createElement('h3'); h.className='cardTitle'; h.textContent=rec.title||'(Untitled)';
      const meta=document.createElement('div'); meta.className='meta'; const badge=document.createElement('span'); badge.className='badge'; badge.textContent=rec.type||'General'; meta.appendChild(badge);
      const n=daysTo(rec.renewalDate); if(n>=0&&n<=7){ const chip=document.createElement('span'); chip.className='dueSoon'; chip.textContent=`Due soon (${n}d)`; meta.appendChild(chip); }
      const d=document.createElement('div'); d.className='desc'; d.textContent=rec.desc||'';
      const dates=document.createElement('div'); dates.className='dates';
      if(rec.startDate){ dates.appendChild(Object.assign(document.createElement('div'),{textContent:'Start: '+fmtDate(rec.startDate)})); }
      if(rec.renewalDate){ const ln=document.createElement('div'); ln.textContent='Renewal: '+fmtDate(rec.renewalDate)+(past(rec.renewalDate)?'  ❗':''); if(past(rec.renewalDate)) ln.classList.add('expired'); dates.appendChild(ln); }
      const g=document.createElement('button'); g.className='btn small ghost'; g.textContent='Add Reminder to Calendar'; g.onclick=(e)=>{e.stopPropagation(); openG(rec);};
      const edit=document.createElement('button'); edit.className='btn small ghost'; edit.textContent='Edit'; edit.onclick=(e)=>{e.stopPropagation(); startEdit(tab,rec.id);};
      const del=document.createElement('button'); del.className='btn small danger'; del.textContent='Delete'; del.onclick=(e)=>{e.stopPropagation(); openConfirm(tab,rec.id);};
      right.appendChild(g); right.appendChild(edit); right.appendChild(del);
      left.appendChild(h); left.appendChild(meta); if(d.textContent) left.appendChild(d); if(rec.startDate||rec.renewalDate) left.appendChild(dates);
      top.appendChild(left); top.appendChild(right); card.appendChild(top);
      card.addEventListener('click', ()=>openDetail(tab,rec.id));
      r.list.appendChild(card);
    });
  }

  tabs.forEach(t=>{ const b=document.createElement('button'); b.id='tab-'+t.id; b.textContent=t.label; b.onclick=()=>switchTab(t.id); tabsEl.appendChild(b); });
  function switchTab(id){ active=id; ['home','vehicles','health','finance','ids','pets','other'].forEach(t=>{ document.getElementById(t+'Content').classList.add('hidden'); document.getElementById('tab-'+t).classList.remove('active');}); document.getElementById(id+'Content').classList.remove('hidden'); document.getElementById('tab-'+id).classList.add('active'); titleEl.textContent=tabs.find(t=>t.id===id).label; renderList(id); }

  function startEdit(tab,id){ const arr=data[tab]||[]; const rec=arr.find(r=>r.id===id); if(!rec) return; editing={tab,id}; openModal('edit'); fTitle.value=rec.title||''; fType.value=rec.type||''; fDesc.value=rec.desc||''; fStart.value=rec.startDate||''; fRenewal.value=rec.renewalDate||''; }
  saveBtn.addEventListener('click', ()=>{ const payload={title:fTitle.value.trim(),type:fType.value.trim(),desc:fDesc.value.trim(),startDate:fStart.value||'',renewalDate:fRenewal.value||'',createdAt:new Date().toISOString()}; if(editing){ const arr=data[editing.tab]; const i=arr.findIndex(r=>r.id===editing.id); if(i>-1){ arr[i]={...arr[i],...payload}; } } else { const id=Date.now().toString(36); data[active]=[{id, ...payload}, ...(data[active]||[])]; } save(); renderList(active); closeModal(); });
  closeBtn.addEventListener('click', closeModal); overlay.addEventListener('click', closeModal);

  function openDetail(tab,id){ viewing={tab,id}; const rec=(data[tab]||[]).find(r=>r.id===id); if(!rec) return; detailWrap.innerHTML=''; const card=document.createElement('div'); card.className='detailCard'; const t=document.createElement('h3'); t.className='detailTitle'; t.textContent=rec.title||'(Untitled)'; const meta=document.createElement('div'); meta.className='detailMeta'; meta.textContent=(rec.type||'General')+' • '+tab[0].toUpperCase()+tab.slice(1); const desc=document.createElement('div'); desc.className='detailDesc'; desc.textContent=rec.desc||''; const dates=document.createElement('div'); dates.className='detailDates'; if(rec.startDate) dates.appendChild(Object.assign(document.createElement('div'),{textContent:'Start Date: '+fmtDate(rec.startDate)})); if(rec.renewalDate){ const n=daysTo(rec.renewalDate); const ln=document.createElement('div'); ln.textContent='Renewal Date: '+fmtDate(rec.renewalDate); if(n>=0&&n<=7) ln.textContent+=`  (due in ${n}d)`; if(n<0){ ln.textContent+='  ❗'; ln.classList.add('expired'); } dates.appendChild(ln); } card.appendChild(t); card.appendChild(meta); if(desc.textContent) card.appendChild(desc); if(dates.childNodes.length) card.appendChild(dates); detailWrap.appendChild(card); detail.classList.remove('hidden'); main.classList.add('hidden'); calFromDetail.onclick=()=>openG(rec); editFromDetail.onclick=()=>startEdit(tab,id); delFromDetail.onclick=()=>openConfirm(tab,id); }
  function showMain(){ detail.classList.add('hidden'); detailWrap.innerHTML=''; viewing=null; main.classList.remove('hidden'); }
  backBtn.addEventListener('click', showMain);

  function reallyRemove(tab,id){ data[tab]=(data[tab]||[]).filter(r=>r.id!==id); save(); renderList(tab); if(viewing && viewing.tab===tab && viewing.id===id) showMain(); }

  Object.keys(refs).forEach(k=>{ refs[k].addBtn.addEventListener('click', ()=>openModal('add')); });
  function init(){ load(); setTimeout(()=>{ splash.classList.add('hidden'); main.classList.remove('hidden'); }, 500); switchTab('home'); }
  init();
})();