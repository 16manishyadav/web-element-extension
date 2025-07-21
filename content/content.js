// --- Top-level variables ---
let selecting = false;
let lastHighlighted = null;
let toolbar = null;
let currentResizable = null;
let resizeHandle = null;
let startX, startY, startWidth, startHeight;
let stylePalette = null;
let resizeBox = null;
let activeHandle = null;
let startBox = null;
let historyStack = [];
let redoStack = [];
let darkModeStyle = null;
let darkModeExtStyle = null;
let toolbarDragOffset = { x: 0, y: 0 };
let isDraggingToolbar = false;

// --- Overlay creation ---
function injectWecOverlay() {
  if (document.getElementById('wec-overlay')) return;
  window.__wec_overlay_injected = true;
  const overlay = document.createElement('div');
  overlay.id = 'wec-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.05)';
  overlay.style.zIndex = 2147483647;
  overlay.style.pointerEvents = 'none';
  overlay.style.display = 'none';
  document.body.appendChild(overlay);
}

function enableSelector() {
  selecting = true;
  const overlay = document.getElementById('wec-overlay');
  overlay.style.cursor = 'crosshair';
  document.body.style.cursor = 'crosshair';
  document.addEventListener('mouseover', onMouseOver, true);
  document.addEventListener('mouseout', onMouseOut, true);
  document.addEventListener('click', onClick, true);
}

function disableSelector() {
  selecting = false;
  const overlay = document.getElementById('wec-overlay');
  overlay.style.pointerEvents = 'none';
  overlay.style.cursor = '';
  document.body.style.cursor = '';
  if (lastHighlighted) {
    lastHighlighted.classList.remove('wec-highlighted');
    lastHighlighted = null;
  }
  // removeToolbar(); // Commented out so toolbar remains visible after selection
  document.removeEventListener('mouseover', onMouseOver, true);
  document.removeEventListener('mouseout', onMouseOut, true);
  document.removeEventListener('click', onClick, true);
  overlay.style.display = 'none';
}

function onMouseOver(e) {
  if (!selecting) return;
  const el = e.target;
  const overlay = document.getElementById('wec-overlay');
  if (el === overlay || el.id === 'wec-overlay') return;
  if (lastHighlighted && lastHighlighted !== el) {
    lastHighlighted.classList.remove('wec-highlighted');
  }
  el.classList.add('wec-highlighted');
  lastHighlighted = el;
}

function onMouseOut(e) {
  if (!selecting) return;
  const el = e.target;
  const overlay = document.getElementById('wec-overlay');
  if (el === overlay || el.id === 'wec-overlay') return;
  el.classList.remove('wec-highlighted');
  if (lastHighlighted === el) lastHighlighted = null;
}

function makeResizable(target) {
  removeResizable();
  currentResizable = target;
  // Get element's bounding rect
  const rect = target.getBoundingClientRect();
  // Create resize box overlay
  resizeBox = document.createElement('div');
  resizeBox.id = 'wec-resize-box';
  document.body.appendChild(resizeBox);
  positionResizeBox(rect);
  // Add 8 handles
  const handles = [
    { cls: 'wec-rh-nw', dir: 'nw' },
    { cls: 'wec-rh-n', dir: 'n' },
    { cls: 'wec-rh-ne', dir: 'ne' },
    { cls: 'wec-rh-e', dir: 'e' },
    { cls: 'wec-rh-se', dir: 'se' },
    { cls: 'wec-rh-s', dir: 's' },
    { cls: 'wec-rh-sw', dir: 'sw' },
    { cls: 'wec-rh-w', dir: 'w' },
  ];
  handles.forEach(h => {
    const handle = document.createElement('div');
    handle.className = `wec-resize-handle-box ${h.cls}`;
    handle.setAttribute('data-dir', h.dir);
    handle.title = 'Drag to resize';
    handle.addEventListener('mousedown', startBoxResize, true);
    resizeBox.appendChild(handle);
  });
  pushHistory({ type: 'resize', el: target, prevWidth: rect.width, prevHeight: rect.height });
}

function positionResizeBox(rect) {
  resizeBox.style.left = `${window.scrollX + rect.left}px`;
  resizeBox.style.top = `${window.scrollY + rect.top}px`;
  resizeBox.style.width = `${rect.width}px`;
  resizeBox.style.height = `${rect.height}px`;
}

function startBoxResize(e) {
  e.preventDefault();
  e.stopPropagation();
  activeHandle = e.target.getAttribute('data-dir');
  const rect = currentResizable.getBoundingClientRect();
  startBox = {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    w: rect.width,
    h: rect.height,
    mouseX: e.clientX,
    mouseY: e.clientY
  };
  // Save the initial size for undo
  currentResizable._resizeUndo = { prevWidth: rect.width + 'px', prevHeight: rect.height + 'px' };
  document.documentElement.addEventListener('mousemove', doBoxResize, true);
  document.documentElement.addEventListener('mouseup', stopBoxResize, true);
}

function doBoxResize(e) {
  if (!activeHandle || !startBox) return;
  let dx = e.clientX - startBox.mouseX;
  let dy = e.clientY - startBox.mouseY;
  let newX = startBox.x, newY = startBox.y, newW = startBox.w, newH = startBox.h;
  if (activeHandle.includes('e')) newW = Math.max(20, startBox.w + dx);
  if (activeHandle.includes('s')) newH = Math.max(20, startBox.h + dy);
  if (activeHandle.includes('w')) {
    newW = Math.max(20, startBox.w - dx);
    newX = startBox.x + dx;
  }
  if (activeHandle.includes('n')) {
    newH = Math.max(20, startBox.h - dy);
    newY = startBox.y + dy;
  }
  resizeBox.style.left = `${newX}px`;
  resizeBox.style.top = `${newY}px`;
  resizeBox.style.width = `${newW}px`;
  resizeBox.style.height = `${newH}px`;
  // Live preview
  currentResizable.style.width = `${newW}px`;
  currentResizable.style.height = `${newH}px`;
  pushHistory({ type: 'resize', el: currentResizable, prevWidth: newW, prevHeight: newH });
}

function stopBoxResize(e) {
  document.documentElement.removeEventListener('mousemove', doBoxResize, true);
  document.documentElement.removeEventListener('mouseup', stopBoxResize, true);
  activeHandle = null;
  startBox = null;
  // Save the new size for redo
  if (currentResizable && currentResizable._resizeUndo) {
    const newWidth = currentResizable.style.width;
    const newHeight = currentResizable.style.height;
    pushHistory({
      type: 'resize',
      el: currentResizable,
      prevWidth: currentResizable._resizeUndo.prevWidth,
      prevHeight: currentResizable._resizeUndo.prevHeight,
      newWidth,
      newHeight
    });
    delete currentResizable._resizeUndo;
  }
}

function removeResizable() {
  if (resizeBox && resizeBox.parentNode) {
    resizeBox.parentNode.removeChild(resizeBox);
    resizeBox = null;
  }
  currentResizable = null;
}

function showStylePalette(target) {
  removeStylePalette();
  stylePalette = document.createElement('div');
  stylePalette.id = 'wec-style-palette';
  stylePalette.innerHTML = `
    <div class="wec-section-title">
      <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="none" stroke="#1976d2" stroke-width="2"/></svg>
      Style Element
    </div>
    <div class="wec-row"><label><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#f3f3f3" stroke="#1976d2" stroke-width="1.5"/></svg>BG: <input type="color" id="wec-bg-color"></label></div>
    <div class="wec-row"><label><svg viewBox="0 0 20 20"><text x="4" y="15" font-size="12" fill="#1976d2">A</text></svg>Text: <input type="color" id="wec-text-color"></label></div>
    <div class="wec-divider"></div>
    <div class="wec-section-title">
      <svg viewBox="0 0 20 20"><rect x="3" y="7" width="14" height="6" rx="2" fill="#f3f3f3" stroke="#1976d2" stroke-width="1.5"/></svg>
      Font
    </div>
    <div class="wec-row"><label><svg viewBox="0 0 20 20"><text x="4" y="15" font-size="12" fill="#1976d2">A</text></svg>Font size: <input type="number" id="wec-font-size" min="8" max="72" style="width:60px"> px</label></div>
    <div class="wec-row"><label><svg viewBox="0 0 20 20"><rect x="3" y="7" width="14" height="6" rx="2" fill="#f3f3f3" stroke="#1976d2" stroke-width="1.5"/></svg>Font: <select id="wec-font-family">
      <option value="">Default</option>
      <option value="Arial">Arial</option>
      <option value="Georgia">Georgia</option>
      <option value="Tahoma">Tahoma</option>
      <option value="Verdana">Verdana</option>
      <option value="Courier New">Courier New</option>
    </select></label></div>
    <button class="wec-reset-btn" id="wec-style-reset" title="Reset styles">Reset</button>
    <button id="wec-style-close" title="Close">✕</button>
  `;
  stylePalette.style.position = 'absolute';
  stylePalette.style.zIndex = 2147483649;
  stylePalette.style.background = '#fff';
  stylePalette.style.border = 'none';
  stylePalette.style.borderRadius = '10px';
  stylePalette.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
  stylePalette.style.padding = '16px 18px 12px 18px';
  stylePalette.style.display = 'flex';
  stylePalette.style.flexDirection = 'column';
  stylePalette.style.gap = '10px';
  stylePalette.style.fontSize = '14px';
  stylePalette.style.minWidth = '220px';
  stylePalette.style.maxWidth = '260px';

  document.body.appendChild(stylePalette);
  positionStylePalette(target);

  document.getElementById('wec-bg-color').oninput = (e) => {
    target.style.backgroundColor = e.target.value;
  };
  document.getElementById('wec-text-color').oninput = (e) => {
    target.style.color = e.target.value;
  };
  document.getElementById('wec-font-size').oninput = (e) => {
    target.style.fontSize = e.target.value + 'px';
  };
  document.getElementById('wec-font-family').oninput = (e) => {
    target.style.fontFamily = e.target.value;
  };
  document.getElementById('wec-style-reset').onclick = () => {
    target.style.backgroundColor = '';
    target.style.color = '';
    target.style.fontSize = '';
    target.style.fontFamily = '';
  };
  document.getElementById('wec-style-close').onclick = removeStylePalette;
  setTimeout(() => {
    document.addEventListener('mousedown', stylePaletteOutsideClick, true);
    document.addEventListener('keydown', stylePaletteEsc, true);
  }, 0);
  pushHistory({ type: 'style', el: target, prevBg: target.style.backgroundColor, prevColor: target.style.color, prevFontSize: target.style.fontSize, prevFontFamily: target.style.fontFamily });
}

function positionStylePalette(target) {
  const rect = target.getBoundingClientRect();
  stylePalette.style.top = `${window.scrollY + rect.bottom + 8}px`;
  stylePalette.style.left = `${window.scrollX + rect.left}px`;
}

function removeStylePalette() {
  if (stylePalette && stylePalette.parentNode) {
    stylePalette.parentNode.removeChild(stylePalette);
    stylePalette = null;
    document.removeEventListener('mousedown', stylePaletteOutsideClick, true);
    document.removeEventListener('keydown', stylePaletteEsc, true);
  }
}

function stylePaletteOutsideClick(e) {
  if (stylePalette && !stylePalette.contains(e.target)) {
    removeStylePalette();
  }
}

function stylePaletteEsc(e) {
  if (e.key === 'Escape') removeStylePalette();
}

function showToolbar(target) {
  removeToolbar();
  removeResizable();
  removeStylePalette();
  toolbar = document.createElement('div');
  toolbar.id = 'wec-toolbar';
  toolbar.innerHTML = `
    <span class="wec-toolbar-drag" title="Move toolbar">
      <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="#e3e8f0" stroke="#b0bec5" stroke-width="2"/></svg>
    </span>
    <button id="wec-undo" title="Undo"><svg viewBox="0 0 20 20"><path d="M4 10h8a4 4 0 1 1-4 4" fill="none" stroke="#1976d2" stroke-width="2" stroke-linecap="round"/></svg></button>
    <button id="wec-redo" title="Redo"><svg viewBox="0 0 20 20"><path d="M16 10H8a4 4 0 1 0 4 4" fill="none" stroke="#1976d2" stroke-width="2" stroke-linecap="round"/></svg></button>
    <button id="wec-hide" title="Hide"><svg viewBox="0 0 20 20"><path d="M6 6l8 8M6 14L14 6" stroke="#d32f2f" stroke-width="2" stroke-linecap="round"/></svg></button>
    <button id="wec-resize" title="Resize"><svg viewBox="0 0 20 20"><rect x="4" y="4" width="12" height="12" rx="3" fill="none" stroke="#1976d2" stroke-width="2"/><path d="M16 16l-3-3" stroke="#1976d2" stroke-width="2" stroke-linecap="round"/></svg></button>
    <button id="wec-style" title="Style"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="none" stroke="#388e3c" stroke-width="2"/><path d="M7 13l6-6" stroke="#388e3c" stroke-width="2" stroke-linecap="round"/></svg></button>
    <button id="wec-close" title="Close"><svg viewBox="0 0 20 20"><path d="M6 6l8 8M6 14L14 6" stroke="#888" stroke-width="2.2" stroke-linecap="round"/></svg></button>
  `;
  document.body.appendChild(toolbar);
  positionToolbar(target);
  document.getElementById('wec-undo').onclick = () => { undoAction(); };
  document.getElementById('wec-redo').onclick = () => { redoAction(); };
  document.getElementById('wec-hide').onclick = () => {
    pushHistory({ type: 'hide', el: target, prevDisplay: target.style.display });
    target.style.display = 'none';
    removeToolbar();
    removeResizable();
    removeStylePalette();
  };
  document.getElementById('wec-resize').onclick = () => {
    makeResizable(target);
    removeStylePalette();
  };
  document.getElementById('wec-style').onclick = () => {
    showStylePalette(target);
  };
  document.getElementById('wec-close').onclick = () => {
    removeToolbar();
    removeResizable();
    removeStylePalette();
  };
  // Drag logic
  const dragHandle = toolbar.querySelector('.wec-toolbar-drag');
  dragHandle.addEventListener('mousedown', startToolbarDrag, true);
}

function positionToolbar(target) {
  const rect = target.getBoundingClientRect();
  toolbar.style.top = `${window.scrollY + rect.top - toolbar.offsetHeight - 8}px`;
  toolbar.style.left = `${window.scrollX + rect.left}px`;
}

function removeToolbar() {
  if (toolbar && toolbar.parentNode) {
    toolbar.parentNode.removeChild(toolbar);
    toolbar = null;
  }
  removeResizable();
  removeStylePalette();
}

function onClick(e) {
  if (!selecting) return;
  e.preventDefault();
  e.stopPropagation();
  const el = e.target;
  const overlay = document.getElementById('wec-overlay');
  if (el === overlay || el.id === 'wec-overlay' || el.id === 'wec-toolbar' || el.parentElement?.id === 'wec-toolbar') return;
  el.classList.add('wec-highlighted');
  showToolbar(el);
  console.log('Selected element:', el);
  disableSelector();
}

function getPageKey() {
  return 'wec_' + location.hostname + location.pathname;
}

function saveHistoryToStorage() {
  const key = getPageKey();
  chrome.storage.local.set({ [key]: historyStack });
}

function loadHistoryFromStorage(callback) {
  const key = getPageKey();
  chrome.storage.local.get([key], (result) => {
    callback(result[key] || []);
  });
}

function clearHistoryFromStorage() {
  const key = getPageKey();
  chrome.storage.local.remove([key]);
}

function pushHistory(action) {
  historyStack.push(action);
  redoStack.push(action);
  saveHistoryToStorage();
}

function undoAction() {
  if (historyStack.length === 0) return;
  const action = historyStack.pop();
  redoStack.push(action);
  if (action.type === 'hide') {
    action.el.style.display = action.prevDisplay;
  } else if (action.type === 'resize') {
    action.el.style.width = action.prevWidth;
    action.el.style.height = action.prevHeight;
  } else if (action.type === 'style') {
    action.el.style.backgroundColor = action.prevBg;
    action.el.style.color = action.prevColor;
    action.el.style.fontSize = action.prevFontSize;
    action.el.style.fontFamily = action.prevFontFamily;
  }
}

function redoAction() {
  if (redoStack.length === 0) return;
  const action = redoStack.pop();
  historyStack.push(action);
  if (action.type === 'hide') {
    action.el.style.display = 'none';
  } else if (action.type === 'resize') {
    action.el.style.width = action.newWidth;
    action.el.style.height = action.newHeight;
  } else if (action.type === 'style') {
    action.el.style.backgroundColor = action.newBg;
    action.el.style.color = action.newColor;
    action.el.style.fontSize = action.newFontSize;
    action.el.style.fontFamily = action.newFontFamily;
  }
}

function enableDarkModeExtension() {
  if (!darkModeExtStyle) {
    darkModeExtStyle = document.createElement('style');
    darkModeExtStyle.id = 'wec-dark-mode-ext-style';
    darkModeExtStyle.textContent = `
      #wec-toolbar, #wec-style-palette, #wec-resize-box {
        background: #23283a !important;
        color: #e3e8ef !important;
        border-color: #3a425c !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.32) !important;
      }
      #wec-toolbar button, #wec-style-palette button, .wec-resize-handle-box {
        background: #23283a !important;
        color: #e3e8ef !important;
        border-color: #3a425c !important;
      }
      #wec-toolbar button:hover, #wec-style-palette button:hover, .wec-resize-handle-box:hover {
        background: #2e3448 !important;
        color: #fff !important;
      }
      #wec-resize-box {
        border-color: #4fc3f7 !important;
        background: rgba(25, 118, 210, 0.10) !important;
      }
      #wec-overlay {
        background: rgba(24,28,36,0.10) !important;
      }
    `;
    document.head.appendChild(darkModeExtStyle);
  }
}

function disableDarkModeExtension() {
  if (darkModeExtStyle && darkModeExtStyle.parentNode) {
    darkModeExtStyle.parentNode.removeChild(darkModeExtStyle);
    darkModeExtStyle = null;
  }
}

function enableDarkMode() {
  if (!darkModeStyle) {
    darkModeStyle = document.createElement('style');
    darkModeStyle.id = 'wec-dark-mode-style';
    darkModeStyle.textContent = `
      html, body, * {
        background: #181c24 !important;
        color: #e3e8ef !important;
        border-color: #3a425c !important;
        box-shadow: none !important;
      }
      a, a * { color: #90caf9 !important; }
      img, video { filter: brightness(0.8) contrast(1.1) !important; }
      input, textarea, select, button {
        background: #23283a !important;
        color: #e3e8ef !important;
        border-color: #3a425c !important;
      }
    `;
    document.head.appendChild(darkModeStyle);
  }
}

function disableDarkMode() {
  if (darkModeStyle && darkModeStyle.parentNode) {
    darkModeStyle.parentNode.removeChild(darkModeStyle);
    darkModeStyle = null;
  }
}

function startToolbarDrag(e) {
  isDraggingToolbar = true;
  const rect = toolbar.getBoundingClientRect();
  // Set position absolute and current left/top before dragging
  toolbar.style.position = 'absolute';
  toolbar.style.left = `${rect.left + window.scrollX}px`;
  toolbar.style.top = `${rect.top + window.scrollY}px`;
  toolbar.style.right = 'auto';
  toolbar.style.bottom = 'auto';
  toolbarDragOffset.x = e.clientX - rect.left;
  toolbarDragOffset.y = e.clientY - rect.top;
  document.documentElement.addEventListener('mousemove', doToolbarDrag, true);
  document.documentElement.addEventListener('mouseup', stopToolbarDrag, true);
}

function doToolbarDrag(e) {
  if (!isDraggingToolbar) return;
  toolbar.style.left = `${e.clientX - toolbarDragOffset.x + window.scrollX}px`;
  toolbar.style.top = `${e.clientY - toolbarDragOffset.y + window.scrollY}px`;
  toolbar.style.right = 'auto';
  toolbar.style.bottom = 'auto';
}

function stopToolbarDrag(e) {
  isDraggingToolbar = false;
  document.documentElement.removeEventListener('mousemove', doToolbarDrag, true);
  document.documentElement.removeEventListener('mouseup', stopToolbarDrag, true);
}

// Listen for popup messages
chrome.runtime.onMessage.addListener((msg) => {
  if (msg === 'undo_action') {
    undoAction();
  } else if (msg === 'redo_action') {
    redoAction();
  } else if (msg === 'remove_customizations') {
    // Undo all actions in reverse order
    for (let i = historyStack.length - 1; i >= 0; i--) {
      const action = historyStack[i];
      if (action.type === 'hide') {
        action.el.style.display = action.prevDisplay;
      } else if (action.type === 'resize') {
        action.el.style.width = action.prevWidth;
        action.el.style.height = action.prevHeight;
      } else if (action.type === 'style') {
        action.el.style.backgroundColor = action.prevBg;
        action.el.style.color = action.prevColor;
        action.el.style.fontSize = action.prevFontSize;
        action.el.style.fontFamily = action.prevFontFamily;
      }
    }
    historyStack = [];
    redoStack = [];
    clearHistoryFromStorage();
  } else if (msg === 'activate_selector') {
    if (!window.__wec_overlay_injected) {
      injectWecOverlay();
    }
    const overlay = document.getElementById('wec-overlay');
    overlay.style.display = 'block';
    enableSelector();
    console.log('Element selector activated!');
  } else if (msg && msg.type === 'toggle_dark_mode_extension') {
    if (msg.enabled) {
      enableDarkModeExtension();
    } else {
      disableDarkModeExtension();
    }
  } else if (msg && msg.type === 'toggle_dark_mode_website') {
    if (msg.enabled) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  }
});

// --- Initialize overlay on load ---
if (!window.__wec_overlay_injected) {
  injectWecOverlay();
}

// On page load, load history from storage into historyStack
loadHistoryFromStorage((actions) => {
  historyStack = actions || [];
  redoStack = [];
}); 