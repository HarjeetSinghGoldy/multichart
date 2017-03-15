import {
    Template
} from 'meteor/templating';
import {
    ReactiveVar
} from 'meteor/reactive-var';
import d3 from "d3";
import "d3-zoom";


import './main.html';

Template.hello.onCreated(function helloOnCreated() {
    var zoom = d3.zoom();

    Meteor.call("getData", function(error, result) {
        if (error) {
            console.log("error", error);
        }
        if (result) {

            console.log(data);
            var data = result[0];
            var dataArr = [];

            for (var key in data) {
                var d = {
                    id: key,
                    values: data[key]
                };
                dataArr.push(d);
            }
            drawMultiLine(dataArr);
        }
    });

});

function drawMultiLine(dataArr) {


    console.log(dataArr);
    var svg = d3.select("svg");
    var margin = {
        top: 20,
        right: 80,
        bottom: 30,
        left: 50
    };
    var width = svg.attr("width") - margin.left - margin.right;
    var height = svg.attr("height") - margin.top - margin.bottom;
    var zoom = d3.zoom()
        .scaleExtent([1 / 4, 8])
        .translateExtent([
            [-width, -Infinity],
            [2 * width, Infinity]
        ])
        .on("zoom", zoomed);


    var zoomRect = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all").
        attr("id","zoomarea")
        .call(zoom);
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //  var parseTime = d3.timeParse("%Y%m%d");

    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory20);

    var xExtent = [
        d3.min(dataArr, function(c) {
            return d3.min(c.values, function(d) {
                return d.created_date;
            });
        }),
        d3.max(dataArr, function(c) {
            return d3.max(c.values, function(d) {
                return d.created_date;
            });
        })
    ];

    var yExtent = [
        d3.min(dataArr, function(c) {
            return d3.min(c.values, function(d) {
                return +d.both_hour_visits;
            });
        }),
        d3.max(dataArr, function(c) {
            return d3.max(c.values, function(d) {
                return +d.both_hour_visits;
            });
        })
    ];
    x.domain(xExtent);

    y.domain(yExtent);

    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y);

    var yGroup = g.append("g");

    var xGroup = g.append("g")
        .attr("transform", "translate(0," + height + ")");





    g.selectAll(".clip").data(dataArr)
        .enter()
        .append("clipPath")
        .attr("id", function(d, i) {
            return "clip" + i;
        })
        .attr("class", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);


    var line = d3.line()
        .curve(d3.curveBasis)
        // .x(function(d) {
        //     return x(d.created_date);
        // })
        .y(function(d) {
            return y(+d.both_hour_visits);
        });



    z.domain(dataArr.map(function(c) {
        return c.id;
    }));

    xGroup
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    yGroup
        .attr("class", "axis axis--y")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Visit Counts")

     lookType = g.selectAll(".lookType")
        .data(dataArr)
        .enter().append("g")
        .attr('id',function(d){ return d.id+"-line"; })
        .attr("class", "lookType")



     lookTypePaths= lookType.append("path")
        .attr("class", "line")
          .style("stroke-width",'2.5px')
        .attr("clip-path", function(d, i) {
            return `url(#clip${i})`
        })
        // .attr("d", function(d) {
        //     return line(d.values);
        // })
        .style("stroke", function(d) {
            var c = z(d.id);
            return c;
        });



        lookTypePaths.on("mouseover", function (d) {
          console.log("hello");
              		d3.select(this)                          //on mouseover of each line, give it a nice thick stroke
                	.style("stroke-width",'6px');

                	var selectthegraphs = $('.line').not(this);     //select all the rest of the lines, except the one you are hovering on and drop their opacity
                	d3.selectAll(selectthegraphs)
                		.style("opacity",0.2);

                //	var getname = document.getElementById(d.id);    //use get element cause the ID names have spaces in them
              //  	var selectlegend = $('.legend').not(getname);    //grab all the legend items that match the line you are on, except the one you are hovering on

              //  	d3.selectAll(selectlegend)    // drop opacity on other legend names
                //		.style("opacity",.2);

              //  	d3.select(getname)
              //  		.attr("class", "legend-select");  //change the class on the legend name that corresponds to hovered line to be bolder
            	});

              lookTypePaths.on("mouseout",	function(d) {        //undo everything on the mouseout
        console.log("world");
                d3.select(this)
                  .style("stroke-width",'2.5px');

                var selectthegraphs = $('.line').not(this);
                d3.selectAll(selectthegraphs)
                  .style("opacity",1);

            //    var getname = document.getElementById(d.name);
            //    var getname2= $('.legend[fakeclass="fakelegend"]')
            //    var selectlegend = $('.legend').not(getname2).not(getname);

            //    d3.selectAll(selectlegend)
            //      .style("opacity",1);

              //  d3.select(getname)
              //    .attr("class", "legend");
            });





    zoom.translateExtent([
        [x(xExtent[0]), -Infinity],
        [x(xExtent[1]), Infinity]
    ])
    zoomRect.call(zoom.transform, d3.zoomIdentity); // initial call to zoom otherwise lines will not be drawn

    lookType.append("text")
        .datum(function(d) {
            return {
                id: d.id,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("transform", function(d) {
            return "translate(" + x(d.value.created_date) + "," + y(d.value.both_hour_visits) + ")";
        })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function(d) {
            return d.id;
        });


    function zoomed() {
        xz = d3.event.transform.rescaleX(x);
        xGroup.call(xAxis.scale(xz));
        g.selectAll(".lookType path").attr("d", function(d) {
            line.x(function(dd) {
                return xz(dd.created_date);
            });
            return line(d.values)

        })
    }


}
