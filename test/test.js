
var trace1 = {
  x: [1.2, 3.5],
  y: [3.4, 2.4],
  mode: "markers",
  name: "Semester",
  text: ["United States", "Canada"],
  marker: {
    color: "rgb(164, 194, 244)",
    size: 25,
    line: {
      color: "white",
      width: 0.5
    }
  },
  type: "scatter"
};
var trace2 = {
  x: [3.4],
  y: [2.4],
  mode: "markers",
  name: "Cummalitive",
  marker: {
    color: 'rgb(255, 217, 102)',
    size: 25,
    line: {
      color: "white",
      width: 0.5
    }
  },
  type: "scatter"
};
var trace0 = {
  x: [0,4.0],
  y: [0,4.0],
  mode: "markers",
  name: "Cummalitive",
  marker: {
    color: 'white',
    size: 1,
    line: {
      color: "white",
      width: 0.5
    }
  },
  type: "scatter"
};

var data = [trace0,trace1, trace2];
var layout = {
  title: "SHPE GPA Chart",
  xaxis: {
    name: "Cummulative",
    showgrid: false,
    showname:true,
    showline: false,
    zeroline: true,
    rangemode:'tozero',
    autorange:true,
    range:[0,4]
  },
  yaxis: {
    title: "Semester",
    showgrid: false,
    showline: true,
    zeroline: false,
    rangemode:'tozero', 
    autorange:true,
    //range:[0,4]
  },
  autoscale: false,
  

};
var graph =document.getElementById('graph');
var graphOptions = {layout: layout, filename: "line-style", fileopt: "overwrite"};
Plotly.plot("graph",data, graphOptions, function (err, msg) {
    console.log(msg);
});