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

  // Modal logic (V1.03)
  const overlay=document.getElementById('overlay');
  const modal=document.getElementById('modal');
  const addBtn=document.getElementById('addBtnHome');
  const closeBtn=document.getElementById('closeModal');

  function openModal(){
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    requestAnimationFrame(()=>{ overlay.classList.add('show'); modal.classList.add('show'); });
    document.getElementById('fTitle').focus();
  }
  function closeModal(){
    overlay.classList.remove('show');
    modal.classList.remove('show');
    setTimeout(()=>{ overlay.classList.add('hidden'); modal.classList.add('hidden'); }, 180);
  }

  addBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  // Save button (no-op for V1.03)
  document.getElementById('saveRecord').addEventListener('click', ()=>{
    // No saving yet in V1.03
    // We'll implement temporary in-memory save in V1.04
    closeModal();
  });

})();