(function(){
  const TABS = ['Home','Vehicles','Health','Finance','IDs & Docs','Pets','Other'];
  const splash = document.getElementById('splash');
  const home = document.getElementById('home');
  const tabsEl = document.getElementById('tabs');
  const activeTitle = document.getElementById('activeTitle');
  let active = 'Home';

  TABS.forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'pill' + (name===active ? ' active' : '');
    btn.textContent = name;
    btn.addEventListener('click', () => {
      active = name;
      activeTitle.textContent = name;
      Array.from(tabsEl.children).forEach(ch => ch.classList.remove('active'));
      btn.classList.add('active');
    });
    tabsEl.appendChild(btn);
  });

  setTimeout(() => {
    splash.classList.add('hidden');
    home.classList.remove('hidden');
  }, 900);
})();