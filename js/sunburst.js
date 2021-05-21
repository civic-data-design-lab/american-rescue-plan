// dataset
let sunburstData = [];

// D3 CHART VARIABLES
const width = 1600;
const height = 1600;
const radius = width/15;

// define svg
const svg = d3.select("#chart-sunburst")
    .append("svg")
    .attr("viewBox", [0, height/6 - 20, width, height]);

// d3 variables
const color = d3.scaleOrdinal()
    .domain(["Tax", "Unemployment Provisions", "State and \n Local Assistance", "Tribal Provisions", "Education", "Healthcare", "Others", "Small businesses", "Housing", "Child Care", "Agriculture","Nutrition","Aviation","Pub. Transport","Broadband", "Cybersecurity and Technology Modernization"])
    .range(["#404d6c", "#697db0", "#e08162", "#f69270", "#4a9ba8", "#63b7c8","#7ac7d6","#94752d","#af8b34","#cfa43d","#e1b241","#f0c96c","#4f6e4a","#689161","#85bb7d"]);

var format = format = d3.format(",d");

var arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))
    
var partition = data => {
        const root = d3.hierarchy(data)
            .sum(d => d.allocation)
            .sort((a, b) => b.value - a.value);
        return d3.partition()
            .size([2 * Math.PI, root.height + 1])
          (root);
    }

function plotSunburst(data) {
    const root = partition(data);
    console.log(root);
  
    root.each(d => d.current = d);
  
    const g = svg.append("g")
        .attr("transform", `translate(${width / 2},${width / 2})`);
  
    const path = g.append("g")
      .selectAll("path")
      .data(root.descendants(2).sort().filter(d => d.depth > 1))
      .join("path")
      .attr("fill", d => {
        while (d.depth > 2) d = d.parent; 
          if (d.data.name == "Ways and Means") {return "#404d6c"};
          if (d.data.name == "Government") {return "#E08162"};
          if (d.data.name == "Public Goods") {return "#4A9BA8"};
          if (d.data.name == "Assistance") {return "#614d1d"};
          if (d.data.name == "Infrastructure") {return "#4f6e4a"};
          if (d.data.name == "Tax") {return "#404d6c"};
          if (d.data.name == "Unemployment") {return "#697db0"};
          if (d.data.name == "State & Local Funds") {return "#E08162"};
          if (d.data.name == "Tribal Provisions") {return "#F69270"};
          if (d.data.name == "Education") {return "#4A9BA8"};
          if (d.data.name == "Healthcare") {return "#63B7C8"};
          if (d.data.name == "Others") {return "#7AC7D6"};
          if (d.data.name == "Small businesses") {return "#614d1d"};
          if (d.data.name == "Housing") {return "#94752d"};
          if (d.data.name == "Child Care") {return "#af8b34"};
          if (d.data.name == "Agriculture") {return "#cfa43d"};
          if (d.data.name == "Nutrition") {return "#e1b241"};
          if (d.data.name == "Disaster Relief") {return "#f0c96c"};
          if (d.data.name == "Aviation") {return "#4f6e4a"};
          if (d.data.name == "Pub. Transport") {return "#689161"};
          if (d.data.name == "Broadband") {return "#85bb7d"};
          if (d.data.name == "Digital Services") {return "#8EC785"};
      })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 1 : 0.8) : (d.parent ? 1 : 0))
        .attr("d", d => arc(d.current));
  
    path.filter(d => d.children)
        .style("cursor", "pointer")
        .on("click", clicked);
  ///How to add the percentage?
    path.append("title")
        .text(d => `${d.ancestors().filter(d => d.depth > 1).map(d => d.data.name).reverse().join("/")}\n$${format(d.value)}`);
  ///How to add text to tier 2?
    const label = g.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().filter(d => d.depth > 1))
        .join("text")
        .attr("dy", "0.35em")
        .attr("fill", d => {return "#ffffff"})
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name);
  
    const parent = g.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("click", clicked);
  
    function clicked(event, p) {
      parent.datum(p.parent || root);
  
      root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      });
  
      const t = g.transition().duration(500);
      // Transition the data on all arcs, even the ones that aren’t visible,
      // so that if this transition is interrupted, entering arcs will start
      // the next transition from the desired position.
      path.transition(t)
          .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
          })
        .filter(function(d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
          .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 1 : 0.8) : ((d.depth > 1) ? 1 : (d.depth > 1) ? 1 : 0))
          .attrTween("d", d => () => arc(d.current));
  
      label.filter(function(d) {
          return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
          .attr("fill-opacity", d => +labelVisible(d.target))
          .attrTween("transform", d => () => labelTransform(d.current));
    }
    
    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }
  
    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }
  
    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
    
    return svg.node();
}

// CALL DATA PARSE FUNCTIONS
// load json file and callback function
function getJsonObject(jsonFileName, callback) {
    var request = new XMLHttpRequest();
    var jsonPath = './data/' + jsonFileName + '.json';
    request.open('GET', jsonPath, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            var type = request.getResponseHeader('Content-Type');
            try {
                callback(JSON.parse(request.responseText));
            } catch (err) {
                callback(err);
            }
        }
    }
}

getJsonObject("ARP_flare@5", function(data) {
    if (sunburstData.length == 0) {
        sunburstData = data;
    }
    plotSunburst(data);
    console.log(data);
})