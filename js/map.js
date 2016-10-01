"use strict";
var map;
var model;
var places;
var infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 25.0000, lng: 72.0000},
    zoom: 4,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT
    },
  });

  infoWindow = new google.maps.InfoWindow({content: ""});

  places = [
    {
      title: "Junagarh Fort",
      marker: new google.maps.Marker({position: {lat: 28.0219, lng: 73.3187}, map: map, animation: google.maps.Animation.DROP}),
    },
    {
      title: "Kumbhalgarh Fort",
      marker: new google.maps.Marker({position: {lat: 25.1528, lng: 73.5870}, map: map, animation: google.maps.Animation.DROP}),
    },
    {
      title: "Chittorgarh Fort",
      marker: new google.maps.Marker({position: {lat: 24.8887, lng: 74.6269}, map: map, animation: google.maps.Animation.DROP}),
    },
    {
      title: "Mehrangarh Fort",
      marker: new google.maps.Marker({position: {lat: 26.2978, lng: 73.0185}, map: map, animation: google.maps.Animation.DROP}),
    },
    {
      title: "Jaisalmer Fort",
      marker: new google.maps.Marker({position: {lat: 26.9124, lng: 70.9123}, map: map, animation: google.maps.Animation.DROP}),
    },
  ];

  model = new ViewModel();
  ko.applyBindings(model);

  places.forEach(function(p) {
    p.marker.addListener('click', function() {
      model.onPlaceClicked(p);
    });
  });

  drawMarker();
}

function handleGoogleMapError() {
  alert("Oh! No! unable to load google maps.");
}

function drawMarker(all) {
  var len = places.length;
  for(var i=0; i < len; i++) {
    if(all || places[i].title.toLowerCase().match(model.queryre())) {
      places[i].marker.setVisible(true);
    }
    else {
      places[i].marker.setVisible(false);
    }
  }
}

var ViewModel = function() {
  this.query  = ko.observable("");
  this.queryre = ko.computed(function() {
    return new RegExp(".*" + this.query().toLowerCase() + ".*");
  }, this);

  this.listPlace = ko.computed(function() {
    if(!this.query()){
      drawMarker(true);
      return places;
    }
    else {
      var re = this.queryre();
      return ko.utils.arrayFilter(places, function(place) {
        drawMarker(false);
        return place.title.toLowerCase().match(re);
      });
    }
  }, this);

  this.onPlaceClicked = function(place) {
    if(place.marker.getAnimation() !== null)
      place.marker.setAnimation(null);
    else {
      places.forEach(function(d) {
        d.marker.setAnimation(null);
      });
      place.marker.setAnimation(google.maps.Animation.BOUNCE);
    }

    map.setZoom(8);
    map.panTo(place.marker.getPosition());

    if(!place.desc){
      $.ajax({
        url:"https://en.wikipedia.org/w/api.php?action=opensearch&search="+ place.title +"&format=json",
        dataType: "jsonp"
      })
      .done(function(data) {
        var title = data[0];
        var content = data[2][0];

        if(!content) {
          content = "Sorry! We are unable to find anythin!";
        }

        var contentString = "<h3>" + title + "</h3><br><p>" + content + "</p>";
        place.desc = contentString; //caching the result
        infoWindow.close();
        infoWindow = new google.maps.InfoWindow({content: place.desc});
        infoWindow.open(map, place.marker);
      })
      .fail(function(err) {
        alert("Oh! something went wrong!");
      })
    } else {
      infoWindow.close();
      infoWindow = new google.maps.InfoWindow({content: place.desc});
      infoWindow.open(map, place.marker);
    }
  };

  this.openNav = function() {
    document.getElementById("side-nav").style.width = "25%";
  };

  this.closeNav = function() {
    document.getElementById("side-nav").style.width = "0%";
  };
};
