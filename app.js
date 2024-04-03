const width = 975;
const height = 615;
const circleSize = 5;
const hoveringCircleSize = 10;
const pointColor = "blue";


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

function renderUSA(svg) {
    d3.json("./states-albers-10m.json", function(error, us) {

        if (error) throw error;
    
        const projection = d3.geoAlbersUsa()
            .translate([width / 2, height / 2])
            .scale(1300);
    
        const path = d3.geoPath();
    
        const USbackground = svg.append('path')
            .attr('fill', '#ddd')
            .attr('d', path(topojson.feature(us, us.objects.nation)));
    
        const borders = svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', '#fff')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('d', path(topojson.mesh(us, us.objects.states, (a,b) => a !== b)));
        
        // edit tooltip style here
        var tooltip = d3.select('body').append('div')
            .style('display', 'inline')
            .style('position', 'fixed')
            .style('visibility', 'hidden')
            .style('opacity', 0)
            .style('background-color', 'white')
            .style('border', 'solid')
            .style('border-width', '1px')
            .style('border-radius', '5px')
            .style('padding', '10px');
        
        // plot the points
        d3.json("./data.json", function(error, data) {
            if (error) throw error;
    
            svg.selectAll("circle")
                .data(data)
                .enter().append("circle")
                .attr("cx", function(d) { return projection([d.Longitude, d.Latitude])[0]; })
                .attr("cy", function(d) { return projection([d.Longitude, d.Latitude])[1]; })
                .attr("r", circleSize)
                .attr("fill", pointColor) // change the point color
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
                    // put a d3 line chart in d.Information
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
    
    })
}



const svg = d3.select('body').append('svg')
        .attr('height', height)
        .attr('width', width);

renderUSA(svg);


document.body.appendChild(svg.node());


