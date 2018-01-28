
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
    /*
    var data = google.visualization.arrayToDataTable([
    ['NumberOfEvents', 'Műveletek száma'],
    ['Raktáron: ' +inStockCount+' db .', inStockCount ],
    ['Nincs raktáron: '+notInStockCount+' db .', notInStockCount],
    ]);
    */
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
    /*
    var data = google.visualization.arrayToDataTable([
        ['Nap', 'User1', 'User2', 'User3'],
        ['2017-01-22',  10,6,8],
        ['2017-01-20',  1,8,4],
        ['2017-01-18',  1,1,2],
        ['2017-01-16',  2,4,2]

     ]);

    for(i=0; i < eventStats.length;i++){
        chartData[i + 1] = [eventStats[i].nap, eventStats[i].db];
    }
    var data = google.visualization.arrayToDataTable(chartData);
    */
    // Define the chart to be drawn.
            var data = new google.visualization.DataTable();
                data.addColumn('string', 'Datum');
                for(i=0; i < eventStats.length;i++){

                    data.addColumn('string', eventStats[i].username);
                    data.addRows([
               [eventStats[i].nap,  2,4,0],
            ]);
    }
    // Optional; add a title and set the width and height of the chart
    var options = {
               title : 'Felhasználói műveletek napi bontásban',
               vAxis: {title: 'Műveletek'},
               hAxis: {title: 'Dátum'},
               seriesType: 'bars'
            };


    // Display the chart inside the <div> element with id="piechart"
    var chart = new google.visualization.ColumnChart(document.getElementById('barchart2'));
    chart.draw(data, options);
}
