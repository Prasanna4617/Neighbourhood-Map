// MODEL containing the list of location
var Locations = [{
    name: "Bombay Brasserie",
    position: {
        lat: 13.066838,
        lng: 80.252184
    },
    id: "536a5b37498e5c24c4bd2cdf"
}, {
    name: "That Madras Place",
    position: {
        lat: 13.005928,
        lng: 80.250697
    },
    id: "521b6a3411d20329d4c65ae2"
}, {
    name: "Kaidi Kitchen",
    position: {
        lat: 13.044555155918,
        lng: 80.26132471446473
    },
    id: "531b27e9498ec7b5a4a1721c"
}, {
    name: "Maplai",
    position: {
        lat: 13.064010635222326,
        lng: 80.2363327753221
    },
    id: "5437ee85498e88c18c04dc24"
}, {
    name: "Barbeque Nation",
    position: {
        lat: 13.045992607888774,
        lng: 80.23347616195679
    },
    id: "4b8ffb98f964a520036e33e3"
}, {
    name: "Rainforest Restaurant",
    position: {
        lat: 13.007118213064699,
        lng: 80.2577424441277
    },
    id: "4c8c81bcf0ce236a181f19ef"
}, {
    name: "Copper kitchen",
    position: {
        lat: 13.050713123466048,
        lng: 80.20394666436374
    },
    id: "535d213e498e9d2f2d2120c4"
}, {
    name: "l'Amandier",
    position: {
        lat: 13.027204292156357,
        lng: 80.25462280576745
    },
    id: "52bfdd0711d2126c64e3c1a1"
}, {
    name: "Savoury Sea Shell",
    position: {
        lat: 13.087772829319363,
        lng: 80.21815863669943
    },
    id: "4bde78f86198c9b6501014ff"
}, {
    name: "PalmShore",
    position: {
        lat: 13.029584324498801,
        lng: 80.2088494907914
    },
    id: "54f4aa26498e094d2b0dd0fb"
}];

var map;

var currentInfowindow;
// Checking Internet Connectivity
online = window.navigator.onLine;
window.addEventListener("offline", function(e) {
    alert("Check Internet Connection");
});
window.addEventListener("online", function(e) {
    alert("Happy Browsing!!");
});

// Function to initialize Map
function initMap() {
    "use strict";
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 13.082680,
            lng: 80.270718
        },
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false
    });
}
// View Model Function
function ViewModel() {
    "use strict";
    var self = this;
    self.markers = [];

    self.Locations = ko.observableArray(Locations);

    self.Locations().forEach(function(location) {
        // Place Markers For all the location in the Model
        var marker = new google.maps.Marker({
            position: location.position,
            map: map,
            animation: google.maps.Animation.DROP,
            title: location.name
        });

        location.marker = marker;

        marker.setVisible(true);

        self.markers.push(marker);
        // FourSquare Client ID and Client Secret
        var CLIENT_ID = '?client_id=NXCJNVGGC5NYO3DSASIAVP2IUF5OVU40SX0F5MMYQI33DAOU';
        var CLIENT_SECRET = '&client_secret=KENCOTFIKEZXNTBQCEHRW3DPRPABJYFXYRLUOY4EXDL30SQJ';
        // Making AJAX Request
        $.ajax({
            type: "GET",
            dataType: 'json',
            cache: false,
            url: 'https://api.foursquare.com/v2/venues/' + location.id + CLIENT_ID + CLIENT_SECRET + '&v=20161123',
            async: true,
            // if ajax req is successfull, then the following function executes
            success: function(response) {
                var venue = response.response.venue;
                var name = venue.name;
                var formattedaddress = venue.location.formattedAddress;
                var photo;
                var openedHours = venue.canonicalUrl;

                if (typeof venue.photos.groups[0] === 'undefined') {
                    photo = "images/photounavailable.png";
                } else {
                    var photo_prefix = venue.photos.groups[0].items[0].prefix;
                    var photo_suffix = venue.photos.groups[0].items[0].suffix;
                    photo = photo_prefix + 150 + photo_suffix;
                }

                var contentString = '<h3>' + name + '</h3>' + '<h4>' + formattedaddress + '</h4>' + '<img src=' + photo + '>' +
                    '<br>' + '<a href=' + openedHours + '>' + 'For More Details' + '</a>';

                // Creating an Infowindow
                var infoWindow = new google.maps.InfoWindow({
                    content: contentString,
                    maxWidth: 200
                });

                location.infoWindow = infoWindow;

                // EventListener when the marker is clicked
                location.marker.addListener('click', function() {
                    if (currentInfowindow !== undefined) {
                        currentInfowindow.close();
                    }
                    currentInfowindow = location.infoWindow;
                    location.infoWindow.open(map, this);
                    currentInfowindow.open(map, location.marker);

                    location.marker.setAnimation(google.maps.Animation.BOUNCE); //Markers will bounce when clicked
                    setTimeout(function() {
                        location.marker.setAnimation(null);
                    }, 1500); //Change value to null after 1.5 seconds and stop m
                });
            },
            // If Ajax request is unsuccessful, runs an error function
            error: function(data) {
                alert("OOPS..Something Went Wrong..Check Connectivity!!");
            }
        });
    });

    //Function that runs when an location from the Dropdown list is clicked
    self.listClick = function(location) {
        if (location.name) {
            map.setZoom(15); //Updates the Map Zoom
            map.panTo(location.position); // Sets the center of the map based on clicked location
            location.marker.setAnimation(google.maps.Animation.BOUNCE);
            if (currentInfowindow !== undefined) {
                currentInfowindow.close();
            }
            currentInfowindow = location.infoWindow;
            currentInfowindow.open(map, location.marker); // Opens Infowindow for the selected Location
        }
        setTimeout(function() {
            location.marker.setAnimation(null);
        }, 1500); // Animation ends after 1.5 seconds
    };

    // Records the user input using KO Observables 
    self.input = ko.observable('');

    //KO computed function to filter the result based on user input
    self.search = ko.computed(function() {
        return ko.utils.arrayFilter(self.Locations(), function(searchResult) {
            var result = searchResult.name.toLowerCase().indexOf(self.input().toLowerCase());
            if (result != -1) {
                searchResult.marker.setVisible(true);
            } else {
                searchResult.marker.setVisible(false);
            }
            return result >= 0;
        });
    });
}