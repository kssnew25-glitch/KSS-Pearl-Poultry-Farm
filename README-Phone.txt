KSS PEARL POULTRY FARM MANAGER - PHONE EDITION (Samsung Galaxy A05s, Android, Chrome)
To INSTALL it so it shows in your app list (app drawer) like any other app, Chrome needs the app at a web address. Do this once (free):
1. On a computer, unzip this file. Drag the whole folder (the one with index.html) into a free static host: Netlify Drop (app.netlify.com/drop), GitHub Pages or Cloudflare Pages. You get an https link.
2. Open that link on the phone in Chrome and wait for it to load once.
3. Chrome menu (3 dots) > Install app (or Add to Home screen > Install). The KSS Pearl icon appears in the app drawer and on the home screen. It works offline.
   Send the same link to the owner's and workers' phones; each one installs it the same way. The app also works on the laptop the same way (Edge: Apps > Install this site as an app).
Quick trial without hosting: open KSS-Pearl-Poultry-Farm-Phone-SingleFile.html in Chrome. It cannot install and records may not persist reliably.
Real APK (optional): give your hosted link to pwabuilder.com > Android package.
FIRST START ON THE OWNER PHONE: create the OWNER (admin) account and SAVE THE RECOVERY CODE.
WORKERS ON THEIR OWN PHONES, OWNER SEES THEIR ENTRIES: set up Cloud sync once (Cloud-Sync\Cloud-Sync-Setup.txt). Then each worker opens the app, chooses "Worker, or owner's second device?", pastes the connect code the owner sent on WhatsApp, and signs in with their own name and PIN. Workers can sign out and in.
DAILY SHED RECORD: enter each time birds died (time, number, cause, sex for Kuroilers). Birds remaining is shown after every day.
SOUND AND POP-UP ALERTS: they work while the app is open or running in the background. Tap the screen once after opening so Chrome allows sound. Turn on pop-ups in More > Alerts, sound and reminders. A phone cannot ring if the app has been fully closed.
BACKUP: More > Download full backup regularly.

UPDATING AN INSTALLED APP (your records are kept)
1. Owner: More > Download full backup first.
2. If you use cloud sync: paste the new Cloud-Sync\Code.gs into your Apps Script project, Save, Deploy > Manage deployments > pencil icon > Version: New version > Deploy (same URL).
3. Phone: upload this folder to the SAME site (Netlify: your site > Deploys > drag the folder in; GitHub Pages: replace the files). Keep the same web address: a new address is a new, empty app. Then open the app twice while online (the first open downloads the update, the second shows it).
4. More shows 'App version v1.9' and a 'Check for app update' button. The first account on the owner's device becomes the Owner; other former admins become Admin helpers.
