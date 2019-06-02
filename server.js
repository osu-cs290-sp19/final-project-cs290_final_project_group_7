
var express = require('express');
var exphbs = require('express-handlebars');

var app = express();
var port = process.env.PORT || 3000;

/*var data = require('./data'); /*must be `data.json` file, maybe use for persistant data...*/
/*
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
*/

app.use(express.static('public'));

app.listen(port, function () {
  console.log("== Server is listening on port", port);
});
