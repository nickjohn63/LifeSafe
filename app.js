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
  const tabsEl=document.getElementById('tabs');
  const title=document.getElementById('activeTitle');
  const listEl=document.getElementById('homeList');

  // In-memory records (V1.04)
  const records=[]; // {id,title,type,desc,createdAt}

  function renderList(){
    listEl.innerHTML='';
    if(records.length===0){
      // keep helper visible
      return;
    }
    records.forEach(rec=>{
      const card=document.createElement('div');
      card.className='card';
      const h=document.createElement('h3');
      h.className='cardTitle';
      h.textContent=rec.title || '(Untitled)';
      const meta=document.createElement('div');
      meta.className='meta';
      const badge=document.createElement('span');
      badge.className='badge';
      badge.textContent=rec.type || 'General';
      meta.appendChild(badge);
      const d=document.createElement('div');
      d.className='desc';
      d.textContent=rec.desc || '';

      card.appendChild(h);
      card.appendChild(meta);
      if(d.textContent) card.appendChild(d);
      listEl.appendChild(card);
    });
  }

  // Build tabs
  tabs.forEach(t=>{
    const b=document.createElement('button');
    b.id='tab-'+t.id;
    b.textContent=t.label;
    b.onclick=()=>switchTab(t.id);
    if(t.id==='home') b.classList.add('active');
    tabsEl.appendChild(b);
  });

  function switchTab(id){
    tabs.forEach(t=>{
      document.getElementById(t.content).classList.add('hidden');
      document.getElementById('tab-'+t.id).classList.remove('active');
    });
    const t=tabs.find(x=>x.id===id);
    if(!t) return;
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

  function openModal(){
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    requestAnimationFrame(()=>{ overlay.classList.add('show'); modal.classList.add('show'); });
    fTitle.focus();
  }
  function closeModal(){
    overlay.classList.remove('show');
    modal.classList.remove('show');
    setTimeout(()=>{ overlay.classList.add('hidden'); modal.classList.add('hidden'); }, 180);
  }
  function clearForm(){
    fTitle.value=''; fType.value=''; fDesc.value='';
  }

  addBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', ()=>{ closeModal(); });
  overlay.addEventListener('click', closeModal);

  // Save -> push to in-memory list and render
  document.getElementById('saveRecord').addEventListener('click', ()=>{
    const rec={
      id: Date.now().toString(36),
      title: fTitle.value.trim(),
      type: fType.value.trim(),
      desc: fDesc.value.trim(),
      createdAt: new Date().toISOString()
    };
    records.unshift(rec); // newest first
    renderList();
    clearForm();
    closeModal();
    // Scroll to top of list to show the new item
    listEl.scrollIntoView({behavior:'smooth', block:'start'});
  });

  // Initial render
  renderList();
})();