// Only try to execute price sorting if we are on a listings page
if (window.location.href.indexOf("/p2p/") > -1) {
    if (document.readyState !== "complete") {
        window.addEventListener("load", setup);
        window.addEventListener("load", addPriceMonitor);
    } else {
        setup();
        addPriceMonitor();
    }
}

function setup() {
    if (document.getElementById("toggle-button-extension") != null) {
        return;
    }

    // Check storage for toggle status default value
    var toggleValue = true;
    chrome.storage.sync.get("topshot-toggle-status", (obj) => {
        if (Object.keys(obj).length === 0 && obj.constructor === Object) {
            chrome.storage.sync.set({ "topshot-toggle-status": true });
        } else {
            toggleValue = obj["topshot-toggle-status"];
        }

        // Add toggle button onload
        var dropdown = document.getElementById('moment-detailed-serialNumber');
        var parentSpan = dropdown.parentElement.parentElement;

        var toggleSwitch = document.createElement("input");
        toggleSwitch.type = "radio";
        toggleSwitch.id = "toggle-button-extension";
        toggleSwitch.checked = toggleValue;

        var toggleLabel = document.createElement("label");
        toggleLabel.for = "toggle-button-extension";
        toggleLabel.innerText = "Sort by Price";
        toggleLabel.style.paddingLeft = "5px";

        var div = document.createElement("div");
        div.appendChild(toggleSwitch);
        div.appendChild(toggleLabel);
        div.onclick = toggleStatus;

        parentSpan.appendChild(div);
        parentSpan.parentElement.style.paddingBottom = "20px";

        // Sort listings by price or serial depending on stored default value
        toggleValue ? sortListings("price") : sortListings("serial");
    });
}

// Simply toggles which property we are sorting by
function toggleStatus() {
    var toggleSwitch = document.getElementById("toggle-button-extension");
    toggleSwitch.checked = !toggleSwitch.checked;
    chrome.storage.sync.set({ "topshot-toggle-status": toggleSwitch.checked });
    if (toggleSwitch.checked == true) {
        sortListings("price");
    }
    else {
        sortListings("serial");
    }
}

// Sort listings by property
function sortListings(sortBy) {
    // Grab the dropdown and listings
    var dropdown = document.getElementById('moment-detailed-serialNumber');
    var optionsList = dropdown.options;

    var newList = []
    for (var i = 0; i < optionsList.length; i++) {
        optionsList[i].price = optionsList[i].innerText.split('$')[1];
        newList.push(optionsList[i]);
        // single digit serials
        if (optionsList[i].value < 10) {
            optionsList[i].style.backgroundColor = "#0F5298";
        }
        // double digit serials
        else if (optionsList[i].value < 100) {
            optionsList[i].style.backgroundColor = "#3C99DC";
        }
        // triple digit serials
        else if (optionsList[i].value < 1000) {
            optionsList[i].style.backgroundColor = "#66D3FA";
        }
        // the rest
        else {
            optionsList[i].style.backgroundColor = "#D5F3FE";
        }
    }

    // sort by price
    if (sortBy == "price") {
        newList = newList.sort((a, b) => {
            if (parseInt(a.price.replace(/,/g, '')) === parseInt(b.price.replace(/,/g, ''))) {
                return 0;
            }
            else {
                return (parseInt(a.price.replace(/,/g, '')) < parseInt(b.price.replace(/,/g, ''))) ? -1 : 1;
            }
        });
    }
    // sort by serial
    else if (sortBy == "serial") {
        newList = newList.sort((a, b) => {
            if (parseInt(a.value) === parseInt(b.value)) {
                return 0;
            }
            else {
                return (parseInt(a.value) < parseInt(b.value)) ? -1 : 1;
            }
        });
    }

    // replace listing with their sorted correspondants 
    for (var i = 0; i <= optionsList.length; i++) {
        optionsList[i] = newList[i];
    }
    optionsList[0].selected = true;
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
                                            // alert!
                                            window.clearTimeout();
                                            resetMonitoring();
                                            chrome.runtime.sendMessage({ type: "alertUser" });
                                        }
                                    } else {
                                        // alert!
                                        window.clearTimeout();
                                        resetMonitoring();
                                        chrome.runtime.sendMessage({ type: "alertUser" });
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
