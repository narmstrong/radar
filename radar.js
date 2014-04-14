// === radar.js ===
// Author: Nick Armstrong
// Version: 0.1

d3.radar = function(file, elem) {

  var selection = d3.select(elem),
      json;

  // Load graph data from the file provided and draw in callback
  d3.json(file, function(data) {
    json = data;
    drawGraph();
  });

  var drawGraph = function() {

    var scales = [],
        radius = json.width/2 - json.margin,
        radians = 2 * Math.PI / json.data.length,
        center = json.width/2,
        pathData = [];

    // Generate scales for each datapoint provided relative to their max
    for(var i = 0; i < json.data.length; i++) {
      var scale = d3.scale.linear()
          .domain([0, json.databounds[i]])
          .range([0, radius]);
      scales.push(scale);
    }

    var svg = selection.append("svg:svg")
        .attr({
          "width" : json.width,
          "height" : json.height,
          "id" : json.id
        });
    svg.append("title")
        .text(json.title);
    svg.append("desc")
        .text(json.description);

    if(json.drawAxes) {
      for(var i = 0; i < json.data.length; i++) {
        svg.append("line")
            .attr({
              "x1" : center,
              "y1" : center,
              "x2" : center + radius * Math.cos(radians * i),
              "y2" : center + radius * Math.sin(radians * i),
              "class" : "axis"
            });
      }
      svg.append("circle")
          .attr({
            "cx" : center,
            "cy" : center,
            "r" : radius/2,
            "class" : "axis",
            "stroke-dasharray" : "3, 3"
          });
    }

    if(json.drawLabels) {
      for(var i = 0; i < json.data.length; i++) {
        svg.append("text")
            .attr({
              "text-anchor" : "middle",
              "x" : center + (radius + json.margin/2) * Math.cos(radians * i),
              "y" : center + (radius + json.margin/2) * Math.sin(radians * i),
              "dy" : "0.5ex",
              "class" : "label"
            })
            .text(json.labels[i]);
      }
    }

    for(var i = 0; i < json.data.length; i++) {
      var point = new Object();
      point.x = center + scales[i](json.data[i]) * Math.cos(radians * i);
      point.y = center + scales[i](json.data[i]) * Math.sin(radians * i);
      pathData.push(point);
    }

    var pathFunction = d3.svg.line()
        .x(function(d){ return d.x; })
        .y(function(d){ return d.y; })
        .interpolate("linear");

    svg.append("path")
        .attr({
          "d" : pathFunction(pathData) + "Z",
          "class" : "graph"
        });

    svg.selectAll(".datapoint")
        .data(json.data)
      .enter()
        .append("circle")
        .attr({
          "cx" : function(d, i){ return center + scales[i](json.data[i]) * Math.cos(radians * i); },
          "cy" : function(d, i){ return center + scales[i](json.data[i]) * Math.sin(radians * i); },
          "r" : 5,
          "class" : "datapoint"
        })

    if(json.selectable) {
      svg.selectAll(".datapoint").on("mouseover", function(){
          var hovered = d3.select(this);
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



  };

};
