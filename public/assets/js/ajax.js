// "function()" guaranties that functions inside get not executed before the document finished loading
$(function(){
    // filling the table with all data by default
    fetchItems();

    // if both id and range are given, the id gets prioritized since it's more specific
    $('#country_filter').on('submit', function(event) {
        event.preventDefault();
        const filter_id = $("#country_filter_id").val();
        if (filter_id !== "") {
            fetchItemByID(filter_id);
            return;
        }
        const id_range = $('#country_filter_range').val();
        if (id_range !== "") {
            const startID = "1";
            const endID = "2";
            //Todo extract start and end from range string
            fetchItemsByRange(startID, endID);
            return
        }
        alert("Please specify an ID or range.");
    });
});

// fetch all items with all properties
function fetchItems() {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/items",
        async: true,
        success: function (data) {
            onReceivedItems(data);
        }, error: function (jqXHR, text, err) {
            console.log("Error, fetching all items")
        }
    });
}

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
            onReceivedItems(data);
        }, error: function (jqXHR, textStatus, errorThrown) {
            // todo Handle error if occurred e.g. no such item with id xxx
            console.log('err');
        }
    });
}

function fetchItemsByRange(startID, endID) {
    // Todo
}