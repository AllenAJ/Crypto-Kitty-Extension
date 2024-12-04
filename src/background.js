// background.js
let loginTabId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'OPEN_AUTH_TAB') {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('index.html?auth=true'),
      active: true
    }, (tab) => {
      loginTabId = tab.id;
    });
  }
  
  if (request.type === 'LOGIN_SUCCESS') {
    // The tab will close itself after showing success message
    // Focus the extension popup
    chrome.action.openPopup();
  }
});