player_dict = {}

const url = chrome.runtime.getURL("playerData.json");
fetch(url)
    .then(response => player_dict = response.json())
    .then(json => player_dict = json);

// When page loads, grab the list of players
window.addEventListener("load", function () {
    var playerTable = document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0];
    var playerSpans = Array.from(playerTable.children);
    playerSpans.forEach(child => {
        var span = child.children[1].children[0].children[0].children[0];
        console.log(span.getAttribute("Title"))
    });
    
    console.log(player_dict);
});

// When user switches tabs (i.e. PG, SG, SF, ...) need to update players