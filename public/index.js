
var pla = {
	hp: 6,
	maxHp: 6,
	items: [],
	statuses: {}
};

var maxHealth = 82; //Screen limitation


var baseOptions = ["Travel", "Scrounge", "Rest", "Use Item"];
var travelOptions = ["North", "East", "South", "West", "Back"];

var testEncounter = {
	social: {
		"0": {
			text: "HELLO THERE!",
			onStart: {
				"name" : "none",
				"args" : []
			},
			options: ["1", "2"],
			optionRes: ["1", "2"]
		},
		"1": {
			text: "HELLO?",
			options: ["0", "2"],
			optionRes: ["0", "2"]
		},
		"2": {
			text: "Goodbye!",
			options: ["0", "1"],
			optionRes: ["0", "1"]
		}
		
	}
	
};



var currentEncounter = testEncounter;
var currentPage = "0";


var textBox = document.getElementById("text-zone");
var optionBox =document.getElementById("options");

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

function setArea(a){
	var encounterBox = document.getElementById("encounter-disp");
	console.log(encounterBox);
	encounterBox.innerHTML = "<img src=\"images/"+ a.name + ".png\">";
	
}

function renderInventory(inven){
	var slots = document.getElementsClassName("item");
	for (var i = 0; i < slots.length; i++){
		slots[i].childNodes[0].innerHTML = "<img src=\""+ inven[i].tex + ".png\">";
	}
	
	var tips = document.getElementsClassName("tooltip");
	for (var i = 0; i < slots.length; i++){
		tips[i].textContent = inven[i].desc;
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



function runOnPage(command){
	if (command.name === "damagePlayer"){
		pla.hp -= command.args[0]
	}
	
}

function endEncounter(){
	currentEncounter = null;
	setOptions(baseOptions);
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
				if (currentEncounter.social[currentPage].onStart) runOnPage(currentEncounter.social[currentPage].onStart);
				doGameTurn();
				//setText
				setText(currentEncounter.social[currentPage].text)
				//set options
				setOptions(currentEncounter.social[currentPage].options)
			}
			
		} else if (traveling){
			if (hit.textContent === "Back"){
				traveling = false;
				setOptions(baseOptions)
				
			} else if (hit.textContent === "North"){
				
			} else if (hit.textContent === "East"){
				
			} else if (hit.textContent === "South"){
				
			} else if (hit.textContent === "West"){
				
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

optionBox.addEventListener('click', optionClick);

setOptions(currentEncounter.social[currentPage].options);

setArea({name : "magma_deamon"});
setHearts(0, 9);


