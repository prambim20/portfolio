import { projects, services, publications, capabilities } from './data.js';
import { MapEngine } from './map.js';
import { SpatialBackdropEngine } from './backdrop.js';

let spatialBackdropInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  initHeroStats();
  initStaticShowcase();
  initInteractiveShowcase();
  initPublications();
  initOther();
  initPageThemeEngine();
  initSpatialBackdrop();
  initNavbarScrollEngine();
});

/* ==========================================================================
   PHASE 1: GLOBAL LAYOUT AND STYLING SYSTEMS
   ========================================================================= */
function initPageThemeEngine() {
  const sections = Array.from(document.querySelectorAll('section'));
  const navLinks = document.querySelectorAll('.nav-link');

  const themes = {
    hero: { bg: '#060913', glow: '#00f0ff', accent: '#3b82f6' },
    work: { bg: '#050c18', glow: '#60a5fa', accent: '#3b82f6' },
    showcase: { bg: '#0a0d16', glow: '#a855f7', accent: '#a855f7' },
    publication: { bg: '#04161f', glow: '#10b981', accent: '#10b981' },
    other: { bg: '#03140e', glow: '#f59e0b', accent: '#f59e0b' }
  };

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -20% 0px',
    threshold: [0, 0.1, 0.2, 0.5, 0.8, 1.0]
  };

  // Track currently visible sections and their exact visibility ratios inside a DOM Map [app.js]
  let visibleSections = new Map();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleSections.set(entry.target.id, entry.intersectionRatio);
      } else {
        visibleSections.delete(entry.target.id);
      }
    });

    // Find the visible section holding the highest layout ratio on viewport
    let maxRatio = -1;
    let activeId = '';
    
    visibleSections.forEach((ratio, id) => {
      if (ratio > maxRatio) {
        maxRatio = ratio;
        activeId = id;
      }
    });

    // Failsafe 1: If scrolled near the absolute top, force 'hero' states instantly
    if (window.scrollY <= 50) {
      activeId = 'hero';
    }

    if (activeId) {
      const theme = themes[activeId];
      if (theme) {
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--page-bg', theme.bg);
        rootStyle.setProperty('--glow-color', theme.glow);
        rootStyle.setProperty('--accent', theme.accent);
      }

      navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        // FIXED: Extracts cleanly hash anchors of active targets, resolving any full absolute URL matching errors on scrollspy
        const hash = href.includes('#') ? '#' + href.split('#')[1] : href;
        link.classList.toggle('active', hash === `#${activeId}`);
      });
    }
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Failsafe 2: Lightweight scroll listener guarantees top theme snaps back with zero lag
  window.addEventListener('scroll', () => {
    if (window.scrollY <= 50) {
      const theme = themes['hero'];
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty('--page-bg', theme.bg);
      rootStyle.setProperty('--glow-color', theme.glow);
      rootStyle.setProperty('--accent', theme.accent);
      navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const hash = href.includes('#') ? '#' + href.split('#')[1] : href;
        link.classList.toggle('active', hash === '#hero');
      });
    }
  }, { passive: true });
}

function initNavbarScrollEngine() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
}

/* ==========================================================================
   PHASE 2: SECTION - HERO NODES
   ========================================================================= */
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

function initSpatialBackdrop() {
  spatialBackdropInstance = new SpatialBackdropEngine('spatial-backdrop');
}

/* ==========================================================================
   PHASE 3: SECTION - STATIC SHOWCASE (GLASS METRO GRID CATALOG WITH FILTERS)
   ========================================================================= */
function initStaticShowcase() {
  const workSection = document.getElementById('work');
  const workContainer = document.getElementById('work-catalog');
  const revealAllBtn = document.getElementById('btn-reveal-all');

  if (!workContainer || !Array.isArray(services) || services.length === 0) return;

  // Append dynamic category filters [index.html, data.js]
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

  // Append "See More" sequential controller layout [main.css, app.js]
  const seeMoreContainer = document.createElement('div');
  seeMoreContainer.className = 'see-more-container';
  const seeMoreBtn = document.createElement('button');
  seeMoreBtn.className = 'btn-see-more';
  seeMoreContainer.appendChild(seeMoreBtn);
  workSection.querySelector('.container').appendChild(seeMoreContainer);

  let currentFilter = 'All';
  let isSeeMoreExpanded = false;
  const INITIAL_LIMIT = 6;

  // Fully decoupled static legend formatting engine
  const buildLegendHtml = (legend) => {
    if (!legend) return '';
    let html = `<div class="static-legend">`;
    if (legend.type === 'continuous') {
      html += `
        <div class="static-legend-continuous">
          <div class="static-legend-bar" style="background: ${legend.gradient}"></div>
          <div class="static-legend-labels">
            <span>${legend.min}</span>
            <span>${legend.max}</span>
          </div>
        </div>
      `;
    } else if (legend.type === 'discrete' && Array.isArray(legend.items)) {
      html += `<div class="static-legend-discrete">`;
      legend.items.forEach(item => {
        html += `
          <span class="static-legend-item">
            <span class="static-legend-dot" style="background-color: ${item.color}"></span>
            ${item.label}
          </span>
        `;
      });
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  };

  const isCardVisible = (card) => {
    if (card.classList.contains('filtered-out')) return false;
    return !card.classList.contains('limit-hidden') || window.innerWidth <= 768;
  };

  const updateRevealButtonText = () => {
    if (!revealAllBtn) return;
    const visibleCards = Array.from(workContainer.querySelectorAll('.work-card')).filter(isCardVisible);
    const allAreExpanded = visibleCards.every(card => card.classList.contains('expanded'));
    revealAllBtn.textContent = allAreExpanded ? 'Collapse All Details' : 'Reveal All Details';
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

    const isMobile = window.innerWidth <= 768;

    // FIXED: Snapping mobile panels load all matches seamlessly; desktop layout retains the 6-limit See More triggers
    if (isMobile) {
      matchingCards.forEach(card => {
        card.classList.remove('limit-hidden');
        card.classList.remove('collapsing-anim');
        card.classList.remove('revealing-anim');
      });
      seeMoreContainer.style.display = 'none';
    } else {
      const hasMoreThanLimit = matchingCards.length > INITIAL_LIMIT;

      if (isSeeMoreExpanded) {
        // Butter-smooth revealing slide transition [main.css]
        matchingCards.forEach((card, idx) => {
          if (idx >= INITIAL_LIMIT) {
            card.classList.remove('limit-hidden');
            void card.offsetWidth; // Force layout re-render for clean keyframe registry
            card.classList.add('revealing-anim');
            card.classList.remove('collapsing-anim');
          }
        });
      } else {
        // Butter-smooth collapsing fade transition [main.css]
        matchingCards.forEach((card, idx) => {
          if (idx >= INITIAL_LIMIT) {
            card.classList.add('collapsing-anim');
            card.classList.remove('revealing-anim');
            
            setTimeout(() => {
              if (card.classList.contains('collapsing-anim')) {
                card.classList.add('limit-hidden');
              }
            }, 400); // Maps accurately to custom collapse duration
          }
        });
      }

      if (hasMoreThanLimit) {
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
    }

    updateRevealButtonText();
  };

  workContainer.innerHTML = '';
  const fragment = document.createDocumentFragment();

  services.forEach(service => {
    const card = document.createElement('div');
    card.className = 'work-card';
    card.setAttribute('data-tag', service.tag);

    const hasViews = Array.isArray(service.views) && service.views.length > 0;

    let imagesHtml = '';
    let tabsHtml = '';

    // Properly maps cover image alongside all supplementary project perspectives
    if (hasViews) {
      imagesHtml = `
        <img src="${service.imageUrl}" alt="${service.imageAlt} - Cover" class="card-img active" data-view-idx="cover" />
      `;
      imagesHtml += service.views.map((view, idx) => `
        <img src="${view.url}" onerror="this.onerror=null; this.src='${service.imageUrl}';" alt="${service.imageAlt} - ${view.label}" class="card-img" data-view-idx="${idx}" />
      `).join('');

      tabsHtml = `
        <div class="card-tabs">
          <button class="card-tab-btn active" data-view-target="cover">Cover</button>
          ${service.views.map((view, idx) => `
            <button class="card-tab-btn" data-view-target="${idx}">${view.label}</button>
          `).join('')}
        </div>
      `;
    } else {
      imagesHtml = `<img src="${service.imageUrl}" alt="${service.imageAlt}" class="card-img active" />`;
    }

    card.innerHTML = `
      <div class="card-preview-viewport">
        ${imagesHtml}
      </div>
      <div class="card-header">
        <span class="card-num">${service.num}</span>
        <span class="card-badge">${service.tag}</span>
      </div>
      <h3>${service.title}</h3>
      <p class="card-collapsed-desc">${service.description}</p>

      <div class="card-expanded-details">
        ${tabsHtml}
        ${service.legend ? `
          <div class="card-legend-block">
            <div class="card-legend-title">${service.legend.title || 'LEGEND'}</div>
            ${buildLegendHtml(service.legend)}
          </div>
        ` : ''}
        <p class="card-full-desc">${service.description}</p>
      </div>

      <div class="card-action-bar">
        <span class="card-action-text">Details</span>
        <span class="card-chevron">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
    `;

    // Inline details expansion handler
    card.addEventListener('click', (e) => {
      // Prevent toggling expansion state when interacting with perspective switcher buttons
      if (e.target.closest('.card-tab-btn')) return;

      const isCollapsing = card.classList.contains('expanded');
      
      // Close any other open cards to keep viewport layout tidy
      workContainer.querySelectorAll('.work-card').forEach(c => {
        if (c !== card) {
          c.classList.remove('expanded');
        }
      });

      card.classList.toggle('expanded');
      updateRevealButtonText();

      // Eradicate horizontal snapping offsets on touch devices
      if (!isCollapsing && window.innerWidth <= 768) {
        setTimeout(() => {
          card.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest', 
            inline: 'center' 
          });
        }, 150);
      }
    });

    // Image Perspective switcher tab handlers
    if (hasViews) {
      const tabBtns = card.querySelectorAll('.card-tab-btn');
      const viewImgs = card.querySelectorAll('.card-img');

      tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = btn.getAttribute('data-view-target');
          tabBtns.forEach(b => b.classList.toggle('active', b === btn));
          viewImgs.forEach(img => {
            const viewIdx = img.getAttribute('data-view-idx');
            img.classList.toggle('active', viewIdx === target);
          });
        });
      });
    }

    fragment.appendChild(card);
  });

  workContainer.appendChild(fragment);

  // Bind Dynamic Category Filter events
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

  // FIXED: Butter-smooth scroll momentum shifts back to the top of Rollouts first before triggering collapse
  seeMoreBtn.addEventListener('click', () => {
    isSeeMoreExpanded = !isSeeMoreExpanded;
    
    if (!isSeeMoreExpanded) {
      // Scroll to top first to avoid snappy viewport drops
      workSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Slight delay ensures scroll momentum begins before collapse anim triggers
      setTimeout(() => {
        renderCatalog();
      }, 150);
    } else {
      renderCatalog();
    }
  });

  // FIXED: Master button toggles expansion parameters on all currently visible cards simultaneously
  if (revealAllBtn) {
    revealAllBtn.addEventListener('click', () => {
      const visibleCards = Array.from(workContainer.querySelectorAll('.work-card')).filter(isCardVisible);
      const hasCollapsedCard = visibleCards.some(card => !card.classList.contains('expanded'));

      visibleCards.forEach(card => {
        card.classList.toggle('expanded', hasCollapsedCard);
        
        // Return active view switcher tabs back to cover if collapsing
        if (!hasCollapsedCard) {
          const coverImg = card.querySelector('.card-img[data-view-idx="cover"]');
          const viewImgs = card.querySelectorAll('.card-img');
          const tabBtns = card.querySelectorAll('.card-tab-btn');

          if (coverImg) {
            viewImgs.forEach(img => img.classList.remove('active'));
            coverImg.classList.add('active');
          }
          tabBtns.forEach((btn, idx) => {
            btn.classList.toggle('active', idx === 0);
          });
        }
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
   ========================================================================= */
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
   ========================================================================= */
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
   PHASE 6: SECTION - OTHER (CAPABILITIES)
   ========================================================================= */
function initOther() {
  const container = document.getElementById('capabilities-tree');
  if (!container || !Array.isArray(capabilities)) return;

  container.innerHTML = ''; 
  const fragment = document.createDocumentFragment();

  capabilities.forEach(branch => {
    const branchDiv = document.createElement('div');
    branchDiv.className = 'tree-branch';

    let branchContent = `
      <div class="tree-branch-header">
        <span>${branch.branchTitle}</span>
        <span class="branch-toggle-icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
    `;

    if (Array.isArray(branch.nodes)) {
      branch.nodes.forEach(node => {
        let nodeContent = `
          <div class="tree-node">
            <div class="node-title">${node.title}</div>
            <div class="node-details">
              ${node.description ? `<span class="node-desc">${node.description}</span>` : ''}
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

        nodeContent += `
            </div>
          </div>
        `; 
        branchContent += nodeContent;
      });
    }

    branchDiv.innerHTML = branchContent;

    branchDiv.addEventListener('click', () => {
      const isExpanding = !branchDiv.classList.contains('expanded');
      branchDiv.classList.toggle('expanded');

      const detailsList = branchDiv.querySelectorAll('.node-details');
      detailsList.forEach(details => {
        if (isExpanding) {
          details.style.maxHeight = `${details.scrollHeight}px`;
        } else {
          details.style.maxHeight = '0px';
        }
      });
    });

    fragment.appendChild(branchDiv);
  });

  container.appendChild(fragment);
}