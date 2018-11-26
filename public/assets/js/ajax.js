fetchItems();

function fetchItems() {
    alert("fetch items");
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/items",
        async: true,
        success: function (data) {
            onReceivedItems(data);
        }, error: function (jqXHR, text, err) {
            // Handle error if occurred
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