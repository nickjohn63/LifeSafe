// LifeSafe v1.15a-Light
// Firebase Auth (Anonymous) using compat builds for maximum Safari/GitHub Pages compatibility.
(function(){
  const cfg = window.LIFESAFE_FIREBASE_CONFIG;
  const s1 = document.getElementById('authStatus');
  const s2 = document.getElementById('authStatus2');
  function set1(t){ if(s1) s1.textContent = t; }
  function set2(t){ if(s2) s2.textContent = t; }
  set1('Firebase auth: initializing…');
  try{
    if(!cfg){ throw new Error('Missing Firebase config'); }
    if(!window.firebase){ throw new Error('Firebase SDK not loaded'); }
    firebase.initializeApp(cfg);
    const auth = firebase.auth();
    auth.onAuthStateChanged((user)=>{
      if(user){
        localStorage.setItem('lifesafe_uid', user.uid);
        set1('Signed in (anonymous). Device ID: ' + user.uid.slice(0,8) + '…');
        set2('If this never appears, it’s usually caching or files uploaded into a subfolder.');
      }else{
        set1('Signing in…');
      }
    });
    auth.signInAnonymously().catch((err)=>{
      set1('Auth error: ' + (err && err.message ? err.message : String(err)));
      console.error(err);
    });
  }catch(err){
    set1('Firebase init error: ' + (err && err.message ? err.message : String(err)));
    console.error(err);
  }
})();

console.error('Missing base app.js in builder');