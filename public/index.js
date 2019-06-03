
var pla = {
	hp: 100,
	items: [],
	statuses: {}
}


function useItem(item, target) {
	if (item.dmg && target.hp) {
		target.hp -= item.dmg;
	}
	if (item.regen && target.statuses) {
		target.statuses.regenSources.push(item.regen);
	}
}

function doGameTurn(target) {
	effectUpdate(target);
	if (target.hp <= 0) {
		if (target.statuses.undying == true) {
			target.hp = 0;
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
		effect.duration -= 1;
	}
}

