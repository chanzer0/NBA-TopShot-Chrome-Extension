window.addEventListener("load", () => {
    var dropdownEl = document.getElementById('moment-detailed-serialNumber');

    priceSerialMap = {}
    for (const child of dropdownEl.children) {
        var split = child.innerText.split('-');
        var serial = split[0].trim();
        var numberSerial = Number(serial.replace(/[#]+/g,""));

        var price = split[1].trim();
        var numberPrice = Number(price.replace(/[^0-9.-]+/g,""));

        priceSerialMap[+numberPrice] = +numberSerial;
    }

    var childElsToAppend = []
    for (var key in priceSerialMap) {
        var element = document.createElement("option");
        element.setAttribute("value", `${priceSerialMap[key]}`);
        element.setAttribute("data-testid", "moment-detailed-serialNumber-5");
        element.innerText = `$${key}.00 - #${priceSerialMap[key]}`;
        childElsToAppend.push(element);
    }

    var cNode = dropdownEl.cloneNode(false);
    dropdownEl.parentNode.replaceChild(cNode, dropdownEl);

    dropdownEl = document.getElementById('moment-detailed-serialNumber');
    for (var i = 0; i < childElsToAppend.length; i++){
        dropdownEl.appendChild(childElsToAppend[i]);
    }
});
