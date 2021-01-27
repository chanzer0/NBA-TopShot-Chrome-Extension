chrome.webNavigation.onHistoryStateUpdated.addListener(() => {
    console.log('Page uses History API and we heard a pushSate/replaceState.');
    chrome.tabs.executeScript(null, {file:"content.js"});
});