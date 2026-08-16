# Worldclass — official launch guide

This folder is a complete, deployable web app **and** a real installable PWA
(Progressive Web App). Follow these in order: Part 1 gets you a real website
with your own domain name, Part 2 makes the AI search actually work once it's
outside Claude, Part 3 turns it into an installable app worldwide, and Part 4
covers publishing to the Apple App Store / Google Play if you want that too.

---

## Part 1 — Get a real website (your own domain)

1. **Buy a domain name.** Any registrar works — Namecheap, Porkbun, or
   Cloudflare Registrar are straightforward and cheap (roughly $10–15/year for
   a `.com`). Search for something like `worldclass.com`, `worldclasslearn.com`,
   `getworldclass.app`, etc.
2. **Create a free Netlify account** at https://app.netlify.com — Netlify
   hosts the site *and* runs the search feature (see Part 2), which is why
   it's the recommended host here over something like GitHub Pages.
3. **Deploy this folder:**
   - **On a computer:** click "Add new site" → "Deploy manually", then drag
     this entire `bundle` folder onto the page
   - **On a phone:** see the separate phone walkthrough Claude gave you —
     it uses GitHub + Netlify's "Import from GitHub" instead of drag-and-drop
   - Either way, you'll get a live `something.netlify.app` address immediately
4. **Connect your domain:** In the site's Netlify dashboard, go to
   **Domain management → Add a domain**, enter your purchased domain, and
   follow Netlify's instructions to point your registrar's DNS to Netlify.
   This usually takes a few minutes to set up and up to 24 hours to fully
   propagate worldwide. HTTPS (the padlock) is issued automatically and free.

At the end of Part 1, your site is live at your own domain — but the search
box won't work yet. That's Part 2.

---

## Part 2 — Make the AI search actually work (important)

Inside Claude, the search box worked because Claude.ai supplies a built-in,
temporary connection to its AI models for artifacts you build there. **That
connection does not exist once the site is hosted on your own domain** — it
only works inside Claude's own interface. To make search work on your real
site, you need your own Anthropic API key, kept secure on a server — never
placed directly in the browser code, where anyone could copy and misuse it.

This folder already includes that secure setup (`netlify/functions/search.js`)
— you just need to switch it on:

1. **Get an API key:** go to https://console.anthropic.com, create an
   account, and generate an API key. New accounts typically get a small
   amount of free credit; after that, usage is pay-as-you-go (a single search
   costs a small fraction of a dollar). In the console, you can set a monthly
   spending limit so costs can never run away from you — worth doing before
   sharing the site publicly.
2. **Add the key to Netlify:** in your site's dashboard, go to
   **Site configuration → Environment variables → Add a variable**.
   - Key: `ANTHROPIC_API_KEY`
   - Value: the key you generated
3. **Redeploy:** trigger a new deploy (Netlify → Deploys → Trigger deploy) so
   the function picks up the new variable.
4. Test the search box on your live domain. If it errors, the message will
   tell you whether the key is missing — double check step 2.

That's it — the frontend now calls your own `/.netlify/functions/search`
endpoint, which holds your key server-side and calls Anthropic on the site's
behalf. Your key is never exposed to visitors.

---

## Part 3 — Installable app, worldwide (already built in)

Once Parts 1–2 are live, the app is already a real installable PWA — no extra
build step needed:

- **iPhone/iPad (Safari):** open your domain → tap Share → "Add to Home Screen"
- **Android (Chrome):** open your domain → tap the ⋮ menu → "Add to Home
  screen" (Chrome may prompt automatically)
- **Desktop (Chrome/Edge):** click the install icon in the address bar

It gets a real home-screen icon, opens full-screen without browser chrome,
and the shell loads instantly (even offline) thanks to `service-worker.js`.
This works for anyone, anywhere, the moment your domain is live.

---

## Part 4 — Publish to the Apple App Store / Google Play (optional)

This step wraps your live website into a native app package for store
submission. It's optional — most PWAs never need it — but here's the path:

1. Go to **https://www.pwabuilder.com** and enter your live domain URL.
2. PWABuilder scans your `manifest.json` and service worker (already set up
   in this folder) and generates ready-to-submit packages for Android and iOS.
3. **Android (Google Play):**
   - Requires a one-time $25 Google Play Developer account
   - PWABuilder generates a signed `.aab` file — upload it in Google Play
     Console, fill out the store listing (screenshots, description, a
     privacy policy page — required even for free apps), submit for review
     (usually a few days)
4. **iOS (Apple App Store):**
   - Requires a $99/year Apple Developer Program account
   - PWABuilder generates an Xcode project; building and signing it needs a
     Mac with Xcode installed (or a cloud Mac rental service if you don't
     have one)
   - Submit via App Store Connect with a privacy policy and store listing;
     Apple's review typically takes one to a few days
5. Alternative to PWABuilder: **Capacitor** (https://capacitorjs.com) gives
   more control if you want to add native-only features later.

---

## Costs at a glance

| Item | Cost |
|---|---|
| Domain name | ~$10–15/year |
| Netlify hosting | Free for this scale |
| Anthropic API usage | Pay-as-you-go, a few cents per search — set a spending cap |
| Google Play (if publishing) | $25 one-time |
| Apple Developer (if publishing) | $99/year |

## One honest note, worth repeating

Search results come from live AI + web search, so they can occasionally be
outdated or wrong. The app already tells users to double-check before
enrolling — keep that disclaimer in place no matter where this is hosted.
