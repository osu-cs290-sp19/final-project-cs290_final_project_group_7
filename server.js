
var express = require('express');
var exphbs = require('express-handlebars');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 3000;

var items;// = require('./itemData'); 
var ghosts;// = require('./ghostData');
var encs;// = require('./encData.json');

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
app.use(bodyParser.json());

var db;
MongoClient.connect(url, function(err, client) {
	if (err) {
		throw err;
	}
	db = client.db("cs290_schaeflz");

	app.listen(port, function () {
	  console.log("== Server is listening on port", port);
	});

	syncWithDB();
	//getCollections();
	displayDBData();
	console.log(db.collection('encData').find());
});

function getGhost(req, res, next) {
	if (req.params.area == 'all'){
		res.status(200).send(JSON.stringify(ghosts));
	} else {
		console.log("area in:", req.params.area);
		var area = req.params.area >= 0 ? (req.params.area >= 4 ? 4 : req.params.area) : 0;
		console.log("effective area:", req.params.area);
		var ghostGot;
		var potentialGhosts = [];

		for (var i in ghosts) {
			if (ghosts[i].locale == area) {
				potentialGhosts.push(ghosts[i]);
			}
		}
		if (potentialGhosts.length > 0) ghostGot = ghosts[randInt(0, potentialGhosts.length - 1)];
		if (ghostGot)
			res.status(200).send(JSON.stringify(ghostGot));
		else
			res.status(500).send("No ghost found for this area.");
	}
}

function getItem(req, res, next) {
	if(req.params.area == 'all') {
		res.status(200).send(JSON.stringify(items));
	} else {
		console.log("getting item...");
		console.log("area in:", req.params.area);
		var area = req.params.area >= 0 ? (req.params.area >= 4 ? 4 : req.params.area) : 0;
		console.log("effective area:", req.params.area);
		var itemGot;
		var totalWeight = 0;
		for (i in items) {
			totalWeight += items[i].weight[area];
			console.log("weight: " + totalWeight, "item added: " + items[i].name);
		}
		var point = randInt(0, totalWeight);
		for (i in Object.keys(items)) {
			if (point - items[i].weight[area] <= 0) {
				itemGot = items[i];
			} else {
				point -= items[i].weight[area];
			}
		}
		if (itemGot){
			console.log(itemGot);
			res.status(200).send(JSON.stringify(itemGot));
		}
			
		else 
			res.status(500).send("Item selection was unsuccessful.");
	}
}

function getEnc(req, res, next) {
	if (req.params.area == 'all') {
		res.status(200).send(JSON.stringify(encs));
	} else {
		var area = req.params.area >= 0 ? (req.params.area <= 4 ? 4 : req.params.area) : 0;
		var encGot;
		var potentialEncs = [];

		for (var i in encs) {
			if (encs[i].areaAvail[area]) {
				potentialEncs.push(encs[i]);
			}
		}
		if (potentialEncs.length > 0) encGot = encs[randInt(0, potentialEncs.length - 1)];
		if (encGot)
			res.status(200).send(JSON.stringify(encGot));
		else
			res.status(500).send("No ency found for this area.");
	}
}

function makeNewGhost(req, res, next) {
	var area = req.params.area >= 0 ? (req.params.area <= 4 ? 4 : req.params.area) : 0;
	var body = req.body;
	if (body.name && body.hp && body.items && body.aggression && body.hospitality
		&& body.tex1 && body.tex2){

		var newGhost = {
			"name": body.name,
			"stats": {
				"hp": body.hp,
				"items": body.items
			},
			"aggression": body.aggression,
			"hospitality": body.hospitality,
			"texture": [body.tex1, body.tex2]
		};

		db.collection('ghostData').insertOne(newGhost);
		ghostSync();
		res.status(200).send("Success.");
	} else {
		res.status(400).send("Ghost could not be made, likely missing fields.");
	}
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

	db.collection("encData").find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var i in temp) {
			console.log(temp[i]);
		}
	});
}

function getCollections() {
	ghosts = [];
	items = [];
	encs = [];

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
	
	db.collection("encData").find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var g in temp) {
			encs.push(temp[g]);
		}
	});
}

function syncWithDB(syncGhosts = true, syncItems = true, syncEncs = true) {
	if (syncGhosts) ghostSync();
	if (syncItems) itemSync();
	if (syncEncs) encSync();
}

function ghostSync() {
	ghosts = require('./ghostData');
	for (var g in ghosts) {
		db.collection('ghostData').deleteMany({'_id': ghosts[g]._id});
		db.collection("ghostData").insertOne(ghosts[g]);
	}
	ghosts = [];

	db.collection('ghostData').find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var g in temp) ghosts.push(temp[g]);
	});
}

function itemSync() {
	items = require('./itemData');
	for (var i in items) {
		db.collection('itemData').deleteMany({'texture': items[i].texture});
		db.collection("itemData").insertOne(items[i]);
	}
	items = [];

	db.collection('itemData').find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var i in temp) items.push(temp[i]);
	});
}

function encSync() {
	encs = require('./encData');
	for (var e in encs) {
		db.collection('encData').deleteMany({'texture': encs[e].texture});
		db.collection("encData").insertOne(encs[e]);
	}
	encs = [];

	db.collection('encData').find().toArray(function(err, temp) {
		assert.equal(err, null);
		for (var e in temp) encs.push(temp[e]);
	});
}

app.get('*', function(res, req,next) {
	console.log("got a request!");
	console.log(req.body, req.params);
	next();
});

app.get('/app/ghost/:area', getGhost);

//hey, uh, gimme all da items, not one, thx
app.get('/app/item/:area', getItem);

app.get('/app/enc/:area', getEnc);

app.post('/app/ghost/make/:area', makeNewGhost);

app.use(express.static('public'));


app.get('*', function(req,res) {
	console.log("got a bad request here." , req.url);
	res.status(404).send("whoops");
});