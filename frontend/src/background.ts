// Background script for Focus Fox extension

// Chrome types declaration
declare const chrome: any;

// Add storage permission to manifest

// Open sidebar when extension action is clicked
chrome.action.onClicked.addListener(async (tab: any) => {
  if (tab.id) {
    // Open the sidebar
    await chrome.sidePanel.open({ tabId: tab.id });
    
    // Set the sidebar to be visible
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: 'public/sidebar.html',
      enabled: true
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
  if (message.type === 'OPEN_SIDEBAR' && sender.tab?.id) {
    // Open sidebar
    chrome.sidePanel.open({ tabId: sender.tab.id });
  } else if (message.type === 'OPEN_SIDEBAR_WITH_TEXT' && sender.tab?.id) {
    // Open sidebar and pass the selected text
    console.log('🦊 Background received OPEN_SIDEBAR_WITH_TEXT:', message.text);
    chrome.sidePanel.open({ tabId: sender.tab.id }).then(() => {
      // Store the selected text in chrome.storage so sidebar can access it
      chrome.storage.local.set({ 
        selectedText: message.text,
        timestamp: Date.now()
      });
      console.log('🦊 Stored selected text in storage');
    });
  } else if (message.type === 'SEND_TEXT_TO_SIDEBAR' && sender.tab?.id) {
    // Send text to sidebar (whether it's open or not)
    console.log('🦊 Background received SEND_TEXT_TO_SIDEBAR:', message.text);
    
    // Store the text and open sidebar
    chrome.storage.local.set({ 
      selectedText: message.text,
      timestamp: Date.now()
    });
    chrome.sidePanel.open({ tabId: sender.tab.id });
    console.log('🦊 Stored text and opened sidebar');
  }
  sendResponse({ success: true });
}); 