// import us from './states-albers-10m.json';

const width = 975;
const height = 615;

d3.json("./states-albers-10m.json", function(error, us) {
    const svg = d3.select('body').append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('height', height)
    .attr('width', width);

    const path = d3.geoPath();

    svg.append('path')
        .attr('fill', '#ddd')
        .attr('d', path(topojson.feature(us, us.objects.nation)));

    svg.append('path')
        .attr('fill', 'none')
        .attr('stroke', '#fff')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round');


    document.body.appendChild(svg.node());
})


