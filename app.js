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

 function switchTab(id){
  tabs.forEach(t=>{
    document.getElementById(t.content).classList.add('hidden');
  });
  const t=tabs.find(x=>x.id===id);
  if(t){
    document.getElementById(t.content).classList.remove('hidden');
    title.textContent=t.label;
  }
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
 }

 tabs.forEach(t=>{
  const btn=document.createElement('button');
  btn.id='tab-'+t.id;
  btn.textContent=t.label;
  btn.onclick=()=>switchTab(t.id);
  if(t.id==='home') btn.classList.add('active');
  tabsEl.appendChild(btn);
 });

 setTimeout(()=>{
  splash.classList.add('hidden');
  main.classList.remove('hidden');
 },800);
})();