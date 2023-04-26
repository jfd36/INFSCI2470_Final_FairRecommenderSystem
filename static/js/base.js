$(document).ready(function() {
    var dialogAbout = $('<div></div>')
        .html("<p><b>Welcome to our fair movie recommender system!</b><br><br>We believe that everyone deserves to enjoy movies that cater to their unique tastes and preferences. Our system is designed to provide fair and non-biased movie recommendations by giving you, the user, full control to explore and discover movies that interest you. We don't believe in hiding anything from you, and that's why we strive to be transparent and open about our recommendations. With our user-centric approach, we aim to provide you with the best movie recommendations that match your interests and preferences, without any hidden biases or preconceptions.<br><br>Click \"Getting Started\" at the top of the screen for guidance on using the interface. Thank you for choosing our fair movie recommender system!</p>")
        .dialog({
            modal: true,
            title: 'Recommendations Help',
            width: 500,
			create: function(event, ui) {
				$(event.target).parent().find('.ui-dialog-titlebar-close').addClass('btn-danger').addClass('btn').addClass('pt-1');
			}
        });
    
    var dialogHelp = $('<div></div>')
        .html("<p><ul><li>To get started, select a user in the 'User Profile' section. You'll see the 'Recommendations' and 'User Cluster View' sections are customized to the user you selected.</li><li>For more help navigating each section, click the '?' in the top right corner.</li></ul></p>")
        .dialog({
            autoOpen: false,
            modal: true,
            title: 'Recommendations Help',
            width: 500,
			create: function(event, ui) {
				$(event.target).parent().find('.ui-dialog-titlebar-close').addClass('btn-danger').addClass('btn').addClass('pt-1');
			}
        });

    $("#aboutBtn").click(function() {
        dialogAbout.dialog('open');
    });

    $("#helpBtn").click(function() {
        dialogHelp.dialog('open');
    }); 
});