// I'm responsible for re-loading the main price sorting script when the page is navigated or refreshed!
chrome.webNavigation.onHistoryStateUpdated.addListener(() => {
    chrome.tabs.executeScript(null, { file: "content.js" });
});

// I'm responsible for playing a sound when your price monitor goes off
chrome.runtime.onMessage.addListener((message, sender) => {
    switch (message.type) {
        case "alertUser":
            var ding = new Audio('assets/ding.mp3');
            ding.volume = 0.5;
            ding.play();
            console.log(sender);
            break;
    }
});