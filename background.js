chrome.contextMenus.onClicked.addListener(async (item, tab) => {
    await chrome.tabs.sendMessage(tab.id, {id: item.menuItemId});
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'looop',
        title: 'Looop',
        contexts: ['all']
    });
});