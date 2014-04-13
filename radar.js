// === radar.js ===
// Author: Nick Armstrong
// Version: 0.1

d3.radar = function(file, elem) {

  var selection = d3.select(elem),
      json;

  // Load graph data from the file provided and draw in callback
  d3.json(file, function(data) {
    console.log(data);
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
          .range([0, radius - json.margin]);
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
  };

};
