// Only try to execute if the page is loaded
if (window.location.href.indexOf("/p2p/") > -1) {
    if (document.readyState !== "complete") {
        window.addEventListener("load", addPriceMonitor);
    } else {
        addPriceMonitor();
    }
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
            var guid = window.location.href.split("/")[5];
            if (guid.indexOf("?") > -1 ){
                guid = guid.split("?")[0];
            }
            var monString = "monitoringEnabled" + guid;
            chrome.storage.sync.get(monString, (obj) => {
                if (Object.keys(obj).length === 0 && obj.constructor === Object) {
                    chrome.storage.sync.set({ [monString]: false });
                    return;
                } else {
                    if (obj[monString]) {
                        $("#disableMonitor").toggle();
                        $("#disableMonitor").click(() => {
                            resetMonitoring();
                        });
                        var priceString = "priceToAlert" + guid;
                        var serialString = "serialToAlert" + guid;
                        var refreshString = "refreshInterval" + guid;
                        chrome.storage.sync.get([
                            priceString,
                            serialString,
                            refreshString
                        ], (data) => {
                            window.setTimeout(() => {
                                // Check if min price has been found
                                var priceDivs = $('[class*="SinglePriceLarge__PriceValue-"]').get();
                                var minPrice = priceDivs[0].innerText;

                                if (parseInt(minPrice.replace(/[,\$]/g, '')) < data[priceString]) {
                                    // Check if serial condition has been met (if applicable)
                                    if (data[serialString] != null &&  data[serialString].length != 0) {
                                        var dropdown = document.getElementById('moment-detailed-serialNumber');
                                        var optionsList = Array.from(dropdown.options);
                                        var newArr = optionsList.filter(el => el.value < +data[serialString]);
                                        if (newArr.length > 0) {
                                            $('#moment-detailed-serialNumber').val(newArr[0].value);
                                        }
                                    } else {
                                        alertUser();
                                    }
                                } else {
                                    window.location.reload();
                                }
                            }, data[refreshString] * 1000);
                        });
                    }
                }
            });
        });
}

function alertUser() {
    resetMonitoring();
    var buyButton = $('button[data-testid="button-p2p-purchase-moment"]');
    buyButton.click();
    chrome.runtime.sendMessage({ type: "alertUser" });
}

function resetMonitoring() {
    window.clearTimeout();
    var guid = window.location.href.split("/")[5];
    if (guid.indexOf("?") > -1 ){
        guid = guid.split("?")[0];
    }

    var monString = "monitoringEnabled" + guid;
    var priceString = "priceToAlert" + guid;
    var serialString = "serialToAlert" + guid;
    var refreshString = "refreshInterval" + guid;

    chrome.storage.sync.set({ [monString]: false });
    chrome.storage.sync.set({ [priceString]: null });
    chrome.storage.sync.set({ [serialString]: null });
    chrome.storage.sync.set({ [refreshString]: null });
    $("#disableMonitor").toggle();
}

function beginMonitoring() {
    var priceToAlert = $("#alertForm #priceInput").val().trim();
    var serialToAlert = $("#alertForm #serialInput").val().trim();
    var refreshInterval = $("#alertForm #refreshInput").val().trim();

    var guid = window.location.href.split("/")[5];
    if (guid.indexOf("?") > -1 ){
        guid = guid.split("?")[0];
    }

    var monString = "monitoringEnabled" + guid;
    var priceString = "priceToAlert" + guid;
    var serialString = "serialToAlert" + guid;
    var refreshString = "refreshInterval" + guid;

    chrome.storage.sync.set({ [priceString]: priceToAlert });
    chrome.storage.sync.set({ [serialString]: serialToAlert });
    chrome.storage.sync.set({ [refreshString]: refreshInterval });
    chrome.storage.sync.set({ [monString]: true });

    window.location.reload();
}
