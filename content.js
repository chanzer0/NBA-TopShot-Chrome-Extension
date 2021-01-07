playerDict = {}

const url = chrome.runtime.getURL("assets/awesemo_data/playerData.json");
fetch(url)
    .then(response => playerDict = response.json())
    .then(json => playerDict = json);

// When page loads, grab the list of players
window.addEventListener("load", () => {
    addPlayerData();
    addLineupData();
});

// When user switches tabs, reload the stuff
window.addEventListener("mouseup", () => {
    addPlayerData();
    addLineupData();
});

// When scrolled, update list with fpts/own
// window.addEventListener("scroll", () => {
//     addPlayerData();
//     addLineupData();
// });
// window.addEventListener("wheel", () => {
//     addPlayerData();
//     addLineupData();
// });

// Apply data on searches
window.addEventListener("keyup", () => {
    addPlayerData();
    addLineupData();
});

function createPlayerDiv(playerName, shouldBeNA) {
    var fpts_div = document.createElement("div");
    var fpts = shouldBeNA ? 'N/A' : playerDict[playerName]["Fpts"];
    fpts_div.innerHTML = `${fpts}`;
    fpts_div.style.color = "darkslategray";
    fpts_div.style.margin = "auto";
    fpts_div.style.fontSize = "10px";

    var own_div = document.createElement("div");
    var ownership = shouldBeNA ? 'N/A' : playerDict[playerName]["Ownership %"];
    own_div.innerHTML = `${ownership}${ownership == 'N/A' ? '' : '%'}`;
    own_div.style.color = "cornflowerblue";
    own_div.style.margin = "auto";
    own_div.style.fontSize = "10px";

    var both_div = document.createElement("span");
    both_div.appendChild(fpts_div);
    both_div.appendChild(own_div);
    return both_div;
}

function addLineupData() {
    var lineupTable = document.querySelector('[data-test-id="lineup-display"]');
    var lineupPlayers = lineupTable.querySelectorAll('[data-test-id="player-name-cell"]');
    var playersInLineup = [];
    lineupPlayers.forEach(playerSpan => {
        var playerName = playerSpan.children[0].getAttribute("title").normalize("NFD").replace(/[\u0300-\u036f]/g, "");;
        if (playerName != null) {
            if (playerDict[playerName] != null) {
                var str = `${playerDict[playerName]["Fpts"]}${playerDict[playerName]["Ownership %"]}%`;
                var textContent = playerSpan.parentElement.textContent;
                var idx = textContent.indexOf(textContent.match(/\d/));
                var onScreen = textContent.substring(idx, textContent.length);
                if (playerSpan.parentElement.children.length > 1 && onScreen != str) {
                    playerSpan.parentElement.removeChild(playerSpan.parentElement.children[1]);
                    // playerDict[playerName]["div"] = null;
                }
            }

            var div = playerDict[playerName] == null ? createPlayerDiv('', true )
                                                     : playerDict[playerName]["div"] == null ? createPlayerDiv(playerName) 
                                                                                             : playerDict[playerName]["div"];                                                                                

            if (Array.from(playerSpan.parentElement.children).length == 1) {
                playerSpan.parentElement.appendChild(div);
            }

            if (!playersInLineup.includes(playerName)){
                playersInLineup.push(playerName);
            }
        } else {
            if (playerSpan.parentElement.children.length > 1) {
                playerSpan.parentElement.removeChild(playerSpan.parentElement.children[1]);
                // playerDict[playerName]["div"] = null;
            }
        }
    });
    buildAwesemoDiv(playersInLineup, lineupTable.parentElement);
}

function addPlayerData() {
    var playerTable = document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0];
    var playerSpans = Array.from(playerTable.children);
    playerSpans.forEach(child => {
        var span = child.children[1].children[0].children[0].children[0];
        // Remove accents from playernames
        var playerName = span.getAttribute("Title").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        var div = playerDict[playerName] == null ? createPlayerDiv('', true )
                                                 : playerDict[playerName]["div"] == null ? createPlayerDiv(playerName) 
                                                                                         : playerDict[playerName]["div"];

        if (playerDict[playerName] != null) {
            var str = `${playerDict[playerName]["Fpts"]}${playerDict[playerName]["Ownership %"]}`;
            if (div.innerText != str) {
                if (Array.from(child.children[1].children[0].children).length == 2) {
                    child.children[1].children[0].removeChild(child.children[1].children[0].children[1]);
                }
            }
            playerDict[playerName]["div"] = null;
        }                                                                                
        
        if (Array.from(child.children[1].children[0].children).length == 1) {
            child.children[1].children[0].appendChild(div);
        }
        if (playerDict[playerName] != null) {
            playerDict[playerName]["div"] = div;
        }
    });
}

function buildAwesemoDiv(playersInLineup, parentElement) {
    var fpts = playersInLineup.map(player => +playerDict[player]["Fpts"]).reduce((a, b) => a + b, 0);
    var own = playersInLineup.map(player => +playerDict[player]["Ownership %"]).reduce((a, b) => a + b, 0);
    var boom = playersInLineup.map(player => +playerDict[player]["Boom %"]).reduce((a, b) => a + b, 0);
    var opto = playersInLineup.map(player => +playerDict[player]["Optimal %"]).reduce((a, b) => a + b, 0);
    var lev = playersInLineup.map(player => +playerDict[player]["Leverage %"]).reduce((a, b) => a + b, 0);

    var current = document.getElementById("awesemo-data");
    while (current != null) {
        parentElement.removeChild(current.parentElement);
        current = document.getElementById("awesemo-data");
    }
    if (playersInLineup.length != 0) {
        fetch(chrome.extension.getURL('assets/template.html'))
        .then(response => response.text())
        .then(data => {
            var div = document.createElement("div");
            div.innerHTML = data;
            
            parentElement.appendChild(div);

            var fpts_str = isNaN(fpts) ? 'N/A' : fpts.toFixed(2);
            var own_str = isNaN(own) ? 'N/A' : own.toFixed(1);
            var boom_str = isNaN(boom) ? 'N/A' : boom.toFixed(2);
            var opto_str = isNaN(opto) ? 'N/A' : opto.toFixed(2);
            var lev_str = isNaN(lev) ? 'N/A' : lev.toFixed(1);

            // feed x axis salary and y axis projection to get a linear fit - divide by 1000 to get points per dollar
            var salaries = playersInLineup.map(playerName => +(playerDict[playerName]["Salary"].replace(",",""))/1000);
            var projs = playersInLineup.map(playerName => +(playerDict[playerName]["Fpts"]));
            var lr = linearRegression(projs, salaries);
            var slope = lr.slope.toFixed(2);
            var intercept = lr.intercept.toFixed(1);

            document.getElementById("awesemo-logo").src = chrome.extension.getURL("assets/awesemo-logo-transparent.png");
            document.getElementById("proj").innerText = `Projection: ${fpts_str}`;
            document.getElementById("own").innerText = `Ownership: ${own_str}%`;
            document.getElementById("boom").innerText = `Boom: ${boom_str}%`;
            document.getElementById("opto").innerText = `Optimal: ${opto_str}%`;
            document.getElementById("lev").innerText = `Leverage: ${lev_str}%`;
            document.getElementById("regr").innerText = `Lin. Fit: ${slope}x ${intercept >= 0 ? '+':''}${intercept}`;
        });
    }
}

function linearRegression(y,x){
    var lr = {};
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;

    for (var i = 0; i < y.length; i++) {

        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i]*y[i]);
        sum_xx += (x[i]*x[i]);
        sum_yy += (y[i]*y[i]);
    } 

    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
    lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

    return lr;
}