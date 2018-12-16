fetchProperties();
fetchItems();
let items = [];

let map = new L.Map('map_id');
initmap();

// set the dimensions and margins of the graph
let margin = {top: 20, right: 20, bottom: 110, left: 40},
    width = 700 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

// set the ranges
let x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
let y = d3.scaleLinear()
    .range([height, 0]);

// append the svg object to the body of the page
// append a 'group' element to 'svg' and move it to the top left margin
let svg = d3.select("#vis_container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let init = true;
function fillBarChart(property) {
    let data = items;

    // select all bars on the graph, take them out, and exit the previous data set.
    // then you can add/enter the new data set
    let bars = svg.selectAll(".bar")
        .remove()
        .exit()
        .data(data);

    // Scale the range of the data in the domains
    x.domain(data.map(d => d.name));
    y.domain([0, d3.max(data, d => parseFloat(d[property]) )]);

    // append the rectangles for the bar chart
    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.name); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d[property]); })
        .attr("height", function(d) { return height - y(parseFloat(d[property])); });

    if (init) {
        init = false;
        // add the x Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");
        // add the y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y));
    } else {
        // update the y Axis
        svg.select(".y").call(d3.axisLeft(y));
    }
}



// fetch all items with all properties
function fetchItems() {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/items",
        async: true,
        success: function (data) {
            items = data;
            fillBarChart('id');
            fillMarkers('id');
            setRequestFeedback(true);
        }, error: function (jqXHR, text, err) {
            setRequestFeedback(false, jqXHR.status + ", " + jqXHR.responseText)
        }
    });
}

// get all available properties
function fetchProperties() {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/properties",
        async: true,
        success: function (data) {
            // since name is uses on the x axis we don't want it as option for the y axis
            const nameIndex = data.indexOf("name");
            if (nameIndex > -1) {
                data.splice(nameIndex, 1);
            }

            // update the selection with the fetched properties
            updateProperties(data)
        }
    });
}

// handle drop down value change
function dropDownChange() {
    let newProperty = d3.select(this).property('value');
    fillBarChart(newProperty);
    fillMarkers(newProperty);
}

// add the drop down to the selected element
let dropDown = d3.select("#vis_container")
    .insert("select", "svg")
    .on("change", dropDownChange);

function updateProperties(props) {
    // fill the drop down with our properties as options
    dropDown.selectAll("option")
        .data(props)
        .enter().append("option")
        .attr("value", function (d) { return d; })
        .text(function (d) { return d; });
}

function setRequestFeedback(success, status = '') {
    if (success) {
        $('#status_code').html("Request successful " + status).css("background-color", "green");
    } else {
        $('#status_code').html("Request failed with status code: " + status).css("background-color", "red");
    }
}

function initmap() {
    // create the tile layer with correct attribution
    let osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
    let osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 15, attribution: osmAttrib});

    map.setView(new L.LatLng(0, 0), 1);
    map.addLayer(osm);
}

let markers = {};
function fillMarkers(property) {
    // in case the markers aren't initialized yet they need to be created first
    if (Object.keys(markers).length === 0) {
        items.forEach(item => {
            markers[item.name] = L.marker([item.gps_lat, item.gps_long]).addTo(map);
            markers[item.name].bindPopup("");
        });
    }

    items.forEach(item => {
        markers[item.name].setPopupContent("<b>" + item.name + "</b><br>"
            + "property: " + property + "<br>"
            + "value: " + item[property]);
    });
}