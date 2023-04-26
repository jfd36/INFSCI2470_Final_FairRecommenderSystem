$(document).ready(function () {
	// Global variable that holds the original 10 movies that will be displayed if "Reset" button is clicked
	var originalMovies = [];
	// Global variable that holds the original ratings for a given user that will be displayed if "Reset" button is clicked
	var originalRatings = [];
	var cluster_data = [];
	var cluster_chart;
	var representativeDots;
	var nonRepresentativeDots;

	var occupations = [
		"Unpecified",
		"Educator",
		"Artist",
		"Clerical",
		"College",
		"Service",
		"Health Care",
		"Managerial",
		"Farmer",
		"Homemaker",
		"K-12 Student",
		"Lawyer",
		"Programmer",
		"Retired",
		"Marketing",
		"Scientist",
		"Self-Employed",
		"Engineer",
		"Craftsman",
		"Unemployed",
		"Writer"
	];

	function createSliders(genre_ratings) {
		$(".slider").each(function (i) {
			$(this).empty().slider({
				value: genre_ratings[i],
				range: "min",
				animate: true,
				orientation: "horizontal",
				tooltip: "show", // display the slider value as a tooltip
				slide: function (event, ui) { // update the tooltip as the slider is moved
					$(this).find(".ui-slider-handle").text(ui.value);
				},
				stop: function (event, ui) { // hide the tooltip when slider is not being moved
					$(this).find(".ui-slider-handle").text("");
				}
			});
		
			// Add mousedown event handler to show the value when the slider is active
			$(this).find(".ui-slider-handle").on("mousedown", function () {
				$(this).text($(this).parent().slider("option", "value"));
			});
		
			// Add mouseup event handler to hide the value when the slider is not active
			$(this).find(".ui-slider-handle").on("mouseup", function () {
				$(this).text("");
			});
		});
		
		// Prevent pop-in on load
		$("#movie-row").removeClass('d-none');
	}

	$('#userId').selectize({
		create: false,
		placeholder: 'Enter ID between 1 - 6040',
		allowEmptyOption: true
	});

	$('#age').selectize({
		create: false,
		placeholder: 'None',
		allowEmptyOption: true
	});

	$('#gender').selectize({
		create: false,
		placeholder: 'None',
		allowEmptyOption: true
	});

	$('#location').selectize({
		create: false,
		placeholder: 'None',
		allowEmptyOption: true
	});

	$('#occupation').selectize({
		create: false,
		placeholder: 'None',
		allowEmptyOption: true
	});

	$('#top-genre').selectize({
		create: false,
		placeholder: 'None',
		allowEmptyOption: true
	});

	createSliders("50|50|50|50|50|50|50|50|50|50|50|50|50|50|50|50|50|50|50".split("|"));

	function updateSliders(ratings) {
		$(".slider").each(function (i) {
			$(this).slider({
				value: ratings[i]
			});
		});
	}

  	function ageRange(age) {
		const ageMapping = {
			1: "Under 18",
			18: "18-24",
			25: "25-34",
			35: "35-44",
			45: "45-49",
			50: "50-55",
			56: "56+"
		};
		return ageMapping[age] || "Unknown";
	}

	// Function that displays random 10 movies
	function displayMovies(data) {
		// Clear the movies container and append the new movies
		$('#movies-container').empty();
		$.each(data, function (index, movie) {
			const movieHtml = '<div class="movie">' +
				'<img src="' + (["n/a", "nan"].indexOf(movie.poster) !== -1 ? $("#placeholderImage").attr("src") : movie.poster) + '">' +
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
	$(".slider").on("slidechange", function (event, ui) {
		slidersChanged = true;
	});

	// Add an event listener to the update button to update the movies when clicked
	$("#update-button").on("click", function () {
		if (slidersChanged) {
			// Make the AJAX call to get the updated movies
			$.ajax({
				url: "/ajax/",
				type: "POST",
				dataType: "json",
				data: {
				call: 'get_movies',
				genre_ratings: $(".slider").map(function () {
					return $(this).slider("value");
				}).get(),
				csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
				},
				success: function (data) {
					// Clear the movies container and append the new movies
					$('#movies-container').empty();
					displayMovies(data);
				},
				error: function (xhr, errmsg, err) {
					console.log(xhr.status + ": " + xhr.responseText);
				}
			});
		}

		// Reset the flag after the movies have been updated
		slidersChanged = false;
	});

	// Resets sliders and movies to original values when reset button is clicked
	$("#reset-button").click(resetSliders);

	// Search for users in the Users Cluster View when search button is clicked
	$("#search").click(function (e) {
		e.preventDefault();
		$.ajax({
			url: "/ajax/",
			type: "POST",
			dataType: "json",
			data: {
				call: 'search_users',
				userId: $('#userId').val(),
				age: $("#age").val(),
				gender: $("#gender").val(),
				location: $("#location").val(),
				occupation: $("#occupation").val(),
				top_genre: $("#top-genre").val(),
				csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
			},
			success: function (json) {
				generate_cluster(json);
			},
			error: function (xhr, errmsg, err) {
				console.log("Error", xhr.status + ": " + xhr.responseText);
			}
		})
	});

	// Fetch User Info
	$("#fetchUser").click(function (e) {
		e.preventDefault();
		$.ajax({
			url: "/ajax/",
			type: "POST",
			dataType: "json",
			data: {
				call: 'fetch_user_info',
				userId: $('#userId').val(),
				extra: 1,
				csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
			},
			success: function (json) {
				$('#userIdLabel').text(json.userId);
				$('#genderLabel').text(json.gender);
				$('#ageLabel').text(ageRange(json.age));
				$('#occupationLabel').text(occupations[json.occupation]);
				$('#locationLabel').text(json.zipCode);
				updateSliders(json.genreRatings.split("|"));
				originalRatings = json.genreRatings.split("|");

				// Populate recent interactions
				let recentInteractions = $('#recentInteractions');
				recentInteractions.empty();
				for (let rating of json.ratings) {
					recentInteractions.append('<li>' + rating + '</li>');
				}

				// Highlight the queried user
				if (json.cluster_data.length > 1) {
					cluster_chart = generate_cluster(json.cluster_data);
				} else {
					cluster_chart = generate_cluster(cluster_data);
				}

				// Update movies
				$("#update-button").click();
			},
			error: function (xhr, errmsg, err) {
				console.log("Error", xhr.status + ": " + xhr.responseText);
			}
		})
	});

	// Get the User Explorer Data
	$.ajax({
		url: "/ajax/",
		type: "POST",
		dataType: "json",
		data: {
			call: 'cluster_csv',
			csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
		},
		success: function (data) {
			cluster_data = data;
			cluster_chart = generate_cluster(data);
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
		success: function (data) {
			originalMovies = data; // assign these original 10 movies to originalMovies global variable
			displayMovies(data);
		},
		error: function (xhr, errmsg, err) {
			console.log(xhr.status + ": " + xhr.responseText);
		}
	});

	// Fetch Movie recommendations
	async function fetchMovies(userId) {
		return new Promise((resolve, reject) => {
			$.ajax({
				url: "/ajax/",
				type: "POST",
				dataType: "json",
				data: {
					call: 'get_movies',
					userId: userId,
					csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
				},
				success: function (json) {
					resolve(json);
				},
				error: function (xhr, errmsg, err) {
					console.log("Error", xhr.status + ": " + xhr.responseText);
					reject(xhr);
				}
			});
		});
	}

	// Fetch User
    async function fetchUser(userId) {
		return new Promise((resolve, reject) => {
			$.ajax({
				url: "/ajax/",
				type: "POST",
				dataType: "json",
				data: {
					call: 'fetch_user_info',
					userId: userId,
					extra: 0,
					csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
				},
				success: function (json) {
					resolve(json);
				},
				error: function (xhr, errmsg, err) {
					console.log("Error", xhr.status + ": " + xhr.responseText);
					reject(xhr);
				}
			});
		});
	}

	async function fetchUserTooltip(userId) {
		let userData = await fetchUser(userId)
		return `<b>User: </b>${userId}<br><b>Gender: </b>${userData.gender}<br><b>Age: </b>${ageRange(userData.age)}<br><b>Occupation: </b>${occupations[userData.occupation]}<br><b>Location: </b>${userData.zipCode}`;
	}
  
	async function addCounterfactualPersona(userId) {
		if ($('#user-'+userId).length) {
			return;
		}
		let user = await fetchUser(userId)
		let counterfactualPersonaHTML = `
			<div class="col-sm-6">
				<div class="card mb-3">
					<div class="row card-body">
						<div class="col-sm-4 text-center">
							<img src="` + $("#avatarImage").attr("src") + `" class="img-fluid rounded-circle w-75">
							<button class="btn btn-success btn-sm mt-2 movies-btn">Movies</button>
							<button class="btn btn-danger btn-sm mt-2 delete-btn">Delete</button>
						</div>
						<div class="col-sm-8">
							<h5 id="user-${userId}" class="card-title">User ${userId}</h5>
							<p class="card-text">		
								<b>Gender: </b>${user.gender}<br>
								<b>Age: </b>${ageRange(user.age)}<br>
								<b>Occupation: </b>${occupations[user.occupation]}<br>
								<b>Location: </b>${user.zipCode}
							</p>
						</div>
					</div>
				</div>
			</div>
		`;
		$("#counterfactual-personas").append(counterfactualPersonaHTML);
	}

  	function generate_cluster(data) {
		// Zoomable, Pannable, Hoverable Scatter Plot
		// Set height/width of plot
		// height = 240;
		// width = 400;
		height = $("#cluster-column").height()
		width = $("#cluster-column").width()
		k = height / width

		$("#chart").empty();

		grid = (g, x, y) => g
			.attr("stroke", "currentColor")
			.attr("stroke-opacity", 0.1)
			.call(g => g
				.selectAll(".x")
				.data(x.ticks(12))
				.join(
					enter => enter.append("line").attr("class", "x").attr("y2", height+10),
					update => update,
					exit => exit.remove()
				)
				.attr("x1", d => 0.5 + x(d))
				.attr("x2", d => 0.5 + x(d)))
			.call(g => g
				.selectAll(".y")
				.data(y.ticks(12 * k))
				.join(
					enter => enter.append("line").attr("class", "y").attr("x2", width+10),
					update => update,
					exit => exit.remove()
				)
				.attr("y1", d => 0.5 + y(d))
				.attr("y2", d => 0.5 + y(d)));

		yAxis = (g, y) => g.call(d3.axisRight(y).ticks(12 * k)).call(g => g.select(".domain").attr("display", "none"))
		xAxis = (g, x) => g.attr("transform", `translate(0,${height})`).call(d3.axisTop(x).ticks(12)).call(g => g.select(".domain").attr("display", "none"))

		z = d3.scaleOrdinal().domain(data.map(d => d[2])).range(d3.schemeCategory10)
		y = d3.scaleLinear().domain([-4.5 * k, 4.5 * k]).range([height, 0])
		x = d3.scaleLinear().domain([-4.5, 4.5]).range([0, width])

		const chart = () => {
			const zoom = d3.zoom().scaleExtent([8, 128]).on("zoom", zoomed);
			const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
			const gGrid = svg.append("g");

			// Create a tooltip div
			const tooltip = d3.select("#chart").append("div").style("opacity", 0).attr("class", "tooltip");
			const gDot = svg.append("g").attr("fill", "none").attr("stroke-linecap", "round")

			let tooltipTimeout;
			let lastHoveredPoint;

			nonReprData = data.filter(d => d[4] !== 1)
			reprData = data.filter(d => d[4] == 1)

			nonRepresentativeDots = gDot.selectAll(".non-representative")
				.data(nonReprData)
				.join("path")
				.classed("non-representative", true)
				.attr("d", d => `M${x(d[0])},${y(d[1])}h0`)
				.attr("stroke", d => z(d[2]))
				// .attr("stroke-width", z(0.1))

			representativeDots = gDot.selectAll(".representative")
				.data(reprData)
				.join("path")
				.classed("representative", true)
				.attr("d", d => `M${x(d[0])},${y(d[1]) - 0.05}l-0.05,.1h.1z`)
				.attr("stroke", d => d3.color(z(d[2])).brighter(1))
				.attr("stroke-width", z(.05))
				.attr("fill", d => d3.color(z(d[2])).brighter(1))
		
			gDot.selectAll(".representative, .non-representative")
				.on("mouseover", async function (event, d) {
					if (lastHoveredPoint !== d[3]) {
						clearTimeout(tooltipTimeout);
				
						tooltipTimeout = setTimeout(async () => {
							let tooltipHtml = await fetchUserTooltip(d[3]);
							tooltip.html(tooltipHtml).style("left", (event.x) + "px").style("top", (event.y - 300) + "px");
							tooltip.transition().duration(100).style("opacity", .9);
						}, 30);
					}
					lastHoveredPoint = d[3];
				}).on("mouseout", function (d) {
						clearTimeout(tooltipTimeout);
						tooltip.transition().duration(500).style("opacity", 0);
						lastHoveredPoint = null;
				}).on("click", function (event, d) {
					addCounterfactualPersona(d[3]);
				});

			let hideTooltipTimeout;

			$(document).on("mousemove", function(event) {
				const targetTagName = event.target.tagName.toLowerCase();
			
				if (targetTagName !== "g" && targetTagName !== "svg" && targetTagName !== "path") {
				clearTimeout(hideTooltipTimeout);
			
				hideTooltipTimeout = setTimeout(function() {
					tooltip.transition()
					.duration(500)
					.style("opacity", 0);
					lastHoveredPoint = null;
				}, 500);
				} else {
				clearTimeout(hideTooltipTimeout);
				}
			});

			const gx = svg.append("g");

			const gy = svg.append("g");

			const initial_scale = 10;
			const initial_translate_x = -x(-0.05) * (initial_scale - 1);
			const initial_translate_y = -y(0.025) * (initial_scale - 1);
			svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(initial_translate_x, initial_translate_y).scale(initial_scale));

			function zoomed({
				transform
			}) {
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

		return chart;
	}

	// modal dialogue box for user profile section
	var dialog1 = $('<div></div>')
		.attr('id', 'dialog1')
		.html("<ul><li>Choose a user by entering a number between 1-6040 in the text box.</li><li>After choosing a user, you'll see their demographics and most recently rated movies displayed.</li><li>To the right you can see the top 10 recommendations for this user based on their genre preferences.</li><li>Below, you can see which cluster this user is placed in.</li?</ul>")
		.dialog({
			autoOpen: false,
			modal: true,
			title: 'User Profile Help',
			width: 500,
			create: function(event, ui) {
				$(event.target).parent().find('.ui-dialog-titlebar-close').addClass('btn-danger').addClass('btn').addClass('pt-1');
			}
		});

	// modal dialogue box for recommendations section
	var dialog2 = $('<div></div>')
		.attr('id', 'dialog2')
		.html("<ul><li>This is where you can view movie recommendations. Once a user is selected, the slider values will change based on that users preferences</li><li>This user's recommendations based on their genre preferences will be shown to the right of the sliders.</li><li>You can view new recommendations by adjusting the sliders and then clicking update.</li><li>Click the reset button if you want to view the original recommendations and reset the sliders.</li></ul>")
		.dialog({
			autoOpen: false,
			modal: true,
			title: 'Recommendations Help',
			width: 500,
			create: function(event, ui) {
				$(event.target).parent().find('.ui-dialog-titlebar-close').addClass('btn-danger').addClass('btn').addClass('pt-1');
			}
		});

	// modal dialogue box for user cluster view section
	var dialog3 = $('<div></div>')
		.attr('id', 'dialog3')
		.html('<ul><li>This cluster plot is a view of all the users in the database. They are clustered into groups based on their genre ratings.</li> <li>Each cluster has a "representative user" which is shown with a different symbol in the cluster plot. This "representative user" shows what the average user looks like for a given cluster. <li>You can hover over each user to see their demographics.</li><li>You can also filter the plot using the 5 filters provided. You can choose which filters you would like to apply.</li><li> If you see a user and would like to see what they would be recommended, select by clicking on the user in the cluster plot.</li><li>You will see this user added to the Counterfactual Persona Explorer (bottom right section). You can select an unlimited number of users.</li></ul>')
		.dialog({
			autoOpen: false,
			modal: true,
			title: 'User Cluster View Help',
			width: 500,
			create: function(event, ui) {
				$(event.target).parent().find('.ui-dialog-titlebar-close').addClass('btn-danger').addClass('btn').addClass('pt-1');
			}
		});

	// modal dialogue box for counterfactual section
	var dialog4 = $('<div></div>')
		.attr('id', 'dialog4')
		.html('<ul><li>Each user and their demographics selected from the cluster plot are displayed here.</li><li>Click the "Movies" button for a given user to see their top movie recommendations.</li></ul>')
		.dialog({
			autoOpen: false,
			modal: true,
			title: 'Counterfactual Persona Explorer Help',
			width: 500,
			create: function(event, ui) {
				$(event.target).parent().find('.ui-dialog-titlebar-close').addClass('btn-danger').addClass('btn').addClass('pt-1');
			}
		});

	$("#counterfactual-personas").on("click", ".delete-btn", function() {
		$(this).closest(".col-sm-6").remove();
	});
	
	// modal dialogue box for counterfactual section
	var dialogPersona = $('<div></div>')
		.attr('id', 'dialogPersona')
		.html('<div id="counterfactual-movie-recs"></div>')
		.dialog({
			autoOpen: false,
			modal: true,
			title: 'Recommended Movies',
			width: 500,
			create: function(event, ui) {
				$(event.target).parent().find('.ui-dialog-titlebar-close').addClass('btn-danger').addClass('btn').addClass('pt-1');
			}
		});

	$("#counterfactual-personas").on("click", ".movies-btn", async function() {
		var userTitle = $(this).closest(".card-body").find("h5").text();
		dialogPersona.dialog("option", "title", "Recommended Movies for " + userTitle);
		let movies = await fetchMovies(userTitle.split()[1]);
		let counterfactualMovies = $("<div style='display: flex'></div>");
		$.each(movies, function (index, movie) {
			const movieHtml = '<div class="movie text-center mx-2">' +
				'<img src="' + (["n/a", "nan"].indexOf(movie.poster) !== -1 ? $("#placeholderImage").attr("src") : movie.poster) + '">' +
				'<h2>' + movie.title + ' (' + movie.year + ')' + '</h2>' +
				'</div>';
			counterfactualMovies.append(movieHtml);
		});
		dialogPersona.html(counterfactualMovies);
		dialogPersona.dialog('open');
	});

	// Add a click event listener to each button
	$('.floating-button').click(function() {
		const dialogId = $(this).data('dialog-id');
		$('#' + dialogId).dialog('open');
	});

	// Add a click event listener to the close button of each dialog box
	$('.ui-dialog-titlebar-close').click(function() {
		// Close the corresponding dialog box when the close button is clicked
		$(this).closest('.ui-dialog-content').dialog('close');
	});
});