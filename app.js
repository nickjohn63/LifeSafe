// LifeSafe v1.17-Light — Secure Login (Google + Email link) + Firebase Storage/Firestore Uploads
// Built for GitHub Pages + iPhone Safari (compat SDKs, no modules).

(function(){
  const splash=document.getElementById('splash');
  const main=document.getElementById('main');
  const showApp=()=>{try{splash.classList.add('hidden');main.classList.remove('hidden');}catch(e){}};
  setTimeout(showApp,900);
  window.addEventListener('error',showApp);
  window.addEventListener('unhandledrejection',showApp);

  // ---------- Firebase init ----------
  const cfg=window.LIFESAFE_FIREBASE_CONFIG;
  const s1=document.getElementById('authStatus');
  const s2=document.getElementById('authStatus2');
  const set1=(t)=>{if(s1) s1.textContent=t;};
  const set2=(t)=>{if(s2) s2.textContent=t;};

  let uid=localStorage.getItem('lifesafe_uid')||null;
  let db=null, storage=null, auth=null;
  let uploads=[];
  let uploadsUnsub=null;

  function humanSize(bytes){
    if(bytes==null) return '';
    const kb=bytes/1024;
    if(kb<1024) return Math.round(kb)+' KB';
    return (kb/1024).toFixed(1)+' MB';
  }
  function safeName(name){
    return (name||'file').replace(/[^\w.\- ]+/g,'_').replace(/\s+/g,' ').trim();
  }

  // Build auth panel in Uploads banner (no extra HTML edits needed)
  function ensureAuthPanel(){
    const banner=document.getElementById('uploadsBanner');
    if(!banner) return null;
    let panel=document.getElementById('authPanel');
    if(panel) return panel;

    panel=document.createElement('div');
    panel.id='authPanel';
    panel.className='authPanel';

    const googleBtn=document.createElement('button');
    googleBtn.className='btn ghost';
    googleBtn.id='googleSignInBtn';
    googleBtn.textContent='Sign in with Google';

    const email=document.createElement('input');
    email.id='emailInput';
    email.type='email';
    email.placeholder='Email for sign-in link';
    email.autocomplete='email';

    const emailBtn=document.createElement('button');
    emailBtn.className='btn ghost';
    emailBtn.id='emailLinkBtn';
    emailBtn.textContent='Send sign-in link';

    const signOutBtn=document.createElement('button');
    signOutBtn.className='btn danger';
    signOutBtn.id='signOutBtn';
    signOutBtn.textContent='Sign out';

    panel.appendChild(googleBtn);
    panel.appendChild(email);
    panel.appendChild(emailBtn);
    panel.appendChild(signOutBtn);
    banner.appendChild(panel);
    return panel;
  }

  function actionUrl(){
    // stay on same GitHub Pages path; strip query
    return window.location.origin + window.location.pathname;
  }

  async function handleRedirectResult(){
    try{
      if(!auth) return;
      await auth.getRedirectResult();
    }catch(err){
      console.error(err);
      set2('Auth redirect error: ' + (err && err.message ? err.message : String(err)));
    }
  }

  async function startGoogleSignIn(){
    try{
      const provider = new firebase.auth.GoogleAuthProvider();
      const user = auth.currentUser;
      if(user && user.isAnonymous){
        // link -> keeps same UID (keeps access to existing uploads)
        await user.linkWithRedirect(provider);
      }else{
        await auth.signInWithRedirect(provider);
      }
    }catch(err){
      console.error(err);
      alert('Google sign-in failed: ' + (err && err.message ? err.message : String(err)));
    }
  }

  async function sendEmailLink(email){
    const acs = { url: actionUrl(), handleCodeInApp: true };
    try{
      localStorage.setItem('lifesafe_emailForSignIn', email);
      await auth.sendSignInLinkToEmail(email, acs);
      alert('Sign-in link sent. Open it from your email on this device.');
    }catch(err){
      console.error(err);
      alert('Email link failed: ' + (err && err.message ? err.message : String(err)));
    }
  }

  async function completeEmailLinkIfPresent(){
    try{
      if(!auth) return;
      const link = window.location.href;
      if(!auth.isSignInWithEmailLink(link)) return;

      const email = localStorage.getItem('lifesafe_emailForSignIn') || window.prompt('Confirm your email to finish sign-in');
      if(!email) return;

      const cred = firebase.auth.EmailAuthProvider.credentialWithLink(email, link);
      const user = auth.currentUser;

      if(user && user.isAnonymous){
        await user.linkWithCredential(cred);
      }else{
        await auth.signInWithCredential(cred);
      }

      localStorage.removeItem('lifesafe_emailForSignIn');
      window.history.replaceState({}, document.title, actionUrl());
    }catch(err){
      console.error(err);
      alert('Completing email sign-in failed: ' + (err && err.message ? err.message : String(err)));
    }
  }

  async function doSignOut(){
    try{
      await auth.signOut();
      // keep app usable; return to anonymous
      await auth.signInAnonymously();
    }catch(err){
      console.error(err);
      alert('Sign out failed: ' + (err && err.message ? err.message : String(err)));
    }
  }

  function setAuthUI(user){
    const panel=ensureAuthPanel();
    if(!panel) return;
    const googleBtn=document.getElementById('googleSignInBtn');
    const emailInput=document.getElementById('emailInput');
    const emailBtn=document.getElementById('emailLinkBtn');
    const signOutBtn=document.getElementById('signOutBtn');

    googleBtn.onclick = startGoogleSignIn;
    emailBtn.onclick = ()=>{
      const email=(emailInput.value||'').trim();
      if(!email) return alert('Enter an email address first.');
      sendEmailLink(email);
    };
    signOutBtn.onclick = doSignOut;

    if(!user){
      signOutBtn.style.display='none';
      return;
    }
    signOutBtn.style.display = user.isAnonymous ? 'none' : '';
    if(user.isAnonymous){
      set2('Optional: sign in to use this across devices.');
    }else{
      const who = user.email || 'Signed in';
      set2('Signed in. Account: ' + who);
    }
  }

  set1('Firebase: initializing…');
  try{
    if(!cfg) throw new Error('Missing Firebase config');
    if(!window.firebase) throw new Error('Firebase SDK not loaded');

    firebase.initializeApp(cfg);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();

    // Finish email link sign-in if present, then handle Google redirect
    completeEmailLinkIfPresent();
    handleRedirectResult();

    auth.onAuthStateChanged((user)=>{
      if(user){
        uid=user.uid;
        localStorage.setItem('lifesafe_uid',uid);
        set1((user.isAnonymous?'Signed in (anonymous). ':'Signed in. ') + 'User ID: ' + uid.slice(0,8) + '…');
        setAuthUI(user);
        startUploadsListener();
        if(active==='uploads') renderList('uploads');
      }else{
        set1('Signing in…');
      }
    });

    // Ensure session exists
    auth.signInAnonymously().catch((err)=>{
      set1('Auth error: '+(err&&err.message?err.message:String(err)));
      set2('Firebase Console → Authentication → enable Anonymous + Google/Email.');
    });
  }catch(err){
    set1('Firebase init error: '+(err&&err.message?err.message:String(err)));
    set2('Try adding ?v=117 to your URL to bypass cache.');
  }

  // ---------- UI + Records (from v1.16) ----------
  const tabs=[
    {id:'home',label:'Home',content:'homeContent'},
    {id:'vehicles',label:'Vehicles',content:'vehiclesContent'},
    {id:'health',label:'Health',content:'healthContent'},
    {id:'finance',label:'Finance',content:'financeContent'},
    {id:'ids',label:'IDs & Docs',content:'idsContent'},
    {id:'pets',label:'Pets',content:'petsContent'},
    {id:'other',label:'Other',content:'otherContent'},
    {id:'uploads',label:'Uploads',content:'uploadsContent'},
  ];
  const byId=(id)=>document.getElementById(id);
  const tabsEl=byId('tabs');
  const titleEl=byId('activeTitle');

  const overlay=byId('overlay');
  const modal=byId('modal');
  const closeModal=byId('closeModal');
  const fTitle=byId('fTitle'), fType=byId('fType'), fDesc=byId('fDesc'), fStart=byId('fStart'), fRenewal=byId('fRenewal');
  const saveRecord=byId('saveRecord');

  const cOv=byId('confirmOverlay'), cPop=byId('confirmPopup'), cCancel=byId('confirmCancel'), cDelete=byId('confirmDelete');

  const refs={
    home:{addBtn:byId('addBtnHome'),list:byId('homeList'),hint:byId('homeHint'),banner:byId('homeBanner')},
    vehicles:{addBtn:byId('addBtnVehicles'),list:byId('vehiclesList'),hint:byId('vehiclesHint'),banner:byId('vehiclesBanner')},
    health:{addBtn:byId('addBtnHealth'),list:byId('healthList'),hint:byId('healthHint'),banner:byId('healthBanner')},
    finance:{addBtn:byId('addBtnFinance'),list:byId('financeList'),hint:byId('financeHint'),banner:byId('financeBanner')},
    ids:{addBtn:byId('addBtnIds'),list:byId('idsList'),hint:byId('idsHint'),banner:byId('idsBanner')},
    pets:{addBtn:byId('addBtnPets'),list:byId('petsList'),hint:byId('petsHint'),banner:byId('petsBanner')},
    other:{addBtn:byId('addBtnOther'),list:byId('otherList'),hint:byId('otherHint'),banner:byId('otherBanner')},
    uploads:{addBtn:byId('addBtnUploads'),list:byId('uploadsList'),hint:byId('uploadsHint'),banner:byId('uploadsBanner'),file:byId('filePicker')},
  };

  const STORAGE='lifesafe_light_v114a';
  let data={home:[],vehicles:[],health:[],finance:[],ids:[],pets:[],other:[]};
  let active='home';
  let editing=null;
  let pendingDel=null;

  function load(){try{const raw=localStorage.getItem(STORAGE); if(raw) data={...data,...(JSON.parse(raw)||{})};}catch(e){}}
  function save(){try{localStorage.setItem(STORAGE,JSON.stringify(data));}catch(e){}}
  function daysTo(v){if(!v) return Infinity; const t=new Date();t.setHours(0,0,0,0);const d=new Date(v+'T00:00:00');return Math.floor((d-t)/86400000);}
  function past(v){return daysTo(v)<0;}
  function soon(v){const n=daysTo(v);return n>=0&&n<=7;}
  function fmtDate(v){if(!v) return ''; try{return new Date(v+'T00:00:00').toLocaleDateString();}catch(e){return v;}}

  function toggleHint(tab){
    const r=refs[tab]; if(!r||!r.hint) return;
    if(tab==='uploads') r.hint.classList.toggle('hidden', uploads.length>0);
    else r.hint.classList.toggle('hidden', (data[tab]||[]).length>0);
  }
  function banner(tab){
    if(tab==='uploads') return;
    const r=refs[tab]; if(!r||!r.banner) return;
    const arr=data[tab]||[];
    const soonN=arr.filter(x=>soon(x.renewalDate)).length;
    const expN=arr.filter(x=>past(x.renewalDate)).length;
    if(soonN||expN){
      r.banner.textContent='Heads up: '+[soonN?`${soonN} due within 7 days`:null,expN?`${expN} expired`:null].filter(Boolean).join(' · ');
      r.banner.classList.remove('hidden');
    }else{
      r.banner.classList.add('hidden');
      r.banner.textContent='';
    }
  }

  function openModal(mode){
    overlay.classList.remove('hidden'); modal.classList.remove('hidden');
    requestAnimationFrame(()=>{overlay.classList.add('show'); modal.classList.add('show');});
    if(mode!=='edit'){
      editing=null; fTitle.value=''; fType.value=''; fDesc.value=''; fStart.value=''; fRenewal.value='';
    }
  }
  function closeModalFn(){
    overlay.classList.remove('show'); modal.classList.remove('show');
    setTimeout(()=>{overlay.classList.add('hidden'); modal.classList.add('hidden');},150);
  }
  closeModal.addEventListener('click', closeModalFn);
  overlay.addEventListener('click', closeModalFn);

  function openConfirm(tab,id){
    pendingDel={tab,id};
    cOv.classList.remove('hidden'); cPop.classList.remove('hidden');
    requestAnimationFrame(()=>{cOv.classList.add('show'); cPop.classList.add('show');});
  }
  function closeConfirm(){
    cOv.classList.remove('show'); cPop.classList.remove('show');
    setTimeout(()=>{cOv.classList.add('hidden'); cPop.classList.add('hidden');},150);
    pendingDel=null;
  }
  cCancel.addEventListener('click', closeConfirm);
  cOv.addEventListener('click', closeConfirm);
  cDelete.addEventListener('click', ()=>{
    if(!pendingDel) return;
    if(pendingDel.tab==='uploads') deleteUpload(pendingDel.id);
    else removeRecord(pendingDel.tab,pendingDel.id);
    closeConfirm();
  });

  function gUrl(rec){
    if(!rec.renewalDate) return null;
    const ymd=rec.renewalDate.replace(/-/g,'');
    const s=ymd+'T100000', e=ymd+'T110000';
    const p=new URLSearchParams({action:'TEMPLATE', text:rec.title||'LifeSafe Renewal', details:(rec.type?`Type: ${rec.type}\n`:'')+(rec.desc||'')});
    p.set('dates',`${s}/${e}`);
    return `https://calendar.google.com/calendar/render?${p.toString()}`;
  }

  function renderList(tab){
    const r=refs[tab];
    r.list.innerHTML='';
    toggleHint(tab); banner(tab);

    if(tab==='uploads'){
      if(!uid || !db || !storage){
        const empty=document.createElement('div'); empty.className='centerText'; empty.textContent='Waiting for Firebase…';
        r.list.appendChild(empty); return;
      }
      if(uploads.length===0){
        const empty=document.createElement('div'); empty.className='centerText'; empty.textContent='No uploads yet';
        r.list.appendChild(empty); return;
      }
      uploads.forEach(rec=>{
        const card=document.createElement('div'); card.className='card';
        const top=document.createElement('div'); top.className='cardTop';
        const left=document.createElement('div');
        const right=document.createElement('div'); right.className='actions';
        const h=document.createElement('h3'); h.className='cardTitle'; h.textContent=rec.filename||'(Untitled document)';
        const meta=document.createElement('div'); meta.className='meta';
        const st=document.createElement('span'); st.className='badge';
        st.textContent = rec.status==='synced'?'Synced ✓':(rec.status==='uploading'?'Uploading…':(rec.status||'Pending'));
        if(rec.status!=='synced') st.classList.add('pending');
        meta.appendChild(st);
        if(rec.status==='uploading' && rec.progress!=null){
          const chip=document.createElement('span'); chip.className='dueSoon'; chip.textContent=` ${Math.round(rec.progress)}% `;
          meta.appendChild(chip);
        }
        const fm=document.createElement('div'); fm.className='fileMeta';
        fm.appendChild(Object.assign(document.createElement('div'),{className:'filename',textContent:rec.filename||''}));
        fm.appendChild(Object.assign(document.createElement('div'),{textContent:'Size: '+humanSize(rec.size)}));
        if(rec.createdAt) fm.appendChild(Object.assign(document.createElement('div'),{textContent:'Added: '+new Date(rec.createdAt).toLocaleString()}));

        const view=document.createElement('button'); view.className='btn small ghost'; view.textContent='View';
        view.onclick=(e)=>{e.stopPropagation(); viewUpload(rec.id);};
        const del=document.createElement('button'); del.className='btn small danger'; del.textContent='Delete';
        del.onclick=(e)=>{e.stopPropagation(); openConfirm('uploads',rec.id);};
        right.appendChild(view); right.appendChild(del);

        left.appendChild(h); left.appendChild(meta); left.appendChild(fm);
        top.appendChild(left); top.appendChild(right);
        card.appendChild(top);
        r.list.appendChild(card);
      });
      return;
    }

    const arr=data[tab]||[];
    if(arr.length===0){
      const empty=document.createElement('div'); empty.className='centerText'; empty.textContent='No records yet';
      r.list.appendChild(empty); return;
    }
    arr.forEach(rec=>{
      const card=document.createElement('div'); card.className='card';
      const top=document.createElement('div'); top.className='cardTop';
      const left=document.createElement('div');
      const right=document.createElement('div'); right.className='actions';
      const h=document.createElement('h3'); h.className='cardTitle'; h.textContent=rec.title||'(Untitled)';
      const meta=document.createElement('div'); meta.className='meta';
      const badge=document.createElement('span'); badge.className='badge'; badge.textContent=rec.type||'General';
      meta.appendChild(badge);
      const n=daysTo(rec.renewalDate);
      if(n>=0&&n<=7){const chip=document.createElement('span'); chip.className='dueSoon'; chip.textContent=`Due soon (${n}d)`; meta.appendChild(chip);}
      const d=document.createElement('div'); d.className='desc'; d.textContent=rec.desc||'';

      const g=document.createElement('button'); g.className='btn small ghost'; g.textContent='Add Reminder to Calendar';
      g.onclick=(e)=>{e.stopPropagation(); const u=gUrl(rec); if(u) window.open(u,'_blank','noopener');};
      const edit=document.createElement('button'); edit.className='btn small ghost'; edit.textContent='Edit';
      edit.onclick=(e)=>{e.stopPropagation(); startEdit(tab,rec.id);};
      const del=document.createElement('button'); del.className='btn small danger'; del.textContent='Delete';
      del.onclick=(e)=>{e.stopPropagation(); openConfirm(tab,rec.id);};
      right.appendChild(g); right.appendChild(edit); right.appendChild(del);

      left.appendChild(h); left.appendChild(meta); if(d.textContent) left.appendChild(d);
      top.appendChild(left); top.appendChild(right);
      card.appendChild(top);
      r.list.appendChild(card);
    });
  }

  tabs.forEach(t=>{
    const b=document.createElement('button'); b.id='tab-'+t.id; b.textContent=t.label; b.onclick=()=>switchTab(t.id);
    tabsEl.appendChild(b);
  });
  function switchTab(id){
    active=id;
    tabs.forEach(t=>{byId(t.content).classList.add('hidden'); byId('tab-'+t.id).classList.remove('active');});
    const t=tabs.find(x=>x.id===id);
    byId(t.content).classList.remove('hidden'); byId('tab-'+id).classList.add('active');
    titleEl.textContent=t.label;
    renderList(id);
  }

  function startEdit(tab,id){
    const rec=(data[tab]||[]).find(r=>r.id===id); if(!rec) return;
    editing={tab,id}; openModal('edit');
    fTitle.value=rec.title||''; fType.value=rec.type||''; fDesc.value=rec.desc||''; fStart.value=rec.startDate||''; fRenewal.value=rec.renewalDate||'';
  }

  saveRecord.addEventListener('click', ()=>{
    const payload={title:(fTitle.value||'').trim(), type:(fType.value||'').trim(), desc:(fDesc.value||'').trim(), startDate:fStart.value||'', renewalDate:fRenewal.value||'', createdAt:new Date().toISOString()};
    if(editing){
      const arr=data[editing.tab]; const i=arr.findIndex(r=>r.id===editing.id); if(i>-1) arr[i={...arr[i],...payload}]; // (not used heavily right now)
    }else{
      const id=Date.now().toString(36);
      data[active]=[{id,...payload},...(data[active]||[])];
    }
    save(); renderList(active); closeModalFn();
  });

  function removeRecord(tab,id){
    data[tab]=(data[tab]||[]).filter(r=>r.id!==id); save(); renderList(tab);
  }

  Object.keys(refs).forEach(k=>{
    refs[k].addBtn.addEventListener('click', ()=>{
      if(k==='uploads'){
        if(!uid) return alert('Waiting for sign-in…');
        refs.uploads.file.value=''; refs.uploads.file.click();
      }else{
        openModal('add');
      }
    });
  });

  refs.uploads.file.addEventListener('change', (e)=>{
    const files=[].slice.call(e.target.files||[]); if(!files.length) return;
    files.forEach(queueUpload);
  });

  // Uploads storage + Firestore
  function uploadsCol(){ return db.collection('users').doc(uid).collection('uploads'); }
  function startUploadsListener(){
    if(!db||!uid) return;
    if(uploadsUnsub){ try{uploadsUnsub();}catch(e){} uploadsUnsub=null; }
    uploadsUnsub = uploadsCol().orderBy('createdAt','desc').onSnapshot((snap)=>{
      uploads = snap.docs.map(d=>({id:d.id,...d.data()}));
      if(active==='uploads') renderList('uploads');
    }, (err)=>{ set2('Firestore error: '+(err&&err.message?err.message:String(err))); });
  }

  function queueUpload(file){
    if(!uid||!db||!storage) return alert('Firebase not ready yet.');
    const id=(Date.now().toString(36)+Math.random().toString(36).slice(2,7));
    const filename=safeName(file.name);
    const path=`users/${uid}/uploads/${id}_${filename}`;
    const docRef=uploadsCol().doc(id);
    const meta={filename, storagePath:path, size:file.size, mime:file.type||'application/octet-stream', status:'uploading', progress:0, createdAt:new Date().toISOString()};
    docRef.set(meta).catch(err=>alert('Firestore write failed: '+(err&&err.message?err.message:String(err))));
    const ref=storage.ref().child(path);
    const task=ref.put(file,{contentType:meta.mime});
    task.on('state_changed',
      (snap)=>{
        const pct=snap.totalBytes?(snap.bytesTransferred/snap.totalBytes)*100:0;
        docRef.set({progress:pct,status:'uploading'},{merge:true}).catch(()=>{});
      },
      (err)=>{
        docRef.set({status:'error', error:(err&&err.message)?err.message:String(err)},{merge:true}).catch(()=>{});
        alert('Upload failed: '+(err&&err.message?err.message:String(err)));
      },
      async ()=>{
        try{
          const url=await ref.getDownloadURL();
          await docRef.set({status:'synced',progress:100,downloadUrl:url},{merge:true});
        }catch(e){
          await docRef.set({status:'synced',progress:100},{merge:true});
        }
      }
    );
  }

  async function viewUpload(id){
    const rec=uploads.find(r=>r.id===id); if(!rec) return alert('Upload not found');
    try{
      let url=rec.downloadUrl;
      if(!url && rec.storagePath) url=await storage.ref().child(rec.storagePath).getDownloadURL();
      if(url) window.open(url,'_blank','noopener');
      else alert('No download URL yet (still uploading?)');
    }catch(err){
      alert('View failed: '+(err&&err.message?err.message:String(err)));
    }
  }

  async function deleteUpload(id){
    const rec=uploads.find(r=>r.id===id); if(!rec) return;
    try{
      if(rec.storagePath) { try{ await storage.ref().child(rec.storagePath).delete(); }catch(e){} }
      await uploadsCol().doc(id).delete();
    }catch(err){
      alert('Delete failed: '+(err&&err.message?err.message:String(err)));
    }
  }

  // init
  load();
  setTimeout(showApp,500);
  switchTab('home');
})();