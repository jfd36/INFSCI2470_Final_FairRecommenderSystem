$(document).ready(function() {
    // Set up dimensions and margins
    const margin = {top: 10, right: 30, bottom: 30, left: 60};
    const width = 460 - margin.left - margin.right;
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
            tooltip.html(`GrLivArea: ${d.GrLivArea}<br>SalePrice: ${d.SalePrice}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        // Add mouseout event to hide tooltip
        .on("mouseout", function(d) {
            tooltip.transition()
            .duration(500)
            .style("opacity", 0);
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
            },
            error: function (xhr, errmsg, err) {
                console.log("Error", xhr.status + ": " + xhr.responseText);
            }
        }).always(function() {
            // Stop spinner
            console.log("Always");
        });
    });
});