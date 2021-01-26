window.addEventListener("load", () => {
    var dropdown = document.getElementById('moment-detailed-serialNumber');
    var optionsList = dropdown.options;

    var newList = []
    for (var i = 0; i < optionsList.length; i++){
        optionsList[i].price = optionsList[i].innerText.split('$')[1];
        newList.push(optionsList[i]);
    }

    newList = newList.sort((a, b) => {           
        if (parseInt(a.price.replace(/,/g, '')) === parseInt(b.price.replace(/,/g, ''))) {
            return 0;
        }
        else {
            return (parseInt(a.price.replace(/,/g, '')) < parseInt(b.price.replace(/,/g, ''))) ? -1 : 1;
        }   
    });

    for (var i = 0; i <= optionsList.length; i++) {            
        optionsList[i] = newList[i];
    }
    optionsList[0].selected = true;
});
