# Homeo Agro Website

Static HTML/CSS/JS website for Homeo Agro Solutions. Designed for fertilizer dealers and direct farmer enquiries. Fully bilingual — English (root) and Hindi (`/hi/`) — with a header toggle, `hreflang` SEO tags, and first-visit browser-language auto-redirect.

---

## File structure

```
homeoagro/
├── index.html              Home page
├── about.html              About / Vision / Mission / Certifications
├── products.html           All 5 product detail cards (anchored)
├── how-to-use.html         Application guide + stage timeline
├── blog.html               Blog index (5 articles)
├── contact.html            3 tabbed forms: Farmer / Dealer / Bulk Order
├── blog/
│   ├── blog-1.html         Why farmers want non-chemical agro support
│   ├── blog-2.html         Urea / DAP / NPK alternatives
│   ├── blog-3.html         Right product at the right crop stage
│   ├── blog-4.html         Pest and insect control
│   └── blog-5.html         Safe handling of agro products
├── hi/                     Hindi version (mirrors structure above)
│   ├── index.html
│   ├── about.html
│   ├── products.html
│   ├── how-to-use.html
│   ├── blog.html
│   ├── contact.html
│   └── blog/
│       └── blog-1.html ... blog-5.html
├── css/
│   └── style.css           Single design system, all pages
├── js/
│   └── main.js             Nav, forms, tabs, animations, language toggle
└── images/
    ├── farmer.png          Hero portrait
    ├── virosil.png         Product bottles (5)
    ├── uri-fast.png
    ├── plantowin-k.png
    ├── plantowin-d.png
    ├── last-tuch.png
    ├── bottle-lineup.png   5-bottle group shot
    ├── field.png           Field background
    └── vegetables.png      Vegetable basket
```

---

## Before you deploy: 3 things to update

### 1. Web3Forms key (form submissions)

The forms currently run in "demo mode" — they show success but don't actually send. To enable real submissions:

1. Go to https://web3forms.com and sign up (free, no credit card)
2. Create an access key linked to `inquiry@homeoagro.com`
3. Open `js/main.js`, find this line near the top:
   ```js
   const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_KEY';
   ```
4. Replace `'YOUR_WEB3FORMS_KEY'` with your actual key (keep the quotes)
5. Save and re-upload to your host

Form submissions will arrive in `inquiry@homeoagro.com` inbox.

### 2. Product photos (when ready)

The product bottles currently use cropped images from your pamphlet. When you have better-quality photos:

- Replace these files (keep the same filenames):
  - `images/virosil.png`
  - `images/uri-fast.png`
  - `images/plantowin-k.png`
  - `images/plantowin-d.png`
  - `images/last-tuch.png`
- Recommended: 600×900 px, PNG with transparent background

### 3. Hindi proofread

All Hindi content is taken from your pamphlet and document verbatim. Worth a final native-speaker read before going live.

---

## Bilingual structure (English + Hindi)

- English lives at the root (`/index.html`, `/about.html`, …).
- Hindi mirrors it under `/hi/` with identical filenames (`/hi/index.html`, `/hi/about.html`, …).
- A small pill toggle (`EN | हिं`) sits in the header on every page next to the "Enquire Now" button. Clicking it navigates to the equivalent page in the other language and saves the user's preference to `localStorage` (`homeoagro_lang`).
- First-time visitors whose browser language starts with `hi` are auto-redirected once to the Hindi version. After that, the user's explicit click is the source of truth — no further auto-redirects.
- Every page has `<link rel="alternate" hreflang="…">` tags pointing at both language versions plus `x-default` (English) — required for Google to surface the right language in search results.

### When adding a new page

1. Create the English version at `/<page>.html`.
2. Create the Hindi version at `/hi/<page>.html` — keep the **filename identical**, only translate the content.
3. In **both** files' `<head>`, add three `hreflang` link tags:
   ```html
   <link rel="alternate" hreflang="en" href="https://www.homeoagro.com/<page>.html">
   <link rel="alternate" hreflang="hi" href="https://www.homeoagro.com/hi/<page>.html">
   <link rel="alternate" hreflang="x-default" href="https://www.homeoagro.com/<page>.html">
   ```
4. In **both** files, drop the language toggle inside `.nav-cta`:
   - On the **English** page: `EN` is `active` and points to itself, `हिं` points to `hi/<page>.html`.
   - On the **Hindi** page: `EN` points to `../<page>.html`, `हिं` is `active` and points to itself.
5. Set `<html lang="hi">` on Hindi pages and translate `<title>` + `<meta name="description">`.
6. Run `<script src="../js/main.js">` from `/hi/` pages and `<script src="../../js/main.js">` from `/hi/blog/` articles — the JS handles toggle persistence automatically once `.lang-btn` elements are present.

### Hindi voice — when adding content

- Match the existing register: warm and professional, **not** over-Sanskritized.
- Code-mix where farmers naturally do: `डीलर`, `डिस्ट्रीब्यूटर`, `फर्टिलाइज़र`, `ऑर्डर`, `पेस्टिसाइड`. Don't translate these to "purer" Hindi.
- Product names (`Virosil`, `Uri Fast`, `Plantowin-K`, `Plantowin-D`, `Last Tuch`), units (`ml`, `L`, `kg`), ISO certifications, MSME number, phone, and email **stay in their English/Latin form**.
- Dose strings: `1 लीटर पानी में 2 ml` is the natural code-mixed form used in the pamphlet — match it.
- Wrap Hindi text in `class="hindi"` so it picks up the Tiro Devanagari Hindi font. Pure-English elements (product names, ISO, etc.) should not have this class.

---

## How to deploy

This is a 100% static site. Pick any of these hosts:

**Netlify** (recommended — free, fastest)
1. Sign up at netlify.com
2. Drag the entire `homeoagro/` folder onto the Netlify dashboard
3. You get a free `*.netlify.app` URL instantly
4. Point your custom domain `www.homeoagro.com` to it via DNS

**Vercel**
1. Sign up at vercel.com
2. Drag-and-drop or connect via GitHub
3. Custom domain setup is one-click

**Hostinger / Hetzner / cPanel hosting**
1. FTP the entire `homeoagro/` folder contents to your hosting `public_html` (or equivalent)
2. Done

**GitHub Pages**
1. Push the folder to a GitHub repo
2. Settings → Pages → Source: `main` branch
3. Done in 2 minutes

---

## Lead capture features

- **Floating WhatsApp button** (all pages, bottom-right) → opens chat with pre-filled message
- **Mobile sticky call button** (visible only on phones, bottom of screen)
- **Forms** on Contact page:
  - Farmer enquiry (default tab)
  - Dealer / Distributor enquiry
  - Bulk Order with product picker (add/remove rows)
- Direct links: `contact.html#farmer`, `contact.html#dealer`, `contact.html#bulk` auto-open the relevant tab

---

## Design notes

- Fonts: Fraunces (display), Manrope (body), Tiro Devanagari Hindi (Hindi text) — all from Google Fonts, no install needed
- Palette: Deep forest green + champagne gold + warm cream
- Each product has its own accent color (Virosil green, Uri Fast blue, Plantowin-K green, Plantowin-D orange, Last Tuch purple)
- Fully responsive (desktop / tablet / mobile)
- Accessibility: semantic HTML, ARIA labels on buttons, keyboard-navigable

---

## To make changes later

Most content edits are straightforward:
- **Phone number** appears in many places — search the entire codebase for `8960516338` and update everywhere
- **Email** — search for `inquiry@homeoagro.com`
- **Addresses** — search for `Hardoi`

For visual changes, all colors and fonts live as CSS variables at the top of `css/style.css` (lines 5–35). Change one variable, it updates everywhere.

---

## Contact

Built for Homeo Agro Solutions, May 2026.
Manufactured by Bala Ji Homeo Agro Solutions, District Hardoi, UP.
Marketed by Globus Solutions.
