let blueMarker = createMarkerIcon("assets/img/marker_blue.png");
let greenMarker = createMarkerIcon("assets/img/marker_green.png");
let map = new L.Map('map_id');
let markers = {};
initMap();

// set the dimensions and margins of the bar chart
let margin = {top: 20, right: 20, bottom: 110, left: 40};
let width = 550 - margin.left - margin.right;
let height = 250 - margin.top - margin.bottom;

// set the ranges and padding between bars
let x = d3.scaleBand().range([0, width]).padding(0.1);
let y = d3.scaleLinear().range([height, 0]);

let svg1 = initBarChart("#vis_container1");
let svg2 = initBarChart("#vis_container2");

let items = [];
fetchItems();

let dropDown1 = initDropDown("#vis_container1", svg1);
let dropDown2 = initDropDown("#vis_container2", svg2);

fetchProperties();

/**
 *
 * @param container - div container where the bar chart should get added at
 * @returns {Selection<BaseType, any, HTMLElement, any>} - the created bar chart as svg
 */
function initBarChart(container) {
    return d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

/** fill the given bar chart
 * @param property - the property to be shown
 * @param svg - the bar chart to fill
 * @param init - should the axis get initialized
 */
function fillBarChart(property, svg, init) {
    let data = items;
    // select all bars on the graph, take them out, and exit the previous data set.
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
        .attr("height", function(d) { return height - y(parseFloat(d[property])); })
        .attr("id", function(d) { return d.name;})
        .on('mouseover', function() {
            let name = d3.select(this).attr('id');
            highlightBar(name, true);
            highlightMarker(name, true);
        })
        .on('mouseout', function() {
            let name = d3.select(this).attr('id');
            highlightBar(name, false);
            highlightMarker(name, false);
        });

    if (init) {
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
            fillBarChart('id', svg1, true);
            fillBarChart('id',  svg2, true);
            setupMarkers();
            updatePopupTexts('id');
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
            updateProperties(data, dropDown1);
            updateProperties(data, dropDown2);
        }
    });
}

// handle drop down value change
/** @param svg - bar chart that should get updated*/
function dropDownChange(svg) {
    return function() {
        console.log("dropdown change with svg:" + svg);
        let newProperty = d3.select(this).property('value');
        fillBarChart(newProperty, svg, false);
        updatePopupTexts(newProperty);
    }
}

/** create the drop down
 *
 * @param container - the div container where the drop down should get added to
 * @param svg - the bar chart that the drop down should be bound to
 * @returns {Selection<BaseType, any, HTMLElement, any>} - the drop down reference
 */
function initDropDown(container, svg) {
    return d3.select(container)
        .insert("select", "svg")
        .on("change", dropDownChange(svg));
}

/**
 * @param props - the new properties to display
 * @param dropDown - the drop down that should get updated
 */
function updateProperties(props, dropDown) {
    // fill the drop down with our properties as options
    dropDown.selectAll("option")
        .data(props)
        .enter().append("option")
        .attr("value", function (d) { return d; })
        .text(function (d) { return d; });
}

// simple error messages for the ajax requests
function setRequestFeedback(success, status = '') {
    if (success) {
        $('#status_code').html("Request successful " + status).css("background-color", "green");
    } else {
        $('#status_code').html("Request failed with status code: " + status).css("background-color", "red");
    }
}

/**
 * initialize the leaflet map
 */
function initMap() {
    let osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
    let osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 15, attribution: osmAttrib});
    map.setView(new L.LatLng(0, 0), 1);
    map.addLayer(osm);
}

function createMarkerIcon(file) {
    return L.icon({
        iconUrl: file,
        iconSize: [25, 34],
        iconAnchor: [12, 34],
        popupAnchor: [0, -30]
    });
}

function setupMarkers() {
    items.forEach(item => {
        markers[item.name] = L.marker([item.gps_lat, item.gps_long], {icon: blueMarker}).addTo(map);
        markers[item.name]['name'] = item.name;
        markers[item.name]
            .bindPopup("")
            .on('mouseover', function () {
                highlightMarker(this.name, true);
                highlightBar(this.name, true);
            })
            .on('mouseout', function () {
                highlightMarker(this.name, false);
                highlightBar(this.name, false);
            });
    });
}

/**
 * update the popup texts to the last changed dropdown value
 *
 * @param property - new property
 */
function updatePopupTexts(property) {
    items.forEach(item => {
        markers[item.name].setPopupContent("<b>" + item.name + "</b><br>"
            + "property: " + property + "<br>"
            + "value: " + item[property]);
    });
}

function highlightBar(itemName, isHighlight) {
    let bar = d3.selectAll(".bar")
        .filter(function(d) { return d.name === itemName; });
    if (isHighlight) {
        bar.style("fill", "limegreen");
    } else {
        bar.style("fill", "steelblue");
    }
}

function highlightMarker(itemName, isHighlight) {
    if (isHighlight) {
        markers[itemName].setIcon(greenMarker);
    } else {
        markers[itemName].setIcon(blueMarker);
    }
}