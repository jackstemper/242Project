async function showGames(){
    let gamesJson = await fetch('api/games/');
    let games = await gamesJson.json();
    let gamesDiv = document.getElementById("games");
    gamesDiv.innerHTML = "";
    for(i in games){
        gamesDiv.append(getGameElem(games[i]));
    }
}

function getGameElem(game){
    let gameDiv = document.createElement("div");
    gameDiv.classList.add("game");
    let gameInfoDiv = document.createElement("div");
    gameInfoDiv.classList.add("gameInfo");
    gameDiv.append(gameInfoDiv);
    let gameSheet = document.createElement("div");
    gameSheet.classList.add("gamesheet");
    gameSheet.setAttribute("id","gameSheet");
    let gameA = document.createElement("a");
    let gameH3 = document.createElement("h3");
    gameA.setAttribute("href","#");
    gameA.setAttribute("dataId","id"+game._id);
    gameA.onclick = expandGame;
    if(game.place=="1"){
        gameH3.innerHTML = `${game.place}st Place Finish!`;
    } else if(game.place=="2"){
        gameH3.innerHTML = `${game.place}nd Place Finish!` ;
    } else if(game.place=="3"){
        gameH3.innerHTML = `${game.place}rd Place Finish!` ;
    } else if(game.place>"3"){
        gameH3.innerHTML = `${game.place}th Place Finish` ;
    }
    gameA.append(gameH3);
    gameSheet.append(gameA);
    //gameInfoDiv.classList.add("hidden");
    let gameRes = document.createElement("h4");
    gameRes.innerHTML = `${game.ranked} ${game.result}`;
    if((game.result == "loss" && game.ranked == "ranked") || (game.result == "win" && game.ranked == "unranked")){
        gameRes.classList.add("gameResL");
    } else {
        gameRes.classList.add("gameResW");
    }
    gameSheet.append(gameRes);
    gameSheet.append(getGameButtons(game));
    gameInfoDiv.append(gameSheet);
    gameInfoDiv.append(getGameExpand(game));
    return gameDiv;
}

function getGameExpand(game){
    gameDeepInfo = document.createElement("div");
    gameDeepInfo.setAttribute("id", "id"+game._id);
    gameDeepInfo.classList.add("hidden");
    gameDeepInfo.append(getChampions(game));
    return gameDeepInfo;
}

function getChampions(game){
    return makeArray("Champions: ", game.champions, game.clvl);
}

function makeArray(title, list, list2){
    let divArray = document.createElement("div");
    let arrayName = document.createElement("h5");
    arrayName.innerHTML = title;
    let ulElm = document.createElement("ul");
    ulElm.classList.add("flexArray");
    let liElmTitle = document.createElement("li");
    liElmTitle.append(arrayName);
    ulElm.append(liElmTitle);
    for(i in list){
        liElm = document.createElement("li");
        liElm.classList.add("flexLi");
        liElm.innerHTML = `${list[i]}  ${list2[i]}*`;
        ulElm.append(liElm);
    }
    divArray.append(ulElm);
    return divArray;
}

function getGameButtons(game){
    let btnDiv = document.createElement("div");
    btnDiv.classList.add("btnDiv");
    let editGameBtn = document.createElement("button");
    editGameBtn.innerHTML = "Edit";
    editGameBtn.setAttribute("dataId", game._id);
    editGameBtn.onclick = expandEditGame;
    btnDiv.append(editGameBtn);
    let deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "X";
    deleteBtn.setAttribute("dataId",game._id);
    deleteBtn.onclick = deleteGame;
    btnDiv.append(deleteBtn);
    return btnDiv;
}

async function deleteGame(){
    const id = this.getAttribute("dataId");
    let response = await fetch(`/api/games/${id}`, {
        method: 'DELETE',
        headers: {
        'Content-Type': 'application/json;charset=utf-8',
        }
    });
    if(response.status != 200){
        console.log("Error deleting game");
        return;
    }
    let result = await response.json();
    console.log("good Delete");
    showGames();
    return result;
}

function expandGame(){
    let id = this.getAttribute("dataId");
    let expandElm = document.querySelector("#"+id);
    expandElm.classList.toggle("hidden");
    return false;
}
async function expandEditGame(){
    this.parentElement.parentElement.parentElement.append(document.getElementById("editForm"));
    let expandElm = document.querySelector("#editForm");
    expandElm.classList.toggle("hidden");
    let gameID = this.getAttribute("dataId");
    let response = await fetch(`api/games/${gameID}`);
    if(response.status !=200){
        return;
    }
    let game = await response.json();
    document.getElementById('editGame').value = game.place;
    document.getElementById('editLevel').value = game.level;
    document.getElementById('editGameResult').value = game.result;
    document.getElementById('editGameRanked').value = game.ranked;
    if(game.champions != null){
        document.getElementById("editChamps").value = game.champions.join('\n');
    }
    if(game.clvl !=null){
        document.getElementById("editChampLvl").value = game.clvl.join('\n');
    }
    console.log("Before Edit Button");
    let editBtn = document.getElementById("editGameBtn");
    editBtn.setAttribute("dataId",gameID);
    editBtn.onclick = editGame;
    return false;
}

async function editGame(){
    const id = this.getAttribute("dataId");
    const place = document.getElementById("editGame").value;
    const level = document.getElementById("editLevel").value;
    const gameResult = document.getElementById("editGameResult").value;
    const ranked = document.getElementById("editGameRanked").value;    
    const champs = document.getElementById("editChamps").value;
    const ccc = champs.split("\n");
    const champlvl = document.getElementById("editChampLvl").value;
    const ccclvl = champlvl.split("\n");
    let game = {"place":place, "result":gameResult, "ranked": ranked, "level":level, "champions":ccc, "clvl":ccclvl};
    console.log(game);
    let response = await fetch(`/api/games/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(game),
    });
    console.log("3");
    if(response.status != 200){
        feedbackP.innerHTML = "Error Editing Game";
        feedbackP.classList.add("error");
        return;
    }
    let result = await response.json();
    showGames();
}

async function addGame(){
    //get the game info
    const gameName = document.getElementById("newGame").value;
    const gameLevel = document.getElementById("newLevel").value;
    const gameRanked = document.getElementById("newGameRanked").value;
    const gameResult = document.getElementById("newGameResult").value;
    const champions = document.getElementById("champs").value;
    const champsdl = champions.split("\n");
    const champlvl = document.getElementById("champLvl").value;
    const champlvldl = champlvl.split("\n");
    console.log(`you are adding a ${gameResult} place finish,\n this game was a ${gameRanked} game.`);
    let game = {"place": gameName, "result":gameResult, "ranked": gameRanked,"level":gameLevel,"champions":champsdl, "clvl":champlvldl};
    let response = await fetch('/api/games/', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(game),
    });
    if(response.status != 200){
        console.log("Error adding game");
        return;
    }
    let result = await response.json();
    showGames();
}

window.onload = function(){
    this.showGames();
    this.document.getElementById("addGameBtn").onclick = addGame;
}