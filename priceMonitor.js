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
    var guid = window.location.href.split("/")[5];
    if (guid.indexOf("?") > -1 ){
        guid = guid.split("?")[0];
    }
    var monEnabled = "monitoring" + guid;
    var monPrice = "price" + guid;
    var monRefresh = "refresh" + guid;
    chrome.storage.sync.get([
        guid,
        monEnabled,
        monPrice,
        monRefresh
    ], (data) => {
        if (Object.keys(data).length === 0 && data.constructor === Object) {
            chrome.storage.sync.set({ [guid]: false });
        } else {
            if (data[guid]) {
                buy();
            }
        }
        fetch(chrome.extension.getURL('form.html'))
            .then(response => response.text())
            .then(form => {
                var divToAppendTo = document.querySelector('div[class^="MomentBanner__MomentBannerContainer-"]');
                var formDiv = document.createElement('div');
                formDiv.innerHTML = form;
                divToAppendTo.appendChild(formDiv);
                $("#disableMonitor").toggle();
                $("#alertForm").submit(() => {
                    beginMonitoring();
                    return false;
                });
                if (data[monEnabled]) {
                    beginMonitoring(data[monPrice], data[monRefresh])
                }
            });
    });     
}

function buy() {
    var guid = window.location.href.split("/")[5];
    if (guid.indexOf("?") > -1 ){
        guid = guid.split("?")[0];
    }
    var monEnabled = "monitoring" + guid;
    var monPrice = "price" + guid;
    var monRefresh = "refresh" + guid;
    chrome.storage.sync.set({ [guid]: false });
    chrome.storage.sync.set({ [monEnabled]: false });
    chrome.storage.sync.set({ [monPrice]: null });
    chrome.storage.sync.set({ [monRefresh]: null });
    var buyButton = $('button[data-testid="button-p2p-purchase-moment"]');
    buyButton.click();
    chrome.runtime.sendMessage({ type: "alertUser" });
}

function beginMonitoring(priceFromStorage, refreshFromStorage) {
    var guid = window.location.href.split("/")[5];
    if (guid.indexOf("?") > -1 ){
        guid = guid.split("?")[0];
    }
    var monEnabled = "monitoring" + guid;
    var monPrice = "price" + guid;
    var monRefresh = "refresh" + guid;
    chrome.storage.sync.set({ [guid]: false });
    chrome.storage.sync.set({ [monEnabled]: true });


    var priceToAlert = -1;
    var refreshInterval = -1;
    if (priceFromStorage != null && refreshFromStorage != null) {
        priceToAlert = priceFromStorage;
        refreshInterval = refreshFromStorage;
    } else {
        priceToAlert = +$("#alertForm #priceInput").val().trim();
        refreshInterval = +$("#alertForm #refreshInput").val().trim();
        chrome.storage.sync.set({ [monPrice]: priceToAlert });
        chrome.storage.sync.set({ [monRefresh]: refreshInterval });
        $("#monButton").click();
    }

    var extension = window.location.href.split("/")[5];
    var setId = extension.split("+")[0];
    var playId = extension.split("+")[1];
    if (playId.indexOf("?") > -1 ){
        playId = playId.split("?")[0];
    }

    var momentGUID = "";
    fetch("https://api.nba.dapperlabs.com/marketplace/graphql?GetUserMomentListingsDedicated",
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query GetUserMomentListingsDedicated($input: GetUserMomentListingsInput!) {\n  getUserMomentListings(input: $input) {\n    data {\n      circulationCount\n      flowRetired\n      version\n      set {\n        id\n        flowName\n        flowSeriesNumber\n        setVisualId\n        __typename\n      }\n      play {\n        ... on Play {\n          ...PlayDetails\n          __typename\n        }\n        __typename\n      }\n      assetPathPrefix\n      priceRange {\n        min\n        max\n        __typename\n      }\n      momentListings {\n        id\n        moment {\n          id\n          price\n          flowSerialNumber\n          owner {\n            dapperID\n            username\n            profileImageUrl\n            __typename\n          }\n          setPlay {\n            ID\n            flowRetired\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      momentListingCount\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment PlayDetails on Play {\n  id\n  description\n  stats {\n    playerID\n    playerName\n    primaryPosition\n    currentTeamId\n    dateOfMoment\n    jerseyNumber\n    awayTeamName\n    awayTeamScore\n    teamAtMoment\n    homeTeamName\n    homeTeamScore\n    totalYearsExperience\n    teamAtMomentNbaId\n    height\n    weight\n    currentTeam\n    birthplace\n    birthdate\n    awayTeamNbaId\n    draftYear\n    nbaSeason\n    draftRound\n    draftSelection\n    homeTeamNbaId\n    draftTeam\n    draftTeamNbaId\n    playCategory\n    homeTeamScoresByQuarter {\n      quarterScores {\n        type\n        number\n        sequence\n        points\n        __typename\n      }\n      __typename\n    }\n    awayTeamScoresByQuarter {\n      quarterScores {\n        type\n        number\n        sequence\n        points\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  statsPlayerGameScores {\n    blocks\n    points\n    steals\n    assists\n    minutes\n    rebounds\n    turnovers\n    plusMinus\n    flagrantFouls\n    personalFouls\n    playerPosition\n    technicalFouls\n    twoPointsMade\n    blockedAttempts\n    fieldGoalsMade\n    freeThrowsMade\n    threePointsMade\n    defensiveRebounds\n    offensiveRebounds\n    pointsOffTurnovers\n    twoPointsAttempted\n    assistTurnoverRatio\n    fieldGoalsAttempted\n    freeThrowsAttempted\n    twoPointsPercentage\n    fieldGoalsPercentage\n    freeThrowsPercentage\n    threePointsAttempted\n    threePointsPercentage\n    __typename\n  }\n  statsPlayerSeasonAverageScores {\n    minutes\n    blocks\n    points\n    steals\n    assists\n    rebounds\n    turnovers\n    plusMinus\n    flagrantFouls\n    personalFouls\n    technicalFouls\n    twoPointsMade\n    blockedAttempts\n    fieldGoalsMade\n    freeThrowsMade\n    threePointsMade\n    defensiveRebounds\n    offensiveRebounds\n    pointsOffTurnovers\n    twoPointsAttempted\n    assistTurnoverRatio\n    fieldGoalsAttempted\n    freeThrowsAttempted\n    twoPointsPercentage\n    fieldGoalsPercentage\n    freeThrowsPercentage\n    threePointsAttempted\n    threePointsPercentage\n    __typename\n  }\n  __typename\n}\n`,
                variables: {
                    input: {
                        setID: setId,
                        playID: playId
                    }
                },
                operationName: "GetUserMomentListingsDedicated"
            })
        })
        .then((res) => { return res.json(); })
        .then((data) => {
            momentGUID = data['data']['getUserMomentListings']['data']['momentListings'][0]['moment']['id'];
        });


    $("#disableMonitor").toggle();
    var intervalId = window.setInterval(() => {
        fetch("https://api.nba.dapperlabs.com/marketplace/graphql?GetMintedMoment",
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query GetMintedMoment($momentId: ID!) {  getMintedMoment(momentId: $momentId) {    data {      ...MomentDetails      play {        ... on Play {          ...PlayDetails          __typename        }        __typename      }      __typename    }    __typename  }}fragment MomentDetails on MintedMoment {  id  version  sortID  set {    id    flowName    flowSeriesNumber    setVisualId    __typename  }  setPlay {    ID    flowRetired    circulationCount    __typename  }  assetPathPrefix  play {    id    stats {      playerID      playerName      primaryPosition      teamAtMomentNbaId      teamAtMoment      dateOfMoment      playCategory      __typename    }    __typename  }  price  listingOrderID  flowId  owner {    dapperID    username    profileImageUrl    __typename  }  flowSerialNumber  forSale  __typename}fragment PlayDetails on Play {  id  description  stats {    playerID    playerName    primaryPosition    currentTeamId    dateOfMoment    jerseyNumber    awayTeamName    awayTeamScore    teamAtMoment    homeTeamName    homeTeamScore    totalYearsExperience    teamAtMomentNbaId    height    weight    currentTeam    birthplace    birthdate    awayTeamNbaId    draftYear    nbaSeason    draftRound    draftSelection    homeTeamNbaId    draftTeam    draftTeamNbaId    playCategory    homeTeamScoresByQuarter {      quarterScores {        type        number        sequence        points        __typename      }      __typename    }    awayTeamScoresByQuarter {      quarterScores {        type        number        sequence        points        __typename      }      __typename    }    __typename  }  statsPlayerGameScores {    blocks    points    steals    assists    minutes    rebounds    turnovers    plusMinus    flagrantFouls    personalFouls    playerPosition    technicalFouls    twoPointsMade    blockedAttempts    fieldGoalsMade    freeThrowsMade    threePointsMade    defensiveRebounds    offensiveRebounds    pointsOffTurnovers    twoPointsAttempted    assistTurnoverRatio    fieldGoalsAttempted    freeThrowsAttempted    twoPointsPercentage    fieldGoalsPercentage    freeThrowsPercentage    threePointsAttempted    threePointsPercentage    __typename  }  statsPlayerSeasonAverageScores {    minutes    blocks    points    steals    assists    rebounds    turnovers    plusMinus    flagrantFouls    personalFouls    technicalFouls    twoPointsMade    blockedAttempts    fieldGoalsMade    freeThrowsMade    threePointsMade    defensiveRebounds    offensiveRebounds    pointsOffTurnovers    twoPointsAttempted    assistTurnoverRatio    fieldGoalsAttempted    freeThrowsAttempted    twoPointsPercentage    fieldGoalsPercentage    freeThrowsPercentage    threePointsAttempted    threePointsPercentage    __typename  }  __typename}`,
                variables: {
                    momentId: momentGUID
                }
            })
        })
        .then((res) => { return res.json(); })
        .then((data) => {
            if (data != null) {
                if (data['data']['getMintedMoment']['data']['price'] != null) {
                    if (!isNaN(data['data']['getMintedMoment']['data']['price'])) {
                        if (data['data']['getMintedMoment']['data']['price'] < priceToAlert) {
                            chrome.storage.sync.set({ [guid]: true });
                            chrome.storage.sync.set({ [monEnabled]: false });
                            window.clearInterval(intervalId);
                            window.location.reload(true);
                        }
                    }
                }
            }
        });
    }, refreshInterval * 1000);
    $("#disableMonitor").click(() => {
        chrome.storage.sync.set({ [guid]: false });
        chrome.storage.sync.set({ [monEnabled]: false });
        chrome.storage.sync.set({ [monPrice]: null });
        chrome.storage.sync.set({ [monRefresh]: null });
        window.clearInterval(intervalId);
        $("#disableMonitor").toggle();
    });
}

