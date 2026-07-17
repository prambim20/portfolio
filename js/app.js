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
   GLOBAL LAYOUT AND STYLING SYSTEMS
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

  const visibleSections = new Map();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleSections.set(entry.target.id, entry.intersectionRatio);
      } else {
        visibleSections.delete(entry.target.id);
      }
    });

    let maxRatio = -1;
    let activeId = '';
    
    visibleSections.forEach((ratio, id) => {
      if (ratio > maxRatio) {
        maxRatio = ratio;
        activeId = id;
      }
    });

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
        const hash = href.includes('#') ? '#' + href.split('#')[1] : href;
        link.classList.toggle('active', hash === `#${activeId}`);
      });
    }
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  const resetToHero = () => {
    if (window.scrollY <= 50) {
      const theme = themes.hero;
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
  };

  window.addEventListener('scroll', resetToHero, { passive: true });
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
   SECTION - HERO NODES
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
   SECTION - STATIC CATALOG (WORK DISPLAY)
   ========================================================================= */
function initStaticShowcase() {
  const workSection = document.getElementById('work');
  const workContainer = document.getElementById('work-catalog');
  const revealAllBtn = document.getElementById('btn-reveal-all');

  if (!workContainer || !Array.isArray(services) || services.length === 0) return;

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

  const buildLegendHtml = (legend) => {
    if (!legend) return '';
    if (legend.type === 'continuous') {
      return `
        <div class="static-legend">
          <div class="static-legend-continuous">
            <div class="static-legend-bar" style="background: ${legend.gradient}"></div>
            <div class="static-legend-labels">
              <span>${legend.min}</span>
              <span>${legend.max}</span>
            </div>
          </div>
        </div>
      `;
    }
    if (legend.type === 'discrete' && Array.isArray(legend.items)) {
      return `
        <div class="static-legend">
          <div class="static-legend-discrete">
            ${legend.items.map(item => `
              <span class="static-legend-item">
                <span class="static-legend-dot" style="background-color: ${item.color}"></span>
                ${item.label}
              </span>
            `).join('')}
          </div>
        </div>
      `;
    }
    return '';
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
        card.classList.add('limit-hidden');
      }
    });

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      matchingCards.forEach(card => {
        card.classList.remove('limit-hidden');
        card.classList.remove('collapsing-anim');
        card.classList.remove('revealing-anim');
      });
      seeMoreContainer.style.display = 'none';
    } else {
      const hasMoreThanLimit = matchingCards.length > INITIAL_LIMIT;

      matchingCards.forEach((card, idx) => {
        if (idx < INITIAL_LIMIT) {
          card.classList.remove('limit-hidden');
          card.classList.remove('collapsing-anim');
          card.classList.remove('revealing-anim');
        } else {
          if (isSeeMoreExpanded) {
            card.classList.remove('limit-hidden');
            void card.offsetWidth;
            card.classList.add('revealing-anim');
            card.classList.remove('collapsing-anim');
          } else {
            if (!card.classList.contains('limit-hidden') && !card.classList.contains('collapsing-anim')) {
              card.classList.add('collapsing-anim');
              card.classList.remove('revealing-anim');
              
              setTimeout(() => {
                if (card.classList.contains('collapsing-anim')) {
                  card.classList.add('limit-hidden');
                }
              }, 400);
            }
          }
        }
      });

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

    if (hasViews) {
      imagesHtml = `
        <img src="${service.imageUrl}" alt="${service.imageAlt} - Cover" class="card-img active" data-view-idx="cover" loading="lazy" decoding="async" />
      `;
      imagesHtml += service.views.map((view, idx) => `
        <img src="${view.url}" onerror="this.onerror=null; this.src='${service.imageUrl}';" alt="${service.imageAlt} - ${view.label}" class="card-img" data-view-idx="${idx}" loading="lazy" decoding="async" />
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
      imagesHtml = `<img src="${service.imageUrl}" alt="${service.imageAlt}" class="card-img active" loading="lazy" decoding="async" />`;
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

    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-tab-btn')) return;

      const isCollapsing = card.classList.contains('expanded');
      
      workContainer.querySelectorAll('.work-card').forEach(c => {
        if (c !== card) {
          c.classList.remove('expanded');
        }
      });

      card.classList.toggle('expanded');
      updateRevealButtonText();

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
    
    if (!isSeeMoreExpanded) {
      workSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        renderCatalog();
      }, 150);
    } else {
      renderCatalog();
    }
  });

  if (revealAllBtn) {
    revealAllBtn.addEventListener('click', () => {
      const visibleCards = Array.from(workContainer.querySelectorAll('.work-card')).filter(isCardVisible);
      const hasCollapsedCard = visibleCards.some(card => !card.classList.contains('expanded'));

      visibleCards.forEach(card => {
        card.classList.toggle('expanded', hasCollapsedCard);
        
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

  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      renderCatalog();
    }
  }, { passive: true });

  renderCatalog();
}

/* ==========================================================================
   SECTION - INTERACTIVE SHOWCASE
   ========================================================================= */
function initInteractiveShowcase() {
  const listContainer = document.getElementById('showcase-selectors');
  const mapFrame = document.querySelector('.map-frame');

  if (!listContainer || !mapFrame || !Array.isArray(projects) || projects.length === 0) return;

  const fragment = document.createDocumentFragment();
  projects.forEach((proj, index) => {
    const selectorCard = document.createElement('div');
    selectorCard.className = `showcase-selector ${index === 0 ? 'active' : ''}`;
    selectorCard.setAttribute('data-project', proj.id);
    selectorCard.setAttribute('role', 'tab');
    selectorCard.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

    const badgesList = Array.isArray(proj.badges) ? proj.badges : (proj.badge ? [proj.badge] : []);

    selectorCard.innerHTML = `
      <div class="selector-header">
        <h3>${proj.title}</h3>
        <div class="badge-container">
          ${badgesList.map(b => `<span class="badge">${b}</span>`).join('')}
        </div>
      </div>
      <p>${proj.description}</p>
    `;

    fragment.appendChild(selectorCard);
  });
  listContainer.appendChild(fragment);

  let mapEngine = null;
  const initMapEngineAndLayers = () => {
    mapEngine = new MapEngine('map', projects[0].coords, projects[0].zoom);
    
    const selectors = listContainer.querySelectorAll('.showcase-selector');
    selectors.forEach((selectorCard, index) => {
      selectorCard.addEventListener('click', () => {
        listContainer.querySelectorAll('.showcase-selector').forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-selected', 'false');
        });
        selectorCard.classList.add('active');
        selectorCard.setAttribute('aria-selected', 'true');
        mapEngine.renderProjectLayer(projects[index]);
      });
    });

    mapEngine.renderProjectLayer(projects[0]);
  };

  const showcaseObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initMapEngineAndLayers();
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px 0px' });

  showcaseObserver.observe(mapFrame);
}

/* ==========================================================================
   SECTION - SCIENTIFIC PUBLICATIONS
   ========================================================================= */
function initPublications() {
  const gridContainer = document.getElementById('publications-grid');
  const modalEl = document.getElementById('pub-reader-modal');
  const modalBody = document.getElementById('pub-modal-body-content');
  const closeBtn = document.getElementById('pub-modal-close-btn');
  const closeBackdrop = document.getElementById('pub-modal-close-backdrop');

  if (!gridContainer || !modalEl || !modalBody || !Array.isArray(publications)) return;

  gridContainer.innerHTML = '';
  const fragment = document.createDocumentFragment();

  publications.forEach((pub) => {
    const [numStr, typeStr] = pub.num.split('/').map(s => s.trim());
    const journalMatch = pub.publisher.match(/\[(.*?)\]/);
    const journalTag = journalMatch ? journalMatch[1] : 'PUBLICATION';

    const card = document.createElement('div');
    card.className = 'pub-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    card.innerHTML = `
      <div class="pub-card-header">
        <span class="pub-card-num">${numStr}</span>
        <span class="pub-card-journal">${journalTag}</span>
      </div>
      <h3>${pub.title}</h3>
      <p class="pub-card-desc">${pub.shortDesc || pub.description}</p>
      <div class="pub-card-footer">
        <span>${typeStr || 'PUBLICATION'}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    `;

    card.addEventListener('click', () => openReader(pub));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openReader(pub);
      }
    });

    fragment.appendChild(card);
  });

  gridContainer.appendChild(fragment);

  const openReader = (pub) => {
    const [_, typeStr] = pub.num.split('/').map(s => s.trim());
    const journalMatch = pub.publisher.match(/\[(.*?)\]/);
    const journalTag = journalMatch ? journalMatch[1] : 'PUBLICATION';
    const cleanPublisher = pub.publisher.replace(/\[.*?\]/, '').trim();

    const imgs = Array.isArray(pub.images) && pub.images.length > 0
      ? pub.images 
      : (pub.imageUrl ? [{ url: pub.imageUrl, label: "Analytical Figure", alt: pub.imageAlt }] : []);

    const buildMicroLegendHtml = (legend) => {
      if (!legend) return '';
      if (legend.type === 'discrete' && Array.isArray(legend.items)) {
        return `
          <div class="micro-legend-discrete">
            ${legend.items.map(item => `
              <span class="micro-legend-item">
                <span class="micro-legend-dot" style="background-color: ${item.color};"></span>
                ${item.label}
              </span>
            `).join('')}
          </div>
        `;
      }
      if (legend.type === 'continuous') {
        return `
          <div class="micro-legend-continuous">
            <span class="micro-label">${legend.min}</span>
            <div class="micro-legend-bar" style="background: ${legend.gradient}"></div>
            <span class="micro-label">${legend.max}</span>
          </div>
        `;
      }
      return '';
    };

    let visualViewportHtml = '';
    if (imgs.length > 0) {
      let tabsHtml = '';
      if (imgs.length > 1) {
        tabsHtml = `
          <div class="console-tabs">
            ${imgs.map((img, idx) => `
              <button class="console-tab-btn ${idx === 0 ? 'active' : ''}" data-view-idx="${idx}">
                ${img.label || `Figure ${idx + 1}`}
              </button>
            `).join('')}
          </div>
        `;
      }

      visualViewportHtml = `
        <div class="console-body-sub-section">
          <div class="console-section-title font-mono">Analytical Visuals</div>
          ${tabsHtml}
          <div class="console-img-viewport">
            ${imgs.map((img, idx) => `
              <img src="${img.url}" class="console-img ${idx === 0 ? 'active' : ''}" data-view-idx="${idx}" onerror="this.style.display='none';" alt="${img.alt || pub.title}" />
            `).join('')}
            ${imgs.map((img, idx) => `
              <div class="console-img-caption-banner ${idx === 0 ? 'active' : ''}" data-view-idx="${idx}">
                <span class="caption-text">${img.caption || img.label}</span>
                ${img.legend ? buildMicroLegendHtml(img.legend) : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    const highlightsHtml = Array.isArray(pub.highlights) 
      ? `
        <div class="console-body-sub-section">
          <div class="console-section-title font-mono">Key Highlights</div>
          <ul class="console-highlights-list">
            ${pub.highlights.map(pt => `<li>${pt}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    modalBody.innerHTML = `
      <div class="console-header">
        <div class="console-meta-row">
          <span class="console-badge font-mono">${typeStr || 'PUBLICATION'}</span>
          <span class="console-badge console-badge-accent font-mono">${journalTag}</span>
        </div>
        <h3 class="console-pub-title">${pub.title}</h3>
        <div class="console-publisher-info">${cleanPublisher}</div>
      </div>

      <div class="console-divider"></div>

      <div class="console-body-grid">
        <div class="console-body-section">
          <div class="console-section-title font-mono">Abstract & Summary</div>
          <p class="console-abstract-text">${pub.description}</p>
          
          <div class="console-gateway-action">
            <a href="${pub.linkUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="border-color: var(--glow-color); margin-top: 1rem; width: 100%; justify-content: center;">
              ${pub.linkText || 'Read Paper'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
          </div>
        </div>

        <div class="console-body-section">
          ${visualViewportHtml}
          ${highlightsHtml}
        </div>
      </div>
    `;

    if (imgs.length > 1) {
      const tabBtns = modalBody.querySelectorAll('.console-tab-btn');
      const viewImgs = modalBody.querySelectorAll('.console-img');
      const viewBanners = modalBody.querySelectorAll('.console-img-caption-banner');

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetIdx = btn.getAttribute('data-view-idx');
          tabBtns.forEach(b => b.classList.toggle('active', b === btn));
          viewImgs.forEach(img => {
            const imgIdx = img.getAttribute('data-view-idx');
            img.classList.toggle('active', imgIdx === targetIdx);
          });
          viewBanners.forEach(banner => {
            const bannerIdx = banner.getAttribute('data-view-idx');
            banner.classList.toggle('active', bannerIdx === targetIdx);
          });
        });
      });
    }

    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeReader = () => {
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      modalBody.innerHTML = '';
    }, 400);
  };

  closeBtn.addEventListener('click', closeReader);
  closeBackdrop.addEventListener('click', closeReader);
  
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl.classList.contains('active')) {
      closeReader();
    }
  });
}

/* ==========================================================================
   SECTION - OTHER (CAPABILITIES)
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
        details.style.maxHeight = isExpanding ? `${details.scrollHeight}px` : '0px';
      });
    });

    fragment.appendChild(branchDiv);
  });

  container.appendChild(fragment);
}