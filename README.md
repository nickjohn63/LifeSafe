# LifeSafe v1.18-Light

Uploads are now stored securely in Firebase Storage and indexed in Firestore.

## Firebase setup required
1) Authentication → Sign-in method → Anonymous enabled
2) Storage → rules already set to `users/<uid>/...` only
3) Firestore Database → Create database (required)

### Suggested Firestore rules (lockdown)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/uploads/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}


## v1.18 additions
- Secure login options: Google + Email link (passwordless)
- Firebase App Check (reCAPTCHA v3) enabled in monitor mode

### Firebase Console checklist
Authentication → Sign-in method: enable Google + Email/Password
Authentication → Settings → Authorized domains: add nickjohn63.github.io
App Check: keep enforcement OFF until verified requests show, then enforce Storage + Firestore.


## v1.20
Home tab records sync to Firestore at /users/<uid>/records/home/items.
Update Firestore rules accordingly.
