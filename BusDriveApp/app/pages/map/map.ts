import {Page, NavParams} from 'ionic-angular';
import {Geolocation} from 'ionic-native';

@Page({
    templateUrl: 'build/pages/map/map.html',
})

export class MapPage {
    private map;
    private stoplist;
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;

    constructor(navParams:NavParams) {
        this.stoplist = navParams.data;
        this.loadMap()
    }
    
    // Lädt Google Maps und zeigt die eigene Position, die Position der Stops und die Route
    loadMap() {
        let options = {timeout: 10000, enableHighAccuracy: true};
        navigator.geolocation.getCurrentPosition((position) => {
                let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                let mapOptions = {
                    center: latLng,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    zoomControl: true,
                    rotateControl: true
                }
                this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
                let marker = new google.maps.Marker({
                    icon: 'http://maps.google.com/mapfiles/ms/icons/bus.png',
                    position: latLng,
                    map: this.map,
                });
                // Zeigt die Stops an der Karte
                for (var index = 0; index < this.stoplist.length; index++) {
                    // let stopLatLng = this.stoplist[index].location doesnt work :(
                    let stopLatLng = new google.maps.LatLng(this.stoplist[index].latitude, this.stoplist[index].longitude);
                    let stopmarker = new google.maps.Marker({
                        position: stopLatLng,
                        map: this.map,
                    });
                }
                this.directionsDisplay.setMap(this.map);
                this.route(this.directionsService, this.directionsDisplay, latLng, latLng);
            },
            (error) => {
                console.log(error);
            }, options
        );
    }
    
    // Zeichnet die Route anhand der gegebenen GPS Koordinaten ( aktuell werden die Koordinaten von Stops genutzt, später werden die von der Route genommen)
    route(directionsService, directionsDisplay, startpos, endpos) {
        let stops = [];
        for (var index = 0; index < this.stoplist.length; index++) {
            stops.push({
                location: new google.maps.LatLng(this.stoplist[index].latitude, this.stoplist[index].longitude),
                stopover: false
            });
        }
        let start = startpos;
        let end = endpos;
        let request = {
            origin: start,
            destination: end,
            waypoints: stops,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                var route = response.routes[0];
            }
        });
    }
}
  
