(function(){
  const TABS = [
    {id:'home', label:'Home', contentId:'homeContent'},
    {id:'vehicles', label:'Vehicles', contentId:'vehiclesContent'},
    {id:'health', label:'Health', contentId:'healthContent'},
    {id:'finance', label:'Finance', contentId:'financeContent'},
    {id:'ids', label:'IDs & Docs', contentId:'idsContent'},
    {id:'pets', label:'Pets', contentId:'petsContent'},
    {id:'other', label:'Other', contentId:'otherContent'},
  ];

  const splash = document.getElementById('splash');
  const phone = document.getElementById('homePhone');
  const tabsEl = document.getElementById('tabs');
  const activeTitle = document.getElementById('activeTitle');

  // Render tabs
  let active = 'home';
  TABS.forEach(tab => {
    const btn = document.createElement('button');
    btn.className = 'pillTab' + (tab.id===active ? ' active' : '');
    btn.textContent = tab.label;
    btn.addEventListener('click', () => setActive(tab.id));
    tabsEl.appendChild(btn);
    tab._btn = btn;
  });

  function setActive(id){
    active = id;
    const item = TABS.find(t=>t.id===id);
    activeTitle.textContent = item.label;

    // toggle tab button state
    TABS.forEach(t => t._btn.classList.toggle('active', t.id===id));

    // hide all sections, show only active
    TABS.forEach(t => {
      const el = document.getElementById(t.contentId);
      if(!el) return;
      if(t.id === id) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });
  }

  // Splash → App
  setTimeout(() => {
    splash.classList.add('hidden');
    phone.classList.remove('hidden');
    setActive('home'); // ensure initial state is consistent
  }, 900);

  // Wire the Home Add Record button (placeholder only)
  const addBtnHome = document.getElementById('addBtnHome');
  if(addBtnHome){
    addBtnHome.addEventListener('click', () => addBtnHome.blur());
  }
})();