const width = 975;
const height = 615;

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
    
    // plot the points
    d3.json("./data.json", function(error, data) {
        if (error) throw error;

        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", function(d) { return projection([d.Longitude, d.Latitude])[0]; })
            .attr("cy", function(d) { return projection([d.Longitude, d.Latitude])[1]; })
            .attr("r", 5)
            .attr("fill", "red")
            .append("title")
            .text(function(d) { return d.Information; });
    });


    document.body.appendChild(svg.node());
})


