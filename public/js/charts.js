
////////////////////////////////////////////////////        
// Load google charts
//

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(chart1);
google.charts.setOnLoadCallback(chart2);
google.charts.setOnLoadCallback(chart3);


// Draw the chart and set the chart values
function chart1() {
var data = google.visualization.arrayToDataTable([
['StockStatusCount', 'count'],
['Raktáron' , inStockCount ],
['Nincs raktáron', notInStockCount],
]);

// Optional; add a title and set the width and height of the chart
var options = {'pieHole': 0.4};

// Display the chart inside the <div> element with id="piechart"
var chart = new google.visualization.PieChart(document.getElementById('piechart'));
chart.draw(data, options);
}

//masodik chart
function chart2() {
    
    var chartData = [['NumberOfEvents', 'Műveletek száma']];
    for(i=0; i < eventCounts.length;i++){
        chartData[i + 1] = [eventCounts[i].date, eventCounts[i].eventnum]; 
    }
    var data = google.visualization.arrayToDataTable(chartData);

    // Optional; add a title and set the width and height of the chart
    var options = {};
    
    // Display the chart inside the <div> element with id="piechart"
    var chart = new google.visualization.ColumnChart(document.getElementById('barchart'));
    chart.draw(data, options);
}

//harmadik chart
function chart3() {
    var chartData = [['datum', 'muneszilvi','ordogerika','kovacskatalin']];
    for(i=0; i < eventStats.length;i++){
        chartData[i + 1] = [eventStats[i].nap,eventStats[i].muneszilvi,eventStats[i].ordogerika,eventStats[i].kovacskatalin]; 
    }
    var data = google.visualization.arrayToDataTable(chartData);

    // Optional; add a title and set the width and height of the chart
    var options = {};
    
    // Display the chart inside the <div> element with id="piechart"
    var chart = new google.visualization.ColumnChart(document.getElementById('barchart2'));
    chart.draw(data, options);
   
    // Optional; add a title and set the width and height of the chart
    var options = {
               title : 'Felhasználói műveletek napi bontásban',
               vAxis: {title: 'Műveletek'},
               hAxis: {title: 'Dátum'},
               seriesType: 'bars'
            };

}
