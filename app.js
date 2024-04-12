const width = 975;
const height = 615;
const circleSize = 5;
const hoveringCircleSize = 10;
const tempFile = "scripts/data/newTempData.csv";
const precFile = "scripts/data/newPrecData.csv";
const tempNum = 1;
const precNum = 2;

function renderLineChart(data, selector) {
    const margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = 200 - margin.left - margin.right, // Adjust size as needed
        height = 100 - margin.top - margin.bottom; // Adjust size as needed

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x)) // Assuming data is an array of objects with x and y
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y))
        .range([height, 0]);

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
}

var usData;

function renderUSA(svg, month, day) {
    d3.json("./counties-albers-10m.json", function(error, us) {

        if (error) throw error;
        usData = us;


        const color = d3.scaleSequential(d3.interpolateRdYlBu);
    
        const path = d3.geoPath();
        
        const USbackground = svg.append('path')
            .attr('fill', 'grey')
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
        
        // edit tooltip style here
        var quantize = d3.scaleQuantize()
        .domain([ 0, 0.15 ])
        .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));
            
        svg.append("g")
            .attr("class", "legendQuant")
            .attr("transform", "translate(20,20)");
        
        var legend = d3.legendColor()
            .labelFormat(d3.format(".2f"))
            .useClass(true)
            .title("A really really really really really long title")
            .titleWidth(100)
            .scale(quantize);
        
        svg.select(".legendQuant")
            .call(legend);
        
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

    // Load the CSV file
    d3.csv(fileType, (function(error2, data) {
        if (error2) throw error2;
        // Store the data in the variable
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
    }));
}

function plotPoints(month, day) {

    const projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale(1300);

    let tooltip = d3.select('body').select('.tooltip');

    if (tooltip.empty()) {
        tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip') // Use a class to identify the tooltip
            .style('display', 'inline')
            .style('position', 'fixed')
            .style('visibility', 'hidden')
            .style('opacity', 0)
            .style('background-color', 'white')
            .style('border', 'solid')
            .style('border-width', '1px')
            .style('border-radius', '5px')
            .style('padding', '10px');
    }

    // plot the points
    fileName = `./weatherdata/${month}${day}.json`
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

        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", function(d) { return projection([d.Longitude, d.Latitude])[0]; })
            .attr("cy", function(d) { return projection([d.Longitude, d.Latitude])[1]; })
            .attr("r", circleSize)
            .attr("fill", function(d) { return colorScale(d.WS); }) // change the point color
            .on("mouseover", function() {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r", hoveringCircleSize);
            })
            .on("mousemove", function() {
                tooltip.style('top', (d3.mouse(this)[1] - 10) + 'px')
                    .style('left', (d3.mouse(this)[0] + 40) + 'px');
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("r", circleSize);
                tooltip.transition()
                    .duration(300)
                    .style('opacity', 0)
                    .style('visibility', 'hidden');
            })
            .on("click", function(d) {
                const chartID = 'line-chart';
                tooltip.html(`
                <div>
                    <text>${d.Location}</text>
                    <div id="${chartID}"></div>
                    <text>Wind speed: ${d.WS} mph</text>
                </div>`)
                    .style('visibility', 'visible')
                    .transition()
                    .duration(300)
                    .style('opacity', 1);
                
                const lineChartData = d.LastWeek;

                renderLineChart(lineChartData, `#${chartID}`);
            })
    });
    
}

const svg = d3.select('body').append('svg')
        .attr('height', height)
        .attr('width', width);

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


