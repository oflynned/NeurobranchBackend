/** Defineing the size of the graph , with margins ,height and width*/
var margin = {top: 20, right: 10, bottom: 100, left: 40};
var width = 700- margin.right - margin.left;
var height = 500 - margin.top - margin.bottom;

/**
 * defining svg
* g element is used as container for grouping objects
*
*/

var svg = d3.select('body')
            append('svg')
            .attr({
                "width": width + margin.right + margin.left,
                "height": height + margin.top + margin.bottom
            })
                .append('g')
                    .attr("transform", "translate(" + margin.left + ',' + margin.right + ')');

/**
 * defining x and y axes
 * defining x and y scales
 *
 */
var xScale = d3.scale.oridnal()
    .rangeRoundBands([0,width], 0.2 0.2);

var yScale = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

/**
 *importing the csv data
 *
 */

 d3.csv("gdp.csv", function (error, data) {
     if(error) console.log("NOOOO data");


     data.forEach(function (d) {
        d.usr = +d.usr;
         d.months = d.months;
         console.log(d.usr);
     });
     
     data.sort(function (a,b) {
        return b.usr - a.usr; 
     });
     /**
      *
      * specifiing the area of x and y scales
      * */
     xScale.domain(data.map(function (d) {return d.months;}));
     yScale.domain([0,d3.max(data, function (d) {return d.usr;}) ] );
     /**
      * drawing the bars in the bar graph
      *
      * */
     svg.selectAll('rect').data(data).enter().append('rect').attr({
         'x': function (d) {return xScale(d.months);},
         'y': function (d) {return yScale(d.usr);},
         'width': xScale.rangeBand(),
         'height': function (d) {return height - yScale(d.usr);}
     });
     /**
      * drawing x Axis
      */
     svg.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(0,)"+height+")")
         .call(xAxis);
 });