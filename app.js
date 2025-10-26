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

  const splash=document.getElementById('splash');
  const main=document.getElementById('main');
  const detail=document.getElementById('detail');
  const tabsEl=document.getElementById('tabs');
  const title=document.getElementById('activeTitle');
  const listEl=document.getElementById('homeList');
  const hintEl=document.getElementById('homeHint');
  const detailWrap=document.getElementById('detailWrap');
  const backBtn=document.getElementById('backBtn');
  const editFromDetail=document.getElementById('editFromDetail');
  const deleteFromDetail=document.getElementById('deleteFromDetail');

  const STORAGE_KEY='lifesafe_records_v105'; // keep same to preserve existing data

  // Helpers
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
  function toggleHint(){
    if(!hintEl) return;
    hintEl.classList.toggle('hidden', records.length>0);
  }

  // Records
  let records=[]; // {id,title,type,desc,startDate,renewalDate,createdAt}
  function load(){
    try{ const raw=localStorage.getItem(STORAGE_KEY); if(raw) records=JSON.parse(raw)||[]; }catch(e){ records=[]; }
  }
  function save(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }catch(e){} }

  function renderList(){
    listEl.innerHTML='';
    toggleHint();
    if(records.length===0){
      const empty=document.createElement('div'); empty.className='centerText'; empty.textContent='No records yet';
      listEl.appendChild(empty); return;
    }
    records.forEach(rec=>{
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
      editBtn.onclick=(e)=>{ e.stopPropagation(); startEdit(rec.id); };
      const delBtn=document.createElement('button'); delBtn.className='btn small danger'; delBtn.textContent='Delete';
      delBtn.onclick=(e)=>{ e.stopPropagation(); remove(rec.id); };

      right.appendChild(editBtn); right.appendChild(delBtn);
      left.appendChild(h); left.appendChild(meta); if(d.textContent) left.appendChild(d); if(rec.startDate||rec.renewalDate) left.appendChild(dates);
      top.appendChild(left); top.appendChild(right);
      card.appendChild(top);

      card.addEventListener('click', ()=>openDetail(rec.id));
      listEl.appendChild(card);
    });
  }

  // Build tabs
  tabs.forEach(t=>{
    const b=document.createElement('button');
    b.id='tab-'+t.id; b.textContent=t.label;
    b.onclick=()=>switchTab(t.id);
    if(t.id==='home') b.classList.add('active');
    tabsEl.appendChild(b);
  });

  function switchTab(id){
    tabs.forEach(t=>{
      document.getElementById(t.content).classList.add('hidden');
      document.getElementById('tab-'+t.id).classList.remove('active');
    });
    const t=tabs.find(x=>x.id===id); if(!t) return;
    document.getElementById(t.content).classList.remove('hidden');
    document.getElementById('tab-'+t.id).classList.add('active');
    title.textContent=t.label;
  }

  // Splash -> main
  setTimeout(()=>{ splash.classList.add('hidden'); main.classList.remove('hidden'); }, 800);

  // Modal logic
  const overlay=document.getElementById('overlay');
  const modal=document.getElementById('modal');
  const addBtn=document.getElementById('addBtnHome');
  const closeBtn=document.getElementById('closeModal');
  const fTitle=document.getElementById('fTitle');
  const fType=document.getElementById('fType');
  const fDesc=document.getElementById('fDesc');
  const fStart=document.getElementById('fStart');
  const fRenewal=document.getElementById('fRenewal');
  const saveBtn=document.getElementById('saveRecord');
  const modalTitle=document.getElementById('modalTitle');

  let editingId=null;
  let viewingId=null;

  function openModal(mode='add'){
    overlay.classList.remove('hidden'); modal.classList.remove('hidden');
    requestAnimationFrame(()=>{ overlay.classList.add('show'); modal.classList.add('show'); });
    if(mode==='add'){
      modalTitle.textContent='Add Record'; saveBtn.textContent='Save';
      fTitle.value=''; fType.value=''; fDesc.value=''; fStart.value=''; fRenewal.value='';
      editingId=null;
    }
    fTitle.focus();
  }
  function closeModal(){
    overlay.classList.remove('show'); modal.classList.remove('show');
    setTimeout(()=>{ overlay.classList.add('hidden'); modal.classList.add('hidden'); }, 180);
  }

  function startEdit(id){
    const rec=records.find(r=>r.id===id); if(!rec) return;
    editingId=id;
    modalTitle.textContent='Edit Record'; saveBtn.textContent='Save changes';
    fTitle.value=rec.title||''; fType.value=rec.type||''; fDesc.value=rec.desc||'';
    fStart.value=rec.startDate||''; fRenewal.value=rec.renewalDate||'';
    openModal('edit');
  }

  function remove(id){
    if(!confirm('Delete this record?')) return;
    records = records.filter(r=>r.id!==id); save(); renderList();
    if(viewingId===id){ showMain(); }
  }

  addBtn.addEventListener('click', ()=>openModal('add'));
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  // Save (add or edit)
  saveBtn.addEventListener('click', ()=>{
    const payload={
      title: fTitle.value.trim(),
      type: fType.value.trim(),
      desc: fDesc.value.trim(),
      startDate: fStart.value || '',
      renewalDate: fRenewal.value || ''
    };
    if(editingId){
      const idx=records.findIndex(r=>r.id===editingId);
      if(idx>-1){ records[idx]={...records[idx], ...payload}; }
      if(viewingId===editingId){ renderDetail(records[idx]); }
    }else{
      const id = Date.now().toString(36);
      records.unshift({ id, createdAt: new Date().toISOString(), ...payload });
    }
    save(); renderList(); closeModal();
  });

  // Detail view
  function openDetail(id){
    viewingId=id;
    const rec=records.find(r=>r.id===id); if(!rec) return;
    renderDetail(rec);
    showDetail();
  }
  function renderDetail(rec){
    detailWrap.innerHTML='';
    const card=document.createElement('div'); card.className='detailCard';
    const titleEl=document.createElement('h3'); titleEl.className='detailTitle'; titleEl.textContent=rec.title||'(Untitled)';
    const meta=document.createElement('div'); meta.className='detailMeta'; meta.textContent=rec.type || 'General';
    const desc=document.createElement('div'); desc.className='detailDesc'; desc.textContent=rec.desc||'';
    const dates=document.createElement('div'); dates.className='detailDates';
    if(rec.startDate){ dates.appendChild(Object.assign(document.createElement('div'),{textContent:'Start Date: '+formatDate(rec.startDate)})); }
    if(rec.renewalDate){ 
      const ln=document.createElement('div');
      ln.textContent='Renewal Date: '+formatDate(rec.renewalDate) + (isPast(rec.renewalDate)?'  ❗':'');
      if(isPast(rec.renewalDate)) ln.classList.add('expired');
      dates.appendChild(ln);
    }
    card.appendChild(titleEl); card.appendChild(meta);
    if(desc.textContent) card.appendChild(desc);
    if(rec.startDate || rec.renewalDate) card.appendChild(dates);
    detailWrap.appendChild(card);
  }

  function showDetail(){ main.classList.add('hidden'); detail.classList.remove('hidden'); }
  function showMain(){ detail.classList.add('hidden'); detailWrap.innerHTML=''; viewingId=null; main.classList.remove('hidden'); }

  backBtn.addEventListener('click', showMain);
  editFromDetail.addEventListener('click', ()=>{ if(viewingId) startEdit(viewingId); });
  deleteFromDetail.addEventListener('click', ()=>{ if(viewingId) remove(viewingId); });

  // Init
  load(); renderList();
})();