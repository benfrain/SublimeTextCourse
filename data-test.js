// "use strict";
var data;
var markers = [];
var map;
var request = new XMLHttpRequest();
// Gets the select box
var select = document.getElementById("months");
// This is a string to hold the month limit
var dateLimit;
function retreiveData () {
    request.open('GET', 'https://data.police.uk/api/stops-force?force=avon-and-somerset&date=2015-04', true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        data = JSON.parse(request.responseText);
        console.log(data);
        
        
      } else {
        // We reached our target server, but it returned an error
        console.error("AJAX Failed after reaching server");
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
        console.error("AJAX Failed to connect");
    };

    request.send();
};

function getData(lat, lng, date){
    // Set up a default for date in case none is passed
    date = (typeof date === 'undefined') ? '2015-01' : date;
    console.log(date);

    // Clear existing data
    data = null;
    // console.log(date);
    request.open('GET', 'https://data.police.uk/api/crimes-street/all-crime?lat=' + lat + '&lng=' + lng + '&date=' + date, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        data = JSON.parse(request.responseText);

        setMarkers(data);
        
      } else {
        // We reached our target server, but it returned an error
        console.error("AJAX Failed after reaching server");
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
        console.error("AJAX Failed to connect");
    };

    request.send();
    return data;
};


function updateMapCoords(theData) {
    var bounds = new google.maps.LatLngBounds();
    markers = theData;
    
    for (var i = 0; i < markers.length; i++) {
       bounds.extend(markers[i].getPosition());
    }

    //remove one zoom level to ensure no marker is on the edge.
    map.event.addListenerOnce(map, 'bounds_changed', function(event) {
        this.setZoom(map.getZoom()-1);

        if (this.getZoom() > 15) {
            this.setZoom(15);
        }
        map.fitBounds(bounds);
    });
}

function deleteMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null); //Remove the marker from the map
    }
    markers = [];
}

function setMarkers(theData) {
    // console.log(theData[0]);
    var bounds = new google.maps.LatLngBounds();
    theData.forEach( function(element, index) {
        var theLatLang = {
            lat: parseFloat(element.location.latitude),
            lng: parseFloat(element.location.longitude)
        }
        var marker = new google.maps.Marker({
           map: map,
           position: theLatLang
        });
        markers.push(marker);
        var contentString = "<h1>" + element.category + "</h1>" + "<h2>" + element.location.street.name + "</h2>";
        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
        // We want to extend the bounds for the map here
        bounds.extend(marker.position);
    });
    map.fitBounds(bounds);
    map.setZoom(map.getZoom()); 
}
//////////////////
// Map specific //
//////////////////
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 52.3555, lng: 1.1743},
        zoom: 10
    });
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    // This is a poly line of England
    var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(54.86396293985476, -4.185791015625),
        new google.maps.LatLng(54.95238569063362, -1.373291015625),
        new google.maps.LatLng(52.696361078274485, 1.724853515625),
        new google.maps.LatLng(51.385495069223204, 1.439208984375),
        new google.maps.LatLng(50.708634400828224, 1.395263671875),
        new google.maps.LatLng(50.401515322782366, -1.724853515625),
        new google.maps.LatLng(49.85215166777001, -6.075439453125),
        new google.maps.LatLng(54.342148864483406, -5.086669921875)
    );
    // Bias the results to locations in England, and restrict to UK
    var select;
    var searchBox = new google.maps.places.Autocomplete(input, { bounds: defaultBounds, componentRestrictions: {country: "uk" }});
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    buildPossibleMonths();
    function buildPossibleMonths() {
        request.open('GET', 'https://data.police.uk/api/crimes-street-dates', true);

        request.onload = function() {
          if (request.status >= 200 && request.status < 400) {
            // Success!
            data = JSON.parse(request.responseText);
            select = document.createElement("select");
            select.id = "months";
            select.style.backgroundColor = '#fff';
            data.forEach( function(element, index) {
                var option = document.createElement("option");
                option.textContent = element.date;
                option.value = element.date;
                select.appendChild(option);
            });
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(select);
            select.addEventListener("change", function switchDateRange(e) {
                var place = searchBox.getPlace();
                var lat = place.geometry.location.lat();
                var lng = place.geometry.location.lng();
                deleteMarkers();
                getData(lat, lng, select.value);
            }, false);
          } else {
            // We reached our target server, but it returned an error
            console.error("AJAX Failed after reaching server");
          }
        };

        request.onerror = function() {
          // There was a connection error of some sort
            console.error("AJAX Failed to connect");
        };

        request.send();
        
    }

    

    searchBox.addListener('place_changed', function() {
        var place = searchBox.getPlace();
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        deleteMarkers();
        getData(lat, lng, select.value);
    });
    
    
}