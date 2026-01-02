# LifeSafe v1.16-Light

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
