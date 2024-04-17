const width = 975;
const height = 615;
const circleSize = 5;
const hoveringCircleSize = 10;
const tempFile = "scripts/data/newTempData.csv";
const precFile = "scripts/data/newPrecData.csv";
const tempNum = 1;
const precNum = 2;
const svg = d3.select('#svg-container').append('svg')
        .attr('height', height)
        .attr('width', width);

const dateText = d3.select("#date-text")
    .style("font-family", "Roboto")
    .style("letter")

function renderLineChart(data, selector) {
    const margin = {top: 20, right: 20, bottom: 50, left: 40},
        width = 275 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    const x = d3.scalePoint()
        .domain(data.map(d => d.x))
        .range([0, width]);

    const x_axis = d3.axisBottom(x)
        .tickFormat(function(d) {
            return +d + 1;
        })

    const maxY = d3.max(data, d => d.y);

    const yTickValues = [0, maxY / 2, maxY];

    const y = d3.scaleLinear()
        .domain([0, maxY])
        .range([height, 0]);

    const y_axis = d3.axisLeft(y)
        .tickValues(yTickValues)
        .tickFormat(d3.format("d"));

    const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y));

    const svg = d3.select(selector)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(x_axis);

    svg.append("g")
        .call(y_axis);

    svg.append("text")             
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
        .style("text-anchor", "middle")
        .style("font-size", "15px")
        .style("font-family", "Roboto")
        .text("Days since today");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("font-size", "15px")
        .style("text-anchor", "middle")
        .text("Wind Speed (mph)")
        .style("font-family", "Roboto");
}

var usData;

function renderUSA(svg, month, day) {
    d3.json("./counties-albers-10m.json", function(error, us) {

        if (error) throw error;
        usData = us;


        const color = d3.scaleSequential(d3.interpolateRdYlBu);
    
        const path = d3.geoPath();
        
        const USbackground = svg.append('path')
            .attr('fill', 'white')
            .attr("stroke", "black")
            .attr('d', path(topojson.feature(us, us.objects.nation)));
        
        var dataType = tempNum;
        colorCounties(dataType);

        const states = svg.append("path")
            .datum(topojson.mesh(us, us.objects.states))
              .attr("fill", "none")
              .attr("stroke", "black")
              .attr("stroke-linejoin", "round")
              .attr("d", path);
        
        plotPoints(month, day);
    })
}

function colorCounties(dataType){
    var fileType = "";
    if(dataType == tempNum){
        fileType = tempFile;
    }
    if(dataType == precNum){
        fileType = precFile;
    }

    d3.csv(fileType, (function(error2, data) {
        if (error2) throw error2;
        const countyValueMap = {};
        data.forEach(function(d) {
            countyValueMap[d.ID] = +d.Value;
        });

        var max = d3.max(data, function(d) { return d.Value; } );
        console.log("max: "+max);
        var min = d3.min(data, function(d) { return d.Value; } );
        console.log("min: "+min);
        var half = (Number(max)+Number(min))/2;
        console.log("half: "+half);
        // TODO: for some reason on temp, it's giving me min and max as only alaska


        var colorScale = d3.scaleLinear()
        .domain([min, max])
        .range(["white", "black"]);

        if(dataType == tempNum){
            colorScale = d3.scaleLinear()
            .domain([0, 45, 90])
            .range(["blue", "beige", "red"]);
            console.log("temperature");
        }
        if(dataType == precNum){
            colorScale = d3.scaleLinear()
            .domain([min, max])
            .range(["white", "teal"]);
            console.log("Precipitation");
        }

        console.log(fileType);
        console.log(dataType);
        
        const path = d3.geoPath();

        const counties = svg.append("g")
            .selectAll("path")
            .data(topojson.feature(usData, usData.objects.counties).features)
            .enter().append('path')
                .attr("fill", function(d) { 
                    if(countyValueMap[d.id] == undefined || countyValueMap[d.id] == null)
                        return "black";
                    return colorScale(countyValueMap[d.id]);
                })
                .attr("stroke", "none")
                .attr("d", path);
        
                
        renderLegend(colorScale, dataType);
    }));
}

function plotPoints(month, day) {

    const projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale(1300);

    let tooltip = d3.select('body').select('.tooltip');

    if (tooltip.empty()) {
        tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('width', '300px')
            .style('height', '300px')
            .style('display', 'block')
            .style('justify-content', 'center')
            .style('align-items', 'center')
            .style('position', 'fixed')
            .style('visibility', 'hidden')
            .style('opacity', 0)
            .style('background-color', 'white')
            .style('border', 'solid')
            .style('border-width', '1px')
            .style('border-radius', '5px')
            .style('padding', '10px');
    }

    // clear all previously plotted points
    svg.selectAll("circle").remove();

    // plot the points
    fileName = `./scripts/wind_data/${month}${day}.json`
    d3.json(fileName, function(error, data) {
        if (error) throw error;

        const colors = [
            "#ffffcc",
            "#c2e699",
            "#78c679",
            "#31a354",
            "#006837"
        ];

        minVal = 0
        maxVal = 20

        const step = maxVal / (colors.length - 1);
        const domain = d3.range(minVal, maxVal + step, step);

        const colorScale = d3.scaleLinear()
            .domain(domain)
            .range(colors);

        const maxWindSpeed = d3.max(data, d => d.WS);
        const maxWindSpeedPoints = data.filter(d => d.WS === maxWindSpeed);

        console.log(maxWindSpeedPoints);

        const stats = d3.select("#stats");
        stats.html("");

        stats.append("p").text("Information about today:");
        maxWindSpeedPoints.forEach(point => {
            stats.append("p").text(`Location: ${point.Location}`);
            stats.append("p").text(`Wind speed: ${point.WS} mph`);
        })


        const pointLegendContainer = d3.select("#legend");
        pointLegendContainer.html("");

        pointLegendContainer.append("p")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("Wind speed (MPH) legend");

        // Create color scale gradient bar
        const legendScaleBar = pointLegendContainer.append("div")
            .style("width", "200px")
            .style("height", "20px")
            .style("background", "linear-gradient(to right, " + colorScale.range().join(", ") + ")");
        
        // Create legend scale labels
        const keyLabels = [0, 5, 10, 15, 20];

        const labelsContainer = pointLegendContainer.append("div")
            .style("display", "flex")
            .style("justify-content", "space-between")
            .style("width", "200px");

        labelsContainer.selectAll("span")
            .data(keyLabels)
            .enter().append("span")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .text(d => d);

        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", function(d) { return projection([d.Longitude, d.Latitude])[0]; })
            .attr("cy", function(d) { return projection([d.Longitude, d.Latitude])[1]; })
            .attr("r", circleSize)
            .attr("fill", function(d) { return colorScale(d.WS); }) // change the point color
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .on("mouseover", function() {
                d3.select(this)
                    .raise()
                    .transition()
                    .duration(100)
                    .attr("r", hoveringCircleSize)
                    .attr("stroke-width", "4px")
            })
            .on("mousemove", function() {
                tooltip.style('top', (d3.mouse(this)[1] - 10) + 'px')
                    .style('left', (d3.mouse(this)[0] + 40) + 'px');
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r", circleSize)
                    .attr("stroke-width", "1px")
                tooltip.transition()
                    .duration(300)
                    .style('opacity', 0)
                    .style('visibility', 'hidden');
            })
            .on("click", function(d) {
                const chartID = 'line-chart';
                tooltip.html(`
                <div>
                    <text>AIRPORT CODE: ${d.Location}</text>
                    <br/>
                    <text>WIND SPEED (TODAY): ${d.WS} mph</text>
                    <div id="${chartID}"></div>
                </div>`)
                    .style('visibility', 'visible')
                    .style('font-family', "Roboto")
                    .style('font-weight', '500')
                    .style('padding', '1vh 1vw')
                    .style('display', 'flex')
                    .style('justify-content', 'center')
                    .style('align-items', 'center')
                    .transition()
                    .duration(300)
                    .style('opacity', 1);
                
                const lineChartData = d.LastWeek;

                renderLineChart(lineChartData, `#${chartID}`);
            })
    });
    
}

function renderLegend(colorScale, dataType) {
    const legendWidth = 200;
    const legendHeight = 20;
    
    svg.selectAll(".legend").remove();
    
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(550, 570)");

    const legendTitle = legend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(dataType === tempNum ? "Temperature Legend" : "Precipitation Legend");

    const legendMin = legend.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("0");

    const legendMax = legend.append("text")
        .attr("x", 205)
        .attr("y", 10)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(dataType === tempNum ? "90" : "10");

    const defs = legend.append("defs");

    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    linearGradient.selectAll("stop")
        .data(colorScale.range())
        .enter().append("stop")
        .attr("offset", function(d, i) {
            return i / (colorScale.range().length - 1);
        })
        .attr("stop-color", function(d) {
            return d;
        });

    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#linear-gradient)");

    const legendScale = d3.scaleLinear()
        .domain([colorScale.domain()[0], colorScale.domain()[colorScale.domain().length - 1]])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .tickSize(6)
        .tickValues(colorScale.domain())
        .tickFormat(d3.format(".1f"));

    legend.append("g")
        .attr("class", "legend-axis")
        .attr("transform", "translate(0," + legendHeight + ")")
        .call(legendAxis);
}

document.addEventListener("DOMContentLoaded", function() {
    const slider = document.getElementById('time-slider');
    const sliderDateDisplay = document.getElementById('slider-date');

    function sliderValueToDate(value) {
        const date = new Date(2009, 0, 1);
        date.setDate(date.getDate() + parseInt(value));
        return date;
    }

    function updateDisplayedDate(date) {
        sliderDateDisplay.textContent = date.toISOString().substring(0, 10);
    }

    function updateVisualizationForDate(date) {
        svg.selectAll("circle").remove();
        dateToMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        month =  dateToMonth[date.getMonth()];
        day = date.getDate();
        plotPoints(month, day);
    }

    updateDisplayedDate(sliderValueToDate(slider.value));

    slider.addEventListener('change', function() {
        const selectedDate = sliderValueToDate(this.value);
        updateDisplayedDate(selectedDate);
        updateVisualizationForDate(selectedDate);
    });

    
});

d3.select('#map-options')
  .on('change', function() {
    var newData = eval(d3.select(this).property('value'));
    colorCounties(newData);
});

renderUSA(svg, "Jan", "1");

document.body.appendChild(svg.node());


