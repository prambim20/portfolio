import { projects, services, publications, capabilities } from './data.js';
import { MapEngine } from './map.js';
import { GlobeEngine } from './globe.js';

// Module scope tracking variables to prevent collision
let globeInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  initPageThemeEngine();
  initHeroStats();
  initHeroGlobe();
  initStaticShowcase();
  initInteractiveShowcase();
  initPublications();
  initOther();
});

/* ==========================================================================
   PHASE 1: GLOBAL LAYOUT AND STYLING SYSTEMS
   ========================================================================== */
function initPageThemeEngine() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  const themes = {
    hero: { bg: '#060913', glow: '#00f0ff', accent: '#3b82f6' },
    work: { bg: '#050c18', glow: '#60a5fa', accent: '#3b82f6' },
    showcase: { bg: '#0a0d16', glow: '#a855f7', accent: '#a855f7' },
    publication: { bg: '#04161f', glow: '#10b981', accent: '#10b981' },
    other: { bg: '#03140e', glow: '#f59e0b', accent: '#f59e0b' }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const theme = themes[id];
        if (theme) {
          const bodyStyle = document.body.style;
          bodyStyle.setProperty('--page-bg', theme.bg);
          bodyStyle.setProperty('--glow-color', theme.glow);
          bodyStyle.setProperty('--accent', theme.accent);
          
          // Reactively stream theme color changes to globe avoiding main thread paint jams
          if (globeInstance) {
            globeInstance.setThemeColors(theme.glow, theme.accent);
          }
        }
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { root: null, rootMargin: '-30% 0px -30% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   PHASE 2: SECTION - HERO NODES
   ========================================================================== */
function initHeroStats() {
  const statsMapping = [
    { id: 'project-count', data: projects },
    { id: 'catalog-count', data: services },
    { id: 'publication-count', data: publications }
  ];

  statsMapping.forEach(({ id, data }) => {
    const element = document.getElementById(id);
    if (element && Array.isArray(data)) {
      element.textContent = `${data.length} Items`;
    }
  });
}

function initHeroGlobe() {
  globeInstance = new GlobeEngine('globe-canvas');
}

/* ==========================================================================
   PHASE 3: SECTION - STATIC SHOWCASE (WORK)
   ========================================================================== */
function initStaticShowcase() {
  const workContainer = document.getElementById('work-catalog');
  const revealAllBtn = document.getElementById('btn-reveal-all');

  if (!workContainer || !Array.isArray(services)) return;

  const buildWorkLegend = (legend) => {
    if (!legend) return '';

    let html = `<div class="work-legend">`;
    if (legend.title) {
      html += `<div class="work-legend-title">${legend.title}</div>`;
    }

    if (legend.type === 'continuous') {
      html += `
        <div class="work-legend-continuous">
          <div class="work-legend-bar" style="background: ${legend.gradient}"></div>
          <div class="work-legend-labels">
            <span>${legend.min}</span>
            <span>${legend.max}</span>
          </div>
        </div>
      `;
    } else if (legend.type === 'discrete' && Array.isArray(legend.items)) {
      html += `<div class="work-legend-discrete">`;
      legend.items.forEach(item => {
        html += `
          <span class="work-legend-item">
            <span class="work-legend-dot" style="background-color: ${item.color}"></span>
            ${item.label}
          </span>
        `;
      });
      html += `</div>`;
    }

    html += `</div>`;
    return html;
  };

  const updateRevealButtonText = () => {
    if (!revealAllBtn) return;
    const allCards = workContainer.querySelectorAll('.work-card');
    const allAreExpanded = Array.from(allCards).every(card => card.classList.contains('expanded'));
    revealAllBtn.textContent = allAreExpanded ? 'Collapse All Images' : 'Reveal All Images';
  };

  // Construct and render fragments efficiently
  const fragment = document.createDocumentFragment();

  services.forEach(service => {
    const card = document.createElement('div');
    card.className = 'work-card';
    card.innerHTML = `
      <div class="work-img-wrapper">
        <img src="${service.imageUrl}" alt="${service.imageAlt}" class="work-img" loading="lazy" />
        <div class="work-overlay"></div>
      </div>
      <div class="work-content">
        <div class="work-meta">
          <span class="work-num">${service.num}</span>
          <span class="work-tag">${service.tag}</span>
        </div>
        <h3>${service.title}</h3>
        <p>${service.description}</p>
        ${buildWorkLegend(service.legend)}
      </div>
    `;

    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
      updateRevealButtonText();
    });

    fragment.appendChild(card);
  });

  workContainer.appendChild(fragment);

  if (revealAllBtn) {
    revealAllBtn.addEventListener('click', () => {
      const allCards = workContainer.querySelectorAll('.work-card');
      const hasCollapsedCard = Array.from(allCards).some(card => !card.classList.contains('expanded'));

      allCards.forEach(card => {
        card.classList.toggle('expanded', hasCollapsedCard);
      });

      updateRevealButtonText();
    });
  }
}

/* ==========================================================================
   PHASE 4: SECTION - INTERACTIVE SPATIAL WORKSPACE (SHOWCASE)
   ========================================================================== */
function initInteractiveShowcase() {
  const listContainer = document.getElementById('showcase-selectors');
  if (!listContainer || !Array.isArray(projects) || projects.length === 0) return;

  const mapEngine = new MapEngine('map', projects[0].coords, projects[0].zoom);
  const fragment = document.createDocumentFragment();

  projects.forEach((proj, index) => {
    const selectorCard = document.createElement('div');
    selectorCard.className = `showcase-selector ${index === 0 ? 'active' : ''}`;
    selectorCard.setAttribute('data-project', proj.id);
    selectorCard.setAttribute('role', 'tab');
    selectorCard.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

    const badgesList = Array.isArray(proj.badges) 
      ? proj.badges 
      : (proj.badge ? [proj.badge] : []);

    selectorCard.innerHTML = `
      <div class="selector-header">
        <h3>${proj.title}</h3>
        <div class="badge-container">
          ${badgesList.map(b => `<span class="badge">${b}</span>`).join('')}
        </div>
      </div>
      <p>${proj.description}</p>
    `;

    selectorCard.addEventListener('click', () => {
      listContainer.querySelectorAll('.showcase-selector').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      selectorCard.classList.add('active');
      selectorCard.setAttribute('aria-selected', 'true');
      mapEngine.renderProjectLayer(proj);
    });

    fragment.appendChild(selectorCard);
  });

  listContainer.appendChild(fragment);
  mapEngine.renderProjectLayer(projects[0]);
}

/* ==========================================================================
   PHASE 5: SECTION - DYNAMIC PUBLICATIONS
   ========================================================================== */
function initPublications() {
  const publicationsContainer = document.getElementById('publications-list');
  if (!publicationsContainer || !Array.isArray(publications)) return;

  publicationsContainer.innerHTML = '';
  const fragment = document.createDocumentFragment();

  publications.forEach(pub => {
    const card = document.createElement('div');
    card.className = 'publication-card clamped';
    
    let cardContent = `
      <span class="num">${pub.num}</span>
      <h3>${pub.title}</h3>
      <span class="publication-publisher">${pub.publisher}</span>
      <p>${pub.description}</p>
    `;

    if (pub.linkUrl) {
      cardContent += `
        <a href="${pub.linkUrl}" target="_blank" rel="noopener noreferrer" class="publication-link">
          ${pub.linkText || 'Read Paper'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
      `;
    }

    card.innerHTML = cardContent;
    card._transitionTimeout = null;

    card.addEventListener('click', () => {
      if (card._transitionTimeout) {
        clearTimeout(card._transitionTimeout);
        card._transitionTimeout = null;
      }

      const isExpanded = card.classList.contains('expanded');

      if (isExpanded) {
        card.classList.remove('expanded');
        card._transitionTimeout = setTimeout(() => {
          if (!card.classList.contains('expanded')) {
            card.classList.add('clamped');
          }
        }, 400); 
      } else {
        card.classList.remove('clamped'); 
        card.classList.add('expanded');  
      }
    });

    const paperLink = card.querySelector('.publication-link');
    if (paperLink) {
      paperLink.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    fragment.appendChild(card);
  });

  publicationsContainer.appendChild(fragment);
}

/* ==========================================================================
   PHASE 6: SECTION - OTHER
   ========================================================================== */
function initOther() {
  const container = document.getElementById('capabilities-tree');
  if (!container || !Array.isArray(capabilities)) return;

  container.innerHTML = ''; 
  const fragment = document.createDocumentFragment();

  capabilities.forEach(branch => {
    const branchDiv = document.createElement('div');
    branchDiv.className = 'tree-branch';

    let branchContent = `<div class="tree-branch-header">${branch.branchTitle}</div>`;

    if (Array.isArray(branch.nodes)) {
      branch.nodes.forEach(node => {
        let nodeContent = `
          <div class="tree-node">
            <div class="node-title">${node.title}</div>
            <span class="node-desc">${node.description}</span>
        `;

        if (Array.isArray(node.leaves)) {
          node.leaves.forEach(leaf => {
            const badgeHtml = leaf.badge ? `<span class="leaf-badge">${leaf.badge}</span>` : '';
            nodeContent += `
              <div class="tree-leaf">
                <span class="leaf-title">${leaf.title}</span>${badgeHtml}
              </div>
            `;
          });
        }

        nodeContent += `</div>`; 
        branchContent += nodeContent;
      });
    }

    branchDiv.innerHTML = branchContent;
    fragment.appendChild(branchDiv);
  });

  container.appendChild(fragment);
}