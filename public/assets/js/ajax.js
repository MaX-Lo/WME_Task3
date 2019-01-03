// "function()" guaranties that functions inside get not executed before the document finished loading
$(function(){
    // filling the table with all data by default
    fetchItems();

    $('#country_filter').on('submit', function(event) {
        event.preventDefault();
        const filter_id = $("#country_filter_id").val();
        const id_range = $('#country_filter_range').val();

        if (id_range !== "") {
            const iDs = parseRangeString(id_range);
            const startID = iDs[0];
            const endID = iDs[1];
            //Todo extract start and end from range string
            fetchItemsByRange(startID, endID);
            return
        }

        if (filter_id !== "") {
            fetchItemByID(filter_id);
            return;
        }

        alert("Please specify an ID or range.");
    });

    $('#country_add').on('submit', function (event) {
        event.preventDefault();
        let item = {};
        item['name'] = $('#country_name').val();
        item['birth_rate_per_1000'] = $('#country_birth').val();
        item['cell_phones_per_100'] = $('#country_cellphone').val();
        addItem(item)
    });

    $('#country_delete').on('submit', function (event) {
        event.preventDefault();
        const id = $('#country_delete_id').val();
        deleteItem(id);
    })
});

// extract start and end id from raw range input string
function parseRangeString(rangeString) {
    var pos = rangeString.indexOf("-");
    if (pos === -1) {
        pos = rangeString.indexOf(",");
    }
    if (pos === -1) {
        pos = rangeString.indexOf(";");
    }
    if (pos === -1) {
        alert("invalid range given! Valid range formats are: 1) id1-id2   2) id1,id2   3) id1;id2. Fetching all items up to given id.")
    }
    console.log(pos);
    const start = rangeString.slice(0, pos);
    const end = rangeString.slice(pos+1, rangeString.length);
    console.log("start:" + start + " end " + end);
    return [start, end];
}

// fetch all items with all properties
function fetchItems() {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/items",
        async: true,
        success: function (data) {
            onReceivedItems(data);
            setRequestFeedback(true);
        }, error: function (jqXHR, text, err) {
            setRequestFeedback(false, jqXHR.status + ", " + jqXHR.responseText)
        }
    });
}

/**
 * fills the table with the given items
 *
  * @param items - array of items
 */
function onReceivedItems(items) {
    console.log("got items:");
    console.log(items);
    let txt = "";
    for (let i in items) {
        item =items[i];
        // assuming only data columns from the template are relevant
        txt += "<tr>"
            + "<td>" + item.id + "</td>"
            + "<td>" + item.name + "</td>"
            + "<td>" + item.birth_rate_per_1000 + "</td>"
            + "<td>" + item.cell_phones_per_100 + "</td>"
            + "<td>" + item.children_per_woman + "</td>"
            + "<td>" + item.electricity_consumption_per_capita + "</td>"
            + "<td>" + item.internet_user_per_100 + "</td>"
            + "</tr>";
    }
    $("#table_body").html(txt);
}

function fetchItemByID(id) {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/items/"+id,
        async: true,
        success: function (data) {
            onReceivedItems([data]);
            setRequestFeedback(true);
        }, error: function (jqXHR, textStatus, errorThrown) {
            setRequestFeedback(false, jqXHR.status + ", " + jqXHR.responseText)
        }
    });
}

function fetchItemsByRange(startID, endID) {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/items/" + startID + "/" + endID,
        async: true,
        success: function (data) {
            onReceivedItems(data);
            setRequestFeedback(true);
        }, error: function (jqXHR, textStatus, errorThrown) {
            setRequestFeedback(false, jqXHR.status + ", " + jqXHR.responseText);
        }
    });
}

function addItem(item) {
    let data = JSON.stringify(item);

    $.ajax({
        url: 'http://localhost:3000/items',
        type: 'POST',
        contentType: 'application/json',
        data: data,
        dataType: 'json',
        async: true,
        success: function(data) {
            setRequestFeedback(true);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            setRequestFeedback(false, jqXHR.status + ", " + jqXHR.responseText);
        }
    });

    fetchItems();
}

function deleteItem(id) {
    $.ajax({
        url: 'http://localhost:3000/items/' + id,
        type: 'DELETE',
        async: true,
        success: function(data) {
            fetchItems();
            setRequestFeedback(true);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            setRequestFeedback(false, jqXHR.status + ", " + jqXHR.responseText);
        }
    });
}

// provides feedback for the user whether the request was successful and if not what went wrong
function setRequestFeedback(success, status = '') {
    if (success) {
        $('#status_code').html("Request successful " + status).css("background-color", "green");
    } else {
        $('#status_code').html("Request failed with status code: " + status).css("background-color", "red");
    }
}

// Properties into selection
function fetchProperties() {
    $.ajax({                                      //get prooperties from REST-API
        type: "GET",
        url: "http://localhost:3000/properties",
        async: true,
        success: function (data) {
          propertiesToOptions(data);
        }
    });
}

function propertiesToOptions(data){
  var options = '';
  for (var i = 0; i < data.length; i++){    //go through all properties of array
    options += '<option value="'+ i+1+'">'+data[i]+'</option>'  //turn into string of properties as html options of select
  }
$("#prop_selection").append(options);     	//add to select "prop_selections"
}
