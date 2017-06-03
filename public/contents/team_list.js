jQuery(function($) {
	$(document).ready(function(){
		$.get('/user/team_list', function(res) {
			if (res && res.result && res.result.length > 0) {
			//alert(Object.values(res.result));
			//alert(whichIsVisible()[0]);
				var team_data_str = JSON.stringify(res.result);
				var team_data = JSON.parse(team_data_str);
				alert("Data: " +  team_data.length + "\nStatus: " + status);
			}			
		});		
	});	
});