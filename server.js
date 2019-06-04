
var express = require('express');
var exphbs = require('express-handlebars');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');

var app = express();
var port = process.env.PORT || 3000;

var items = require('./itemData'); 
var ghosts = require('./ghostData');

var mongoHost = process.env.MONGO_HOST;
var mongoPort = process.env.MONGO_PORT || 27017;
var mongoUser = process.env.MONGO_USER;
var mongoPassword = process.env.MONGO_PASSWORD;
var mongoDBName = process.env.MONGO_DB_NAME;

var url;/* = 'mongodb://' + mongoUser + ':' + mongoPassword + '@' + mongoHost + ':' + mongoPort + '/' + mongoDBName;*/

/*
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
*/

app.use(express.static('public'));

app.get('app/ghost', getGhost);

app.get('app/item&layer=:level', getItem);

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
	displayDBData();
});

function getGhost(req, res, next) {
	next();
}

function getItem(req, res, next) {
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
}

function syncWithDB(){
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
	shouldUpdate = false;

	if (shouldUpdate) {
		fs.writeFileSync('./itemData.json', JSON.stringify(items)); 
	}
}