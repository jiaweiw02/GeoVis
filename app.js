const width = 975;
const height = 615;
const circleSize = 5;
const hoveringCircleSize = 10;
const pointColor = "blue";

d3.json("./states-albers-10m.json", function(error, us) {

    if (error) throw error;

    const svg = d3.select('body').append('svg')
        .attr('height', height)
        .attr('width', width);

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
                tooltip.html(d.Information)
                    .style('visibility', 'visible')
                    
                    .transition()
                    .duration(300)
                    .style('opacity', 1);
            })
    });

    document.body.appendChild(svg.node());
})


