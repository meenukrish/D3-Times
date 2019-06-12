
// Defining helper methods

// Creating the X and Y scales based on the 
function xScale(estimatedata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(estimatedata, d => d[chosenXAxis]) * 0.8, d3.max(estimatedata, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;

}

function yScale(estimatedata, chosenYAxis) {
  
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(estimatedata, d => d[chosenYAxis]) * 0.8, d3.max(estimatedata, d => d[chosenYAxis]) * 1.2])
    .range([0, width]);

  return yLinearScale;

}

function renderXaxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis)

  return xAxis;
}

function renderYaxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}


function settextgroup(chartGroup, estimatedata, chosenXAxis,chosenYAxis)
{
var textGroup = chartGroup.selectAll()
.data(estimatedata)
.exit()
.remove()
.append("text")
.text(function(d){ return d.abbr})
.attr("x", d => xLinearScale(d[chosenXAxis]))
.attr("y", d => yLinearScale(d[chosenYAxis]))
.attr("font-size","9px")
.attr("fill","white");

return textGroup;

}

function renderXCircles(circlesGroup, textGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  textGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));


  return circlesGroup;
}

function renderYCircles(circlesGroup, textGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

    textGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}


function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") 
  {
    var xlabel = "Poverty:";
  }
  else if (chosenXAxis === "age")
  {
    var xlabel = "Age:";
  }
  else
  {
    var xlabel = "Income:";
  }

  if (chosenYAxis === "healthcare") 
  {
    var ylabel = "HealthCare:";
  }
  else if (chosenYAxis === "smokes")
  {
    var ylabel = "Smokes:";
  }
  else
  {
    var ylabel = "Obesity:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([-8,0])
    .html(function(d) {
      return (`<p><b>${d.state.toUpperCase()}</b><br>${xlabel} ${d[chosenXAxis]}%<br>${ylabel} ${d[chosenYAxis]}%</p>`);
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


//Make responsive function to dynamically resize the chart when the window is resized
function makeResponsive()
{

// Select the svg element
    var svgArea = d3.select("body").select("svg");

// clear svg is not empty
    if (!svgArea.empty()) {
    svgArea.remove();
    }

// SVG wrapper dimensions are determined by the current width and
// height of the browser window.
  var svgWidth = window.innerWidth/2;
  var svgHeight = window.innerHeight;

  var margin = {    
  top: 40,
  right: 40,
  bottom: 150,
  left: 100
  };

  height = svgHeight - margin.top - margin.bottom;
  width = svgWidth - margin.left - margin.right;

 
// Append SVG element
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// Append group element
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);


// default chosen X-axis Params
var chosenXAxis = "poverty";
// default chosen Y-axis Params
var chosenYAxis = "obesity";


// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv", function(err, estimatedata) {

  if (err) throw err;
    // parse data
  estimatedata.forEach(function(data) 
  {
    data.poverty =+ data.poverty;
    data.age =+ data.age;
    data.income =+ data.income;
    data.healthcare =+ data.healthcare;
    data.obesity =+ data.obesity;
    data.smokes =+ data.smokes;
  });


// xLinearScale function above csv import
var xLinearScale = xScale(estimatedata, chosenXAxis);
var yLinearScale = yScale(estimatedata, chosenYAxis);


// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);


// append x axis
var xAxis = chartGroup.append("g")
.attr("transform", `translate(0, ${height})`)
.call(bottomAxis);

// append x axis
var yAxis = chartGroup.append("g")
.attr("transform", `translate(0, ${height-width})`)
.call(leftAxis);

// append initial circles
var circlesGroup = chartGroup.selectAll("circle")
.data(estimatedata)
.enter()
.append("circle")
.attr("cx", d => xLinearScale(d[chosenXAxis]))
.attr("cy", d => yLinearScale(d[chosenYAxis]))
.attr("r", 15)
.attr("fill", "#2059b5")
.attr("opacity", ".75")
.classed("stateCircle" , true);



var textGroup = chartGroup.selectAll(null)
.data(estimatedata)
.enter()
.append("text")
.text(function(d){ return d.abbr})
.attr("x", d => xLinearScale(d[chosenXAxis]))
.attr("y", d => yLinearScale(d[chosenYAxis]))
.attr("font-size","9px")
.attr("fill","white");



// Create group for  3 x- axis labels
var xlabelsGroup = chartGroup.append("g")
.attr("transform", `translate(${width / 2}, ${height + 20})`);

// Create group for  2 x- axis labels
var ylabelsGroup = chartGroup.append("g")
.attr("transform", `translate(${width / 2}, ${height + 20})`);

// Add the X-axis labels
var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .classed("aText", true)
    .text("In Poverty(%)");

var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText", true)
    .text("Age(Median)");

var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText", true)
    .text("Household Income(Median)");


// Add Y-axis labels

var obesitylabel = ylabelsGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("y",0-(margin.left*3.8))
.attr("x", (height / 2))
.attr("dy", "1em")
.classed("aText", true)
.attr("value", "obesity")
.classed("active", true)
.text("Obese(%)");

var smokesLabel = ylabelsGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("y",0-(margin.left*3.6))
.attr("x", (height / 2))
.attr("dy", "1em")
.classed("aText", true) 
.attr("value", "smokes")  // value to grab for event listener
.classed("inactive", true)
.text("Smokes(%)");

var healthcareLabel = ylabelsGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("y",0-(margin.left*3.4))
.attr("x", (height / 2))
.attr("dy", "1em")
.classed("aText", true) 
.attr("value", "healthcare")  // value to grab for event listener
.classed("inactive", true)
.text("Lacks HealthCare(%)");

var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

// x axis labels event listener
xlabelsGroup.selectAll("text")
.on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value !== chosenXAxis) {

    // replaces chosenXAxis with value
    chosenXAxis = value;
    xLinearScale = xScale(estimatedata, chosenXAxis);

    // updates x axis with transition
    xAxis = renderXaxis(xLinearScale, xAxis);

    textGroup = settextgroup(xAxis, estimatedata, chosenXAxis, chosenYAxis)

   // updates circles with new x values
    circlesXGroup = renderXCircles(circlesGroup, textGroup, xLinearScale, chosenXAxis);

    // updates tooltips with new info
    circlesXGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesXGroup);

    // changes classes to change bold text
    if (chosenXAxis === "age") {
        ageLabel
        .classed("active", true)
        .classed("inactive", false);
       povertyLabel
        .classed("active", false)
        .classed("inactive", true);
        incomeLabel
        .classed("active", false)
        .classed("inactive", true);
    }
    else if (chosenXAxis === "income"){
        incomeLabel
        .classed("active", true)
        .classed("inactive", false);
        povertyLabel
        .classed("active", false)
        .classed("inactive", true);
        ageLabel
        .classed("active", false)
        .classed("inactive", true);
    }
    else {
        ageLabel
        .classed("active", false)
        .classed("inactive", true);
        incomeLabel
        .classed("active", false)
        .classed("inactive", true);
        povertyLabel
        .classed("active", true)
        .classed("inactive", false);
    }

  }
});

// x axis labels event listener
ylabelsGroup.selectAll("text")
.on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value !== chosenYAxis) {

    // replaces chosenYAxis with value
    chosenYAxis = value;
    yLinearScale = yScale(estimatedata, chosenYAxis);

    // updates x axis with transition
    yAxis = renderYaxis(yLinearScale, yAxis);

    textGroup = settextgroup(yAxis, estimatedata, chosenXAxis, chosenYAxis)
    // updates circles with new y values
    circlesYGroup = renderYCircles(circlesGroup, textGroup, yLinearScale, chosenYAxis);

    // updates tooltips with new info
    circlesYGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesYGroup);

    // changes y-axis to change bold text
if (chosenYAxis === "obesity") {
  obesitylabel
  .classed("active", true)
  .classed("inactive", false);
  healthcareLabel
  .classed("active", false)
  .classed("inactive", true);
  smokesLabel
  .classed("active", false)
  .classed("inactive", true);
}
else if (chosenYAxis === "smokes"){
  smokesLabel
  .classed("active", true)
  .classed("inactive", false);
  healthcareLabel
  .classed("active", false)
  .classed("inactive", true);
  obesitylabel
  .classed("active", false)
  .classed("inactive", true);
}
else {
  obesitylabel
  .classed("active", false)
  .classed("inactive", true);
  smokesLabel
  .classed("active", false)
  .classed("inactive", true);
  healthcareLabel
  .classed("active", true)
  .classed("inactive", false);
}

  }
});



});  //d3.csv end

}; //makeresponsive function end

makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);