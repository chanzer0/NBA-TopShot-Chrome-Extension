// I'm responsible for playing a sound when your price monitor goes off
chrome.runtime.onMessage.addListener((message, sender) => {
    switch (message.type) {
        case "alertUser":
            var ding = new Audio('assets/ding.mp3');
            ding.volume = 0.5;
            ding.play();
            chrome.windows.update(sender.tab.windowId, { drawAttention: true });
            chrome.tabs.get(sender.tab.id, (tab) => {
                console.log(tab);
                chrome.tabs.highlight({ 'tabs': tab.index }, function () { });
                chrome.tabs.executeScript(tab.id, { code: "document.title = 'PRICE ALERT - BUY';" });
            });
            break;
    }
});