/**
 * Lightweight site interactivity script
 * Replaces Framer's React SPA with vanilla JS for:
 * - Dropdown menus (Solutions, Products)
 * - Standard page navigation (no SPA)
 */

(function () {
  'use strict';

  // Dropdown menu definitions
  const dropdownMenus = {
    Solutions: [
      { heading: 'APP DEVELOPERS' },
      { label: 'User Onboarding', href: '/nexus/deposit' },
      { label: 'Multi-Chain Solutions', href: '/nexus' },
      { heading: 'BLOCKCHAIN DEVELOPERS' },
      { label: 'Data Availability', href: '/da' },
    ],
    Products: [
      { label: 'Avail FastBridge', href: 'https://fastbridge.availproject.org/' },
      { label: 'Avail Deposits', href: '/nexus/deposit' },
      { label: 'Avail Nexus', href: '/nexus' },
      { label: 'Avail DA', href: '/da' },
    ],
  };

  // Create dropdown panel element
  function createDropdownPanel(items) {
    const panel = document.createElement('div');
    panel.className = 'nav-dropdown-panel';

    items.forEach(item => {
      if (item.heading) {
        const h = document.createElement('div');
        h.className = 'nav-dropdown-heading';
        h.textContent = item.heading;
        panel.appendChild(h);
      } else {
        const a = document.createElement('a');
        a.className = 'nav-dropdown-link';
        a.href = item.href;
        a.textContent = item.label;
        if (item.href.startsWith('http')) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        panel.appendChild(a);
      }
    });

    return panel;
  }

  // Inject dropdown CSS
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Fix overflow:clip on Framer wrapper that cuts off dropdowns */
      .framer-6sZUo {
        overflow: visible !important;
      }
      nav {
        overflow: visible !important;
      }

      /* Responsive variants: Framer SSR renders Desktop, Tablet, Phone variants.
         Hide inactive ones based on viewport. */
      /* Desktop (default): show Desktop, hide Tablet & Phone */
      [data-framer-name="Tablet"],
      [data-framer-name="Phone"] {
        display: none !important;
      }
      [data-framer-name="Desktop"] {
        display: flex !important;
      }

      /* Tablet: 810px–1199px */
      @media (max-width: 1199px) and (min-width: 810px) {
        [data-framer-name="Desktop"] { display: none !important; }
        [data-framer-name="Tablet"]  { display: flex !important; }
        [data-framer-name="Phone"]   { display: none !important; }
      }

      /* Phone: ≤809px */
      @media (max-width: 809px) {
        [data-framer-name="Desktop"] { display: none !important; }
        [data-framer-name="Tablet"]  { display: none !important; }
        [data-framer-name="Phone"]   { display: flex !important; }
      }
      /* Fix Framer elements hidden with inline opacity:0 (meant to be animated in by JS) */
      section[style*="opacity:0"],
      div[style*="opacity:0"],
      button[style*="opacity:0"] {
        opacity: 1 !important;
      }

      /* Ticker/marquee animation for chain logo scrollers */
      @keyframes ticker-scroll {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .ticker-animated > ul {
        animation: ticker-scroll 30s linear infinite !important;
      }
      .ticker-animated > ul:hover {
        animation-play-state: paused;
      }

      .nav-dropdown-trigger {
        cursor: pointer;
      }
      .nav-dropdown-panel {
        display: none;
        position: fixed;
        min-width: 220px;
        background: rgb(32, 34, 36);
        border-radius: 12px;
        padding: 16px 0;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transition: opacity 0.15s ease;
        pointer-events: none;
      }
      .nav-dropdown-panel.visible {
        display: flex;
        flex-direction: column;
        opacity: 1;
        pointer-events: auto;
      }
      .nav-dropdown-heading {
        font-family: "Delight Medium", "Delight Medium Placeholder", sans-serif;
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: rgba(170, 170, 170, 0.6);
        padding: 8px 20px 4px;
      }
      .nav-dropdown-heading:not(:first-child) {
        margin-top: 8px;
        border-top: 1px solid rgba(255,255,255,0.06);
        padding-top: 12px;
      }
      .nav-dropdown-link {
        display: block;
        padding: 8px 20px;
        font-family: "Delight Medium", "Delight Medium Placeholder", sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.85);
        text-decoration: none;
        transition: color 0.15s ease, background 0.15s ease;
      }
      .nav-dropdown-link:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.06);
      }
    `;
    document.head.appendChild(style);
  }

  // Position a dropdown panel below its trigger
  function positionPanel(panel, trigger) {
    const rect = trigger.getBoundingClientRect();
    panel.style.top = (rect.bottom + 8) + 'px';
    panel.style.left = (rect.left + rect.width / 2 - 110) + 'px';
  }

  // Initialize dropdown menus
  function initDropdowns() {
    injectStyles();

    // Find Solutions and Products text elements in the nav
    const nav = document.querySelector('nav');
    if (!nav) return;

    Object.keys(dropdownMenus).forEach(menuName => {
      const allElements = nav.querySelectorAll('p.framer-text');
      let triggerTextEl = null;

      allElements.forEach(el => {
        if (el.textContent.trim() === menuName) {
          triggerTextEl = el;
        }
      });

      if (!triggerTextEl) return;

      // Find the nearest positioned ancestor to use as trigger
      let trigger = triggerTextEl.closest('[class*="framer-"]');
      while (trigger && trigger.parentElement && !trigger.parentElement.matches('[data-framer-name="Links"]')) {
        trigger = trigger.parentElement;
      }

      if (!trigger) return;

      trigger.classList.add('nav-dropdown-trigger');

      const panel = createDropdownPanel(dropdownMenus[menuName]);
      document.body.appendChild(panel);

      let hideTimeout;

      function showPanel() {
        clearTimeout(hideTimeout);
        document.querySelectorAll('.nav-dropdown-panel.visible').forEach(p => {
          if (p !== panel) p.classList.remove('visible');
        });
        positionPanel(panel, trigger);
        panel.classList.add('visible');
      }

      function scheduleHide() {
        hideTimeout = setTimeout(() => {
          panel.classList.remove('visible');
        }, 200);
      }

      trigger.addEventListener('mouseenter', showPanel);
      trigger.addEventListener('mouseleave', scheduleHide);
      panel.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
      panel.addEventListener('mouseleave', scheduleHide);
    });
  }

  // Fix navigation links to use standard page loads
  function fixNavigation() {
    // Remove the data-framer-hydrate-v2 attribute to prevent any Framer JS from trying to hydrate
    const main = document.getElementById('main');
    if (main) {
      main.removeAttribute('data-framer-hydrate-v2');
    }

    // Ensure all internal links do standard navigation
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Fix relative ./ links to absolute
      if (href === './') {
        link.setAttribute('href', '/');
      } else if (href.startsWith('./')) {
        link.setAttribute('href', '/' + href.slice(2));
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fixNavigation();
      initDropdowns();
      initTickers();
    });
  } else {
    fixNavigation();
    initDropdowns();
    initTickers();
  }
  // Initialize ticker/marquee animations
  function initTickers() {
    // Find all ticker sections (Framer renders them as <section> with a <ul> inside)
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const ul = section.querySelector('ul');
      if (!ul || ul.children.length < 2) return;

      // Check if this looks like a ticker (has list items with images/logos)
      const items = ul.querySelectorAll('li');
      if (items.length < 3) return;

      // Duplicate items for seamless loop if not already duplicated
      const originalCount = items.length;
      const hasAriaHidden = Array.from(items).some(li => li.getAttribute('aria-hidden') === 'true');
      if (!hasAriaHidden) {
        items.forEach(item => {
          const clone = item.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          ul.appendChild(clone);
        });
      }

      // Remove inline transform that Framer SSR sets (e.g. translateX(-0px))
      // so the CSS animation can control the transform
      ul.style.transform = '';

      section.classList.add('ticker-animated');
    });
  }

})();
