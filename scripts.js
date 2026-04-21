/* ================================================================
   scripts.js  —  Prompt Engineering Guide

   This file handles ALL interactive behavior on the page.
   It runs after the DOM is fully loaded (see DOMContentLoaded).

   FUNCTION REFERENCE
   ──────────────────────────────────────────────────────────────
   initMermaid()               Set up Mermaid diagram rendering
   initTheme()                 Load saved dark/light preference
   toggleDarkMode()            Switch theme & save to localStorage
   updateThemeIcon(isDark)     Update the sun/moon button icon

   switchTab(id, btn)          Switch quality spectrum tabs
   animateScoreBarsInPanel(p)  Animate score bars in a given panel

   initCopyButtons()           Wire up all "Copy" buttons
   copyText(text, btn)         Copy a string to clipboard

   buildPrompt()               Assemble prompt from builder form
   clearBuilder()              Reset all builder inputs
   copyPreview()               Copy assembled prompt to clipboard
   updateCharCount()           Update char count under preview

   toggleFAQ(el)               Open/close an FAQ accordion item

   initScrollAnimations()      Fade-in elements on scroll (IntersectionObserver)
   initScrollSpy()             Highlight active nav link while scrolling
   initBackToTop()             Show/hide back-to-top button

   filterPractices(cat, btn)   Filter best practice cards by category
   ================================================================ */


/* ─────────────────────────────────────────────────────────────────
   1.  BOOT  ─ run everything once DOM is ready
   ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();           // must run first so page renders in correct theme
  initMermaid();         // render all <pre class="mermaid"> diagrams
  initScrollAnimations();// set up intersection observer for fade-ins
  initScrollSpy();       // highlight active nav link
  initBackToTop();       // show/hide back-to-top button
  initCopyButtons();     // attach copy handlers to all .copyable blocks

  // Trigger score bar animation for the default visible panel
  const defaultPanel = document.querySelector('.quality-panel.active');
  if (defaultPanel) {
    setTimeout(() => animateScoreBarsInPanel(defaultPanel), 300);
  }
});


/* ─────────────────────────────────────────────────────────────────
   2.  MERMAID DIAGRAM SETUP

   Mermaid converts text inside <pre class="mermaid"> blocks
   into SVG diagrams (flowcharts, mindmaps, etc.)
   We configure it here so diagrams match our design system.
   ───────────────────────────────────────────────────────────────── */

/**
 * initMermaid
 * Configures and initializes the Mermaid library.
 * Must run AFTER the Mermaid <script> tag has loaded.
 */
function initMermaid() {
  // Safety check — library may not be loaded
  if (typeof mermaid === 'undefined') {
    console.warn('Mermaid library not found. Diagrams will not render.');
    return;
  }

  mermaid.initialize({
    startOnLoad: true,    // auto-render diagrams when page loads
    theme: 'base',        // use minimal theme so CSS controls most styling

    // Color tokens fed into Mermaid's SVG templates
    themeVariables: {
      primaryColor:       '#e8533e',
      primaryTextColor:   '#1a1a2e',
      primaryBorderColor: '#e8533e',
      lineColor:          '#9393b0',
      secondaryColor:     '#f5f4f0',
      tertiaryColor:      '#ffffff',
      edgeLabelBackground:'#f5f4f0',
      fontFamily:         'DM Sans, sans-serif',
      fontSize:           '14px',
    },

    // Flowchart-specific options
    flowchart: {
      curve: 'smooth',    // smooth bezier curves on arrows
      padding: 20,        // inner padding around nodes
      htmlLabels: true,   // allow HTML inside node labels
    },

    // Mindmap-specific options
    mindmap: {
      padding: 16,
    },

    // Security: allow only safe HTML inside diagram labels
    securityLevel: 'loose',
  });
}


/* ─────────────────────────────────────────────────────────────────
   3.  DARK MODE

   We store the user's preference in localStorage so it persists
   across page reloads. We also respect the OS-level preference
   via the prefers-color-scheme media query.
   ───────────────────────────────────────────────────────────────── */

/**
 * initTheme
 * Called on page load. Checks saved preference, falls back to OS preference.
 */
function initTheme() {
  const saved       = localStorage.getItem('theme');
  const prefsDark   = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldBeDark = saved === 'dark' || (!saved && prefsDark);

  if (shouldBeDark) {
    document.body.classList.add('dark');
  }

  updateThemeIcon(shouldBeDark);
}

/**
 * toggleDarkMode
 * Flips the theme when the user clicks the sun/moon button.
 * Saves choice to localStorage so it survives a page refresh.
 */
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);

  // Re-render Mermaid diagrams with matching theme colours
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'base',
    });
    // mermaid.run() re-processes all diagram blocks
    try { mermaid.run(); } catch (e) { /* ignore if already rendered */ }
  }
}

/**
 * updateThemeIcon
 * Swaps the emoji icon inside the theme toggle button.
 *
 * @param {boolean} isDark  true = dark mode is active
 */
function updateThemeIcon(isDark) {
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}


/* ─────────────────────────────────────────────────────────────────
   4.  QUALITY SPECTRUM TABS

   The quality spectrum section has 4 tabs (Poor → Precise).
   Clicking a tab shows the matching panel and hides the others.
   ───────────────────────────────────────────────────────────────── */

/**
 * switchTab
 * Activates one quality panel and deactivates the rest.
 *
 * @param {string}  id   Panel suffix — 'poor' | 'avg' | 'nice' | 'prec'
 * @param {Element} btn  The tab <button> element that was clicked
 */
function switchTab(id, btn) {
  // Deactivate all panels and tab buttons
  document.querySelectorAll('.quality-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.qtab').forEach(b => b.classList.remove('active'));

  // Activate the target panel and the clicked button
  const panel = document.getElementById('panel-' + id);
  if (panel) panel.classList.add('active');
  btn.classList.add('active');

  // After a tiny delay (so the panel is visible), animate its score bars
  setTimeout(() => animateScoreBarsInPanel(panel), 60);
}


/* ─────────────────────────────────────────────────────────────────
   5.  SCORE BAR ANIMATION

   Each .score-fill element has a data-width attribute (e.g. "78%").
   The CSS starts the bar at width:0.
   This function triggers the transition to the target width.
   ───────────────────────────────────────────────────────────────── */

/**
 * animateScoreBarsInPanel
 * Finds all score bars inside a panel and animates them.
 *
 * @param {Element|null} panel  The panel element to search within
 */
function animateScoreBarsInPanel(panel) {
  if (!panel) return;

  panel.querySelectorAll('.score-fill[data-width]').forEach(bar => {
    const target = bar.dataset.width;
    bar.style.width = '0%';   // reset first

    // Double rAF (requestAnimationFrame) trick:
    // The first rAF ensures the '0%' reset is painted BEFORE
    // we set the target width, so the CSS transition actually fires.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = target;
      });
    });
  });
}


/* ─────────────────────────────────────────────────────────────────
   6.  COPY TO CLIPBOARD

   Two parts:
   a) initCopyButtons — scans the page for .copyable elements
      and injects a "Copy" button into each one.
   b) copyText — the actual clipboard write + visual feedback.
   ───────────────────────────────────────────────────────────────── */

/**
 * initCopyButtons
 * Dynamically inserts a copy button into every .copyable element.
 * This way the HTML doesn't need to manually add buttons.
 */
function initCopyButtons() {
  document.querySelectorAll('.copyable').forEach(block => {
    const btn = document.createElement('button');
    btn.className   = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy to clipboard');

    // The parent must be position:relative for the absolute button to work
    block.style.position = 'relative';
    block.appendChild(btn);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Grab text content, strip the button's own "Copy" text
      const text = block.textContent.replace(/^Copy$/m, '').trim();
      copyText(text, btn);
    });
  });
}

/**
 * copyText
 * Writes text to the clipboard.
 * Shows "Copied!" feedback on the button, then resets after 1.5s.
 *
 * Falls back to document.execCommand for older browsers that
 * don't support the modern navigator.clipboard API.
 *
 * @param {string}  text  Text to copy
 * @param {Element} btn   The button element to update
 */
function copyText(text, btn) {
  const reset = () => {
    if (!btn) return;
    btn.textContent = 'Copy';
    btn.classList.remove('copied');
    btn.style.background = '';
    btn.style.color = '';
  };

  const confirm = () => {
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(reset, 1600);
  };

  // Modern Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(confirm)
      .catch(() => execCommandFallback(text, confirm));
  } else {
    execCommandFallback(text, confirm);
  }
}

/**
 * execCommandFallback
 * Legacy copy method for HTTP or older browsers.
 * Creates a hidden <textarea>, selects it, and fires execCommand('copy').
 */
function execCommandFallback(text, onSuccess) {
  const ta = document.createElement('textarea');
  ta.value = text;
  Object.assign(ta.style, { position: 'fixed', opacity: '0', pointerEvents: 'none' });
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    if (onSuccess) onSuccess();
  } catch (e) {
    console.warn('Copy failed:', e);
  }
  document.body.removeChild(ta);
}


/* ─────────────────────────────────────────────────────────────────
   7.  INTERACTIVE PROMPT BUILDER

   Users fill in Role, Context, Task, etc. in a form.
   buildPrompt() reads those values and assembles a formatted
   prompt string, displayed in the live preview panel.
   ───────────────────────────────────────────────────────────────── */

/**
 * buildPrompt
 * Reads all builder field values and renders a formatted prompt
 * into the preview panel. Called on every input event.
 */
function buildPrompt() {
  // Read each field — .trim() removes leading/trailing whitespace
  const role     = val('b-role');
  const context  = val('b-context');
  const task     = val('b-task');
  const format   = val('b-format');
  const audience = val('b-audience');
  const tone     = val('b-tone');
  const doThis   = val('b-do');
  const dontThis = val('b-donot');
  const example  = val('b-example');

  // Build up the prompt section by section, only adding non-empty fields
  const parts = [];
  if (role)     parts.push(`You are a ${role}.`);
  if (context)  parts.push(`\nContext:\n${context}`);
  if (task)     parts.push(`\nTask:\n${task}`);
  if (format)   parts.push(`\nFormat:\n${format}`);
  if (audience) parts.push(`\nAudience:\n${audience}`);
  if (tone)     parts.push(`\nTone:\n${tone}`);
  if (doThis)   parts.push(`\nDo:\n${doThis}`);
  if (dontThis) parts.push(`\nDo NOT:\n${dontThis}`);
  if (example)  parts.push(`\nExample of good output:\n${example}`);

  const promptText = parts.join('\n');

  const output      = document.getElementById('preview-output');
  const placeholder = document.getElementById('preview-placeholder');
  const charCount   = document.getElementById('preview-chars');

  if (promptText && output && placeholder) {
    output.textContent    = promptText;
    output.style.display  = 'block';
    placeholder.style.display = 'none';
  } else if (output && placeholder) {
    output.textContent    = '';
    output.style.display  = 'none';
    placeholder.style.display = 'block';
  }

  // Update character count
  if (charCount) {
    charCount.textContent = promptText
      ? `${promptText.length.toLocaleString()} characters · ~${Math.ceil(promptText.length / 4)} tokens`
      : '';
  }
}

/**
 * val
 * Shorthand: gets a trimmed value from an input/textarea by id.
 *
 * @param {string} id  Element ID
 * @returns {string}   Trimmed value, or empty string if not found
 */
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/**
 * clearBuilder
 * Resets all form fields and clears the preview.
 */
function clearBuilder() {
  ['b-role','b-context','b-task','b-format','b-audience','b-tone','b-do','b-donot','b-example']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

  const output      = document.getElementById('preview-output');
  const placeholder = document.getElementById('preview-placeholder');
  const charCount   = document.getElementById('preview-chars');

  if (output)      { output.textContent = ''; output.style.display = 'none'; }
  if (placeholder) placeholder.style.display = 'block';
  if (charCount)   charCount.textContent = '';
}

/**
 * copyPreview
 * Copies the assembled prompt from the preview panel.
 * Called by the "Copy Prompt" button in the preview.
 */
function copyPreview() {
  const output = document.getElementById('preview-output');
  const btn    = document.getElementById('preview-copy');
  if (output && output.textContent) {
    copyText(output.textContent, btn);
  }
}

/**
 * fillExample
 * Pre-populates the builder with a sample prompt based on type.
 * Useful for showing users what each field should look like.
 *
 * @param {string} type  'code' | 'writing' | 'analysis'
 */
function fillExample(type) {
  const examples = {
    code: {
      role:     'senior Python engineer',
      context:  'I have a Django REST API with slow database queries on the /users endpoint. Profiling shows N+1 queries.',
      task:     'Identify the N+1 issue in the provided code and rewrite the queryset to use select_related or prefetch_related.',
      format:   'Show: (1) the problematic code, (2) the fixed version, (3) a brief explanation of why it\'s faster.',
      audience: 'Mid-level Django developer',
      tone:     'Technical, direct',
      doThis:   'Use Django ORM best practices. Add inline comments explaining the fix.',
      dontThis: 'Do NOT use raw SQL. Do NOT change the API response shape.',
      example:  '',
    },
    writing: {
      role:     'content strategist specializing in B2B SaaS',
      context:  'We are launching a new AI feature for project management software. The feature auto-assigns tasks based on team workload.',
      task:     'Write a 400-word blog post introducing this feature to our existing customers.',
      format:   'Structure: Hook (1 sentence), Problem (1 paragraph), Solution (2 paragraphs), CTA (1 sentence).',
      audience: 'Project managers at mid-size tech companies, 30-50 years old',
      tone:     'Conversational and confident. No jargon. Avoid buzzwords like "leverage" and "synergy".',
      doThis:   'Include one concrete example of the feature in action.',
      dontThis: 'Do NOT use passive voice. Do NOT start with "In today\'s fast-paced world".',
      example:  '',
    },
    analysis: {
      role:     'data analyst',
      context:  'Monthly churn rate jumped from 2.1% to 4.8% in Q3. The jump started in week 3 of August.',
      task:     'List the most likely causes of this churn spike and suggest one data query I can run to validate each hypothesis.',
      format:   'Numbered list. Each item: hypothesis + SQL query to test it (assume PostgreSQL, table name: subscriptions).',
      audience: 'Non-technical product manager',
      tone:     'Clear and methodical. Explain SQL queries in plain English.',
      doThis:   'Focus on hypotheses testable with subscription and event data.',
      dontThis: 'Do NOT suggest external surveys. Do NOT guess without a validation step.',
      example:  '',
    },
  };

  const data = examples[type];
  if (!data) return;

  Object.entries(data).forEach(([field, value]) => {
    const el = document.getElementById(`b-${field === 'doThis' ? 'do' : field === 'dontThis' ? 'donot' : field}`);
    if (el) el.value = value;
  });

  buildPrompt();
}


/* ─────────────────────────────────────────────────────────────────
   8.  FAQ ACCORDION

   Clicking a question expands its answer.
   Only one item stays open at a time.
   ───────────────────────────────────────────────────────────────── */

/**
 * toggleFAQ
 * Closes all open items, then opens the clicked one (unless it was already open).
 *
 * @param {Element} questionEl  The .faq-question div that was clicked
 */
function toggleFAQ(questionEl) {
  const clickedItem = questionEl.closest('.faq-item');
  const wasOpen     = clickedItem.classList.contains('open');

  // Close everything first (accordion behavior: only one open)
  document.querySelectorAll('.faq-item.open').forEach(item => item.classList.remove('open'));

  // If it wasn't already open, open it now
  if (!wasOpen) clickedItem.classList.add('open');
}


/* ─────────────────────────────────────────────────────────────────
   9.  SCROLL ANIMATIONS

   IntersectionObserver watches elements with class="fade-in".
   When they scroll into view, we add class="visible",
   which triggers the CSS transition defined in styles.css.

   This is much more performant than listening to scroll events
   because the browser handles the visibility checks internally.
   ───────────────────────────────────────────────────────────────── */

/**
 * initScrollAnimations
 * Observes all .fade-in elements and adds .visible when they enter viewport.
 */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('visible');

        // Also kick off score bar animation if this element contains bars
        const bars = entry.target.querySelectorAll('.score-fill[data-width]');
        if (bars.length > 0) {
          setTimeout(() => animateScoreBarsInPanel(entry.target), 120);
        }

        // Stop watching once animated — no need to re-trigger
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,               // fire when 12% of the element is visible
      rootMargin: '0px 0px -30px 0px', // offset from the bottom edge
    }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}


/* ─────────────────────────────────────────────────────────────────
   10. SCROLL SPY

   As the user scrolls through sections, the corresponding
   nav link gets the "active" class for visual feedback.
   ───────────────────────────────────────────────────────────────── */

/**
 * initScrollSpy
 * Uses IntersectionObserver to track which section is in view.
 * Updates nav links with [data-section] attributes.
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  if (!sections.length || !navLinks.length) return;

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === id);
          });
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: '-52px 0px 0px 0px',  // 52px = nav bar height
    }
  );

  sections.forEach(s => spy.observe(s));
}


/* ─────────────────────────────────────────────────────────────────
   11. BACK TO TOP BUTTON

   Shows the floating button once the user scrolls 400px down.
   ───────────────────────────────────────────────────────────────── */

/**
 * initBackToTop
 * Attaches a scroll listener that toggles .visible on the button.
 */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  // passive:true tells the browser we won't call preventDefault(),
  // which lets it optimize the scroll listener for performance.
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
}

/**
 * scrollToTop
 * Smoothly scrolls back to the top of the page.
 * Called by the back-to-top button's onclick.
 */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ─────────────────────────────────────────────────────────────────
   12. BEST PRACTICES FILTER

   Each practice card has a data-category attribute.
   The filter buttons call filterPractices() which shows/hides cards.
   ───────────────────────────────────────────────────────────────── */

/**
 * filterPractices
 * Filters the best practices grid by category.
 * 'all' shows every card.
 *
 * @param {string}  category  'all' | 'output' | 'clarity' | 'structure' | 'quality'
 * @param {Element} btn       The filter button that was clicked
 */
function filterPractices(category, btn) {
  // Update which button looks active
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Toggle visibility of each card
  document.querySelectorAll('.practice-card').forEach(card => {
    const match = category === 'all' || card.dataset.category === category;
    card.classList.toggle('hidden', !match);
  });
}


/* ─────────────────────────────────────────────────────────────────
   13. SMOOTH SCROLL FOR NAV LINKS

   Clicking a .nav-link scrolls to the target section smoothly.
   The offset accounts for the sticky nav bar height.
   ───────────────────────────────────────────────────────────────── */

/**
 * scrollToSection
 * Smoothly scrolls to the section with the given ID,
 * adjusting for the 52px sticky nav bar.
 *
 * @param {string} sectionId  The section element's ID
 */
function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;

  const navHeight = 52;
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: 'smooth' });
}
