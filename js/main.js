// Initialize the Map
const map = L.map('map', {
    center: [20, 0],
    zoom: 3,
    worldCopyJump: true 
});

// Add the Basemap (Dark Mode)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// Define the Data Source (USGS Live Feed)
const earthquakeFeed = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Pick color based on magnitude
function getColor(mag) {
    return mag > 6.0 ? '#ff0055' : // Red (Severe)
           mag > 4.5 ? '#ff8c00' : // Orange (Moderate)
                       '#00ff88';  // Green (Minor)
}

// Style the Points (because why not?)
function getStyle(feature) {
    return {
        radius: feature.properties.mag * 2.5, // Scale size by magnitude
        fillColor: getColor(feature.properties.mag),
        color: "#fff",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.7
    };
}

// Fetch Data and Add to Map
fetch(earthquakeFeed)
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, getStyle(feature));
            },
            onEachFeature: function (feature, layer) {
                const date = new Date(feature.properties.time).toLocaleString();
                const popupContent = `
                    <div style="font-family: sans-serif; min-width: 150px;">
                        <h4 style="margin:0 0 5px 0; color:#333;">M ${feature.properties.mag} Quake</h4>
                        <p style="margin:0; font-size:0.9em;"><strong>${feature.properties.place}</strong></p>
                        <p style="margin:5px 0 0 0; font-size:0.8em; color:#666;">${date}</p>
                        <a href="${feature.properties.url}" target="_blank" style="font-size: 0.8em;">More Info</a>
                    </div>
                `;
                layer.bindPopup(popupContent);
            }
        }).addTo(map);
    })
    .catch(error => console.error("Error loading USGS data:", error));


// Legend Control (Because a map without a legend is like a pizza without toppings)
const legend = L.control({ position: 'bottomleft' });

legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = [0, 4.5, 6.0];
    const labels = ['Minor (< 4.5)', 'Moderate (4.5 - 6.0)', 'Severe (> 6.0)'];
    const colors = ['#00ff88', '#ff8c00', '#ff0055'];

    // Add some styles to make sure the legend box looks good
    div.style.backgroundColor = 'rgba(30, 30, 30, 0.8)';
    div.style.padding = '10px';
    div.style.borderRadius = '5px';
    div.style.color = '#fff';

    div.innerHTML = '<h4 style="margin: 0 0 5px 0;">Seismic Intensity</h4>';

    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '; width: 10px; height: 10px; display: inline-block; margin-right: 5px;"></i> ' +
            labels[i] + '<br>';
    }

    return div;
};

legend.addTo(map);