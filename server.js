const express = require('express');

const exphbs = require('express-handlebars');
const app = express();
const mongoose = require("mongoose");

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');



app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



require('./routes/html-routes')(app);
require('./routes/api-routes')(app);


mongoose.connect("mongodb://localhost/scrapewithmongo", { useFindAndModify: false });


var PORT = process.env.PORT || 5000;
var server = app.listen(PORT, function () {
    console.log('server on port', PORT);
});