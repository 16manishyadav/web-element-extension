chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'activate-selector',
    title: 'Activate Element Customizer',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'activate-selector') {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/content.js']
    });
  }
}); 