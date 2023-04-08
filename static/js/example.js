$(document).ready(function() {
     // Define the sliders
     $(".slider").each(function() {
        // read initial values from markup and remove that
        var value = parseInt($(this).text(), 10);
        $(this).empty().slider({
          value: value,
          range: "min",
          animate: true,
          orientation: "horizontal"
        });
    });

    // Zoomable, Pannable, Hoverable Scatter Plot
    // Set height/width of plot
    height = 405;
    width = 500;
    k = height / width

    // 900 random points
    const data = (() => {
        const random = d3.randomNormal(0, 0.2);
        const sqrt3 = Math.sqrt(3);
        return [].concat(
          Array.from({ length: 300 }, () => [random() + sqrt3, random() + 1, 0]),
          Array.from({ length: 300 }, () => [random() - sqrt3, random() + 1, 1]),
          Array.from({ length: 300 }, () => [random(), random() - 1, 2]),
        //   'TEST DATA'
        );
      })();

    grid = (g, x, y) => g
    .attr("stroke", "currentColor")
    .attr("stroke-opacity", 0.1)
    .call(g => g
      .selectAll(".x")
      .data(x.ticks(12))
      .join(
        enter => enter.append("line").attr("class", "x").attr("y2", height),
        update => update,
        exit => exit.remove()
      )
        .attr("x1", d => 0.5 + x(d))
        .attr("x2", d => 0.5 + x(d)))
    .call(g => g
      .selectAll(".y")
      .data(y.ticks(12 * k))
      .join(
        enter => enter.append("line").attr("class", "y").attr("x2", width),
        update => update,
        exit => exit.remove()
      )
        .attr("y1", d => 0.5 + y(d))
        .attr("y2", d => 0.5 + y(d)));
    
    yAxis = (g, y) => g
    .call(d3.axisRight(y).ticks(12 * k))
    .call(g => g.select(".domain").attr("display", "none"))

    xAxis = (g, x) => g
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisTop(x).ticks(12))
    .call(g => g.select(".domain").attr("display", "none"))

    z = d3.scaleOrdinal()
    .domain(data.map(d => d[2]))
    .range(d3.schemeCategory10)

    y = d3.scaleLinear()
    .domain([-4.5 * k, 4.5 * k])
    .range([height, 0])

    x = d3.scaleLinear()
    .domain([-4.5, 4.5])
    .range([0, width])
 
      const chart = () => {
        const zoom = d3.zoom()
          .scaleExtent([0.5, 32])
          .on("zoom", zoomed);
      
        const svg = d3.create("svg")
          .attr("viewBox", [0, 0, width, height]);
      
        const gGrid = svg.append("g");

        // Create a tooltip div
        const tooltip = d3.select("#chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");
      
        const gDot = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-linecap", "round")
            
      
        gDot.selectAll("path")
          .data(data)
          .join("path")
          .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`User ${d[2]}: (${d[0].toFixed(2)}, ${d[1].toFixed(2)})`)
                .style("left", (event.x) + "px")
                .style("top", (event.y - 300) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
          .attr("d", d => `M${x(d[0])},${y(d[1])}h0`)
          .attr("stroke", d => z(d[2]));
      
        const gx = svg.append("g");
      
        const gy = svg.append("g");
      
        svg.call(zoom).call(zoom.transform, d3.zoomIdentity);
      
        function zoomed({transform}) {
          const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
          const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
          gDot.attr("transform", transform).attr("stroke-width", 5 / transform.k);
          gx.call(xAxis, zx);
          gy.call(yAxis, zy);
          gGrid.call(grid, zx, zy);
        }
      
        return Object.assign(svg.node(), {
          reset() {
            svg.transition()
              .duration(750)
              .call(zoom.transform, d3.zoomIdentity);
          }
        });
      };

    const chartDiv = d3.select("#chart");
    const chartSvg = chartDiv.append(() => chart());

    // reset, chart.reset()


    function exampleFunction(data) {
        $.each(data.movies, function() {
            console.log(this);
        });
    }


    // --------------------
    // --- AJAX Example ---
    // --------------------
    $("#ajax_demo").click(function() {
        $.ajax({
            url: "/ajax/",
            type: "POST",
            dataType: "json",
            data: {
                call: 'fetch_movie_data',
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            },
            success: function (json) {
                console.log("Success", json);
                exampleFunction(json);
            },
            error: function (xhr, errmsg, err) {
                console.log("Error", xhr.status + ": " + xhr.responseText);
            }
        }).always(function() {
            // Stop spinner
            console.log("Always");
        });
    });


    // Interactive bar chart prototype
    function genreBarchart(data) {
        // Set the dimensions of the chart
        var margin = { top: 20, right: 20, bottom: 50, left: 40 },
        width = 600 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;
    
        // Create the SVG element to contain the chart
        var svg = d3.select("#barchart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        // Define the x and y scales
        var x = d3.scaleBand()
        .range([0, width])
        .domain(data.slice(1).map(function(d) { return d[0]; }))
        .padding(0.2);
    
        var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data.slice(1).map(function(d) { return d[1]; }))]);
    
        // Create the bars
        svg.selectAll(".bar")
        .data(data.slice(1))
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return height - y(d[1]); })
        .attr("fill", "red");;
    
        // Add the x-axis
        svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");;
    
        // Add the y-axis
        svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));
    }

    var exampleUserData = [
        ["genre", "rating", "value", "userId"],
        ["Action", 246.0, 0.8861940298507462, 1],
        ["Adventure", 276.5, 1.0, 1],
        ["Animation", 36.5, 0.1044776119402985, 1],
        ["Children", 68.5, 0.22388059701492538, 1],
        ["Comedy", 153.0, 0.539179104477612, 1],
        ["Crime", 80.0, 0.2667910447761194, 1],
        ["Drama", 162.0, 0.5727611940298507, 1],
        ["Fantasy", 261.5, 0.9440298507462687, 1],
        ["Horror", 168.5, 0.5970149253731343, 1],
        ["IMAX", 8.5, 0.0, 1],
        ["Musical", 11.0, 0.009328358208955223, 1],
        ["Mystery", 65.0, 0.21082089552238806, 1],
        ["Romance", 43.5, 0.13059701492537312, 1],
        ["Sci-Fi", 148.5, 0.5223880597014925, 1],
        ["Thriller", 158.0, 0.5578358208955224, 1],
        ["War", 33.0, 0.0914179104477612, 1],
        ["Western", 13.5, 0.018656716417910446, 1]
    ];

    var bardata = [
        ["genre", "value"],
        ["Horror", 50],
        ["Mystery", 30],
        ["Romance", 10],
        ["Action", 80],
        ["Thriller", 70]
    ];
    genreBarchart(exampleUserData);
});