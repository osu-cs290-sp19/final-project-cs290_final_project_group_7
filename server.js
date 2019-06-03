
var express = require('express');
var exphbs = require('express-handlebars');

var app = express();
var port = process.env.PORT || 3000;

var items = require('./itemData'); 
var ghosts = require('./ghostData');

/*
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
*/

app.use(express.static('public'));

app.get('app/ghost', getGhost);

app.get('app/item&layer=:level', getItem);

app.listen(port, function () {
  console.log("== Server is listening on port", port);
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