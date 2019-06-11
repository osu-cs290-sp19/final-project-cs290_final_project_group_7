
var items = [];
var randItem;



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







function random(min, max) {
  return (Math.random() * (max - min)) + min;
}

var pla = {
	hp: 6,
	maxHp: 6,
	inventory: [],
	statuses: {},
	textures: [1,1],
	pos: [5, 5]
};




function getItemByName(name){
	for (var i in items){
		if (items[i].name == name){
			return items[i];
		}
	}
	return null;
}

var maxHealth = 82; //Screen limitation


var baseOptions = ["Travel", "Scrounge", "Rest", "Use Item"];
var travelOptions = ["North", "East", "South", "West", "Back"];

var testEncounter = {
	name: "yellow imp",
	items: [],
	health: 10,
	social: {
		"0": {
			text: "HELLO THERE!",
			
			options: ["Buy foul potion for 3 obals", "2"],
			optionRes: ["1", "2"]
		},
		"1": {
			text: "Pleased to be doing busness with you!",
			options: ["I'll take another", "Bye!"],
			onStart: {
				"name" : "itemCheck",
				"args" : ["obol", 3, {"name":"gainItem", "args" : ["foul potion", 1]}, {"name":"setPage", "args" : ["3"]}]
			},
			optionRes: ["0", "2"]
		},
		"2": {
			text: "Goodbye!",
			onStart: {
				"name" : "endEncounter"
			
			},
			options: ["0", "1"],
			optionRes: ["0", "1"]
		},
		
		"3": {
			text: "HEY!  You don't have enough obols!",
			options: ["oh"],
			optionRes: ["0"]
		}
		
		
	}
	
	
};

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
	
	var bridgeX = Math.floor(random(0, 25));
	var bridgeY = m*bridgeX + b;
	world[bridgeX+ "," + bridgeY] = "bridge";
	
	line += m + "*x " + b; 
	world[line] = enc;
}

function genWorld(defaul){
	world = {};
	world["default"] = defaul;
	genLine("chasm");
	genLine("river");
	var forest = "";
	forest += Math.floor(random(5, 20)) + ",";
	forest += Math.floor(random(5, 20)) + ",";
	forest += Math.floor(random(3, 8));
	world[forest] = "forest";
	var stairs = Math.floor(random(1, 24)) + "," + Math.floor(random(1, 24)) + "";
	
	
}

function getEnc(){
	var poses = world.keys();
	for (var i in poses){
		if (poses[i].includes("y")) { // line
			var eq = poses[i].split(" "); //split equation
			var m = eq[2].split("*")[0]; //get m
			var b = eq[3]; //get b
			if (Math.floor(m * pla.pos[0]) + b === pla.pos[1]){ //check it
				return world[poses[i]];
			}
		} else {
			var s = poses[i].split(",");
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


var currentEncounter = testEncounter;
var currentPage = "0";
var currentArea = {
	"name":"crag"
	
};


var textBox = document.getElementById("text-zone");
var optionBox =document.getElementById("options");
var itemBox = document.getElementById("inventory");

var traveling = false;

function useItem(item, target) {
	if (item.target == "enemy"){
		
	} else if (item.target == "player"){
		if (item.dmg && pla.hp) {
			pla.hp -= item.dmg;
		}
		if (item.regen && pla.statuses) {
			pla.statuses.regenSources.push(item.regen);
		}
	} else if (item.target == "all"){
		
		
	}
	
}

function rest(){
	pla.hp += pla.maxHp * 0.2;
}

function doGameTurn() {
	effectUpdate(pla);
	if (pla.hp <= 0) {
		if (pla.statuses.undying == true) {
			pla.hp = 0;
		} else {
			/*kill the target*/
		}
	}
}

function effectUpdate(target) {
	for (effect in target.statuses) {
		if(effect.type == "regen"){
			target.hp += effect.amount;
		}
		if(effect.type == "fire"){
			target.hp -= effect.amount;
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
	for (var i = 0; i < inven.length; i++){
		slots[i].innerHTML = "<img src=\"images/"+ inven[i].texture + ".png\" class=\"it\">" + String(inven[i].count);
	}
	
	var tips = document.getElementsByClassName("tooltip");
	for (var i = 0; i < inven.length; i++){
		tips[i].textContent = inven[i].desc;
	}
}

function getItem(item){
	if (pla.inventory.includes(item)){
		pla.inventory[pla.inventory.indexOf(item)].count++;
	} else {
		pla.inventory.push(item);
	}
	renderInventory(pla.inventory);
}

function loseItem(item){
	if (pla.inventory.includes(item)){
		item = pla.inventory[pla.inventory.indexOf(item)];
		if(item.count > 1){
			item.count--;
		} else {
			pla.inventory.remove(item);
		}
		renderInventory(pla.inventory);
	} 
}

function setText(text){
	textBox.textContent = text;
}

function setOptions(options){
	//remove old
	reOps = document.getElementById("options");
	
	//add new
	var op = "";
	for (ops in options){

		 op += "<div class=\"option\">" + options[ops] + "</div>";
		
	}
	reOps.innerHTML = op;
}

function hasItem(item){
	for (var i =0; i < pla.inventory.length; i++){
		
		if (pla.inventory[i].name === item){
			return i;
		}
	}
	return -1;
}

function endEncounter(){
	currentEncounter = null;
	setOptions(baseOptions);
	setEncounterImage("areas/" + currentArea.name);
}

function runOnPage(command){
	if (command.name === "damagePlayer"){
		pla.hp -= command.args[0]
	}
	if (command.name === "itemCheck"){
		var idx = hasItem(command.args[0])
		console.log(pla.inventory[idx].count);
		console.log(command.args[1]);
		if (idx >= 0 && pla.inventory[idx].count >= command.args[1]){
			console.log("EYSSSSSSSSSSSSSSSS");
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
}



function optionClick(event){
	var hit = event.target;
	if (hit){
		if (currentEncounter){
			var page = currentEncounter.social[currentPage];
			
			
			var choice = page.options.indexOf(hit.textContent);
			if (choice > -1){
				//update page
				currentPage = page.optionRes[choice];
				//run on start
				
				doGameTurn();
				//setText
				setText(currentEncounter.social[currentPage].text)
				//set options
				setOptions(currentEncounter.social[currentPage].options)
				doGameTurn();
				if (currentEncounter.social[currentPage].onStart) runOnPage(currentEncounter.social[currentPage].onStart);
			}
			
		} else if (traveling){
			if (hit.textContent === "Back"){
				traveling = false;
				setOptions(baseOptions)
				
			} else if (hit.textContent === "North"){
				pla.pos[1]++;
			} else if (hit.textContent === "East"){
				pla.pos[0]++;
			} else if (hit.textContent === "South"){
				pla.pos[1]--;
			} else if (hit.textContent === "West"){
				pla.pos[1]--;
			} 
			
		} else {
			if (hit.textContent === "Use Item"){
				useItem(selectedItem)
			} else if (hit.textContent === "Travel"){
				traveling = true;
				setOptions(travelOptions);
			} else if (hit.textContent === "Scrounge"){
				scrounge();
			} else if (hit.textContent === "Rest"){
				rest();
			} 
		}
	}
	
	
}

var selectedItem = 0;
function itemClick(event){
	var items = document.getElementsByClassName("it");
	var hit = event.target;
	selectedItem = null;
	for (var i = 0; i < items.length; i++){
		console.log(items[i]);
		items[i].parentNode.parentNode.classList.remove("selected");
		if (items[i] == hit && pla.inventory.length > i){
			hit.parentNode.parentNode.classList.add("selected");
			selectedItem = pla.inventory[i];
		}
	}

}

function startGame() {
	getItem(getItemByName("obol"));

	setEncounterImage("yellow_imp");
	optionBox.addEventListener('click', optionClick);
	itemBox.addEventListener('click', itemClick);

	setOptions(currentEncounter.social[currentPage].options);


	setHearts(0, 25);
	setHearts(1, pla.hp);
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


function fadeOutEffect() {
    var fadeTarget = charScreen;
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
	
	fadeOutEffect()
});




