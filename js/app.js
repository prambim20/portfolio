import { projects, services, publications, capabilities } from './data.js';
import { MapEngine } from './map.js';
import { GlobeEngine } from './globe.js';

let globeInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  initHeroStats();
  initStaticShowcase();
  initInteractiveShowcase();
  initPublications();
  initOther();
  initPageThemeEngine();
  initHeroGlobe();
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

  let sectionOffsets = [];
  let activeSectionId = '';

  const cacheOffsets = () => {
    sectionOffsets = Array.from(sections).map(section => {
      const rect = section.getBoundingClientRect();
      return {
        id: section.id,
        top: rect.top + window.scrollY,
        height: rect.height
      };
    });
  };

  const updateActiveSection = () => {
    if (sectionOffsets.length === 0) return;
    
    const scrollPosition = window.scrollY + window.innerHeight * 0.4;
    let currentId = sectionOffsets[0].id;

    for (let i = 0; i < sectionOffsets.length; i++) {
      const section = sectionOffsets[i];
      if (scrollPosition >= section.top) {
        currentId = section.id;
      }
    }

    if (currentId !== activeSectionId) {
      activeSectionId = currentId;
      const theme = themes[currentId];
      if (theme) {
        const bodyStyle = document.body.style;
        bodyStyle.setProperty('--page-bg', theme.bg);
        bodyStyle.setProperty('--glow-color', theme.glow);
        bodyStyle.setProperty('--accent', theme.accent);
        
        if (globeInstance) {
          globeInstance.setThemeColors(theme.glow, theme.accent);
        }
      }
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
      });
    }
  };

  cacheOffsets();
  updateActiveSection();

  window.addEventListener('load', cacheOffsets, { passive: true });
  window.addEventListener('resize', cacheOffsets, { passive: true });

  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      cacheOffsets();
      updateActiveSection();
    });
    resizeObserver.observe(document.body);
  }

  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        updateActiveSection();
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  const navToggle = document.querySelector('.nav-toggle');
  const navLinksContainer = document.querySelector('.nav-links');

  if (navToggle && navLinksContainer) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navLinksContainer.classList.toggle('nav-active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinksContainer.classList.remove('nav-active');
      });
    });
  }
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
  const workSection = document.getElementById('work');
  const workContainer = document.getElementById('work-catalog');
  const revealAllBtn = document.getElementById('btn-reveal-all');

  if (!workContainer || !Array.isArray(services)) return;

  const filterWrapper = document.createElement('div');
  filterWrapper.className = 'work-filters-container';
  
  const filters = ['All', 'Workflow', 'Model', 'Dataset'];
  filterWrapper.innerHTML = `
    <div class="work-filters">
      ${filters.map((f, i) => `
        <button class="filter-btn ${i === 0 ? 'active' : ''}" data-filter="${f}">
          ${f === 'All' ? 'All Outputs' : f + 's'}
        </button>
      `).join('')}
    </div>
  `;
  workSection.querySelector('.container').insertBefore(filterWrapper, workContainer);

  const seeMoreContainer = document.createElement('div');
  seeMoreContainer.className = 'see-more-container';
  const seeMoreBtn = document.createElement('button');
  seeMoreBtn.className = 'btn-see-more';
  seeMoreContainer.appendChild(seeMoreBtn);
  workSection.querySelector('.container').appendChild(seeMoreContainer);

  let currentFilter = 'All';
  let isSeeMoreExpanded = false;
  const INITIAL_LIMIT = 6;

  const isCardVisible = (card) => {
    if (card.classList.contains('filtered-out')) return false;
    return !card.classList.contains('limit-hidden') || window.innerWidth <= 768;
  };

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
    const visibleCards = Array.from(workContainer.querySelectorAll('.work-card')).filter(isCardVisible);
    const allAreExpanded = visibleCards.every(card => card.classList.contains('expanded'));
    revealAllBtn.textContent = allAreExpanded ? 'Collapse All Images' : 'Reveal All Images';
  };

  const renderCatalog = () => {
    const cards = Array.from(workContainer.querySelectorAll('.work-card'));
    const matchingCards = [];

    cards.forEach(card => {
      const matches = currentFilter === 'All' || card.getAttribute('data-tag') === currentFilter;
      if (matches) {
        card.classList.remove('filtered-out');
        matchingCards.push(card);
      } else {
        card.classList.add('filtered-out');
      }
      card.classList.remove('limit-hidden');
    });

    const showCount = isSeeMoreExpanded ? matchingCards.length : Math.min(INITIAL_LIMIT, matchingCards.length);
    for (let i = showCount; i < matchingCards.length; i++) {
      matchingCards[i].classList.add('limit-hidden');
    }

    if (matchingCards.length > INITIAL_LIMIT) {
      seeMoreContainer.style.display = 'flex';
      seeMoreBtn.innerHTML = isSeeMoreExpanded 
        ? `Show Less 
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <polyline points="18 15 12 9 6 15"></polyline>
           </svg>`
        : `See More Outputs 
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <polyline points="6 9 12 15 18 9"></polyline>
           </svg>`;
    } else {
      seeMoreContainer.style.display = 'none';
    }

    updateRevealButtonText();
  };

  workContainer.innerHTML = '';
  const fragment = document.createDocumentFragment();

  services.forEach(service => {
    const card = document.createElement('div');
    card.className = 'work-card';
    card.setAttribute('data-tag', service.tag);
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

  filterWrapper.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterWrapper.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentFilter = btn.getAttribute('data-filter');
    isSeeMoreExpanded = false;
    workContainer.scrollTo({ left: 0, behavior: 'smooth' });
    renderCatalog();
  });

  seeMoreBtn.addEventListener('click', () => {
    isSeeMoreExpanded = !isSeeMoreExpanded;
    renderCatalog();

    if (!isSeeMoreExpanded) {
      workSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  if (revealAllBtn) {
    revealAllBtn.addEventListener('click', () => {
      const visibleCards = Array.from(workContainer.querySelectorAll('.work-card')).filter(isCardVisible);
      const hasCollapsedCard = visibleCards.some(card => !card.classList.contains('expanded'));

      visibleCards.forEach(card => {
        card.classList.toggle('expanded', hasCollapsedCard);
      });

      updateRevealButtonText();
    });
  }

  window.addEventListener('resize', () => {
    renderCatalog();
  }, { passive: true });

  renderCatalog();
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
        // Apply line-clamping truncation only after style transitions have concluded
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