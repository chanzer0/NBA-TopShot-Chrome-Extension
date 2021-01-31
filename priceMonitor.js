// Only try to execute if the page is loaded
if (document.readyState !== "complete") {
    window.addEventListener("load", () => {
        console.log("load event fired");
        addPriceMonitor();
    });
} else {
    addPriceMonitor();
}

function addPriceMonitor() {
    if (document.getElementById("alertForm") != null) {
        return;
    }

    fetch(chrome.extension.getURL('form.html'))
        .then(response => response.text())
        .then(data => {
            var divToAppendTo = document.querySelector('div[class^="MomentBanner__MomentBannerContainer-"]');
            var formDiv = document.createElement('div');
            formDiv.innerHTML = data;
            divToAppendTo.appendChild(formDiv);
            $("#disableMonitor").toggle();
            $("#alertForm").submit(() => {
                beginMonitoring();
                return false;
            });

            chrome.storage.sync.get("monitoringEnabled", (obj) => {
                if (Object.keys(obj).length === 0 && obj.constructor === Object) {
                    chrome.storage.sync.set({ "monitoringEnabled": false });
                    return;
                } else {
                    if (obj.monitoringEnabled) {
                        $("#disableMonitor").toggle();
                        $("#disableMonitor").click(() => {
                            resetMonitoring();
                        })
                        chrome.storage.sync.get([
                            "priceToAlert",
                            "serialToAlert",
                            "refreshInterval"
                        ], (data) => {
                            window.setTimeout(() => {
                                // Check if min price has been found
                                var priceDivs = $('[class*="SinglePriceLarge__PriceValue-"]').get();
                                var minPrice = priceDivs[0].innerText;

                                if (parseInt(minPrice.replace(/[,\$]/g, '')) < data.priceToAlert) {
                                    // Check if serial condition has been met (if applicable)
                                    if (data.serialToAlert != null && data.serialToAlert.length != 0) {
                                        var dropdown = $('#moment-detailed-serialNumber').get();
                                        var optionsList = dropdown.options;
                                        optionsList = optionsList.filter(el => el.value < data.serialToAlert);
                                        if (optionsList.some(el => el.price < data.priceToAlert)) {
                                            alertUser();
                                        }
                                    } else {
                                        alertUser();
                                    }
                                } else {
                                    window.location.reload();
                                }
                            }, data.refreshInterval * 1000);
                        });
                    }
                }
            });
        });
}

function alertUser() {
    window.clearTimeout();
    resetMonitoring();
    var buyButton = $('button[data-testid="button-p2p-purchase-moment"]');
    buyButton.click();
    chrome.runtime.sendMessage({ type: "alertUser" });
}

function resetMonitoring() {
    chrome.storage.sync.set({ "monitoringEnabled": false });
    chrome.storage.sync.set({ "priceToAlert": null });
    chrome.storage.sync.set({ "serialToAlert": null });
    chrome.storage.sync.set({ "refreshInterval": null });
    $("#disableMonitor").toggle();
}

function beginMonitoring() {
    var priceToAlert = $("#alertForm #priceInput").val().trim();
    var serialToAlert = $("#alertForm #serialInput").val().trim();
    var refreshInterval = $("#alertForm #refreshInput").val().trim();

    chrome.storage.sync.set({ "priceToAlert": priceToAlert });
    chrome.storage.sync.set({ "serialToAlert": serialToAlert });
    chrome.storage.sync.set({ "refreshInterval": refreshInterval });
    chrome.storage.sync.set({ "monitoringEnabled": true });

    window.location.reload();
}
