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

  // Home refs
  const home={
    root: document.getElementById('homeContent'),
    addBtn: document.getElementById('addBtnHome'),
    hint: document.getElementById('homeHint'),
    list: document.getElementById('homeList')
  };
  // Vehicles refs
  const vehicles={
    root: document.getElementById('vehiclesContent'),
    addBtn: document.getElementById('addBtnVehicles'),
    hint: document.getElementById('vehiclesHint'),
    list: document.getElementById('vehiclesList')
  };

  // Detail view
  const detailWrap=document.getElementById('detailWrap');
  const backBtn=document.getElementById('backBtn');
  const editFromDetail=document.getElementById('editFromDetail');
  const deleteFromDetail=document.getElementById('deleteFromDetail');

  // Modal
  const overlay=document.getElementById('overlay');
  const modal=document.getElementById('modal');
  const closeBtn=document.getElementById('closeModal');
  const fTitle=document.getElementById('fTitle');
  const fType=document.getElementById('fType');
  const fDesc=document.getElementById('fDesc');
  const fStart=document.getElementById('fStart');
  const fRenewal=document.getElementById('fRenewal');
  const saveBtn=document.getElementById('saveRecord');
  const modalTitle=document.getElementById('modalTitle');

  // Storage
  const STORAGE_KEY='lifesafe_tabbed_records_v109';
  let data={
    home: [],
    vehicles: [],
    health: [],
    finance: [],
    ids: [],
    pets: [],
    other: []
  };

  // State
  let activeTab='home';
  let editingId=null;
  let viewing={ tab:null, id:null };

  // Helpers
  function load(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){ const parsed=JSON.parse(raw)||{}; data={...data, ...parsed}; }
    }catch(e){ /* ignore */ }
  }
  function save(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }catch(e){}
  }
  function formatDate(val){
    if(!val) return '';
    try{ const d=new Date(val+'T00:00:00'); return d.toLocaleDateString(); }catch(e){ return val; }
  }
  function isPast(val){
    if(!val) return false;
    const today=new Date(); today.setHours(0,0,0,0);
    const d=new Date(val+'T00:00:00');
    return d < today;
  }
  function toggleHintFor(tabId){
    const arr=data[tabId]||[];
    if(tabId==='home' && home.hint){ home.hint.classList.toggle('hidden', arr.length>0); }
    if(tabId==='vehicles' && vehicles.hint){ vehicles.hint.classList.toggle('hidden', arr.length>0); }
  }

  // Rendering
  function renderList(tabId){
    const arr=data[tabId]||[];
    const container = tabId==='home' ? home.list : tabId==='vehicles' ? vehicles.list : null;
    if(!container) return;
    container.innerHTML='';
    toggleHintFor(tabId);
    if(arr.length===0){
      const empty=document.createElement('div'); empty.className='centerText'; empty.textContent='No records yet';
      container.appendChild(empty); return;
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
      const d=document.createElement('div'); d.className='desc'; d.textContent=rec.desc || '';

      const dates=document.createElement('div'); dates.className='dates';
      if(rec.startDate){ dates.appendChild(Object.assign(document.createElement('div'),{textContent:'Start: '+formatDate(rec.startDate)})); }
      if(rec.renewalDate){
        const ln2=document.createElement('div'); ln2.textContent='Renewal: '+formatDate(rec.renewalDate) + (isPast(rec.renewalDate)?'  ❗':'');
        if(isPast(rec.renewalDate)) ln2.classList.add('expired');
        dates.appendChild(ln2);
      }

      const editBtn=document.createElement('button'); editBtn.className='btn small ghost'; editBtn.textContent='Edit';
      editBtn.onclick=(e)=>{ e.stopPropagation(); startEdit(tabId, rec.id); };
      const delBtn=document.createElement('button'); delBtn.className='btn small danger'; delBtn.textContent='Delete';
      delBtn.onclick=(e)=>{ e.stopPropagation(); remove(tabId, rec.id); };

      right.appendChild(editBtn); right.appendChild(delBtn);
      left.appendChild(h); left.appendChild(meta); if(d.textContent) left.appendChild(d); if(rec.startDate||rec.renewalDate) left.appendChild(dates);
      top.appendChild(left); top.appendChild(right);
      card.appendChild(top);

      card.addEventListener('click', ()=>openDetail(tabId, rec.id));
      container.appendChild(card);
    });
  }

  function renderActiveTab(){
    renderList(activeTab);
  }

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
      document.getElementById('tab-'+t.id).classList.remove('active');
    });
    const t=tabs.find(x=>x.id===id);
    if(!t) return;
    document.getElementById(t.content).classList.remove('hidden');
    document.getElementById('tab-'+t.id).classList.add('active');
    title.textContent=t.label;
    renderActiveTab();
  }

  // Splash -> main
  setTimeout(()=>{ splash.classList.add('hidden'); main.classList.remove('hidden'); }, 800);

  // Modal
  function openModal(mode='add', presetTab=activeTab){
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
    setTimeout(()=>{ overlay.classList.add('hidden'); modal.classList.add('hidden'); }, 180);
  }

  function startEdit(tabId, id){
    const list = data[tabId]||[];
    const rec=list.find(r=>r.id===id); if(!rec) return;
    editingId={ tab: tabId, id };
    modalTitle.textContent='Edit Record'; saveBtn.textContent='Save changes';
    fTitle.value=rec.title||''; fType.value=rec.type||''; fDesc.value=rec.desc||'';
    fStart.value=rec.startDate||''; fRenewal.value=rec.renewalDate||'';
    openModal('edit');
  }

  function remove(tabId, id){
    if(!confirm('Delete this record?')) return;
    data[tabId]=(data[tabId]||[]).filter(r=>r.id!==id);
    save(); renderList(tabId);
    if(viewing.tab===tabId && viewing.id===id){ showMain(); }
  }

  // Add buttons per tab
  home.addBtn.addEventListener('click', ()=>openModal('add','home'));
  vehicles.addBtn.addEventListener('click', ()=>openModal('add','vehicles'));

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  // Save (add or edit) -> uses current activeTab for destination
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
      if(idx>-1){ arr[idx]={...arr[idx], ...payload}; }
      if(viewing.tab===editingId.tab && viewing.id===editingId.id){ renderDetail(editingId.tab, arr[idx]); }
      data[editingId.tab]=arr;
    }else{
      const id = Date.now().toString(36);
      data[activeTab]=[ { id, ...payload }, ...(data[activeTab]||[]) ];
    }
    save(); renderList(activeTab); closeModal();
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
    const meta=document.createElement('div'); meta.className='detailMeta'; meta.textContent=(rec.type||'General')+' • '+tabId[0].toUpperCase()+tabId.slice(1);
    const desc=document.createElement('div'); desc.className='detailDesc'; desc.textContent=rec.desc||'';
    const dates=document.createElement('div'); dates.className='detailDates';
    if(rec.startDate){ dates.appendChild(Object.assign(document.createElement('div'),{textContent:'Start Date: '+formatDate(rec.startDate)})); }
    if(rec.renewalDate){
      const ln=document.createElement('div'); ln.textContent='Renewal Date: '+formatDate(rec.renewalDate) + (isPast(rec.renewalDate)?'  ❗':'');
      if(isPast(rec.renewalDate)) ln.classList.add('expired');
      dates.appendChild(ln);
    }
    card.appendChild(titleEl); card.appendChild(meta); if(desc.textContent) card.appendChild(desc); if(rec.startDate||rec.renewalDate) card.appendChild(dates);
    detailWrap.appendChild(card);
  }
  function showDetail(){ main.classList.add('hidden'); detail.classList.remove('hidden'); }
  function showMain(){ detail.classList.add('hidden'); detailWrap.innerHTML=''; viewing={tab:null,id:null}; main.classList.remove('hidden'); }

  backBtn.addEventListener('click', showMain);
  editFromDetail.addEventListener('click', ()=>{ if(viewing.tab && viewing.id) startEdit(viewing.tab, viewing.id); });
  deleteFromDetail.addEventListener('click', ()=>{ if(viewing.tab && viewing.id) remove(viewing.tab, viewing.id); });

  // Init
  load();
  // Build tabs UI state and render initial
  tabs.forEach(t=>{ if(t.id==='home') document.getElementById(t.content).classList.remove('hidden'); });
  // Toggle hints on first load
  ['home','vehicles'].forEach(toggleHintFor);
  renderList('home'); // Home first
})();