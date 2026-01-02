# LifeSafe v1.17-Light

Adds secure login options **without changing** your locked light design.

## What’s new
- Google Sign-in
- Email sign-in link (passwordless)
- When you're already anonymous, signing in **links** to the same account so your UID stays the same (keeps access to existing uploads).

## Firebase Console setup
Authentication → Sign-in method:
- Enable **Anonymous**
- Enable **Google**
- Enable **Email/Password** (needed for email link)

Authentication → Settings → Authorized domains:
- Add `nickjohn63.github.io`
