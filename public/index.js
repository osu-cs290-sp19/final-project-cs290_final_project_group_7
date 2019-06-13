
var items;
var ghosts;
var encs;
var days = 1;
function getEncs() {
	var encReq = new XMLHttpRequest();
	encReq.open('GET', "/app/enc/all");
	encReq.addEventListener('load', function(event){
		console.log(event.target.response);
		if (event.target.status === 200){
			encs = JSON.parse(event.target.response);
			console.log(encs);
		} else {
			console.log(event.target);
		}
		getGhosts();
	});
	encReq.send();
}

function getGhosts() {
	var ghostReq = new XMLHttpRequest();
	ghostReq.open('GET', "/app/ghost/all");
	ghostReq.addEventListener('load', function(event){
		console.log(event.target.response);
		if (event.target.status === 200){
			ghosts = JSON.parse(event.target.response);
			console.log(ghosts);
		} else {
			console.log(event.target);
		}
		getItems();
	});
	ghostReq.send();
}

function getItems(){
	var itemsReq = new XMLHttpRequest();
	itemsReq.open('GET', "/app/item/all");
	itemsReq.addEventListener('load', function(event){
		console.log(event.target.response);
		if (event.target.status === 200){
			items = JSON.parse(event.target.response);
			console.log(items);
		} else {
			console.log(event.target);
		}
		startGame();
	});
	itemsReq.send();
}

getEncs();






function random(min, max) {
  return (Math.random() * (max - min)) + min;
}

function randInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

var pla = {
	name: "John Doe",
	health: 6,
	maxHp: 6,
	sin: 0,
	inventory: [],
	statuses: {},
	textures: [1,1],
	pos: [5, 5],
	name: "",
	score: 0
};

var areas = {
	"crag" : {
		"name" : "Crag",
		"texture" : "areas/crag",
		"id" : 0
	},
	"forest" : {
		"name" : "Forest",
		"texture" : "areas/forest",
		"id" : 1
	},
	"chasm" : {
		"name" : "Chasm",
		"texture" : "areas/chasm",
		"id" : 2
	},
	"river" : {
		"name" : "River",
		"texture" : "areas/river",
		"id" : 3
	},
	"chasm-bridge" : {
		"name" : "Chasm Bridge",
		"texture" : "areas/chasm_bridge",
		"id" : 4
	},
	"river-bridge" : {
		"name" : "River Bridge",
		"texture" : "areas/river_bridge",
		"id" : 5
	},
	"edge" : {
		"name" : "Edge",
		"texture" : "areas/edge",
		"id" : 6
	},
}


function getItemByName(name){
	
	for (var i in items){
		
		if (items[i].name === name){
			return items[i];
		}
	}
	return null;
}

var maxHealth = 82; //Screen limitation


var baseOptions = ["Travel", "Scrounge", "Rest", "Use Item", "End Game"];
var travelOptions = ["North", "East", "South", "West", "Back"];



var world= {
	"y = 0.5*x -2" : "chasm",
	"0,1" : "bridge",
	"5,2,3" : "forest"
	
};

function genLine(enc){
	var line = "y = ";
	var m = 0;
	var b = random(-5, 25);
	if (b > 25/2){
		m = random(-2, 0);
	} else {
		m = random(0, 2);
	}
	
	var bridgeX = randInt(0, 25);
	var bridgeY = Math.floor(m*bridgeX + b);
	world[bridgeX+ "," + bridgeY] = "bridge";
	
	line += m + "*x " + b; 
	world[line] = enc;
}

function genWorld(defaul){
	world = {};
	
	genLine("chasm");
	genLine("river");
	var forest = "";
	forest += randInt(5, 20) + ",";
	forest += randInt(5, 20) + ",";
	forest += randInt(4, 8);
	world[forest] = "forest";
	var stairs = Math.floor(random(1, 24)) + "," + Math.floor(random(1, 24)) + "";
	world["default"] = defaul;
	
	
}

function getEnc(){
	var poses = Object.keys(world);
	console.log(poses);
	for (var i = 0; i < poses.length; i++){
		if (poses[i].includes("y")) { // line
			var eq = poses[i].split(" "); //split equation
			var m = eq[2].split("*")[0]; //get m
			var b = eq[3]; //get b
			if (Math.floor(m * pla.pos[0]) + b === pla.pos[1]){ //check it
				return world[poses[i]];
			}
		} else {
			var s = poses[i].split(",");
			console.log(s);
			if (s.length === 3){
				if (Math.sqrt(Math.pow(pla.pos[0] - s[0], 2) + Math.pow(pla.pos[1] - s[1], 2)) <= s[2]){ //circle
					return world[poses[i]]
				}
			} else if (s.length === 2){
				if (s[0] == pla.pos[0] && s[1] == pla.pos[1] ){ //normal x,y
					return world[poses[i]];
				}
			} else if (pla.pos[0] === 0 || pla.pos[0] === 25 || pla.pos[1] === 0 || pla.pos[1] === 25){
				return "edge";
				
			} else {
				return world["default"];
			}
		}
	}
	
}


var currentEncounter = null;
var currentPage = "0";
var currentArea = {};


var textBox = document.getElementById("text-zone");
var optionBox =document.getElementById("options");
var itemBox = document.getElementById("inventory");

var traveling = false;

function useItem(item, target) {
	if (target === "enemy"){
		useItem(item, currentEncounter);
		setMainText(item.use);
		
	}else if (target === "pla"){
		useItem(item, pla);
		setSubText(item.use);
	} else {
	
		if (target.health && item.damage){
			target.health -= item.damage;
			console.log(target);
			if (target === pla){
				setHearts(1, target.health);
			} else {
				setHearts(0, target.health);
				if (target.onDamage && !target.dam){
					target.dam = 1;
					runOnPage(target.onDamage);
				}
			}
			
		}
			
		if (target === pla){
			
		} else {
			loseItem(item, pla);
		}
	}
	deselectItems();
	
}

function rest(){
	pla.health += pla.maxHp * 0.2;
	setSubText("You take a brief rest...");
	if (pla.health > pla.maxHp) pla.health = pla.maxHp;
	setHearts(1, pla.health);
	
	
}

function doGameTurn() {
	effectUpdate(pla);
	//effectUpdate(currentEncounter);
	if (currentEncounter){
		if (currentEncounter.health <= 0){
		setMainText("You defeated the " + currentEncounter.name + "!");
		endEncounter();
		
		}
		if (currentEncounter.hostile){
			useItem(currentEncounter.inventory[Math.floor(random(0, currentEncounter.inventory.length))], "pla");
		}
	}
	if (pla.health <= 0) {
		if (pla.statuses.undying == true) {
			pla.health = 0;
		} else {
			/*kill the target*/
			die();
		}
	}
	
	
}

function effectUpdate(target) {
	for (effect in target.statuses) {
		if(effect.type == "regen"){
			target.health += effect.amount;
		}
		if(effect.type == "fire"){
			target.health -= effect.amount;
		}
		
		effect.duration -= 1;
	}

}


function setHearts(isPla, amt){
	var heart = "images/enm_heart.png";
	var h_heart = "images/enm_h_heart.png";
	var box = document.getElementById("enm-health");
	var html = "";
	if (isPla){
		heart = "images/pla_heart.png";
		h_heart =  "images/pla_h_heart.png";
		box = document.getElementById("pla-health");
	}
	var amtact = Math.floor(amt/2);
	
	for (var i = 0; i < amtact; i++){
		var img = "<img src=\"" + heart + "\" " + "class=\"heart\">";
		
		html += img;
	}
	if (amtact*2 != amt){
		var img = "<img src=\"" + h_heart + "\" " + "class=\"heart\">";
		html += img;
	}
	
	box.innerHTML = html;
}

function setEncounterImage(a){
	var encounterBox = document.getElementById("encounter-disp");
	encounterBox.innerHTML = "<img src=\"images/"+ a + ".png\">";
	
}



function renderInventory(inven){
	var slots = document.getElementsByClassName("item");
	var tips = document.getElementsByClassName("tooltip");
	for (var i = 0; i < slots.length; i++){
		slots[i].innerHTML = "";
		tips[i].textContent = "";
	}
	for (var i = 0; i < inven.length; i++){
		
		slots[i].innerHTML = "<img src=\"images/"+ inven[i].texture + ".png\" class=\"it\">" + String(inven[i].count);
		tips[i].textContent = inven[i].desc;
	}
	
	
}

function getItem(item){
	setSubText("You found: " + item.name);
	if (pla.inventory.includes(item)){
		pla.inventory[pla.inventory.indexOf(item)].count++;
	} else {
		pla.inventory.push(item);
	}
	pla.score += item.score;
	renderInventory(pla.inventory);
}

function loseItem(item, target){
	if (target.inventory.includes(item)){
		
		if(item.count > 1){
			item.count--;
		} else if (item.count === 1) {
			target.inventory.splice(target.inventory.indexOf(item), 1);
			

		}
		selectedIndex = null;
		renderInventory(target.inventory);
		if (target === pla){
			pla.score -= item.score;
		}
	} 
}

function setMainText(text){
	var textBox = document.getElementById("main-text");
	textBox.textContent = text + "\n";
}

function setSubText(text){
	var textBox = document.getElementById("sub-text");
	textBox.textContent = text + "\n";
}

function setOptions(options){
	//remove old
	reOps = document.getElementById("options");
	
	//add new
	var op = "";
	
	for (ops in options){

		 op += "<div class=\"option\">" + options[ops] + "</div>";
		
	}
	if (!options.includes("Use Item")){
		op += "<div class=\"option\">" + "Use Item" + "</div>";
	}
	reOps.innerHTML = op;
}

function hasItem(item){
	for (var i =0; i < pla.inventory.length; i++){
		console.log(pla.inventory[i].name)
		if (pla.inventory[i].name === item){
			return i;
		}
	}
	return -1;
}

function startEncounter(){
	var encGot;
	var potentialEncs = [];

	for (var i in encs) {
		if (encs[i].areaAvail.includes(currentArea.id)){
			potentialEncs.push(encs[i]);
		}
	}

	if (potentialEncs.length > 0) encGot = potentialEncs[randInt(0, potentialEncs.length)];
	currentEncounter = encGot;
	currentPage = 0;

	console.log(potentialEncs);
	setEncounterImage(currentEncounter.texture);
	currentEncounter.health = currentEncounter.maxHealth;
	setHearts(0, currentEncounter.health);
	setOptions(currentEncounter.social[currentPage].options);
	setMainText(currentEncounter.social[currentPage].text);
	document.getElementById("encounter-name").textContent = currentEncounter.name;
	currentEncounter.dam = 0;
}

function endEncounter(){
	if (currentEncounter.onEnd) runOnPage(currentEncounter.onEnd);
	currentEncounter = null;
	setOptions(baseOptions);
	setHearts(0, 0);
	setEncounterImage("areas/" + currentArea.name);
	document.getElementById("encounter-name").textContent = "";
}


function runOnPage(command){
	
	if (command.name === "damagePlayer"){
		pla.health -= command.args[0]
	}
	if (command.name === "itemCheck"){
		var idx = hasItem(command.args[0])
		console.log(idx);
		if (idx >= 0 && pla.inventory[idx].count >= command.args[1]){
			
			command = command.args[2];
		} else {
			command = command.args[3];
		}
	}
	
	if (command.name === "getItem"){
		getItem(getItemByName(command.args[0]));
	}
	if (command.name === "setPage"){
		currentPage = command.args[0];
		
	}
	if (command.name === "endEncounter"){
		endEncounter();
	}
	if (command.name === "randomPage") {
		var rand = 0;
		for (var i in command.chance) {
			rand += command.chance[i];
		}
		rand = randInt(0, rand - 1);
		for (var i in command.chance) {
			rand-= command.chance[i];
			if (rand <= 0) {
				currentPage = command.pages[i];
				
			}
		}
	}
	if (command.name === "becomeHostile"){
		currentEncounter.hostile = 1;
	}

}




function scrounge(){
	var itemGot;
	var total = 0;
	
	for (var i = 0; i < items.length; i++) {
		
		total = items[i].weight[currentArea.id] + total;
		
	
	}
	var point = random(0, total);

	for (i in Object.keys(items)) {
		if (point - items[i].weight[currentArea.id] <= 0) {
			itemGot = items[i];
		} else {
			point -= items[i].weight[currentArea.id];
		}
	}
	getItem(itemGot);
	startEncounter();
	
}


var lastMove = "";
var scrounged = 0;
function optionClick(event){

	if(pla.health <= 0) {return;}

	var hit = event.target;
	if (hit){
		if (currentEncounter){
			
			var page = currentEncounter.social[currentPage];
		
			console.log(page);
		
			var choice = page.options.indexOf(hit.textContent);
			
			if (choice > -1){
				//update page
				var lastPage = currentPage;
				currentPage = page.optionRes[choice];
				//run on start
				if (currentEncounter.social[currentPage].onStart) {
					runOnPage(currentEncounter.social[currentPage].onStart);
				}
				
				setMainText(currentEncounter.social[currentPage].text)
				setSubText("");
				if (lastPage != currentPage) runOnPage(currentEncounter.social[currentPage].onStart);
				
				if (currentEncounter){
					
					//setText
				
					setMainText(currentEncounter.social[currentPage].text)
					
					//set options
					setOptions(currentEncounter.social[currentPage].options)
					
				}
				
				
			} else if (hit.textContent === "Use Item"){
				
				useItem(selectedItem, selectedItem.target);
			}
			doGameTurn();
			
		} else if (traveling){
			if (hit.textContent === "Back"){
				traveling = false;
				setOptions(baseOptions)
				
			} else if (hit.textContent === "North"){
				pla.pos[1]++;
				setMainText("You travel north...");
				setSubText("");
				currentArea = areas[getEnc()];
				lastMove = hit.textContent;
				scrounged = 0;
			} else if (hit.textContent === "East"){
				pla.pos[0]++;
				setMainText("You travel east...");
				setSubText("");
				currentArea = areas[getEnc()];
				lastMove = hit.textContent;
				scrounged = 0;
			} else if (hit.textContent === "South"){
				pla.pos[1]--;
				setMainText("You travel south...");
				setSubText("");
				currentArea = areas[getEnc()];
				lastMove = hit.textContent;
				scrounged = 0;
			} else if (hit.textContent === "West"){
				pla.pos[1]--;
				setMainText("You travel west...");
				setSubText("");
				currentArea = areas[getEnc()];
				lastMove = hit.textContent;
				scrounged = 0;
			} 
			traveling = false;
			setOptions(baseOptions);
			setEncounterImage(currentArea.texture);
			
			
		} else {
			if (hit.textContent === "Use Item"){
				
				useItem(selectedItem, selectedItem.target);
			} else if (hit.textContent === "Travel"){
			
				traveling = true;
				setOptions(travelOptions);
			} else if (hit.textContent === "Scrounge"){
				if (!scrounged){
					
					scrounge();
					scrounged = 1;
				} else {
					setSubText("You've already scrounged this area.");
				}

			} else if (hit.textContent === "Rest"){
			
				rest();
			} else if (hit.textContent === "End Game") {
				if(confirm("Ending will undo all progress.")){
					die();
					
				}
			}
		}
	}
	
	
}

var selectedItem = 0;

function deselectItems(){
	var items = document.getElementsByClassName("slot");
	
	for (var i = 0; i < items.length; i++){
		
		items[i].classList.remove("selected");
		
	}
}
function itemClick(event){
	
	var hit = event.target;
	selectedItem = null;
	var items = document.getElementsByClassName("it");
	deselectItems();
	for (var i = 0; i < items.length; i++){
		
		items[i].parentNode.parentNode.classList.remove("selected");
		if (items[i] == hit && pla.inventory.length > i){
			hit.parentNode.parentNode.classList.add("selected");
			selectedItem = pla.inventory[i];
		}
	}

}

function startGame() {
	getItem(getItemByName("Obol"));


	
	optionBox.addEventListener('click', optionClick);
	itemBox.addEventListener('click', itemClick);


	setOptions(baseOptions);

	setHearts(1, pla.health);	
	genWorld("crag");
	currentArea = areas[getEnc()];
	setEncounterImage(currentArea.texture);
}



//-----------------------Char Creation-------------------------------\
var TEXTURE_COUNT = 7;

var hairL = document.getElementById("hair-button-l");
var hairR = document.getElementById("hair-button-r");

var cloakL = document.getElementById("cloak-button-l");
var cloakR = document.getElementById("cloak-button-r");

var charImage = document.getElementById("character-image");

function updateCharRender(){
	charImage.innerHTML = "<img src = \"images/chars/cloaks/cloak" + String(pla.textures[1]) + ".png\" class=\"layer1\"><img src = \"images/chars/heads/head" + String(pla.textures[0]) + ".png\" class=\"layer2\">";
}

hairL.addEventListener('click', function(){
	pla.textures[0] += 1;
	if (pla.textures[0] > TEXTURE_COUNT){
		pla.textures[0] -= TEXTURE_COUNT;
	}
	updateCharRender();
});

cloakL.addEventListener('click', function(){
	pla.textures[1] += 1;
	if (pla.textures[1] > TEXTURE_COUNT){
		pla.textures[1] -= TEXTURE_COUNT;
	}
	updateCharRender();
});

hairR.addEventListener('click', function(){
	pla.textures[0] -= 1;
	if (pla.textures[0] < 1){
		pla.textures[0] += TEXTURE_COUNT;
	}
	updateCharRender();
});

cloakR.addEventListener('click', function(){
	pla.textures[1] -= 1;
	if (pla.textures[1] < 1){
		pla.textures[1] += TEXTURE_COUNT;
	}
	updateCharRender();
});

var beginButton = document.getElementById("begin-button");
var gameScreen = document.getElementById("game-screen");
var charScreen = document.getElementById("character-creation");


function fadeOutEffect(target, go = null) {
    var fadeTarget = target;
    var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity > 0) {
            fadeTarget.style.opacity -= 0.001;
        } else {
            clearInterval(fadeEffect);
			charScreen.classList.add("hidden");
        }
    }, 1);
}


beginButton.addEventListener('click', function(){
	
	gameScreen.classList.remove("hidden");
	pla.name = document.getElementById("name-input").value;
	if (pla.name){
		setMainText("Welcome to hell, " + pla.name);
		fadeOutEffect(charScreen);
	} else {
		alert("Please enter a name.");
	}
	
});

function die(){
	fadeOutEffect(gameScreen);
	
	pushChar(true, true, "Score: " + (pla.score * days));
}

function pushChar(addGhost = true, addVictor = true, podiumText) {
	if (addGhost) {
		var ghostReq = new XMLHttpRequest();
		ghostReq.open('POST', '/app/ghost/make/' + currentArea.id);
		var newGhost = {
			"name": pla.name,
			"hp": pla.maxHp,
			"items": pla.inventory,
			"aggression": pla.sin,
			"hospitality": 100 - pla.sin,
			"texture": [pla.textures[0], pla.textures[1]]
		}
		ghostReq.setRequestHeader('Content-Type', 'application/json');
		ghostReq.addEventListener('load', function(event) {
			if (event.target.status === 200) {
				console.log("ghost saved!");
			} else {
				console.log(event.target);
			}
		});
		console.log("sending:", newGhost);
		ghostReq.send(JSON.stringify(newGhost));
	}
	if (addVictor) {
		var victorReq = new XMLHttpRequest();
		victorReq.open('POST', '/app/gameEnd');
		if(!podiumText){podiumText = "Made it to " + currentArea.name;}
		if(!pla.name){pla.name = "No Name Given";}
		var newVictor =  {
			"name": pla.name,
			'image1': 'images/chars/cloaks/cloak' + String(pla.textures[1]) +'.png',
			'image2': 'images/chars/heads/head' + String(pla.textures[0]) + '.png',
			"text": podiumText
		};
		victorReq.setRequestHeader('Content-Type', 'application/json');
		victorReq.addEventListener('load', function(event) {
			if (event.target.status === 200) {
				console.log("victor saved!");
			} else {
				console.log(event.target);
			}
		});
		console.log("sending:", newVictor);
		victorReq.send(JSON.stringify(newVictor));
	}
	setTimeout(function() {
		window.location.href = "/gameOver";
	}, 5000);
	
}




function getEncs() {
	var encReq = new XMLHttpRequest();
	encReq.open('GET', "/app/enc/all");
	encReq.addEventListener('load', function(event){
		console.log(event.target.response);
		if (event.target.status === 200){
			encs = JSON.parse(event.target.response);
			console.log(encs);
		} else {
			console.log(event.target);
		}
		getGhosts();
	});
	encReq.send();
}