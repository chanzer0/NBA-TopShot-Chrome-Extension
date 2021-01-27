window.addEventListener("load", () => {
    // Check storage for toggle status
    var toggleValue = true;
    chrome.storage.sync.get("topshot-toggle-status", (obj) => {
        if (Object.keys(obj).length === 0 && obj.constructor === Object) {
            chrome.storage.sync.set({"topshot-toggle-status": true});
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

        toggleValue ? sortListings("price") : sortListings("serial");
    });
});

function toggleStatus() {
    var toggleSwitch = document.getElementById("toggle-button-extension");
    toggleSwitch.checked = !toggleSwitch.checked;
    chrome.storage.sync.set({"topshot-toggle-status": toggleSwitch.checked});
    if (toggleSwitch.checked == true) {
        sortListings("price");
    }
    else {
        sortListings("serial");
    }
    chrome.storage.sync.get("topshot-toggle-status", (obj) => {
        console.log(obj);
    });
}


function sortListings(sortBy) {
    var dropdown = document.getElementById('moment-detailed-serialNumber');
    var optionsList = dropdown.options;

    var newList = []
    for (var i = 0; i < optionsList.length; i++){
        optionsList[i].price = optionsList[i].innerText.split('$')[1];
        newList.push(optionsList[i]);
        // single digit serials
        if (optionsList[i].value < 10) {
            optionsList[i].style.background = "#0F5298";
        }
        // double digit serials
        else if (optionsList[i].value < 100) {
            optionsList[i].style.background = "#3C99DC";
        }
        // triple digit serials
        else if (optionsList[i].value < 1000) {
            optionsList[i].style.background = "#66D3FA";
        }
        // the rest
        else {
            optionsList[i].style.background = "#D5F3FE";
        }
    }

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
    
    for (var i = 0; i <= optionsList.length; i++) {            
        optionsList[i] = newList[i];
    }
    optionsList[0].selected = true;
}
