document.getElementById('activate-selector').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, 'activate_selector');
  }
});

document.getElementById('undo-action').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, 'undo_action');
  }
});

document.getElementById('redo-action').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, 'redo_action');
  }
});

document.getElementById('remove-customizations').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, 'remove_customizations');
  }
});

// Dark mode toggles logic
const extToggle = document.getElementById('dark-mode-toggle-extension');
const webToggle = document.getElementById('dark-mode-toggle-website');
const popupBody = document.body;

extToggle.addEventListener('change', async (e) => {
  const enabled = extToggle.checked;
  // Toggle dark mode for popup only
  if (enabled) {
    popupBody.style.background = '#181c24';
    popupBody.style.color = '#e3e8ef';
  } else {
    popupBody.style.background = '#f7fafd';
    popupBody.style.color = '';
  }
  // Toggle dark mode for overlays/toolbars
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'toggle_dark_mode_extension', enabled });
  }
});

webToggle.addEventListener('change', async (e) => {
  const enabled = webToggle.checked;
  // Toggle dark mode for website content only
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'toggle_dark_mode_website', enabled });
  }
}); 