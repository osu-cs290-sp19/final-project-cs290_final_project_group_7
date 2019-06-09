
var express = require('express');
var exphbs = require('express-handlebars');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');

var app = express();
var port = process.env.PORT || 3000;

var items;// = require('./itemData'); 
var ghosts;// = require('./ghostData');
var enems = require('./enemData.json');

var mongoHost = process.env.MONGO_HOST || "classmongo.engr.oregonstate.edu";
var mongoPort = process.env.MONGO_PORT || 27017;
var mongoUser = process.env.MONGO_USER || process.env.MONGO_DB_NAME || "cs290_schaeflz";
var mongoPassword = process.env.MONGO_PASSWORD;
var mongoDBName = process.env.MONGO_DB_NAME || process.env.MONGO_USER || "cs290_schaeflz";

var url = 'mongodb://' + mongoUser + ':' + mongoPassword + '@' + mongoHost + ':' + mongoPort + '/' + mongoDBName;
console.log("=== URL:", url);

/*
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
*/

app.use(express.static('public'));

app.get('app/ghost&layer=:level', getGhost);

app.get('app/item&layer=:level', getItem);

app.get('app/enem&layer=:level', getEnem)

var db;
MongoClient.connect(url, function(err, client) {
	if (err) {
		throw err;
	}
	db = client.db("cs290_schaeflz");

	app.listen(port, function () {
	  console.log("== Server is listening on port", port);
	});

	// syncWithDB();
	getCollections();
	displayDBData();
	console.log(db.collection('enemData').find());
});

function getGhost(req, res, next) {
	var level = req.params.level >= 0 ? (req.params.level <= 10 ? 10 : req.params.level) : 0;
	var ghostGot;
	var potentialGhosts = [];

	for (var i in ghost) {
		if (ghosts[i].layer == level) {
			potentialGhosts.push(ghosts[i]);
		}
	}
	if (potentialGhosts.length > 0) ghostGot = ghosts[randInt(0, potentialGhosts.length - 1)];
	if (ghostGot)
		res.status(200).send(JSON.stringify(ghostGot));
	else
		res.status(500).send("No ghost found for this level.");
}

function getItem(req, res, next) {
	var level = req.params.level >= 0 ? (req.params.level <= 10 ? 10 : req.params.level) : 0; 
	var itemGot;
	var totalWeight = 0;
	for (i in Object.keys(items)) {
		totalWeight+= items.i.weight[req.params.level];
	}
	var point = randInt(0, totalWeight);
	for (i in Objects.keys(items)) {
		if (point - items.i.weight[req.params.level] <= 0) {
			itemGot = i;
		} else {
			point -= items.i.weight[req.params.level];
		}
	}
	if (itemGot)
		res.status(200).send(JSON.stringify(itemGot));
	else 
		res.status(500).send("Item selection was unsuccessful.");
}

function getEnem(req, res, next) {
	var level = req.params.level >= 0 ? (req.params.level <= 10 ? 10 : req.params.level) : 0;
	var enemGot;
	var potentialEnems = [];

	for (var i in enems) {
		if (enems[i].levelAvail[level]) {
			potentialEnems.push(enems[i]);
		}
	}
	if (potentialEnems.length > 0) enemGot = enems[randInt(0, potentialEnems.length - 1)];
	if (enemGot)
		res.status(200).send(JSON.stringify(enemGot));
	else
		res.status(500).send("No enemy found for this level.");
}

function randInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function displayDBData() {
	console.log(db);
	db.collection("itemData").find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var i in temp) {
			console.log(temp[i]);
		}
	});

	db.collection("ghostData").find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var i in temp) {
			console.log(temp[i]);
		}
	});

	db.collection("enemData").find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var i in temp) {
			console.log(temp[i]);
		}
	});
}

function getCollections() {
	ghosts = [];
	items = [];
	enems = [];

	db.collection("ghostData").find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var g in temp) {
			ghosts.push(temp[g]);
		}
	});

	db.collection("itemData").find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var g in temp) {
			items.push(temp[g]);
		}
	});
	
	db.collection("enemData").find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var g in temp) {
			enems.push(temp[g]);
		}
	});
}

function syncWithDB(){
	//ghosts updating
	for (var g in ghosts) {
		db.collection("ghostData").deleteMany(ghosts[g]);
	}
	var shouldUpdate = false;
	db.collection("ghostData").find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var g in temp) {
			console.log(i + ": Adding new ghost from db...\n" + temp[g]);
			ghosts.push(temp[g]);
			shouldUpdate = true;
		}
	});

	db.collection("ghostData").insertMany(ghosts);

	if (shouldUpdate) {
		fs.writeFileSync('./ghostData.json', JSON.stringify(ghosts));
		shouldUpdate = false;
	}

	//items updating
	for (var i in items) {
		db.collection("itemData").deleteMany(items[i]);
	}
	db.collection("itemData").find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var i in temp) {
			console.log(i + ": Adding new item from db...\n" + temp[i]);
			items.push(temp[i]);
			shouldUpdate = true;
		}
	});
	db.collection("itemData").insertMany(items);

	if (shouldUpdate) {
		fs.writeFileSync('./itemData.json', JSON.stringify(items)); 
		shouldUpdate = false;
	}

	//enems updating
	for (var i in enems) {
		db.collection("enemData").deleteMany(enems[i]);
	}
	db.collection("enemData").find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var i in temp) {
			console.log(i + ": Adding new item from db...\n" + temp[i]);
			enems.push(temp[i]);
			shouldUpdate = true;
		}
	});
	db.collection("enemData").insertMany(enems);

	if (shouldUpdate) {
		fs.writeFileSync('./enemData.json', JSON.stringify(enems)); 
		shouldUpdate = false;
	}
}