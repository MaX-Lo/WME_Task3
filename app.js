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

/* add an item with name and 2 arbitrarily chosen properties */
app.post('/items',function(req,res){
    let item = req.body;

    if (!item.name) {
        res.status(400);
        res.send('Bad request, name is missing');
    } else if (Object.keys(item).length !== 3) {
        res.status(400);
        res.send('Bad request, specify 2 freely chosen properties!')
    }
    // ToDo check for available IDs and assign one (but isn't part of task specification...)
    json.push(item);
    res.end('Added country ' + item.name + ' to list!');
})

/** get all countries with all properties **/
app.get('/items', (req, res) => {
    res.send(json)
});

/** get country, with all properties, by id */
app.get('/items/:id', (req, res) => {
    let id = req.params.id;
    let item = getItem(id);
    if (!item) {
        res.status(400);
        res.send('No such id ' + id + ' in database')
    } else {
        res.send(item);
    }
});

/** get all countries by id in range from id1 to id2 (id1 and id2 inclusive) */
app.get('/items/:id1/:id2', (req, res) => {
    id1 = req.params.id1;
    id2 = req.params.id2;

    if (!getItem(id1) || !getItem(id2)) {
        res.status(400);
        res.send('Range not possible');
    }
    let start = id1;
    let end = id2;
    if (id1 > id2) {
        start = id2;
        end = id1;
    }
    res.send(getItems(start, end));
});

/**
 * @param id - item id, has to match original schema (e.g. 001 instead of 1)
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

/** get all items by id in range from start to end inclusive */
function getItems(start, end) {
    let result = [];
    for (let i = 0; i < json.length; i++){
        let item = json[i];
        for (let key in item){
            if (key === 'id' && item.hasOwnProperty(key) && item[key] >= start && item[key] <= end) {
                result.push(item);
            }
        }
    }
    return result;
}

// DO NOT CHANGE!
// bind server to port
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});