# Bangash Transport ERP — GitHub Pages + Firebase edition

A static web app (HTML + CSS + JS + JSON) that runs on **GitHub Pages** and keeps its data in **Firebase**
(Authentication + Cloud Firestore). No Python server is needed any more.

```
docs/                  <- the finished website (this is what GitHub Pages serves)
  index.html, assets/  compiled app (HTML/CSS/JS)
  firebase-config.js   <- YOU EDIT THIS: your Firebase keys
  data/seed_demo.json  sample company data (JSON)
frontend/              source code (only needed if you want to change the screens)
firestore.rules        Firestore security rules (publish these in Firebase)
```

**Two modes, chosen automatically**
* `firebase-config.js` empty -> **Demo mode**: works immediately, data stays in each browser only.
* `firebase-config.js` filled -> **Live mode**: shared real-time data and real staff logins via Firebase.

---
## 1. Create the Firebase project (about 10 minutes, free Spark plan is enough)
1. https://console.firebase.google.com -> **Add project**.
2. **Build -> Authentication -> Get started -> Sign-in method -> Email/Password -> Enable** (the first switch only).
3. **Build -> Firestore Database -> Create database** (production mode, pick a region near you).
4. Firestore -> **Rules** tab -> replace everything with the contents of `firestore.rules` -> **Publish**.
5. **Project settings (gear) -> General -> Your apps -> Web (`</>`)** -> register an app (no hosting needed) and copy the `firebaseConfig` values.
6. **Authentication -> Settings -> Authorized domains -> Add domain**: `YOUR-GITHUB-USERNAME.github.io`.
7. Open `docs/firebase-config.js` and paste your values (apiKey, authDomain, projectId, appId ...). Save.

## 2. Put it on GitHub Pages
1. Create a repository on GitHub and upload **everything in this folder** (keep the `docs` folder).
   (or: `git init && git add . && git commit -m "ERP" && git push` to your repo)
2. Repository **Settings -> Pages -> Build and deployment -> Source: Deploy from a branch -> Branch `main`, folder `/docs` -> Save**.
3. After a minute your site is live at `https://YOUR-GITHUB-USERNAME.github.io/REPO-NAME/`.

## 3. First start
Open the site. Because the database is empty you will see **First-time setup**: enter company name, your name,
an admin username and PIN, and choose *Empty company* or *Sample company data*. **Do this immediately after deploying** —
the first account created becomes the Administrator. Then add staff in **Settings -> User Logins** (roles: Admin, Operations, Accounts, Workshop).

Later you can change the keys directly on github.com by editing `docs/firebase-config.js` — no rebuild required.

---
## How it works / things to know
* **Live sync:** changes appear for all signed-in users within a second or two (Firestore real-time listeners); offline edits are cached and retried.
* **Logins:** staff sign in with *username + PIN*. Behind the scenes each user is a Firebase Authentication account (`username.gN@staff.example.com`, password `Bte#`+PIN — Firebase requires 6+ characters). Nobody needs a real email address.
* **Security is enforced by `firestore.rules`**, not by the web page: only active staff can read/write business data; only Admins can change users, roles and company settings; disabled users lose access immediately.
* **Admin resets someone's PIN** -> a new login is created for that user and the old one is cut off (browsers cannot change another person's password directly). Deleted users are removed from the app, but their Firebase Authentication entry stays; you can delete it in the Firebase console (harmless meanwhile, it has no access).
* The Firebase web keys in `firebase-config.js` are **not secrets**. Optionally restrict the API key to your site: Google Cloud Console -> APIs & Services -> Credentials -> your browser key -> HTTP referrers `https://YOUR-GITHUB-USERNAME.github.io/*`.
* Usernames can be looked up one by one on the login screen (needed to sign in); there is no way to list them.
* GitHub Pages sites are public on the internet (a private repo needs a paid GitHub plan to publish Pages). The *data* is protected by sign-in + rules, but the app code and `data/seed_demo.json` sample data are visible to anyone.
* Firebase's login protection (automatic blocking after repeated wrong PINs) replaces the old server's login throttle. Use PINs longer than 4 digits for real accounts.
* Backup: **Settings -> JSON Backup & Restore** downloads / restores everything as JSON. Do this regularly.
* Free-tier limits (Spark): 50k reads / 20k writes per day — plenty for a small transport office.

## Changing the screens (developers)
```bash
cd frontend
npm install
npm run dev      # http://localhost:3000  (demo mode unless public/firebase-config.js is filled)
npm run build    # rebuilds the website into ../docs  (then commit & push)
```
Storage code lives in `frontend/src/services/backend/` (`firebase.ts`, `local.ts`) behind `services/api.ts`.
Note: `npm run build` overwrites `docs/firebase-config.js` from `frontend/public/firebase-config.js` — put your keys in both (or only there).
