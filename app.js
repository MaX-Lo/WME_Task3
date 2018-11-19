// DO NOT CHANGE!  - why not?
//init app with express, util, body-parser, csv2json
var express = require('express');
var app = express();
var sys = require('util');
var path = require('path');
var bodyParser = require('body-parser');
var Converter = require("csvtojson").Converter;

//register body-parser to handle json from res / req
app.use( bodyParser.json() );

//register public dir to serve static files (html, css, js)
app.use( express.static( path.join(__dirname, "public") ) );

// END DO NOT CHANGE!

/**************************************************************************
 ****************************** csv2json *********************************
 **************************************************************************/
let json;
converter = new Converter({});
converter.fromFile('world_data.csv')
    .then((jsonObj)=>{
        json = jsonObj;
    });

/**************************************************************************
********************** handle HTTP METHODS ***********************
**************************************************************************/

/** get all countries with all properties **/
app.get('/items', (req, res) => {
    res.send(json)
});

/** get country, with all properties, by id */
app.get('/items/:id', (req, res) => {
    let item = getItem(req.params.id);
    if (!item) {
        res.send('No such id ' + req.params.id + ' in database')
    } else {
        res.send(item);
    }
});

/**
 * @param id - item id, has to match original schema (e.g. 001 for instead of 1)
 * @returns matching item, if none exists null
 */
function getItem(id) {
    for (let i = 0; i < json.length; i++){
        let item = json[i];
        for (let key in item){
            if (key === 'id' && item.hasOwnProperty(key) && item[key] === id) {
                return item;
            }
        }
    }
    return null;
}

// DO NOT CHANGE!
// bind server to port
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});