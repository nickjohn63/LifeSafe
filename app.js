(function(){
  // Tabs
  const tabs=[
    {id:'home',label:'Home',content:'homeContent'},
    {id:'vehicles',label:'Vehicles',content:'vehiclesContent'},
    {id:'health',label:'Health',content:'healthContent'},
    {id:'finance',label:'Finance',content:'financeContent'},
    {id:'ids',label:'IDs & Docs',content:'idsContent'},
    {id:'pets',label:'Pets',content:'petsContent'},
    {id:'other',label:'Other',content:'otherContent'}
  ];

  // Elements
  const splash=document.getElementById('splash');
  const main=document.getElementById('main');
  const detail=document.getElementById('detail');
  const tabsEl=document.getElementById('tabs');
  const title=document.getElementById('activeTitle');

  // Per-tab refs
  const refs={
    home:{ root:byId('homeContent'), addBtn:byId('addBtnHome'), hint:byId('homeHint'), banner:byId('homeBanner'), list:byId('homeList') },
    vehicles:{ root:byId('vehiclesContent'), addBtn:byId('addBtnVehicles'), hint:byId('vehiclesHint'), banner:byId('vehiclesBanner'), list:byId('vehiclesList') },
    health:{ root:byId('healthContent'), addBtn:byId('addBtnHealth'), hint:byId('healthHint'), banner:byId('healthBanner'), list:byId('healthList') },
    finance:{ root:byId('financeContent'), addBtn:byId('addBtnFinance'), hint:byId('financeHint'), banner:byId('financeBanner'), list:byId('financeList') },
    ids:{ root:byId('idsContent'), addBtn:byId('addBtnIds'), hint:byId('idsHint'), banner:byId('idsBanner'), list:byId('idsList') },
    pets:{ root:byId('petsContent'), addBtn:byId('addBtnPets'), hint:byId('petsHint'), banner:byId('petsBanner'), list:byId('petsList') },
    other:{ root:byId('otherContent'), addBtn:byId('addBtnOther'), hint:byId('otherHint'), banner:byId('otherBanner'), list:byId('otherList') }
  };

  // Detail view
  const detailWrap=byId('detailWrap');
  const backBtn=byId('backBtn');
  const editFromDetail=byId('editFromDetail');
  const deleteFromDetail=byId('deleteFromDetail');
  const calendarFromDetail=byId('calendarFromDetail');

  // Modal
  const overlay=byId('overlay');
  const modal=byId('modal');
  const closeBtn=byId('closeModal');
  const fTitle=byId('fTitle');
  const fType=byId('fType');
  const fDesc=byId('fDesc');
  const fStart=byId('fStart');
  const fRenewal=byId('fRenewal');
  const saveBtn=byId('saveRecord');
  const modalTitle=byId('modalTitle');

  // Confirm popup
  const cOverlay=byId('confirmOverlay');
  const cPopup=byId('confirmPopup');
  const cCancel=byId('confirmCancel');
  const cDelete=byId('confirmDelete');

  // Storage
  const STORAGE_KEY='lifesafe_tabbed_records_v112';
  let data={ home:[], vehicles:[], health:[], finance:[], ids:[], pets:[], other:[] };

  // State
  let activeTab='home';
  let editingId=null;
  let viewing={ tab:null, id:null };
  let pendingDelete=null; // {tab,id} for confirm

  // Helpers
  function byId(id){ return document.getElementById(id); }
  function load(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){ const parsed=JSON.parse(raw)||{}; data={...data, ...parsed}; }
    }catch(e){}
  }
  function save(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }catch(e){} }
  function formatDate(val){
    if(!val) return '';
    try{ const d=new Date(val+'T00:00:00'); return d.toLocaleDateString(); }catch(e){ return val; }
  }
  function daysUntil(val){
    if(!val) return Infinity;
    const today=new Date(); today.setHours(0,0,0,0);
    const d=new Date(val+'T00:00:00');
    return Math.floor((d - today)/(1000*60*60*24));
  }
  function isPast(val){ return daysUntil(val) < 0; }
  function isDueSoon(val){ const n=daysUntil(val); return n>=0 && n<=7; }

  function toggleHintFor(tabId){
    const arr=data[tabId]||[];
    const r=refs[tabId];
    if(!r) return;
    if(r.hint) r.hint.classList.toggle('hidden', arr.length>0);
  }
  function updateBanner(tabId){
    const arr=data[tabId]||[];
    const soon = arr.filter(r=>isDueSoon(r.renewalDate)).length;
    const exp  = arr.filter(r=>isPast(r.renewalDate)).length;
    const el = refs[tabId]?.banner;
    if(!el) return;
    if(soon>0 || exp>0){
      const parts=[];
      if(soon>0) parts.push(`${soon} due within 7 days`);
      if(exp>0) parts.push(`${exp} expired`);
      el.textContent = `Heads up: ` + parts.join(" · ");
      el.classList.remove('hidden');
    }else{
      el.classList.add('hidden');
      el.textContent='';
    }
  }

  function openConfirm(tabId,id){
    pendingDelete={tab:tabId,id};
    cOverlay.classList.remove('hidden');
    cPopup.classList.remove('hidden');
    requestAnimationFrame(()=>{ cOverlay.classList.add('show'); cPopup.classList.add('show'); });
  }
  function closeConfirm(){
    cOverlay.classList.remove('show'); cPopup.classList.remove('show');
    setTimeout(()=>{ cOverlay.classList.add('hidden'); cPopup.classList.add('hidden'); }, 150);
    pendingDelete=null;
  }
  cCancel.addEventListener('click', closeConfirm);
  cOverlay.addEventListener('click', closeConfirm);
  cDelete.addEventListener('click', ()=>{
    if(!pendingDelete) return;
    reallyRemove(pendingDelete.tab, pendingDelete.id);
    closeConfirm();
  });

  function makeGCalURL(rec){
    if(!rec.renewalDate) return null;
    const ymd = rec.renewalDate.replace(/-/g,'');
    const start = ymd + 'T100000';
    const end   = ymd + 'T110000';
    const params = new URLSearchParams({
      action:'TEMPLATE',
      text: rec.title || 'LifeSafe Renewal',
      details: (rec.type?`Type: ${rec.type}\n`:'') + (rec.desc||'')
    });
    params.set('dates', `${start}/${end}`);
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }
  function openGoogleCalendar(rec){
    const url=makeGCalURL(rec);
    if(url) window.open(url,'_blank','noopener');
  }

  function renderList(tabId){
    const r=refs[tabId]; if(!r) return;
    const arr=data[tabId]||[];
    r.list.innerHTML='';
    toggleHintFor(tabId);
    updateBanner(tabId);
    if(arr.length===0){
      const empty=document.createElement('div'); empty.className='centerText'; empty.textContent='No records yet';
      r.list.appendChild(empty); return;
    }
    arr.forEach(rec=>{
      const card=document.createElement('div'); card.className='card';
      const top=document.createElement('div'); top.className='cardTop';
      const left=document.createElement('div');
      const right=document.createElement('div'); right.className='actions';

      const h=document.createElement('h3'); h.className='cardTitle'; h.textContent=rec.title || '(Untitled)';
      const meta=document.createElement('div'); meta.className='meta';
      const badge=document.createElement('span'); badge.className='badge'; badge.textContent=rec.type || 'General';
      meta.appendChild(badge);
      const n = daysUntil(rec.renewalDate);
      if(n>=0 && n<=7){
        const chip=document.createElement('span'); chip.className='dueSoon'; chip.textContent=`Due soon (${n}d)`;
        meta.appendChild(chip);
      }
      const d=document.createElement('div'); d.className='desc'; d.textContent=rec.desc || '';

      const dates=document.createElement('div'); dates.className='dates';
      if(rec.startDate){ dates.appendChild(Object.assign(document.createElement('div'),{textContent:'Start: '+formatDate(rec.startDate)})); }
      if(rec.renewalDate){
        const ln2=document.createElement('div'); ln2.textContent='Renewal: '+formatDate(rec.renewalDate) + (isPast(rec.renewalDate)?'  ❗':'');
        if(isPast(rec.renewalDate)) ln2.classList.add('expired');
        dates.appendChild(ln2);
      }

      const gcBtn=document.createElement('button'); gcBtn.className='btn small ghost'; gcBtn.textContent='Add Reminder to Calendar';
      gcBtn.onclick=(e)=>{ e.stopPropagation(); openGoogleCalendar(rec); };

      const editBtn=document.createElement('button'); editBtn.className='btn small ghost'; editBtn.textContent='Edit';
      editBtn.onclick=(e)=>{ e.stopPropagation(); startEdit(tabId, rec.id); };
      const delBtn=document.createElement('button'); delBtn.className='btn small danger'; delBtn.textContent='Delete';
      delBtn.onclick=(e)=>{ e.stopPropagation(); openConfirm(tabId, rec.id); };

      right.appendChild(gcBtn); right.appendChild(editBtn); right.appendChild(delBtn);
      left.appendChild(h); left.appendChild(meta); if(d.textContent) left.appendChild(d); if(rec.startDate||rec.renewalDate) left.appendChild(dates);
      top.appendChild(left); top.appendChild(right);
      card.appendChild(top);

      card.addEventListener('click', ()=>openDetail(tabId, rec.id));
      r.list.appendChild(card);
    });
  }

  function renderActiveTab(){ renderList(activeTab); }

  // Tabs UI
  tabs.forEach(t=>{
    const b=document.createElement('button');
    b.id='tab-'+t.id; b.textContent=t.label;
    b.onclick=()=>switchTab(t.id);
    if(t.id===activeTab) b.classList.add('active');
    tabsEl.appendChild(b);
  });

  function switchTab(id){
    activeTab=id;
    tabs.forEach(t=>{
      document.getElementById(t.content).classList.add('hidden');
      byId('tab-'+t.id).classList.remove('active');
    });
    const t=tabs.find(x=>x.id===id);
    if(!t) return;
    document.getElementById(t.content).classList.remove('hidden');
    byId('tab-'+t.id).classList.add('active');
    title.textContent=t.label;
    renderActiveTab();
  }

  // Splash -> main
  setTimeout(()=>{ splash.classList.add('hidden'); main.classList.remove('hidden'); }, 700);

  // Modal
  function openModal(mode='add'){
    overlay.classList.remove('hidden'); modal.classList.remove('hidden');
    requestAnimationFrame(()=>{ overlay.classList.add('show'); modal.classList.add('show'); });
    if(mode==='add'){
      modalTitle.textContent='Add Record'; saveBtn.textContent='Save';
      fTitle.value=''; fType.value=''; fDesc.value=''; fStart.value=''; fRenewal.value='';
      editingId=null;
    }else{
      modalTitle.textContent='Edit Record'; saveBtn.textContent='Save changes';
    }
    fTitle.focus();
  }
  function closeModal(){
    overlay.classList.remove('show'); modal.classList.remove('show');
    setTimeout(()=>{ overlay.classList.add('hidden'); modal.classList.add('hidden'); }, 150);
  }

  function startEdit(tabId, id){
    const list = data[tabId]||[];
    const rec=list.find(r=>r.id===id); if(!rec) return;
    editingId={ tab: tabId, id };
    openModal('edit');
    fTitle.value=rec.title||''; fType.value=rec.type||''; fDesc.value=rec.desc||'';
    fStart.value=rec.startDate||''; fRenewal.value=rec.renewalDate||'';
  }

  function reallyRemove(tabId, id){
    data[tabId]=(data[tabId]||[]).filter(r=>r.id!==id);
    save(); renderList(tabId);
    if(viewing.tab===tabId && viewing.id===id){ showMain(); }
    updateBanner(tabId);
  }

  // Add buttons per tab
  Object.keys(refs).forEach(key=>{
    const r=refs[key];
    r.addBtn.addEventListener('click', ()=>openModal('add'));
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  saveBtn.addEventListener('click', ()=>{
    const payload={
      title: fTitle.value.trim(),
      type: fType.value.trim(),
      desc: fDesc.value.trim(),
      startDate: fStart.value || '',
      renewalDate: fRenewal.value || '',
      createdAt: new Date().toISOString()
    };
    if(editingId){
      const arr=data[editingId.tab]||[];
      const idx=arr.findIndex(r=>r.id===editingId.id);
      if(idx>-1){ arr[idx]={...arr[idx], ...payload}; data[editingId.tab]=arr; }
    }else{
      const id = Date.now().toString(36);
      data[activeTab]=[ { id, ...payload }, ...(data[activeTab]||[]) ];
    }
    save(); renderList(activeTab); updateBanner(activeTab); closeModal();
  });

  // Detail view
  function openDetail(tabId, id){
    viewing={ tab: tabId, id };
    const rec=(data[tabId]||[]).find(r=>r.id===id); if(!rec) return;
    renderDetail(tabId, rec);
    showDetail();
  }
  function renderDetail(tabId, rec){
    detailWrap.innerHTML='';
    const card=document.createElement('div'); card.className='detailCard';
    const titleEl=document.createElement('h3'); titleEl.className='detailTitle'; titleEl.textContent=rec.title||'(Untitled)';
    const meta=document.createElement('div'); meta.className='detailMeta';
    meta.textContent=(rec.type||'General')+' • '+tabId[0].toUpperCase()+tabId.slice(1);
    const desc=document.createElement('div'); desc.className='detailDesc'; desc.textContent=rec.desc||'';
    const dates=document.createElement('div'); dates.className='detailDates';
    if(rec.startDate){ dates.appendChild(Object.assign(document.createElement('div'),{textContent:'Start Date: '+formatDate(rec.startDate)})); }
    if(rec.renewalDate){
      const n = daysUntil(rec.renewalDate);
      const ln=document.createElement('div'); ln.textContent='Renewal Date: '+formatDate(rec.renewalDate);
      if(n>=0 && n<=7){ ln.textContent += `  (due in ${n}d)`; }
      if(n<0){ ln.textContent += '  ❗'; ln.classList.add('expired'); }
      dates.appendChild(ln);
    }
    card.appendChild(titleEl); card.appendChild(meta); if(desc.textContent) card.appendChild(desc); if(rec.startDate||rec.renewalDate) card.appendChild(dates);
    detailWrap.appendChild(card);

    calendarFromDetail.onclick=()=>openGoogleCalendar(rec);
    editFromDetail.onclick=()=>startEdit(tabId, rec.id);
    deleteFromDetail.onclick=()=>openConfirm(tabId, rec.id);
  }

  function showDetail(){ main.classList.add('hidden'); detail.classList.remove('hidden'); }
  function showMain(){ detail.classList.add('hidden'); detailWrap.innerHTML=''; viewing={tab:null,id:null}; main.classList.remove('hidden'); }

  backBtn.addEventListener('click', showMain);

  // Init
  load();
  // Build tabs and first render
  switchTab('home');
})();