/**
 * allocations — Clockwise Box Choreography, Fan-Out Transition & 16-Chart Zero-Whitespace Canvas
 */

// ============================================================================
// State & Choreography Phases
// ============================================================================

const state = {
  // 'TYPING_CATEGORY' | 'ANIMATING_CATEGORY' | 'TYPING_PERCENT' | 'ANIMATING_PERCENT' | 'TILED_VIEW'
  phase: 'TYPING_CATEGORY',
  currentCategory: '',
  currentColor: '#111113',
  usedHues: [],
  allocations: [], // [{ name, weight, rawInput, color }]
  tilePalettes: {} // chartId -> array of unique random colors
};

const el = {};

function initElements() {
  el.topHeader = document.getElementById('topHeader');
  el.btnBrandLogo = document.getElementById('btnBrandLogo');
  el.btnShareIcon = document.getElementById('btnShareIcon');
  el.btnResetIcon = document.getElementById('btnResetIcon');

  el.inputStage = document.getElementById('inputStage');
  el.completedPairsBar = document.getElementById('completedPairsBar');
  el.choreographyRow = document.getElementById('choreographyRow');

  el.categoryEntity = document.getElementById('categoryEntity');
  el.categoryEntityText = document.getElementById('categoryEntityText');
  el.categoryBoxSvg = document.getElementById('categoryBoxSvg');
  el.categoryBoxPath = document.getElementById('categoryBoxPath');

  el.percentEntity = document.getElementById('percentEntity');
  el.percentEntityText = document.getElementById('percentEntityText');
  el.percentBoxSvg = document.getElementById('percentBoxSvg');
  el.percentBoxPath = document.getElementById('percentBoxPath');

  el.typingLine = document.getElementById('typingLine');
  el.typedContent = document.getElementById('typedContent');
  el.promptPlaceholder = document.getElementById('promptPlaceholder');
  el.blinkingCursor = document.getElementById('blinkingCursor');
  el.hiddenInput = document.getElementById('hiddenInput');

  el.tilesStage = document.getElementById('tilesStage');
  el.tilesGrid = document.getElementById('tilesGrid');
  el.toast = document.getElementById('toast');
}

// ============================================================================
// Perceptually Uniform OKLCH Editorial Color Harmony Engine
// ============================================================================

/**
 * Converts OKLCH (Perceptual Lightness L [0..1], Chroma C [0..0.3], Hue H [0..360])
 * to a sRGB hex color (#rrggbb) with smooth gamut clamping.
 */
function oklchToHex(L, C, H) {
  const hRad = (((H % 360) + 360) % 360) * (Math.PI / 180);
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const toGamma = (c) => {
    const cl = Math.max(0, Math.min(1, c));
    return cl <= 0.0031308 ? 12.92 * cl : 1.055 * Math.pow(cl, 1 / 2.4) - 0.055;
  };

  return '#' + [r, g, bl]
    .map(v => Math.round(toGamma(v) * 255).toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates a unique, random, yet refined mineral-pigment color for input category boxes.
 * Uses a golden-angle walk in OKLCH with restrained chroma so all entered boxes
 * share the same editorial weight and never clash.
 */
function generateUniqueRandomColor(hueList) {
  if (hueList.length === 0) {
    hueList.push(Math.floor(Math.random() * 360));
  } else {
    const lastHue = hueList[hueList.length - 1];
    // Golden-angle step + subtle organic variance
    const nextHue = (lastHue + 137.5 + (Math.random() * 16 - 8)) % 360;
    hueList.push(nextHue);
  }

  const h = hueList[hueList.length - 1];
  const L = 0.45 + (Math.random() * 0.07 - 0.035); // Balanced ink-pigment lightness
  const C = 0.078 + Math.random() * 0.024;         // Muted architectural chroma
  return oklchToHex(L, C, h);
}

/**
 * Generates an elegant, cohesive, unique random color scheme for a single chart tile.
 * Each tile gets its own distinct anchor hue and harmonic relationship
 * (Tonal Architectural, Analogous Drift, Split-Complement Duotone, or Muted Mineral Chord),
 * stepping cleanly in perceptual lightness so slices complement each other effortlessly.
 */
function generateTileColorScheme(count, globalTileUsedBaseHues) {
  const n = Math.max(count, 1);

  // Pick a unique base hue for this tile via golden-angle separation from previous tiles
  let baseHue;
  if (globalTileUsedBaseHues.length === 0) {
    baseHue = Math.floor(Math.random() * 360);
  } else {
    const seed = globalTileUsedBaseHues[0];
    const idx = globalTileUsedBaseHues.length;
    baseHue = (seed + idx * 137.508 + (Math.random() * 12 - 6) + 360) % 360;
  }
  globalTileUsedBaseHues.push(baseHue);

  // Choose an editorial harmony archetype for this tile
  const harmonyType = globalTileUsedBaseHues.length % 4;
  const direction = Math.random() < 0.5 ? 1 : -1;
  const colors = [];

  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1); // Normalized position [0..1]

    // Smooth perceptual lightness ramp from deep shade (0.33) to soft mineral tint (0.76)
    const L = 0.33 + t * 0.43;

    let H = baseHue;
    let C = 0.08;

    if (harmonyType === 0) {
      // 1. Analogous Editorial Drift: subtle 22°–30° hue glide across the lightness scale
      const totalArc = Math.min(72, n * 22);
      H = (baseHue + direction * (t - 0.5) * totalArc + 360) % 360;
      C = 0.072 + Math.sin(t * Math.PI) * 0.028;
    } else if (harmonyType === 1) {
      // 2. Tonal Architectural Monolith: single pigment family with warm/cool undertone shift
      H = (baseHue + direction * (t - 0.5) * 18 + 360) % 360;
      C = 0.062 + Math.sin(t * Math.PI) * 0.032;
    } else if (harmonyType === 2) {
      // 3. Split-Complement Counterpoint: serene anchor family paired with a muted warm/cool counterpart
      const isAccent = i >= Math.ceil(n * 0.6);
      H = isAccent
        ? (baseHue + direction * 155 + (t * 14) + 360) % 360
        : (baseHue + direction * (t * 20) + 360) % 360;
      C = isAccent ? 0.078 : 0.056 + (1 - t) * 0.022;
    } else {
      // 4. Muted Mineral Chord: soft 42° harmonic steps with low earth/stone chroma
      H = (baseHue + direction * i * 38 + 360) % 360;
      C = 0.065 + (1 - Math.abs(t - 0.5) * 1.4) * 0.024;
    }

    colors.push(oklchToHex(L, C, H));
  }

  return colors;
}

// ============================================================================
// Math & Fraction Parsing
// ============================================================================

function getTotalAllocated() {
  return state.allocations.reduce((sum, item) => sum + item.weight, 0);
}

function getRemaining() {
  return Math.max(0, 100 - getTotalAllocated());
}

function formatPct(val) {
  const rounded = Math.round(val * 100) / 100;
  if (Math.abs(rounded - Math.round(rounded)) < 0.005) {
    return `${Math.round(rounded)}%`;
  }
  return `${rounded.toFixed(2).replace(/\.?0+$/, '')}%`;
}

function parseAllocationValue(rawStr, remaining) {
  const clean = rawStr.trim().replace(/%/g, '');
  if (!clean) return null;

  const fracMatch = clean.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (den <= 0 || num <= 0) return null;
    const val = (num / den) * 100;
    if (Math.abs(val - remaining) < 0.08) {
      return remaining;
    }
    return val;
  }

  const num = parseFloat(clean);
  if (isNaN(num) || num <= 0) return null;
  if (Math.abs(num - remaining) < 0.05) {
    return remaining;
  }
  return num;
}

function showToast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  setTimeout(() => el.toast.classList.remove('show'), 2200);
}

function triggerErrorShake() {
  el.choreographyRow.classList.remove('shake-error');
  void el.choreographyRow.offsetWidth;
  el.choreographyRow.classList.add('shake-error');
}

// ============================================================================
// Clockwise SVG Box Drawing Engine
// ============================================================================

function animateClockwiseBox(entityEl, pathEl, targetColor, drawDuration = 400, colorDuration = 260) {
  return new Promise(resolve => {
    const w = entityEl.offsetWidth;
    const h = entityEl.offsetHeight;
    const perimeter = 2 * (w + h);

    // Clockwise path starting at top-left (0,0) -> (w,0) -> (w,h) -> (0,h) -> (0,0)
    pathEl.setAttribute('d', `M 0,0 L ${w},0 L ${w},${h} L 0,${h} Z`);
    pathEl.style.transition = 'none';
    pathEl.style.stroke = '#111113';
    pathEl.style.strokeDasharray = `${perimeter}`;
    pathEl.style.strokeDashoffset = `${perimeter}`;

    void pathEl.getBoundingClientRect();

    pathEl.style.transition = `stroke-dashoffset ${drawDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    pathEl.style.strokeDashoffset = '0';

    setTimeout(() => {
      pathEl.style.transition = `stroke ${colorDuration}ms ease`;
      pathEl.style.stroke = targetColor;

      setTimeout(() => {
        resolve();
      }, colorDuration);
    }, drawDuration);
  });
}

// ============================================================================
// Input Choreography Controller
// ============================================================================

function resetForNextCategory() {
  state.phase = 'TYPING_CATEGORY';
  state.currentCategory = '';
  state.currentColor = '#111113';

  el.categoryEntity.style.display = 'none';
  el.categoryEntity.classList.remove('slid-left');
  el.percentEntity.style.display = 'none';
  el.percentEntity.classList.remove('joined');

  el.typingLine.style.display = 'inline-flex';
  el.typedContent.textContent = '';
  el.promptPlaceholder.textContent = '';
  el.blinkingCursor.style.display = 'inline-block';

  el.hiddenInput.value = '';
  el.hiddenInput.focus();
}

function renderCompletedPairs() {
  el.completedPairsBar.innerHTML = state.allocations.map(item => `
    <div class="completed-pair" style="--pair-color: ${item.color};">
      <span class="pair-cell">${escapeHtml(item.name)}</span>
      <span class="pair-cell pair-cell-pct">${formatPct(item.weight)}</span>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function handleKeydown(e) {
  if (state.phase === 'ANIMATING_CATEGORY' || state.phase === 'ANIMATING_PERCENT' || state.phase === 'TILED_VIEW') {
    return;
  }

  if (state.phase === 'TYPING_PERCENT') {
    const isControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'].includes(e.key);
    const isNumericOrFrac = /^[0-9./%]$/.test(e.key);
    if (!isControl && !isNumericOrFrac && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      triggerErrorShake();
      return;
    }
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    handleEnterCommit();
  }
}

function handleInput() {
  if (state.phase === 'TYPING_CATEGORY') {
    el.typedContent.textContent = el.hiddenInput.value;
    el.promptPlaceholder.textContent = '';
  } else if (state.phase === 'TYPING_PERCENT') {
    const sanitized = el.hiddenInput.value.replace(/[^0-9./%]/g, '');
    if (sanitized !== el.hiddenInput.value) {
      el.hiddenInput.value = sanitized;
    }
    const clean = sanitized.replace(/%/g, '');
    if (clean.length === 0) {
      el.typedContent.textContent = '';
      el.promptPlaceholder.textContent = '?%';
    } else {
      el.typedContent.textContent = clean;
      el.promptPlaceholder.textContent = '%';
    }
  }
}

async function handleEnterCommit() {
  const raw = el.hiddenInput.value.trim();

  if (state.phase === 'TYPING_CATEGORY') {
    if (!raw) return;

    state.phase = 'ANIMATING_CATEGORY';
    state.currentCategory = raw;
    state.currentColor = generateUniqueRandomColor(state.usedHues);

    el.typingLine.style.display = 'none';
    el.categoryEntityText.textContent = raw;
    el.categoryEntity.style.display = 'inline-flex';

    await animateClockwiseBox(el.categoryEntity, el.categoryBoxPath, state.currentColor, 400, 260);

    el.categoryEntity.classList.add('slid-left');

    setTimeout(() => {
      state.phase = 'TYPING_PERCENT';
      el.hiddenInput.value = '';
      el.typedContent.textContent = '';
      el.promptPlaceholder.textContent = '?%';
      el.typingLine.style.display = 'inline-flex';
      el.hiddenInput.focus();
    }, 180);

  } else if (state.phase === 'TYPING_PERCENT') {
    const remaining = getRemaining();
    const parsedWeight = parseAllocationValue(raw, remaining);

    if (parsedWeight === null || parsedWeight <= 0) {
      triggerErrorShake();
      return;
    }

    if (parsedWeight > remaining + 0.01) {
      triggerErrorShake();
      return;
    }

    const finalWeight = Math.min(remaining, parsedWeight);
    const displayStr = formatPct(finalWeight);

    state.phase = 'ANIMATING_PERCENT';
    el.typingLine.style.display = 'none';
    el.percentEntityText.textContent = displayStr;
    el.percentEntity.style.display = 'inline-flex';

    await animateClockwiseBox(el.percentEntity, el.percentBoxPath, state.currentColor, 360, 240);

    el.percentEntity.classList.add('joined');

    setTimeout(() => {
      state.allocations.push({
        name: state.currentCategory,
        weight: finalWeight,
        rawInput: raw,
        color: state.currentColor
      });

      updateUrlState();

      const newRemaining = getRemaining();
      if (newRemaining <= 0.02) {
        const sum = getTotalAllocated();
        if (Math.abs(100 - sum) > 0 && state.allocations.length > 0) {
          state.allocations[state.allocations.length - 1].weight += (100 - sum);
        }
        transitionToTiledCharts(true);
      } else {
        renderCompletedPairs();
        resetForNextCategory();
      }
    }, 340);
  }
}

// ============================================================================
// Tiled Multi-Chart Screen & Smooth Fan-Out Transition
// ============================================================================

const CHART_TYPES = [
  { id: 'donut', title: 'donut chart', tag: 'ring sector' },
  { id: 'pie', title: 'pie chart', tag: 'circular sector' },
  { id: 'half-donut', title: 'semi-circle arc', tag: '180° gauge' },
  { id: 'radial-bars', title: 'concentric radial tracks', tag: 'orbital arcs' },
  { id: 'polar-area', title: 'nightingale rose', tag: 'polar area' },
  { id: 'waffle', title: 'waffle matrix', tag: '10×10 grid' },
  { id: 'treemap', title: 'squarified treemap', tag: 'nested area' },
  { id: 'marimekko', title: 'marimekko strip', tag: '100% horizontal' },
  { id: 'stacked-column', title: 'stacked pillar & bars', tag: 'vertical stack' },
  { id: 'bubble-pack', title: 'circle pack', tag: 'area circles' },
  { id: 'parliament', title: 'hemicycle parliament', tag: '100 seats' },
  { id: 'pyramid', title: 'proportional pyramid', tag: 'tiered triangle' },
  { id: 'radar', title: 'radar polygon', tag: 'multi-axis web' },
  { id: 'lollipop', title: 'lollipop stem rank', tag: 'linear stem' },
  { id: 'bullseye', title: 'concentric bullseye', tag: 'nested disks' },
  { id: 'mosaic-slices', title: 'diagonal slice matrix', tag: 'oblique bands' }
];

function transitionToTiledCharts(withFanOut = true) {
  state.phase = 'TILED_VIEW';
  generateAllTilePalettes();

  const launchGrid = () => {
    el.inputStage.style.display = 'none';
    el.inputStage.classList.remove('converging');
    el.topHeader.style.display = 'flex';
    el.tilesStage.style.display = 'block';

    renderAllTiles(withFanOut);
  };

  if (withFanOut && el.inputStage.style.display !== 'none') {
    el.inputStage.classList.add('converging');
    setTimeout(launchGrid, 220);
  } else {
    launchGrid();
  }
}

function generateAllTilePalettes() {
  const globalBaseHues = [];
  CHART_TYPES.forEach(chart => {
    state.tilePalettes[chart.id] = generateTileColorScheme(state.allocations.length, globalBaseHues);
  });
}

function renderAllTiles(animateFanOut = false) {
  el.tilesGrid.innerHTML = CHART_TYPES.map(chart => {
    const palette = state.tilePalettes[chart.id];
    const legendHtml = state.allocations.map((item, idx) => {
      const color = palette[idx % palette.length];
      return `
        <div class="tile-legend-item" data-chart="${chart.id}" data-index="${idx}" title="Click to edit ${escapeHtml(item.name)}">
          <span class="legend-swatch" style="background-color: ${color};"></span>
          <span class="legend-name">${escapeHtml(item.name)}</span>
          <span class="legend-pct">${formatPct(item.weight)}</span>
        </div>
      `;
    }).join('');

    return `
      <article class="chart-tile" data-chart-id="${chart.id}">
        <div class="tile-header">
          <span class="tile-title">${chart.title}</span>
          <span class="tile-type-tag">${chart.tag}</span>
        </div>
        <div class="tile-canvas-wrap">
          <canvas class="tile-canvas" id="canvas_${chart.id}"></canvas>
        </div>
        <div class="tile-legend">
          ${legendHtml}
        </div>
      </article>
    `;
  }).join('');

  // Draw all 16 canvases synchronously at full layout dimensions before applying transforms
  drawAllChartCanvases();

  if (animateFanOut) {
    const tiles = Array.from(el.tilesGrid.querySelectorAll('.chart-tile'));
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight / 2;
    const total = tiles.length;

    // Position all tiles stacked in a fanned deck at the center of the screen
    tiles.forEach((tile, i) => {
      const rect = tile.getBoundingClientRect();
      const tileCenterX = rect.left + rect.width / 2;
      const tileCenterY = rect.top + rect.height / 2;
      const dx = originX - tileCenterX;
      const dy = originY - tileCenterY;
      const fanAngle = (i - (total - 1) / 2) * 4.2;

      tile.style.transition = 'none';
      tile.style.zIndex = `${30 + i}`;
      tile.style.opacity = '0';
      tile.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${fanAngle}deg) scale(0.22)`;
    });

    // Force layout flush
    void el.tilesGrid.offsetHeight;

    // Fan out across the screen into their equal-size zero-whitespace grid cells
    requestAnimationFrame(() => {
      tiles.forEach((tile, i) => {
        const delay = i * 24;
        tile.style.transition = `transform 780ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity 280ms ease ${delay}ms`;
        tile.style.opacity = '1';
        tile.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
      });

      setTimeout(() => {
        tiles.forEach(tile => {
          tile.style.transition = '';
          tile.style.zIndex = '';
          tile.style.transform = '';
          tile.style.opacity = '';
        });
      }, 1250);
    });
  }

  // Bind click-to-edit on any legend item
  el.tilesGrid.querySelectorAll('.tile-legend-item').forEach(itemEl => {
    itemEl.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      const idx = parseInt(itemEl.dataset.index, 10);
      openLegendInlineEdit(itemEl, idx);
    });
  });
}

function openLegendInlineEdit(itemEl, index) {
  const alloc = state.allocations[index];
  const pctSpan = itemEl.querySelector('.legend-pct');
  if (!pctSpan) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'legend-inline-input';
  input.value = Math.round(alloc.weight * 100) / 100;
  pctSpan.replaceWith(input);
  input.focus();
  input.select();

  const commit = () => {
    const parsed = parseAllocationValue(input.value, 100);
    if (parsed !== null && parsed > 0 && parsed <= 100) {
      alloc.weight = parsed;
      const others = state.allocations.filter((_, i) => i !== index);
      const othersSum = others.reduce((s, a) => s + a.weight, 0);
      const targetOthersSum = Math.max(0, 100 - parsed);

      if (others.length > 0) {
        if (othersSum > 0) {
          others.forEach(o => {
            o.weight = (o.weight / othersSum) * targetOthersSum;
          });
        } else {
          others.forEach(o => {
            o.weight = targetOthersSum / others.length;
          });
        }
      } else {
        alloc.weight = 100;
      }
      updateUrlState();
    }
    renderAllTiles(false);
  };

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      commit();
    } else if (ev.key === 'Escape') {
      renderAllTiles(false);
    }
  });

  input.addEventListener('blur', commit);
}

// ============================================================================
// High-DPI Canvas Renderers for All 16 Chart Types
// ============================================================================

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  // Use layout-invariant offsetWidth/offsetHeight so transforms never distort resolution
  const w = canvas.offsetWidth || canvas.parentElement.offsetWidth || 280;
  const h = canvas.offsetHeight || canvas.parentElement.offsetHeight || 140;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

function drawAllChartCanvases() {
  if (state.phase !== 'TILED_VIEW') return;

  CHART_TYPES.forEach(chart => {
    const canvas = document.getElementById(`canvas_${chart.id}`);
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const palette = state.tilePalettes[chart.id];
    const items = state.allocations;

    switch (chart.id) {
      case 'donut':
        drawDonut(ctx, w, h, items, palette);
        break;
      case 'pie':
        drawPie(ctx, w, h, items, palette);
        break;
      case 'half-donut':
        drawHalfDonut(ctx, w, h, items, palette);
        break;
      case 'radial-bars':
        drawRadialBars(ctx, w, h, items, palette);
        break;
      case 'polar-area':
        drawPolarArea(ctx, w, h, items, palette);
        break;
      case 'waffle':
        drawWaffle(ctx, w, h, items, palette);
        break;
      case 'treemap':
        drawTreemap(ctx, w, h, items, palette);
        break;
      case 'marimekko':
        drawMarimekko(ctx, w, h, items, palette);
        break;
      case 'stacked-column':
        drawStackedColumn(ctx, w, h, items, palette);
        break;
      case 'bubble-pack':
        drawBubblePack(ctx, w, h, items, palette);
        break;
      case 'parliament':
        drawParliament(ctx, w, h, items, palette);
        break;
      case 'pyramid':
        drawPyramid(ctx, w, h, items, palette);
        break;
      case 'radar':
        drawRadar(ctx, w, h, items, palette);
        break;
      case 'lollipop':
        drawLollipop(ctx, w, h, items, palette);
        break;
      case 'bullseye':
        drawBullseye(ctx, w, h, items, palette);
        break;
      case 'mosaic-slices':
        drawMosaicSlices(ctx, w, h, items, palette);
        break;
    }
  });
}

// 1. Donut Chart
function drawDonut(ctx, w, h, items, palette) {
  const cx = w / 2, cy = h / 2;
  const rOut = Math.min(cx, cy) * 0.88;
  const rIn = rOut * 0.58;
  let angle = -Math.PI / 2;

  items.forEach((item, i) => {
    const sweep = (item.weight / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, rOut, angle, angle + sweep);
    ctx.arc(cx, cy, rIn, angle + sweep, angle, true);
    ctx.closePath();
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ECECED';
    ctx.stroke();
    angle += sweep;
  });
}

// 2. Pie Chart
function drawPie(ctx, w, h, items, palette) {
  const cx = w / 2, cy = h / 2;
  const r = Math.min(cx, cy) * 0.88;
  let angle = -Math.PI / 2;

  items.forEach((item, i) => {
    const sweep = (item.weight / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ECECED';
    ctx.stroke();
    angle += sweep;
  });
}

// 3. Semi-Circle Gauge (180° Half-Donut)
function drawHalfDonut(ctx, w, h, items, palette) {
  const cx = w / 2, cy = h * 0.82;
  const rOut = Math.min(w * 0.42, h * 0.74);
  const rIn = rOut * 0.56;
  let angle = Math.PI;

  items.forEach((item, i) => {
    const sweep = (item.weight / 100) * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, rOut, angle, angle + sweep);
    ctx.arc(cx, cy, rIn, angle + sweep, angle, true);
    ctx.closePath();
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ECECED';
    ctx.stroke();
    angle += sweep;
  });
}

// 4. Concentric Radial Tracks
function drawRadialBars(ctx, w, h, items, palette) {
  const cx = w / 2, cy = h / 2;
  const maxR = Math.min(cx, cy) * 0.9;
  const minR = maxR * 0.24;
  const n = items.length;
  const bandStep = (maxR - minR) / Math.max(n, 1);
  const thickness = Math.max(3, bandStep * 0.72);

  items.forEach((item, i) => {
    const r = maxR - i * bandStep - thickness / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = 'rgba(0,0,0,0.07)';
    ctx.stroke();

    const sweep = (item.weight / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + sweep);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = palette[i % palette.length];
    ctx.stroke();
  });
}

// 5. Nightingale Rose / Polar Area Chart
function drawPolarArea(ctx, w, h, items, palette) {
  const cx = w / 2, cy = h / 2;
  const maxR = Math.min(cx, cy) * 0.9;
  const n = items.length;
  const maxWeight = Math.max(...items.map(a => a.weight), 1);
  const sectorAngle = (Math.PI * 2) / n;

  [0.33, 0.66, 1].forEach(frac => {
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * frac, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  items.forEach((item, i) => {
    const start = -Math.PI / 2 + i * sectorAngle;
    const end = start + sectorAngle;
    const r = Math.max(maxR * 0.15, Math.sqrt(item.weight / maxWeight) * maxR);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ECECED';
    ctx.stroke();
  });
}

// 6. Waffle Chart (10x10 Grid of 100 cells)
function drawWaffle(ctx, w, h, items, palette) {
  const size = Math.min(w, h) * 0.88;
  const startX = (w - size) / 2;
  const startY = (h - size) / 2;
  const cellGap = Math.max(1.5, size * 0.02);
  const cellSize = (size - cellGap * 9) / 10;

  const cells = [];
  items.forEach((item, i) => {
    const count = Math.round(item.weight);
    for (let c = 0; c < count && cells.length < 100; c++) {
      cells.push(palette[i % palette.length]);
    }
  });
  while (cells.length < 100) {
    cells.push(palette[(items.length - 1) % palette.length]);
  }

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const idx = (9 - row) * 10 + col;
      const x = startX + col * (cellSize + cellGap);
      const y = startY + row * (cellSize + cellGap);
      ctx.fillStyle = cells[idx];
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }
}

// 7. Squarified Treemap
function drawTreemap(ctx, w, h, items, palette) {
  const pad = 6;
  const sorted = items.map((item, i) => ({ ...item, color: palette[i % palette.length] }))
    .sort((a, b) => b.weight - a.weight);

  function partition(list, x, y, width, height) {
    if (list.length === 0) return;
    if (list.length === 1) {
      ctx.fillStyle = list[0].color;
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#ECECED';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      return;
    }

    const total = list.reduce((s, a) => s + a.weight, 0);
    let half = 0;
    let splitIdx = 0;
    for (let i = 0; i < list.length; i++) {
      half += list[i].weight;
      splitIdx = i + 1;
      if (half >= total / 2 && splitIdx < list.length) break;
    }
    if (splitIdx >= list.length) splitIdx = list.length - 1;

    const left = list.slice(0, splitIdx);
    const right = list.slice(splitIdx);
    const leftSum = left.reduce((s, a) => s + a.weight, 0);
    const ratio = total > 0 ? leftSum / total : 0.5;

    if (width >= height) {
      const wLeft = width * ratio;
      partition(left, x, y, wLeft, height);
      partition(right, x + wLeft, y, width - wLeft, height);
    } else {
      const hTop = height * ratio;
      partition(left, x, y, width, hTop);
      partition(right, x, y + hTop, width, height - hTop);
    }
  }

  partition(sorted, pad, pad, w - pad * 2, h - pad * 2);
}

// 8. Marimekko / 100% Stacked Horizontal Bar
function drawMarimekko(ctx, w, h, items, palette) {
  const padX = 10;
  const totalW = w - padX * 2;
  const barY = h * 0.22;
  const barH = h * 0.56;
  let curX = padX;

  items.forEach((item, i) => {
    const segW = (item.weight / 100) * totalW;
    ctx.fillStyle = palette[i % palette.length];
    ctx.fillRect(curX, barY, segW, barH);
    ctx.strokeStyle = '#ECECED';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(curX, barY, segW, barH);
    curX += segW;
  });
}

// 9. 100% Stacked Column + Side-by-Side Ranked Columns
function drawStackedColumn(ctx, w, h, items, palette) {
  const padY = 8;
  const availH = h - padY * 2;

  const pillarX = 16;
  const pillarW = Math.min(44, w * 0.2);
  let curY = padY;
  items.forEach((item, i) => {
    const segH = (item.weight / 100) * availH;
    ctx.fillStyle = palette[i % palette.length];
    ctx.fillRect(pillarX, curY, pillarW, segH);
    ctx.strokeStyle = '#ECECED';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pillarX, curY, pillarW, segH);
    curY += segH;
  });

  const startX = pillarX + pillarW + 18;
  const rightW = w - startX - 14;
  const maxW = Math.max(...items.map(a => a.weight), 1);
  const colGap = 6;
  const colW = Math.min(32, (rightW - colGap * (items.length - 1)) / Math.max(items.length, 1));

  items.forEach((item, i) => {
    const colH = (item.weight / maxW) * availH;
    const x = startX + i * (colW + colGap);
    const y = padY + availH - colH;
    ctx.fillStyle = palette[i % palette.length];
    ctx.fillRect(x, y, colW, colH);
  });
}

// 10. Area-Proportional Circle Packing
function drawBubblePack(ctx, w, h, items, palette) {
  const cx = w / 2, cy = h / 2;
  const maxRadius = Math.min(w, h) * 0.36;
  const circles = items.map((item, i) => ({
    r: Math.max(6, Math.sqrt(item.weight / 100) * maxRadius * 1.12),
    color: palette[i % palette.length],
    x: cx + Math.cos((i / items.length) * Math.PI * 2) * 16,
    y: cy + Math.sin((i / items.length) * Math.PI * 2) * 16
  }));

  for (let iter = 0; iter < 110; iter++) {
    for (let i = 0; i < circles.length; i++) {
      circles[i].x += (cx - circles[i].x) * 0.05;
      circles[i].y += (cy - circles[i].y) * 0.05;

      for (let j = i + 1; j < circles.length; j++) {
        const dx = circles[j].x - circles[i].x;
        const dy = circles[j].y - circles[i].y;
        const dist = Math.hypot(dx, dy) || 0.1;
        const minDist = circles[i].r + circles[j].r + 2.5;
        if (dist < minDist) {
          const push = (minDist - dist) * 0.5;
          const nx = dx / dist;
          const ny = dy / dist;
          circles[i].x -= nx * push;
          circles[i].y -= ny * push;
          circles[j].x += nx * push;
          circles[j].y += ny * push;
        }
      }
    }
  }

  circles.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = c.color;
    ctx.fill();
  });
}

// 11. Hemicycle Parliament Chart (100 seats)
function drawParliament(ctx, w, h, items, palette) {
  const cx = w / 2, cy = h * 0.85;
  const maxR = Math.min(w * 0.42, h * 0.76);
  const dotR = Math.max(2, maxR * 0.044);
  const rows = [14, 17, 20, 23, 26];
  const seats = [];

  rows.forEach((count, rIdx) => {
    const radius = maxR * (0.38 + (rIdx / (rows.length - 1)) * 0.62);
    for (let s = 0; s < count; s++) {
      const angle = Math.PI + (s / (count - 1)) * Math.PI;
      seats.push({
        angle,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius
      });
    }
  });

  seats.sort((a, b) => a.angle - b.angle);

  const seatColors = [];
  items.forEach((item, i) => {
    const count = Math.round(item.weight);
    for (let k = 0; k < count && seatColors.length < 100; k++) {
      seatColors.push(palette[i % palette.length]);
    }
  });
  while (seatColors.length < 100) {
    seatColors.push(palette[(items.length - 1) % palette.length]);
  }

  seats.forEach((seat, idx) => {
    ctx.beginPath();
    ctx.arc(seat.x, seat.y, dotR, 0, Math.PI * 2);
    ctx.fillStyle = seatColors[idx];
    ctx.fill();
  });
}

// 12. Proportional Tiered Pyramid
function drawPyramid(ctx, w, h, items, palette) {
  const topY = 8;
  const totalH = h - 16;
  const baseW = Math.min(w * 0.82, totalH * 1.45);
  const cx = w / 2;
  let curH = 0;

  items.forEach((item, i) => {
    const sliceH = (item.weight / 100) * totalH;
    const y1 = topY + curH;
    const y2 = y1 + sliceH;
    const w1 = (curH / totalH) * baseW;
    const w2 = ((curH + sliceH) / totalH) * baseW;

    ctx.beginPath();
    ctx.moveTo(cx - w1 / 2, y1);
    ctx.lineTo(cx + w1 / 2, y1);
    ctx.lineTo(cx + w2 / 2, y2);
    ctx.lineTo(cx - w2 / 2, y2);
    ctx.closePath();

    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ECECED';
    ctx.stroke();

    curH += sliceH;
  });
}

// 13. Radar / Spider Polygon Chart
function drawRadar(ctx, w, h, items, palette) {
  const cx = w / 2, cy = h / 2;
  const rMax = Math.min(cx, cy) * 0.84;
  const n = Math.max(items.length, 3);
  const maxW = Math.max(...items.map(a => a.weight), 1);

  [0.33, 0.66, 1].forEach(level => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      const x = cx + Math.cos(a) * rMax * level;
      const y = cy + Math.sin(a) * rMax * level;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  const pts = items.map((item, i) => {
    const a = -Math.PI / 2 + (i / items.length) * Math.PI * 2;
    const r = (item.weight / maxW) * rMax;
    return {
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      color: palette[i % palette.length]
    };
  });

  if (pts.length >= 2) {
    ctx.beginPath();
    pts.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(17, 17, 19, 0.08)';
    ctx.fill();
    ctx.strokeStyle = '#111113';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  pts.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });
}

// 14. Horizontal Lollipop Stem Chart
function drawLollipop(ctx, w, h, items, palette) {
  const padX = 16, padY = 10;
  const trackW = w - padX * 2;
  const availH = h - padY * 2;
  const rowStep = availH / Math.max(items.length, 1);
  const dotR = Math.min(5.5, Math.max(3, rowStep * 0.3));

  items.forEach((item, i) => {
    const y = padY + (i + 0.5) * rowStep;
    const targetX = padX + (item.weight / 100) * trackW;

    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(padX + trackW, y);
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(targetX, y);
    ctx.strokeStyle = palette[i % palette.length];
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(targetX, y, dotR, 0, Math.PI * 2);
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
  });
}

// 15. Concentric Bullseye (Cumulative Area Disks)
function drawBullseye(ctx, w, h, items, palette) {
  const cx = w / 2, cy = h / 2;
  const maxR = Math.min(cx, cy) * 0.88;
  let cumulative = 100;

  items.forEach((item, i) => {
    const r = Math.sqrt(Math.max(0, cumulative) / 100) * maxR;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ECECED';
    ctx.stroke();
    cumulative -= item.weight;
  });
}

// 16. Diagonal Mosaic Slice Matrix
function drawMosaicSlices(ctx, w, h, items, palette) {
  const pad = 8;
  const boxW = w - pad * 2;
  const boxH = h - pad * 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(pad, pad, boxW, boxH);
  ctx.clip();

  const totalSpan = boxW + boxH * 0.5;
  let curPos = 0;

  items.forEach((item, i) => {
    const span = (item.weight / 100) * totalSpan;
    const x1 = pad + curPos;
    const x2 = x1 + span;
    const skew = boxH * 0.5;

    ctx.beginPath();
    ctx.moveTo(x1, pad);
    ctx.lineTo(x2, pad);
    ctx.lineTo(x2 - skew, pad + boxH);
    ctx.lineTo(x1 - skew, pad + boxH);
    ctx.closePath();

    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ECECED';
    ctx.stroke();

    curPos += span;
  });

  ctx.restore();
}

// ============================================================================
// URL State Preservation & Hydration
// ============================================================================

function updateUrlState() {
  if (state.allocations.length === 0) {
    window.history.replaceState({}, '', window.location.pathname);
    return;
  }

  const p = state.allocations
    .map(a => `${encodeURIComponent(a.name)}:${Math.round(a.weight * 100) / 100}`)
    .join(',');
  const params = new URLSearchParams();
  params.set('p', p);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

function hydrateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const p = params.get('p');
  if (!p) return false;

  const parts = p.split(',');
  const loaded = [];
  let sum = 0;

  parts.forEach(part => {
    const [rawName, rawWeight] = part.split(':');
    if (!rawName || !rawWeight) return;
    const name = decodeURIComponent(rawName).trim();
    const weight = parseFloat(rawWeight);
    if (name && !isNaN(weight) && weight > 0 && sum + weight <= 100.1) {
      loaded.push({
        name,
        weight,
        rawInput: String(weight),
        color: generateUniqueRandomColor(state.usedHues)
      });
      sum += weight;
    }
  });

  if (loaded.length > 0) {
    state.allocations = loaded;
    if (sum >= 99.9) {
      transitionToTiledCharts(true);
    } else {
      renderCompletedPairs();
      resetForNextCategory();
    }
    return true;
  }
  return false;
}

// ============================================================================
// Reset & Share Controls
// ============================================================================

function resetApplication() {
  state.allocations = [];
  state.usedHues = [];
  state.tilePalettes = {};

  el.topHeader.style.display = 'none';
  el.tilesStage.style.display = 'none';
  el.inputStage.style.display = 'flex';
  el.inputStage.classList.remove('converging');
  el.completedPairsBar.innerHTML = '';

  window.history.replaceState({}, '', window.location.pathname);
  resetForNextCategory();
}

function bindEvents() {
  el.inputStage.addEventListener('click', () => {
    if (state.phase === 'TYPING_CATEGORY' || state.phase === 'TYPING_PERCENT') {
      el.hiddenInput.focus();
    }
  });

  el.hiddenInput.addEventListener('keydown', handleKeydown);
  el.hiddenInput.addEventListener('input', handleInput);

  el.btnShareIcon.addEventListener('click', () => {
    updateUrlState();
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('Link copied'))
      .catch(() => showToast('Copy failed'));
  });

  el.btnResetIcon.addEventListener('click', () => {
    resetApplication();
  });

  el.btnBrandLogo.addEventListener('click', (e) => {
    e.preventDefault();
    resetApplication();
  });

  window.addEventListener('resize', () => {
    if (state.phase === 'TILED_VIEW') {
      drawAllChartCanvases();
    }
  });
}

function init() {
  initElements();
  bindEvents();

  if (!hydrateFromUrl()) {
    resetForNextCategory();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
