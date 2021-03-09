chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
    chrome.tabs.get(details.tabId, function (tab) {
        if (tab.url.indexOf("www.nbatopshot.com/listings/p2p/") > -1) {
            console.log('executing script on tabID: ' + details.tabId);
            chrome.tabs.executeScript(details.tabId, { file: "assets/scripts/jquery-3.2.1.min.js" }, () => {
                chrome.tabs.executeScript(details.tabId, { file: "priceSort.js" });
            });
        }
    });
});