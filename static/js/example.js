// Global variable that holds the original 10 movies that will be displayed if "Reset" button is clicked
var originalMovies = [];
var originalRatings = [];

$(document).ready(function() {

  function createSliders(genre_ratings) {     
    $(".slider").each(function(i) {
      $(this).empty().slider({
        value: genre_ratings[i],
        range: "min",
        animate: true,
        orientation: "horizontal",
        tooltip: "show", // display the slider value as a tooltip
        slide: function(event, ui) { // update the tooltip as the slider is moved
          $(this).find(".ui-slider-handle").text(ui.value);
        },
        stop: function(event, ui) { // hide the tooltip when slider is not being moved
          $(this).find(".ui-slider-handle").text("");
        }
      });
    });
  }

  createSliders("50|50|50|50|50|50|50|50|50|50|50|50|50|50|50|50|50|50|50".split("|"));

  function updateSliders(ratings) {  
    $(".slider").each(function(i) {
      $(this).slider({value: ratings[i]});
    });
  }
  
  // Function that displays random 10 movies
  function displayMovies(data) {
    // Clear the movies container and append the new movies
    $('#movies-container').empty();
    console.log(data)
    $.each(data, function(index, movie) {
      const movieHtml = '<div class="movie">' +
                          '<img src="' + (movie.poster == "n/a" ? ("/static/img/no-image-png-2.png").replace(/&amp;/g, "&") : movie.poster) + '">' +
                          '<h2>' + movie.title + ' (' + movie.year + ')' + '</h2>' +
                        '</div>';
      $('#movies-container').append(movieHtml);
    });
  }

  // Function that resets sliders to original values and displays original 10 movies
  function resetSliders() {
    displayMovies(originalMovies);
    updateSliders(originalRatings);
  }

  // Set a flag to keep track of whether any slider value has been changed
  var slidersChanged = false;

  // Add an event listener to the sliders to set the flag when a value is changed
  $(".slider").on("slidechange", function(event, ui) {
    slidersChanged = true;
  });

  // Add an event listener to the update button to update the movies when clicked
  $("#update-button").on("click", function() {
    if (slidersChanged) {
      // Make the AJAX call to get the updated movies
      $.ajax({
        url: "/ajax/",
        type: "POST",
        dataType: "json",
        data: {
          call: 'get_movies',
          genre_ratings: $(".slider").map(function() { return $(this).slider("value"); }).get(),
          csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
        },
        success: function(data) {
          // Clear the movies container and append the new movies
          $('#movies-container').empty();
          displayMovies(data); 
        },
        error: function(xhr, errmsg, err) {
          console.log(xhr.status + ": " + xhr.responseText);
        }
      });
    }
  
    // Reset the flag after the movies have been updated
    slidersChanged = false;
  });

  // Resets sliders and movies to original values when reset button is clicked
  $("#reset-button").click(resetSliders);

    // Fetch User Info
    $("#fetchUser").click(function(e) {
        e.preventDefault();
        $.ajax({
            url: "/ajax/",
            type: "POST",
            dataType: "json",
            data: {
                call: 'fetch_user_info',
                userId: $('#userId').val(),
                extra: 0,
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
            },
            success: function (json) {
                console.log("Success", json);
                $('#userIdLabel').text($('#userId').val());
                $('#genderLabel').text(json.gender);
                $('#ageLabel').text(json.age);
                $('#occupationLabel').text(json.occupation);
                $('#locationLabel').text(json.zipCode);
                updateSliders(json.genreRatings.split("|"));
                originalRatings = json.genreRatings.split("|");
            },
            error: function (xhr, errmsg, err) {
                console.log("Error", xhr.status + ": " + xhr.responseText);
            }
        }).always(function() {
            // Stop spinner
            console.log("Always");
        });
    });

    // Get the User Explorer Data
    var cluster_data = [];
    $.ajax({
        url: "/ajax/",
        type: "POST",
        dataType: "json",
        data: {
            call: 'cluster_csv',
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
        },
        success: function(data) {
            console.log(data); 
            $.each(data, function(index, value) {
                cluster_data.push([value.x, value.y, value.cluster, value.user_id, value.is_representative])
            });
            console.log(cluster_data)
            generate_cluster();
        },
        error: function (xhr, errmsg, err) {
            console.log("Error", xhr.status + ": " + xhr.responseText);
        }
    });

    // Get initial 10 random movies
    $.ajax({
      url: "/ajax/",
      type: "POST",
      dataType: "json",
      data: {
        call: 'get_movies',
        csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
      },
      success: function(data) {
        originalMovies = data; // assign these original 10 movies to originalMovies global variable
        displayMovies(data);
      },
      error: function(xhr, errmsg, err) {
        console.log(xhr.status + ": " + xhr.responseText);
      }
    });

    function generate_cluster() {
        // Zoomable, Pannable, Hoverable Scatter Plot
        // Set height/width of plot
        height = 405;
        width = 500;
        k = height / width

        const data = cluster_data;
        console.log(data)

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
        
            const initial_scale = 13;
            const initial_translate_x = -x(-0.05) * (initial_scale - 1);
            const initial_translate_y = -y(0.025) * (initial_scale - 1);
            svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(initial_translate_x, initial_translate_y).scale(initial_scale));
        
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
    }

});