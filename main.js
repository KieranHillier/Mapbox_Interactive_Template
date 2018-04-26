//set access token that allows the use of 'mapboxgl' functions
mapboxgl.accessToken = 'pk.eyJ1IjoibWVkdGVnaXMiLCJhIjoiY2o3bTE5OHBpMnR6YjMzbHg1dnN4anFncyJ9.EHZOmQ3AjxLvc8WTLeYWKg';

//declare map
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/medtegis/cj905z4jy1be12rlaziec3mc7',    //mapbox://styles/medtegis/cj905z4jy1be12rlaziec3mc7 --- mapbox://styles/mapbox/light-v9
	center: [-79.389487, 43.662396],
	zoom: 8.5,
	maxZoom: 15,
	pitch: 0,
	padding:20,
	minZoom: 8,
	maxBounds: [[-84.10194897198637, 41.10217733325325], [-73.71324058503285, 47.596906324895485]]
});

//add navigation control to top-right of the screen
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

//load in layers once the webpage is booted
map.on('load', function() {

	//source to pull layer info from
	map.addSource ('source', {
    'type': 'vector',
    'url': 'mapbox://medtegis.7ouonno8'
  });

	//layer to create hover effect
  map.addLayer({
    'id': 'income-hover',
    'type': 'line',
    'source': 'source',
    'source-layer': 'lct_000b16a_e_IncomeAge3857-2fhlg6',
    'paint': {
      'line-color': "#000000",
			'line-opacity': 0.7,
			'line-width': 2
    },
    "filter": ["==", "lct_000b16", ""]
  });

	//layer for medium household income
	map.addLayer({
    'id': 'income',
    'type': 'fill',
    'source': 'source',
    'source-layer': 'lct_000b16a_e_IncomeAge3857-2fhlg6',
		'layout': {
			"visibility": "visible"
		},
		'paint': {
			'fill-color': {
        'property': 'medtotalin',
        'type': 'interval',
        'stops': [
          [34112, '#f1eef6'],
          [62496, '#d0d1e6'],
          [86272, '#a6bddb'],
          [113024, '#74a9cf'],
          [164352, '#2b8cbe'],
          [289792, '#045a8d'],
        ]
      }
    }
  }, 'road-label-large');

	//layer for percent of population (0-14)
	map.addLayer({
    'id': 'percentile',
    'type': 'fill',
    'source': 'source',
    'source-layer': 'lct_000b16a_e_IncomeAge3857-2fhlg6',
		'layout': {
			"visibility": "none"
		},
		'paint': {
			'fill-color': {
        'property': 'perc0to14',
        'type': 'interval',
        'stops': [
          [0.0792, '#fef0d9'],
          [0.1259, '#fdd49e'],
          [0.1558, '#fdbb84'],
          [0.1871, '#fc8d59'],
          [0.2290, '#e34a33'],
          [0.3512, '#b30000'],
        ]
      }
    }
  }, 'place-village');

	//layer for total population (0-14)
	map.addLayer({
    'id': 'totalpop',
    'type': 'fill',
    'source': 'source',
    'source-layer': 'lct_000b16a_e_IncomeAge3857-2fhlg6',
		'layout': {
			"visibility": "none"
		},
		'paint': {
			'fill-color': {
        'property': 'Zeroto14yr',
        'type': 'interval',
        'stops': [
          [420, '#edf8fb'],
          [755, '#ccece6'],
          [1160, '#99d8c9'],
          [1830, '#66c2a4'],
          [3340, '#2ca25f'],
          [5665, '#006d2c'],
        ]
      }
    }
  }, 'place-village');

	//layer that creates the polygon outlines
  map.addLayer({
    'id': 'income-outline',
    'type': 'line',
    'source': 'source',
    'source-layer': 'lct_000b16a_e_IncomeAge3857-2fhlg6',
    'paint': {
      'line-color': '#868588',
      'line-width': 0.2
    }
  });
});

//object to store layer names and attribues that will populate the legend
//use same colours and breakpoints as imported data layer
var layers = {
	percentile : {
		title: 'Percentage of Population aged 10-14 (yrs)',
		color: ['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#e34a33', '#b30000'],
		text: ['0 - 7.92', '7.93 - 12.59', '12.60 - 15.58', '15.59 - 18.71', '18.72 - 22.90', '22.91 - 35.12']
	},
	totalpop : {
		title: 'Total Number of Population aged 10-14 (yrs)',
		color: ['#edf8fb', '#ccece6', '#99d8c9', '#66c2a4', '#2ca25f', '#006d2c'],
		text: ['0 - 420', '421 - 755', '756 - 1160', '1161 - 1830', '1831 - 3340', '3341 - 5665']
	},
	income : {
		title: 'Average Household Income ($)',
		color: ['#f1eef6', '#d0d1e6', '#a6bddb', '#74a9cf', '#2b8cbe', '#045a8d'],
		text: ['0 - 34112', '34113 - 62496', '62497 - 86272', '86273 - 113024', '113025 - 164352', '164353 - 289792']
	}
};

//initialize legend with layer you want when page is loaded
updateLegend(layers.income.color, layers.income.text);

//keypress listener for changing layers
document.addEventListener('keypress', (event) => {
	const keyCode = event.charCode;
	if (keyCode === 13 ) {
		updateMap(event);
	}
});

//on click listener for changing layers
document.addEventListener('click', (event) => {
	updateMap(event);
});

//create click effect when users mouses over the data
map.on("click", 'income', mouseMove);
map.on("click", 'totalpop', mouseMove);
map.on("click", 'percentile', mouseMove);


//monetary formatter -- parts of JS internationalization API -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 0,
});


//function to create hover effect
function mouseMove(e) {
	feature = e.features[0];
	coords = e.lngLat;
	console.log(feature);
	map.setFilter("income-hover", ["==", "lct_000b16", feature.properties.lct_000b16]);
	var rounded = Math.round((feature.properties.perc0to14 *100) * 100) / 100
	var moneyFormat = formatter.format(feature.properties.medtotalin)
	var popup = new mapboxgl.Popup({offset:10})
			.setLngLat([coords.lng, coords.lat])
			.setHTML("<strong>Percentage of Pop (0 - 14):</strong> " + rounded + "%<br> <strong>Number of People (0 - 14):</strong> " + feature.properties.Zeroto14yr + "<br> <strong>Median Household Income:</strong> " + moneyFormat)
			.addTo(map);
	// $("#stats").html("Percentage of Pop (0 - 14): " + (feature.properties.perc0to14 *100) + "%<br> Number of People (0 - 14): " + feature.properties.Zeroto14yr + "<br> Median Household Income: $" + feature.properties.medtotalin);
}

//funtion to update text and colours of legend
function updateLegend(color, text) {
  for (i=0; i<color.length; i++) {
    $("#color" + (i + 1)).css( "background-color", color[i]);
    $("#text" + (i + 1)).text(text[i]);
  }
}

//display the correct layer
function updateMap(event) {
	var layerFocused = event.target.innerText.toLowerCase();
	var trimmed = layerFocused.replace(" ", "");
	for (var key in layers) {
		if (trimmed === key) {
			var layer_title = document.getElementById('layer-title');
			var color = layers[key].color;
			var text = layers[key].text;
			var title = layers[key].title;
			layer_title.innerText = title;
			checkVisibility(key);
			updateLegend(color, text);
		}
	}
}

//determine which layer to display
function checkVisibility(target) {
	for (var key in layers) {
		var current = key;
		var layerDOM = document.querySelector('#' + current);

		//find match and display it. hide the rest
		if (target === current) {
			map.setLayoutProperty(current, 'visibility', 'visible');
			layerDOM.classList.add('active');
		} else {
			map.setLayoutProperty(current, 'visibility', 'none');
			layerDOM.classList.remove('active');
		}
	}
}
