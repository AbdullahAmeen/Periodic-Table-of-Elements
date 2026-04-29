// Choropleth Map for Element Distribution
let currentElement = 'steel';
let geoJsonLayer;

// Define element descriptions
const elementDescriptions = {
    steel: {
        name: 'Steel',
        uses: 'Buildings, Machines',
        color: '#FF6B6B'
    },
    aluminum: {
        name: 'Aluminum',
        uses: 'Aircraft, Cans, Transport',
        color: '#4ECDC4'
    },
    copper: {
        name: 'Copper',
        uses: 'Wiring, Motors',
        color: '#FF9F43'
    },
    silicon: {
        name: 'Silicon',
        uses: 'Chips, Solar Panels, Glass',
        color: '#A29BFE'
    },
    lithium: {
        name: 'Lithium',
        uses: 'Rechargeable Batteries',
        color: '#FAB1A0'
    },
    nickel: {
        name: 'Nickel',
        uses: 'Batteries, Stainless Steel',
        color: '#74B9FF'
    },
    chromium: {
        name: 'Chromium',
        uses: 'Corrosion Resistance',
        color: '#55EFC4'
    },
    titanium: {
        name: 'Titanium',
        uses: 'Aerospace, Implants',
        color: '#DFE6E9'
    },
    uranium: {
        name: 'Uranium',
        uses: 'Nuclear Power',
        color: '#FD79A8'
    }
};

// Color function based on percentage
function getColor(d) {
    return d > 50 ? '#b10026' :
           d > 40 ? '#e31a1c' :
           d > 30 ? '#fc4e2a' :
           d > 20 ? '#fd8d3c' :
           d > 10 ? '#feb24c' :
           d > 5  ? '#fed976' :
                    '#ffffb2';
}

// Create map
const map = L.map('map').setView([15, 5], 2);

// Add base tile layer
 L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri and the GIS User Community'
}).addTo(map);

// Function to style features based on current element
function style(feature) {
    const elementValue = feature.properties[currentElement] || 0;
    return {
        fillColor: getColor(elementValue),
        weight: 0.3,
        opacity: 1,
        color: '#444',
        dashArray: '',
        fillOpacity: 0.8
    };
}

// Create info box
const info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    const element = elementDescriptions[currentElement];
    if (props) {
        const percentage = props[currentElement] || 0;
        this._div.innerHTML = `
            <h5>${element.name} Distribution</h5>
            <b>${props.COUNTRY}</b><br>
            Percentage: ${percentage}%<br>
            Uses: ${element.uses}
        `;
    } else {
        this._div.innerHTML = `
            <h5>${element.name} Distribution</h5>
            <p>Hover over countries to see percentage</p>
            <p><small>Uses: ${element.uses}</small></p>
        `;
    }
};
info.addTo(map);

// Highlight feature on hover
function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 0.7,
        color: '#f00909',
        dashArray: '',
        fillOpacity: 0.6
    });
    
    // Update info box
    info.update(layer.feature.properties);
    
    // Bring to front
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Reset highlight on mouse out
function resetHighlight(e) {
    geoJsonLayer.resetStyle(e.target);
    info.update();
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

// Load GeoJSON data
function loadMap(element) {
    currentElement = element;
    
    // Remove existing layer
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
    }
    
    // Load and add GeoJSON
    fetch('data/World_Countries.geojson')
        .then(response => response.json())
        .then(data => {
            geoJsonLayer = L.geoJson(data, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
            
            // Update info box
            info.update();
        })
        .catch(error => console.error('Error loading GeoJSON:', error));
}

// Legend
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'legend');
    const grades = [0, 5, 10, 20, 30, 40, 50];
    let labels = [];
    
    div.innerHTML = '<h6 style="margin: 0 0 10px 0;">Percentage (%)</h6>';
    
    for (let i = 0; i < grades.length; i++) {
        const from = grades[i];
        const to = grades[i + 1];
        const color = getColor(from + 1);
        labels.push(
            `<i style="background:${color}; width: 18px; height: 18px; float: left; margin-right: 8px; border-radius: 3px;"></i> ` +
            (to ? `${from}% &ndash; ${to}%` : `${from}%+`)
        );
    }
    
    div.innerHTML += labels.join('<br>');
    return div;
};
legend.addTo(map);

// Initialize map with default element
document.addEventListener('DOMContentLoaded', function() {
    loadMap(currentElement);
    
    // Add event listeners to element buttons
    const elementButtons = document.querySelectorAll('.element-btn');
    elementButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            elementButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Load map with selected element
            const element = this.getAttribute('data-element');
            loadMap(element);
        });
    });
    
    // Set first button as active
    if (elementButtons.length > 0) {
        elementButtons[0].classList.add('active');
    }
});
