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
    // ToDo check if properties already exist, if not return bad request --- depends on what is meant by '2 arbitrarily props...'
    } else if (Object.keys(item).length !== 3) {
        res.status(400);
        res.send('Bad request, specify 2 freely chosen properties!')
    }
    item.id = getFreeId();
    console.log("added item with id " + item.id);
    json.push(item);
    res.end('Added country ' + item.name + ' to list!');
});

/** get all countries with all properties **/
app.get('/items', (req, res) => {
    res.send(json)
});

/** get country, with all properties, by id */
app.get('/items/:id', (req, res) => {
    let id = req.params.id;
    // converting to int and str ensures correctly formatted ids e.g 04 or 4  will result always in 004 that way
    let item = getItem(toStringId(toIntId(id)));
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

    if (!getItem(toStringId(toIntId(id1))) || !getItem(toStringId(toIntId(id2)))) {
        res.status(400);
        res.send('Range not possible');
    }
    let start = toStringId(toIntId(id1));
    let end = toStringId(toIntId(id2));
    if (start > end) {
        let tmp = start;
        start = end;
        end = tmp;
    }
    console.log(start + '  ' + end);
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

/* convert integer id as string formatted as 'xxx'*/
function toStringId(intID) {
    let id = intID.toString();
    if (id.length === 1) {
        id = '00' + id;
    } else if (id.length === 2) {
        id = '0' + id;
    }
    return id;
}

/* string id to integer id */
function toIntId(strID) {
    return parseInt(strID);
}

/* get next free id as string formated as 'xxx'*/
function getFreeId() {
    let id;
    let testing = 1;
    while (getItem(toStringId(testing))) {
        testing += 1;
    }
    return toStringId(testing);
}

// DO NOT CHANGE!
// bind server to port
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});