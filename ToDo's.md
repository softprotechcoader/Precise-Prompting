# The Art of Precise Prompting

A complete, interactive visual guide to prompt engineering for Claude AI.
Built with plain HTML, CSS, and JavaScript — no build tools, no frameworks.

---

## What this guide covers

| # | Section | What you learn |
|---|---------|----------------|
| 01 | Anatomy | The 5 building blocks of every great prompt |
| 02 | Processing | How Claude internally processes your text (7 stages) |
| 03 | Quality Spectrum | Side-by-side Poor → Precise examples with scores |
| 04 | Comparison Table | All quality levels across 7 dimensions at a glance |
| 05 | Template | A fill-in-the-blanks master prompt template |
| 06 | Best Practices | 10 proven techniques, filterable by category |
| 07 | Cheat Sheet | Power phrases to copy-paste into any prompt |
| 08 | Prompt Builder | Live interactive form that assembles a real prompt |
| 09 | Common Mistakes | 8 FAQ accordion items with before/after examples |

---

## File structure

```
Art_Of_Precise_Prompting/
│
├── index.html          Main page — all 9 sections and structure
├── styles.css          All visual styles (21 organized sections)
├── scripts.js          All interactive JavaScript (13 functions)
├── README.md           This file
│
└── .github/
    └── workflows/
        └── deploy.yml  GitHub Actions CI/CD pipeline
```

### Why three separate files?

Keeping HTML, CSS, and JavaScript in separate files is a standard practice called "separation of concerns." It means:

- **HTML** only describes the content structure (what's on the page)
- **CSS** only describes how things look (colors, fonts, layout)
- **JavaScript** only describes how things behave (clicks, animations)

This makes the code easier to read, edit, and maintain. You can change the color scheme without touching the HTML, or add a new feature without touching the styles.

---

## Running locally

You don't need Node.js, npm, or any build step. Just open the file.

**Option A — Double-click** `index.html` in your file explorer. It opens in your browser.

**Option B — VS Code Live Server** (recommended for development):
1. Install the "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"
3. Changes auto-refresh in the browser as you edit

**Option C — Python quick server** (if you have Python installed):
```bash
cd "Art_Of_Precise_Prompting"
python -m http.server 8080
# then open http://localhost:8080
```

> **Note on Mermaid diagrams:** Mermaid loads from a CDN (jsDelivr). If you're working offline, the diagrams won't render — but everything else works fine.

---

## Deploying to GitHub Pages

This repo ships with a GitHub Actions workflow that automatically deploys to GitHub Pages whenever you push to the `main` branch.

### First-time setup (do this once)

1. **Push this folder to a GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Enable GitHub Pages in your repo settings:**
   - Go to your repo on GitHub
   - Click **Settings** → **Pages** (left sidebar)
   - Under "Source" select **GitHub Actions**
   - Click Save

3. **Push any change to `main`** — the workflow runs automatically.

4. **Your site goes live at:**
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

   The exact URL is shown in the GitHub Actions run log and in Settings → Pages.

### How the CI/CD pipeline works

The workflow file is at `.github/workflows/deploy.yml`.

```
You push code to main
        ↓
GitHub Actions triggers the workflow
        ↓
Checkout action pulls the latest code
        ↓
configure-pages prepares the deployment
        ↓
upload-pages-artifact bundles the site files
        ↓
deploy-pages publishes to GitHub Pages CDN
        ↓
Your live URL is updated (usually < 2 minutes)
```

No build step is needed because this is a static site — the files are served as-is.

---

## CSS Reference

All CSS is in `styles.css`, organized into 21 numbered sections.

### CSS Custom Properties (Variables)

Defined in `:root {}` at the top of `styles.css`. Change these to retheme the whole site.

| Variable | Default value | What it controls |
|----------|---------------|------------------|
| `--ink` | `#1a1a2e` | Main text color (dark navy) |
| `--ink2` | `#2d2d44` | Secondary text, slightly lighter |
| `--muted` | `#6b6b8a` | Subdued / placeholder text |
| `--bg` | `#f5f4f0` | Page background (warm off-white) |
| `--bg2` | `#eceae4` | Card and panel backgrounds |
| `--bg3` | `#ffffff` | Pure white surfaces |
| `--accent` | `#e8533e` | Primary brand color (red-orange) |
| `--accent2` | `#f2a24a` | Secondary accent (amber) |
| `--blue` | `#3b6fd4` | Informational / link blue |
| `--teal` | `#1d9e75` | Success / positive green |
| `--purple` | `#7c5cbf` | Code highlight purple |
| `--r` | `12px` | Medium border radius (cards) |
| `--r2` | `8px` | Small border radius (inputs) |
| `--r3` | `20px` | Large border radius (containers) |
| `--t` | `0.2s ease` | Standard hover transition |
| `--section-pad` | `64px` | Vertical section padding |

**Dark mode** is handled by overriding variables on `body.dark {}`. All component styles automatically inherit the updated values — no duplicate rules needed.

### Key CSS patterns used

**`clamp(min, preferred, max)`** — fluid font sizes that scale with viewport width:
```css
font-size: clamp(24px, 3vw, 36px);
/* never smaller than 24px, never larger than 36px, scales between */
```

**`backdrop-filter: blur()`** — frosted glass effect on the nav bar:
```css
background: rgba(245,244,240,0.92);
backdrop-filter: blur(14px);
```

**CSS Grid `auto-fill`** — auto-wrapping card grid that fits as many columns as possible:
```css
grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
```

**`max-height` animation trick** — used for the FAQ accordion. Height can't be transitioned from `0` to `auto`, but `max-height` can:
```css
.faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
.faq-item.open .faq-answer { max-height: 500px; }
```

---

## JavaScript Reference

All JavaScript is in `scripts.js`, organized into 13 sections.

### Function list

#### `initMermaid()`
Configures the Mermaid library before it auto-renders the `<pre class="mermaid">` blocks. Sets theme colors, curve style, and font family to match the design system.

#### `initTheme()` / `toggleDarkMode()` / `updateThemeIcon(isDark)`
Theme system:
- `initTheme()` — runs on page load. Reads `localStorage` for a saved preference, falls back to OS `prefers-color-scheme`.
- `toggleDarkMode()` — flips the `.dark` class on `<body>`, saves to `localStorage`, re-renders Mermaid diagrams in matching theme.
- `updateThemeIcon(isDark)` — swaps the button emoji between ☀️ and 🌙.

#### `switchTab(id, btn)`
Switches the active quality spectrum panel. Removes `.active` from all panels/tabs, adds it to the selected ones, then calls `animateScoreBarsInPanel()` after a short delay.

**Parameters:**
- `id` — panel suffix string: `'poor'` | `'avg'` | `'nice'` | `'prec'`
- `btn` — the clicked `<button>` element

#### `animateScoreBarsInPanel(panel)`
Finds all `.score-fill[data-width]` elements inside `panel` and animates them from 0% to their `data-width` value. Uses a double `requestAnimationFrame` to ensure the CSS reset actually fires before the transition starts.

#### `initCopyButtons()` / `copyText(text, btn)` / `execCommandFallback(text, cb)`
Copy to clipboard system:
- `initCopyButtons()` — scans for `.copyable` elements, injects a `<button class="copy-btn">` into each, wires up the click handler.
- `copyText(text, btn)` — writes text using the modern `navigator.clipboard` API with fallback.
- `execCommandFallback()` — legacy copy method for HTTP or older browsers.

#### `buildPrompt()`
Core function of the interactive builder. Reads all 9 field values (`#b-role`, `#b-context`, etc.), assembles them into a formatted prompt string, and updates `#preview-output`. Also updates the character/token counter.

#### `val(id)`
Small helper: `document.getElementById(id)?.value.trim() ?? ''`. Used heavily inside `buildPrompt()`.

#### `clearBuilder()`
Resets all builder form fields to empty strings and shows the placeholder text.

#### `copyPreview()`
Reads `#preview-output` text and calls `copyText()` to put it on the clipboard.

#### `fillExample(type)`
Pre-populates all builder fields with a sample prompt. `type` can be `'code'`, `'writing'`, or `'analysis'`. Calls `buildPrompt()` when done.

#### `toggleFAQ(questionEl)`
Accordion toggle. Closes all open `.faq-item` elements, then opens the one containing `questionEl` (unless it was already open — in which case it just closes).

#### `initScrollAnimations()`
Uses `IntersectionObserver` to watch all `.fade-in` elements. When one enters the viewport (at least 12% visible), adds `.visible`, which triggers the CSS fade-up transition. Also triggers `animateScoreBarsInPanel()` if score bars are present in the element.

#### `initScrollSpy()`
Uses `IntersectionObserver` to detect which `<section id="...">` is currently in view and highlights the matching `.nav-link[data-section]` with `.active`.

#### `initBackToTop()` / `scrollToTop()`
- `initBackToTop()` — adds a passive `scroll` listener. Shows the button when `window.scrollY > 400`.
- `scrollToTop()` — calls `window.scrollTo({ top: 0, behavior: 'smooth' })`.

#### `filterPractices(category, btn)`
Filters the best practices grid. Removes `.hidden` from all cards if `category === 'all'`, otherwise adds `.hidden` to cards whose `data-category` doesn't match.

#### `scrollToSection(sectionId)`
Smoothly scrolls to a section, accounting for the 52px sticky nav bar height.

---

## Mermaid Diagrams

The guide uses [Mermaid v10](https://mermaid.js.org/) for two diagrams:

**Section 01 — Prompt Anatomy Mindmap**
```
mindmap
  root((Ideal Prompt))
    Role → Context → Task → Format → Constraints
```

**Section 02 — Processing Pipeline Flowchart**
```
flowchart LR
  Your Prompt → Tokenize → Intent Parse → Context Weight
              → Knowledge → Chain-of-Thought → Format → Response
```

Mermaid renders these as SVG when the page loads. To change a diagram, edit the text inside the relevant `<pre class="mermaid">` block in `index.html`.

---

## Adding a new section

1. Add a new `<section id="your-id">` in `index.html` following the existing pattern
2. Add a matching `.nav-link` button in the nav bar with `data-section="your-id"`
3. Add CSS for any new components to `styles.css`
4. Add any JavaScript behavior to `scripts.js`

---

## Browser support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). IE is not supported.

The `backdrop-filter` nav blur effect needs `-webkit-backdrop-filter` for Safari — already included in `styles.css`.

---

## License

MIT — free to use, adapt, and share.
