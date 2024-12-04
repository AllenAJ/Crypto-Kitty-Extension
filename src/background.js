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
    // Smoothly close the auth tab
    if (loginTabId) {
      chrome.tabs.remove(loginTabId, () => {
        // Focus the extension popup after a short delay
        setTimeout(() => {
          chrome.action.openPopup();
        }, 300);
      });
    }
  }
});