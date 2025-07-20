// Background script for Focus Fox extension

// Chrome types declaration
declare const chrome: any;

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
    chrome.sidePanel.open({ tabId: sender.tab.id }).then(() => {
      // Send message to sidebar with selected text
      chrome.tabs.sendMessage(sender.tab!.id!, {
        type: 'SIDEBAR_OPEN_WITH_TEXT',
        text: message.text
      });
    });
  }
  sendResponse({ success: true });
}); 