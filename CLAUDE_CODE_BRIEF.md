# Brief: Add Hindi Language Version to Homeo Agro Website

## Context

This is a static HTML/CSS/JS marketing website for **Homeo Agro Solutions**, an Indian agro-products company (Bala Ji Homeo Agro Solutions, Hardoi, UP). Target audience: **fertilizer dealers and direct farmers in the Hindi belt** (UP, Bihar, MP, Haryana, Rajasthan, etc.).

The current site is **English-first with Hindi headlines on key sections**. The brand wants a **complete parallel Hindi version** with a toggle so users can switch languages.

---

## Project structure (current state)

```
homeoagro/
├── index.html              Home
├── about.html              About / Vision / Mission / Certifications
├── products.html           5 product detail cards (anchored: #virosil, #urifast, #plantowink, #plantowind, #lasttuch)
├── how-to-use.html         Application guide + crop-stage timeline
├── blog.html               Blog index (5 articles)
├── contact.html            3 tabbed forms (Farmer / Dealer / Bulk Order)
├── blog/
│   ├── blog-1.html         Why farmers want non-chemical agro support
│   ├── blog-2.html         Urea / DAP / NPK alternatives
│   ├── blog-3.html         Right product at the right crop stage
│   ├── blog-4.html         Pest and insect control
│   └── blog-5.html         Safe handling of agro products
├── css/style.css           Single design system, all pages
├── js/main.js              Nav, forms, tabs, scroll reveals, Web3Forms submission
├── images/                 farmer.png, 5 product bottles, field.png, etc.
└── README.md
```

**Tech stack:** Plain static HTML, CSS, vanilla JS. No build step. No framework. Hosted on any static host.

**Fonts (Google Fonts, already loaded in style.css):**
- Fraunces — display headings
- Manrope — English body
- Tiro Devanagari Hindi — Hindi text

---

## What to build

### 1. Directory structure

Create a parallel `/hi/` directory mirroring the English structure:

```
homeoagro/
├── index.html              ← English (unchanged)
├── about.html
├── products.html
├── ... (existing English pages)
└── hi/
    ├── index.html          ← Hindi versions
    ├── about.html
    ├── products.html
    ├── how-to-use.html     ← keep filename in English for parity, or rename to upyog-kaise-kare.html if SEO research suggests Hindi URLs perform better in Indian search. Default: keep English filenames.
    ├── blog.html
    ├── contact.html
    └── blog/
        ├── blog-1.html
        ├── blog-2.html
        ├── blog-3.html
        ├── blog-4.html
        └── blog-5.html
```

**Default decision:** keep filenames in English (`index.html`, `about.html`, etc.) inside `/hi/`. This simplifies the toggle logic — switching languages is just adding/removing `/hi/` from the path.

### 2. Language toggle UI

Add a compact toggle in the site header on **every page** (both English and Hindi versions). Place it just before the "Enquire Now" button.

**Visual spec:**
```
EN  |  हिं
```

- Small pill button, two states: EN (active) / हिं (active)
- Active state: filled with `var(--green-deep)`, white text
- Inactive: transparent, ink-soft color, hover green-bright
- Inter-state separator: thin vertical line
- Font size ~0.85rem, padding ~0.4rem 0.8rem
- Mobile: collapse into the hamburger menu OR keep visible (recommend: keep visible — it's only ~80px wide and language preference matters most on first visit)

**HTML pattern (drop into header on every page, both languages):**

```html
<div class="lang-toggle">
  <a href="..." data-lang="en" class="lang-btn active">EN</a>
  <span class="lang-divider"></span>
  <a href="..." data-lang="hi" class="lang-btn">हिं</a>
</div>
```

The `href` on each link should point to the **equivalent page in the other language**. Example:
- On English `/products.html`: `data-lang="hi"` href = `/hi/products.html`
- On Hindi `/hi/products.html`: `data-lang="en"` href = `/products.html`
- On English `/blog/blog-3.html`: `data-lang="hi"` href = `/hi/blog/blog-3.html`

Compute the equivalent URL with a small JS helper that lives in `js/main.js`:

```js
function getLanguageEquivalentUrl(targetLang) {
  const path = window.location.pathname;
  const isHindi = path.includes('/hi/');
  if (targetLang === 'hi' && !isHindi) {
    // Insert /hi/ after the base path
    return path.replace(/^\//, '/hi/');
  }
  if (targetLang === 'en' && isHindi) {
    return path.replace('/hi/', '/');
  }
  return path;
}
```

Wire this up so the toggle links update on page load (rather than hardcoding URLs into every page) — keeps the HTML clean and avoids broken links if filenames change.

### 3. Language preference persistence

```js
// On any toggle click:
localStorage.setItem('homeoagro_lang', clickedLang);

// On every page load (in main.js, before anything else):
const savedLang = localStorage.getItem('homeoagro_lang');
const currentlyHindi = window.location.pathname.includes('/hi/');
const currentlyEnglish = !currentlyHindi;

// Auto-redirect logic:
// - First-time visitor (no saved preference): detect from navigator.language; if Hindi browser, redirect to /hi/ equivalent
// - Returning visitor: respect their saved preference; if it doesn't match current URL, redirect to match
// - User clicks toggle: update preference AND navigate (the href handles navigation; just save preference on click)
```

**Important:** Only auto-redirect on the very first visit (no localStorage key set). After that, never auto-redirect — the user's explicit choice (clicking the toggle) is the source of truth. This prevents the annoying "I'm trying to read English but it keeps sending me to Hindi" loop.

**First-visit detection:**
```js
if (!localStorage.getItem('homeoagro_lang')) {
  const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  const preferHindi = browserLang.startsWith('hi') || browserLang.includes('-in');
  // Note: hi-IN is the typical Hindi browser code. en-IN users mostly read English, so don't force them to Hindi.
  if (preferHindi && currentlyEnglish) {
    localStorage.setItem('homeoagro_lang', 'hi');
    window.location.replace(getLanguageEquivalentUrl('hi'));
    return;
  }
  // Otherwise set preference to whatever they're viewing
  localStorage.setItem('homeoagro_lang', currentlyHindi ? 'hi' : 'en');
}
```

### 4. SEO: hreflang tags

In `<head>` of **every page** (both English and Hindi), add:

```html
<!-- On English pages -->
<link rel="alternate" hreflang="en" href="https://www.homeoagro.com/products.html">
<link rel="alternate" hreflang="hi" href="https://www.homeoagro.com/hi/products.html">
<link rel="alternate" hreflang="x-default" href="https://www.homeoagro.com/products.html">

<!-- On Hindi pages -->
<link rel="alternate" hreflang="en" href="https://www.homeoagro.com/products.html">
<link rel="alternate" hreflang="hi" href="https://www.homeoagro.com/hi/products.html">
<link rel="alternate" hreflang="x-default" href="https://www.homeoagro.com/products.html">
```

Update `<html lang="en">` to `<html lang="hi">` on Hindi pages.

Also update `<title>` and `<meta name="description">` on Hindi pages to Hindi.

### 5. CSS for the toggle

Add to `css/style.css`:

```css
.lang-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0;
  padding: 0.25rem;
  background: var(--cream-deep);
  border-radius: var(--radius-pill);
  margin-right: 0.75rem;
}
.lang-btn {
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.35rem 0.8rem;
  border-radius: var(--radius-pill);
  color: var(--ink-soft);
  text-decoration: none;
  transition: all 0.2s ease;
}
.lang-btn.active {
  background: var(--green-deep);
  color: var(--paper);
}
.lang-btn:not(.active):hover {
  color: var(--green-deep);
}
.lang-divider {
  width: 1px;
  height: 14px;
  background: rgba(31, 77, 46, 0.2);
}
.lang-btn[data-lang="hi"] {
  font-family: var(--font-hindi);
  font-size: 0.95rem;
}

@media (max-width: 960px) {
  .lang-toggle { margin-right: 0.5rem; }
}
```

### 6. The actual content translation

Translate **all visible text** on every page to Hindi. Things to keep in English/Latin script:

**Keep as-is (do not translate):**
- Brand name: "Homeo Agro"
- Product names: "Virosil", "Uri Fast", "Plantowin-K", "Plantowin-D", "Last Tuch"
- Product categories on product cards: "Pesticide", "Urea", "NPK", "DAP", "KP" — these are industry terms farmers recognize in their English forms
- Company names: "Bala Ji Homeo Agro Solutions", "Globus Solutions"
- Address: "District Hardoi — 241001, Uttar Pradesh, India" (you can translate to "जिला हरदोई — 241001, उत्तर प्रदेश, भारत" — choice yours, recommend translating)
- Phone number: "+91-80050 04736"
- Email: "inquiry@homeoagro.com"
- Certifications: "ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018", "GMP", "MSME: UP35A0002140"
- Chemical compounds in product "Contains" sections: "Natsulf, Poison Oak, Cuprum Met, Natmur, Bovista, Nitric Acid, Kalimur, Calphos, Acid Phos, Ferum Sulph"
- Dose format: "2 ml in 1 litre of water" can be translated to "1 लीटर पानी में 2 ml" (mixing Hindi with the unit is natural and the pamphlet already does this)
- Units: ml, L, kg, days — keep numeric and unit notation as-is

**Translate:**
- All headings, body copy, button labels, form labels, navigation, footer
- Blog article titles and full article body content
- Safety banners, captions, eyebrows, taglines
- Meta titles and descriptions
- Image alt text

**Style guide for the translation:**
The pamphlet's existing Hindi establishes the voice. Match it:
- कृषि का नया भरोसा (the tagline — keep on home page hero)
- हमारे प्रमुख उत्पाद (Our Main Products)
- Homeo Agro के लाभ (Homeo Agro's Benefits)
- सामान्य उपयोग मात्रा (General Dose)
- प्रति 1 litre पानी (Per 1 litre water — note the natural code-mixing)
- स्वस्थ पौधे, बेहतर सुरक्षा, उत्कृष्ट वृद्धि, अधिक उपज (the four icon labels)
- किसानों, डीलरों और डिस्ट्रीब्यूटर्स के लिए सुनहरा अवसर (Golden opportunity for farmers, dealers and distributors)
- संपर्क करें (Contact Us)
- उत्पाद केवल कृषि एवं पौधों के उपयोग के लिए हैं... (existing safety banner — keep verbatim)

**Tone:** Professional but warm. Not overly Sanskritized (avoid शुद्ध हिंदी that no farmer uses). Use natural farming Hindi that mixes English loanwords where farmers actually use them: डीलर, डिस्ट्रीब्यूटर, फर्टिलाइज़र, ऑर्डर, ईमेल, etc.

**Key vocabulary to use consistently:**
- Farmer = किसान
- Dealer = डीलर
- Distributor = डिस्ट्रीब्यूटर / वितरक
- Crop = फसल
- Plant = पौधा / पौधे
- Pest = कीट
- Pesticide = कीटनाशक
- Fertilizer = खाद / उर्वरक (use खाद — more common with farmers)
- Soil = मिट्टी
- Watering = सिंचाई / पानी देना
- Sowing = बुवाई
- Bulk order = बल्क ऑर्डर / थोक ऑर्डर
- Application / Use = प्रयोग / उपयोग
- Dose = मात्रा / डोज़
- Stage = चरण / अवस्था
- Bud = कली
- Bean = फली
- Fruit = फल
- Flower = फूल
- Grain = अनाज
- Pulse = दाल
- Vegetable = सब्जी

### 7. Form field translations (Contact page)

```
Name → नाम
Mobile Number → मोबाइल नंबर
Email → ईमेल
City / District → शहर / जिला
State → राज्य
Product Interested In → रुचि का उत्पाद
Crop & Issue / Requirement → फसल और समस्या / आवश्यकता
Business Name → व्यवसाय का नाम
Looking For → आप क्या चाहते हैं
Send Enquiry → पूछताछ भेजें
Submit Partnership Enquiry → पार्टनरशिप पूछताछ भेजें
Request Bulk Order Quote → थोक ऑर्डर के लिए मूल्य पूछें
Products & Quantities → उत्पाद और मात्रा
Add another product → एक और उत्पाद जोड़ें
Remove → हटाएं
Required By → कब तक चाहिए
Delivery Type → डिलीवरी का प्रकार
Pickup from Hardoi → हरदोई से पिकअप
Delivery to my location → मेरे स्थान पर डिलीवरी
Additional Notes → अतिरिक्त जानकारी
By submitting, you consent to be contacted by Homeo Agro about your enquiry. → फॉर्म भेजने से आप Homeo Agro से संपर्क के लिए सहमति देते हैं।
```

Also: the form's hidden `subject` and `enquiry_type` fields **should stay in English** so emails arriving at inquiry@homeoagro.com remain easy to filter/sort regardless of which language the form was submitted in. Add a separate hidden field `submitted_language: hi` to track which version was used.

### 8. WhatsApp pre-fill message

The floating WhatsApp button has a pre-filled message. Translate on Hindi pages:

- English: `Hi Homeo Agro, I'm interested in your products.`
- Hindi: `नमस्ते Homeo Agro, मुझे आपके उत्पादों में रुचि है।`

URL-encode appropriately when constructing the `wa.me` link.

### 9. Things you can skip or simplify

- **Don't translate the existing English blog article body content one-to-one** if it doesn't read naturally. Each Hindi article can be a freshly written version that conveys the same information in a way that sounds native — not a literal translation. Word count and section structure can match loosely, not exactly.
- **Don't translate the `aria-label` of the menu toggle** — keep it functional. Or translate to "मेनू" if you prefer.
- **Don't translate filenames** — `blog-1.html` stays `blog-1.html` in both languages.

### 10. Quality checks before declaring done

After building, verify:

1. Every English page has a Hindi counterpart at the predictable URL
2. The language toggle on every page correctly links to its counterpart
3. Clicking the toggle on any page actually loads the right Hindi/English version (no 404s)
4. Saving `homeoagro_lang=hi` in localStorage on the homepage, then navigating to any other English URL directly, redirects to the Hindi version
5. Saving `homeoagro_lang=en` works the same way in reverse
6. First-visit auto-detection works for Hindi browsers
7. Hindi text renders in Tiro Devanagari Hindi font (not falling back to system default — check Devanagari ligatures look correct, especially conjuncts like क्ष, त्र, ज्ञ)
8. Forms submit successfully from Hindi pages (test the Web3Forms integration still works — hidden English fields should be present)
9. WhatsApp button pre-fill message is in Hindi on Hindi pages
10. Hreflang tags are present and correct on every page
11. `<html lang="hi">` is set on every Hindi page
12. Page titles and meta descriptions are translated
13. All product anchors still work: `/hi/products.html#virosil` should scroll to the Virosil section
14. Contact page hash deep-links work in both languages: `/hi/contact.html#dealer` should open the dealer tab in Hindi

### 11. Final note for the developer

**Do not translate the Hindi to "purer" Hindi than the pamphlet's voice.** The brand has chosen a specific register — accessible, natural, code-mixed where appropriate. Match that register. If a Hindi word would confuse a farmer in UP/Bihar, use the English loanword they already use (डीलर not वितरक, फर्टिलाइज़र not उर्वरक in headlines, etc.).

When in doubt about word choice, mirror the existing Hindi in the English pages (the pamphlet's vocabulary is the source of truth).

---

## Suggested execution order

1. Read all existing pages to understand structure
2. Create `/hi/` directory and `/hi/blog/` subdirectory
3. Build `/hi/index.html` first — full Hindi translation. Get it right, then use as the template for the others.
4. Add the language toggle CSS to `style.css`
5. Add toggle HTML to existing English pages' headers
6. Add JS helper functions to `main.js` (URL computation, localStorage persistence, first-visit detection)
7. Replicate `/hi/index.html` pattern across about, products, how-to-use, blog, contact
8. Translate the 5 blog articles individually (these have the most content)
9. Verify all 14 quality checks above
10. Update `README.md` with a note about the bilingual structure and how to maintain it (e.g., "when adding a new page, create both `/page.html` and `/hi/page.html`")

Estimated time: 30–60 minutes of working time, depending on translation quality bar.
