"use strict";
exports.__esModule = true;
var express = require("express");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bodyParser = require("body-parser");
var cors = require("cors");
var path = require("path");
// tslint:disable-next-line:no-var-requires
var selectionAlgorithm = require("./src/js/selectionAlgorithm");
mongoose.connect('mongodb://userhelper:userhelper@ds129540.mlab.com:29540/help-me-to-choose', function (err) {
    if (err) {
        console.log('Could NOT connect to database: ', err);
    }
    else {
        console.log('Connected to database');
    }
});
var schema = new Schema({
    rawData: [
        {
            priority: Number,
            name: String,
            rankGroup: [
                {
                    rank: Number,
                    name: String
                }
            ]
        }
    ],
    resultData: [
        {
            totalRank: Number,
            name: String
        }
    ],
    date: { type: Date, "default": Date.now }
});
var ResultData = mongoose.model('ResultData', schema);
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/client/dist'));
app.post('/dataProcess', function (req, res) {
    selectionAlgorithm(req.body, function callback(output) {
        var result = new ResultData({
            rawData: req.body,
            resultData: output
        });
        result.save();
        res.send(output);
    });
});
app.get('/', function (req, res) {
    res.send(path.join(__dirname, 'public/dist/index.js'));
});
app.set('port', process.env.PORT || 8080);
app.listen(app.get('port'), function (err) {
    console.log('Listening on port ' + app.get('port'));
});
