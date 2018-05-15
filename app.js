"use strict";
exports.__esModule = true;
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var path = require("path");
// tslint:disable-next-line:no-var-requires
var selectionAlgorithm = require("./src/js/selectionAlgorithm");
var app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/client/dist'));
app.post('/dataProcess', function (req, res) {
    selectionAlgorithm(req.body, function callback(output) {
        console.log('output', output);
        res.send(output);
    });
});
app.get('/', function (req, res) {
    res.send(path.join(__dirname, 'public/dist/index.js'));
});
app.set('port', process.env.PORT || 8080);
var server = app.listen(app.get('port'), function (err) {
    console.log('Listening on port ' + app.get('port'));
});
