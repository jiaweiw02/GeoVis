
// MAIN VARIABLES
const width = 975;
const height = 615;
const circleSize = 5;
const hoveringCircleSize = 10;
const tempFile = "scripts/data/newTempData.csv";
const precFile = "scripts/data/newPrecData.csv";
const tempNum = 1;
const precNum = 2;
const POINT_TEMP = 3;
const POINT_DEW = 4;
const POINT_WIND = 5;
const POINT_HUMIDITY = 6;
const POINT_PRESSURE = 7;

var global_month = "Jan";
var global_day = "1";
var dataType = tempNum;

// MAIN SVG
const svg = d3.select('#svg-container').append('svg')
        .attr('height', height)
        .attr('width', width);

const dateText = d3.select("#date-text")
    .style("font-family", "Roboto")
    .style("letter")


// FUNCTIONS
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
        .text(getNameByType(eval(d3.select('#point-options').property('value'))))
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
        
        colorCounties(dataType, month, day);

        const states = svg.append("path")
            .datum(topojson.mesh(us, us.objects.states))
              .attr("fill", "none")
              .attr("stroke", "black")
              .attr("stroke-linejoin", "round")
              .attr("d", path);
        
    })
}

function colorCounties(dataType, month, day){
    var fileType = "";
    if(dataType == tempNum){
        fileType = "scripts/mapdata/"+month+"Temps.csv";
    }
    if(dataType == precNum){
        fileType = "scripts/mapdata/"+month+"Prec.csv";
    }
    svg.selectAll("counties").remove();

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

        // console.log(fileType);
        // console.log(dataType);
        
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
    console.log("month: "+ month+"; day: "+day);
    plotPoints(month, day);
    console.log("printed points");
}

// function getLastSevenDays(month, day) {
//     // Array of month abbreviations and the number of days in each month
//     const months = [
//         { name: "Jan", days: 31 },
//         { name: "Feb", days: 28 },
//         { name: "Mar", days: 31 },
//         { name: "Apr", days: 30 },
//         { name: "May", days: 31 },
//         { name: "Jun", days: 30 },
//         { name: "Jul", days: 31 },
//         { name: "Aug", days: 31 },
//         { name: "Sep", days: 30 },
//         { name: "Oct", days: 31 },
//         { name: "Nov", days: 30 },
//         { name: "Dec", days: 31 }
//     ];

//     const monthIndex = months.findIndex(m => m.name === month);
//     let result = [];

//     for (let i = 0; i < 7; i++) {
//         let newDay = day - i;
//         let newMonthIndex = monthIndex;

//         while (newDay < 1) {
//             newMonthIndex = newMonthIndex - 1;
//             if (newMonthIndex < 0) {
//                 newMonthIndex = 11;
//             }
//             newDay += months[newMonthIndex].days;
//         }

//         result.push(`${months[newMonthIndex].name}${newDay}`);
//     }

//     return result.reverse();
// }

// function getLastWeekWeatherData(days, location, type) {

//     let lineChart = {'x': [], 'y': []};

//     for (let i = 0; i < days.length; i++) {
//         const url = `lastweek/${location}/${days[i]}.json`

//         d3.json(url, function(error, data) {
//             if (error) throw error;

//             lineChart.push(data[type])
//         })
//     }

//     return lineChart
// }

function getNameByType(type) {
    if (type === POINT_TEMP) {
        return "Temperature (F)";
    } else if (type === POINT_DEW) {
        return "Dew Point (F)";
    } else if (type === POINT_WIND) {
        return "Wind Speed (mph)";
    } else if (type === POINT_HUMIDITY) {
        return "Humidity (%)";
    } else if (type === POINT_PRESSURE) {
        return "Pressure (in)";
    }
}

function getMinValue(data, type) {
    if (type === POINT_TEMP) {
        return d3.min(data, d => d.Temperature);
    } else if (type === POINT_DEW) {
        return d3.min(data, d => d.DewPoint);
    } else if (type === POINT_WIND) {
        return d3.min(data, d => d.WindSpeed);
    } else if (type === POINT_HUMIDITY) {
        return d3.min(data, d => d.Humidity);
    } else if (type === POINT_PRESSURE) {
        return d3.min(data, d => d.Pressure);
    }
    alert("getMinValue: type is not defined.")
    return 0;
}

function getMaxValue(data, type) {
    if (type === POINT_TEMP) {
        return d3.max(data, d => d.Temperature);
    } else if (type === POINT_DEW) {
        return d3.max(data, d => d.DewPoint);
    } else if (type === POINT_WIND) {
        return d3.max(data, d => d.WindSpeed);
    } else if (type === POINT_HUMIDITY) {
        return d3.max(data, d => d.Humidity);
    } else if (type === POINT_PRESSURE) {
        return d3.max(data, d => d.Pressure);
    }
    
    alert("getMaxValue: type is not defined.")
    return 0;
}

function maxPoints(data, type, maxValue) {

    if (type === POINT_TEMP) {
        return data.filter(d => d.Temperature === maxValue);
    } else if (type === POINT_DEW) {
        return data.filter(d => d.DewPoint === maxValue);
    } else if (type === POINT_WIND) {
        return data.filter(d => d.WindSpeed === maxValue);
    } else if (type === POINT_HUMIDITY) {
        return data.filter(d => d.Humidity === maxValue);
    } else if (type === POINT_PRESSURE) {
        return data.filter(d => d.Pressure === maxValue);
    }

    alert("maxPoints: type is not defined.")
    return [];
}

function plotPoints(month, day) {

    const projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale(1300);

    let tooltip = d3.select('body').select('.tooltip');

    if (tooltip.empty()) {
        tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
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
    fileName = `./scripts/weatherdata/${month}${day}.json`
    d3.json(fileName, function(error, data) {
        if (error) throw error;

        const colors = [
            "#ffffcc",
            "#c2e699",
            "#78c679",
            "#31a354",
            "#006837"
        ];

        const type = eval(d3.select('#point-options').property('value'));

        const minVal = getMinValue(data, type);
        const maxVal = getMaxValue(data, type);

        const step = maxVal / (colors.length - 1);
        const domain = d3.range(minVal, maxVal + step, step);

        const colorScale = d3.scaleLinear()
            .domain(domain)
            .range(colors);
        
        const pointsWMax = maxPoints(data, type, maxVal);

        const stats = d3.select("#stats");
        stats.html("");

        stats.append("p").text(`Highest ${getNameByType(type)}:`);
        pointsWMax.forEach(point => {
            stats.append("p").text(`Location: ${point.Name}`);
        })

        const point = pointsWMax[0];

        stats.append("p").text(`${getNameByType(type)}: ${
            type === POINT_TEMP ? point.Temperature :
            type === POINT_DEW ? point.DewPoint :
            type === POINT_WIND ? point.WindSpeed :
            type === POINT_HUMIDITY ? point.Humidity :
            type === POINT_PRESSURE ? point.Pressure : ""
        } ${
            type === POINT_TEMP ? "F" :
            type === POINT_DEW ? "F" :
            type === POINT_WIND ? "mph" :
            type === POINT_HUMIDITY ? "%" :
            type === POINT_PRESSURE ? "in" : ""
        }`);


        const pointLegendContainer = d3.select("#legend");
        pointLegendContainer.html("");

        pointLegendContainer.append("p")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(getNameByType(type));

        // Create color scale gradient bar
        const legendScaleBar = pointLegendContainer.append("div")
            .style("width", "200px")
            .style("height", "20px")
            .style("background", "linear-gradient(to right, " + colorScale.range().join(", ") + ")");
        
        // Create legend scale labels
        let keyLabels = [];

        if (type === POINT_TEMP) {
            keyLabels = [0, 15, 30, 45, 60, 75, 90, 105];
        } else if (type === POINT_DEW) {
            keyLabels = [0, 10, 20, 30, 40, 50, 60];
        } else if (type === POINT_WIND) {
            keyLabels = [0, 5, 10, 15, 20, 25, 30];
        } else if (type === POINT_HUMIDITY) {
            keyLabels = [0, 10, 20, 30, 40, 50, 60];
        } else if (type === POINT_PRESSURE) {
            keyLabels = [0, 10, 20, 30, 40, 50, 60];
        }


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
            .attr("fill", function(d) {
                if (type === POINT_TEMP) {
                    return colorScale(d.Temperature);
                } else if (type === POINT_DEW) {
                    return colorScale(d.DewPoint);
                } else if (type === POINT_WIND) {
                    return colorScale(d.WindSpeed);
                } else if (type === POINT_HUMIDITY) {
                    return colorScale(d.Humidity);
                } else if (type === POINT_PRESSURE) {
                    return colorScale(d.Pressure);
                }
            }) // change the point color
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
                    <text>${d.Name}</text>
                    <br/>
                    <text>Airport Code: ${d.Location}</text>
                    <br/>
                    <text>Wind Speed (mph): ${d.WindSpeed} mph</text>
                    <br/>
                    <text>Temperature (F): ${d.Temperature} F</text>
                    <br/>
                    <text>Dew Point (F): ${d.DewPoint} F</text>
                    <br/>
                    <text>Humidity (%): ${d.Humidity} %</text>
                    <br/>
                    <text>Pressure (in): ${d.Pressure} in</text>
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

                let lineChartData;

                const selectedType = eval(d3.select('#point-options').property('value'));

                if (selectedType === POINT_TEMP) {
                    lineChartData = d.LastWeekTemperature;
                } else if (selectedType === POINT_DEW) {
                    lineChartData = d.LastWeekDewPoint;
                } else if (selectedType === POINT_WIND) {
                    lineChartData = d.LastWeekWindSpeed;
                } else if (selectedType === POINT_HUMIDITY) {
                    lineChartData = d.LastWeekHumidity;
                } else if (selectedType === POINT_PRESSURE){
                    lineChartData = d.LastWeekPressure;
                }
                
                if (!lineChartData) {
                    alert("lineChartData is not defined.");
                    return;
                }
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
        .text(dataType === tempNum ? "Temperature Legend (F)" : "Precipitation Legend (\")");

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


// HTML RELATED
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

    function updateVisualization(date) {
        svg.selectAll("circle").remove();
        dateToMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        month =  dateToMonth[date.getMonth()];
        day = date.getDate();
        global_month = month;
        global_day = day;
        colorCounties(dataType, month, day);
    }

    updateDisplayedDate(sliderValueToDate(slider.value));

    slider.addEventListener('change', function() {
        const selectedDate = sliderValueToDate(this.value);
        updateDisplayedDate(selectedDate);
        updateVisualization(selectedDate);
    });

    d3.select('#point-options')
        .on('change', function() {
            updateVisualization(sliderValueToDate(slider.value));
        })
});

d3.select('#map-options')
  .on('change', function() {
    var newData = eval(d3.select(this).property('value'));
    dataType = newData;
    colorCounties(dataType, global_month, global_day);
});

renderUSA(svg, "Jan", "1");

document.body.appendChild(svg.node());