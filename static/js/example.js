$(document).ready(function() {
    // Set up dimensions and margins
    const margin = {top: 10, right: 30, bottom: 30, left: 60};
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleLinear()
    .range([0, width]);

    const yScale = d3.scaleLinear()
    .range([height, 0]);

    // Append SVG element to the chart div
    const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create a tooltip div
    const tooltip = d3.select("#chart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip");

    // Load data and draw chart
    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv")
    .then(data => {
        // Convert string data to numeric values
        data.forEach(d => {
        d.GrLivArea = +d.GrLivArea;
        d.SalePrice = +d.SalePrice;
        });

        // Set domains for scales based on data
        xScale.domain([0, d3.max(data, d => d.GrLivArea)]);
        yScale.domain([0, d3.max(data, d => d.SalePrice)]);

        // Add axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

        svg.append("g")
        .call(yAxis);

        // Draw dots
        drawDots(data, xScale, yScale);
    })
    .catch(error => console.error(error));

    function drawDots(data, xScale, yScale) {
        svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.GrLivArea))
        .attr("cy", d => yScale(d.SalePrice))
        .attr("r", 1.5)
        .style("fill", "#69b3a2")
        // Add mouseover event to show tooltip
        .on("mouseover", function(event, d) {
            tooltip.transition()
            .duration(200)
            .style("opacity", .9);
            tooltip.html(`UserID: ${d.GrLivArea}<br>Blah blah: ${d.SalePrice}`)
            .style("left", (event.pageX - 635) + "px")
            .style("top", (event.pageY - 50) + "px");
        })
        // Add mouseout event to hide tooltip
        .on("mouseout", function(d) {
            tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
    }

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
    

    // Define the sliders
    for (var i = 1; i < exampleUserData.length; i++) {
        var label = exampleUserData[i][0];
        var value = exampleUserData[i][2];
        var slider = '<div><label for="' + label + '">' + label + '</label><div class="slider" id="' + label + '"></div></div>';
        $('#sliders').append(slider);

        $('#' + label).slider({
            create: function() {
            //   handle.text( $( this ).slider( "value" ) );
            },
            slide: function( event, ui ) {
            //   handle.text( ui.value );
            }
          });
    }
});