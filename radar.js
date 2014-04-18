// radar.js
// A simple utility for drawing static radar charts using D3.
//
// Author: Nick Armstrong
// Last Update: 04.17.2014
// Version: 0.2
//
// Many thanks to Stephen Few, Clint Ivy, Jamie Love, and Jason Davies
// for their work on bullets.js, which heavily influenced the design
// of this script.
// A copy of bullets.js can be found here: http://bl.ocks.org/mbostock/4061961

(function() {

  d3.radar = function() {
    var
      // SVG sizing data
      width = 300,
      height = 300,
      center = [150, 150],
      // Calculation data
      radius = 120,
      radians,
      labelOffset = 15;
      pathdata = [],
      // Formatting data
      drawAxes = true,
      drawLabels = true,
      drawQuadrants = true,
      drawPoints = true,
      selectable = true;

    var pathFunction = d3.svg.line()
      .x(function(d){ return d.x; })
      .y(function(d){ return d.y; })
      .interpolate("linear");

    function chart(g) {
      g.each(function(d, i) {

        // Generate scale for drawing axis and datapoint - bind to element.
        var scale = d3.scale.linear()
          .domain([lowerRange(d), upperRange(d)])
          .range([0, radius]);
        d.scale = scale;

        // Draw axis for current element
        if(drawAxes) {
          var axis = axisCoords(d, i);
          d3.select(this).append("line")
            .attr({
              "x1" : axis[0],
              "y1" : axis[1],
              "x2" : axis[2],
              "y2" : axis[3],
              "class" : "axis"
            });
        }

        // Draw label for current element
        if(drawLabels) {
          var label = labelVals(d, i);
          d3.select(this).append("text")
            .attr({
              "dy" : "0.5ex",
              "class" : "label",
              "text-anchor" : "middle",
              "x" : label[0],
              "y" : label[1]
            })
            .text(label[2]);
        }

        // Add datapoints to pathdata - bind to element
        var coordinates = pointCoords(d, i);
        pathdata.push({"x" : coordinates[0], "y" : coordinates[1]});
        d.coordinates = coordinates;

      });

      var svg = d3.select(g[0].parentNode)

      if(drawQuadrants) {
        var quadrants = [1/4, 2/4, 3/4, 1];
        svg.selectAll(".quadrant")
            .data(quadrants)
          .enter().append("circle")
            .attr({
              "class" : "quadrant",
              "cx" : center[0],
              "cy" : center[1],
              "r" : function(d){ return d * radius; },
            });
      }

      svg.append("path")
          .attr({
            "d" : pathFunction(pathdata) + "Z",
            "class" : "graph"
          });

      if(drawPoints) {
        g.each(function(d, i) {

          var point = d3.select(this).append("circle")
            .attr({
              "cx" : d.coordinates[0],
              "cy" : d.coordinates[1],
              "r" : radius / 20,
              "class" : "datapoint"
            });

          if(selectable) {

            point.on("mouseover", function(){
                var hovered = point;
                d3.selectAll(".datapoint")
                    .each(function(){
                      var crnt = d3.select(this);
                      if(crnt.datum() === hovered.datum() && !crnt.classed("datapoint selected"))
                        crnt.attr("class", "datapoint hover");
                      else if(!crnt.classed("datapoint selected"))
                        crnt.attr("class", "datapoint");
                    })
              })
              .on("mouseout", function(){
                d3.selectAll(".datapoint")
                    .each(function(){
                      if(!d3.select(this).classed("datapoint selected"))
                        d3.select(this).attr("class", "datapoint");
                    })
              })
              .on("click", function(){
                var selected = d3.select(this);
                d3.selectAll(".datapoint")
                    .each(function(){
                      var crnt = d3.select(this);
                      if(crnt.datum() === selected.datum())
                        crnt.attr("class", "datapoint selected");
                      else
                        crnt.attr("class", "datapoint");
                    });
              });

          }

        });
      }
    }


    /*
    *  Setters/getters for chart() -- return chart object to allow chaining.
    */

    chart.width = function(args) {
      // if no args provided return the value of width
      if(!arguments.length)
        return width;
      // if args are provided set a value for width
      width = args;
      // return radar object to allow method chaining
      return chart;
    };

    chart.height = function(args) {
      if(!arguments.length)
        return height;
      height = args;
      return chart;
    };

    chart.center = function(args) {
      if(!arguments.length)
        return center;
      center = args;
      return chart;
    };

    chart.radius = function(args) {
      if(!arguments.length)
        return radius;
      radius = args;
      return chart;
    };

    chart.radians = function(args) {
      if(!arguments.length)
        return radians;
      radians = (Math.PI * 2) / args;
      return chart;
    };

    chart.labelOffset = function(args) {
      if(!arguments.length)
        return labelOffset;
      labelOffset = args;
      return chart;
    };

    chart.drawAxes = function(args) {
      if(!arguments.length)
        return drawAxes;
      drawAxes = args;
      return chart;
    };

    chart.drawLabels = function(args) {
      if(!arguments.length)
        return drawLabels;
      drawLabels = args;
      return chart;
    };

    chart.drawQuadrants = function(args) {
      if(!arguments.length)
        return drawQuadrants;
      drawQuadrants = args;
      return chart;
    };

    chart.drawPoints = function(args) {
      if(!arguments.length)
        return drawPoints;
      drawPoints = args;
      return chart;
    };

    chart.selectable = function(args) {
      if(!arguments.length)
        return selectable;
      selectable = args;
      return chart;
    };


    /*
    *  Helper functions for chart generation
    */

    function lowerRange(d) {
      return d.range[0];
    }

    function upperRange(d) {
      return d.range[1];
    }

    function axisCoords(d, i) {
      var coordinates = [center[0], center[1]];
      coordinates.push(center[0] + radius * Math.cos(radians * i));
      coordinates.push(center[1] + radius * Math.sin(radians * i));
      return coordinates;
    }

    function labelVals(d, i) {
      var vals = [];
      vals.push(center[0] + (radius + labelOffset) * Math.cos(radians * i));
      vals.push(center[1] + (radius + labelOffset) * Math.sin(radians * i));
      vals.push(d.label);
      return vals;
    }

    function pointCoords(d, i) {
      var coordinates = [];
      coordinates.push(center[0] + d.scale(d.value) * Math.cos(radians * i));
      coordinates.push(center[1] + d.scale(d.value) * Math.sin(radians * i));
      return coordinates;
    }

    return chart;
  };

})();
