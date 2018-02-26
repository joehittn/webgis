var viennaExtent = [1734967,6104128,1877445,6168565];
var basemapExtent = [367148,5548948,2646801,6579929];
var centerCongruent = [1820279, 6141391];
var centerAnimation = [1819279, 6140791];
var mapZoom = 15;
var animationZoom = 15;
var center = centerCongruent;

<!--ANIMATION START-->
var style = new ol.style.Style({
  stroke: new ol.style.Stroke({
    width: 3,
    color: [111, 111, 255, 0.8],
    lineDash : [5,7,20,7]
  })
});

anfahrtSource = new ol.source.Vector({
  crossOrigin: 'anonymous',
  url: '../data/pfad/anfahrt.geojson',
  format: new ol.format.GeoJSON()
});

var vectorLayerAnfahrt = new ol.layer.Vector({
    style: style,
    maxResolution: 20,
    source: anfahrtSource
});

function addStartEndMarkers() {
  route = anfahrtSource.getFeatures()[0].getGeometry();
  var startCoords = route.getCoordinates()[0];
  var routeCoords = route.getCoordinates();
  var routeLength = routeCoords.length;

  var routeFeature = new ol.Feature({
    type: 'route',
    geometry: route
  });
  var geoMarker = new ol.Feature({
    type: 'geoMarker',
    geometry: new ol.geom.Point(routeCoords[0])
  });
  var startMarker = new ol.Feature({
    type: 'icon',
    geometry: new ol.geom.Point(routeCoords[0])
  });
  var endMarker = new ol.Feature({
    type: 'icon',
    geometry: new ol.geom.Point(routeCoords[routeLength - 1])
  });

  var animating = false;
  var speed, now;
  var speedInput = document.getElementById('speed');
  var startButton = document.getElementById('start-animation');

  var styles = {
    'route': new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: 6, color: [237, 212, 0, 0.8]
      })
    }),
    'geoMarker': new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        width: 100,
        src: '../data/icons/bike-icon.png'
      })
    }),
    'icon': new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        snapToPixel: false,
        fill: new ol.style.Fill({color: 'grey'}),
        stroke: new ol.style.Stroke({
          color: 'white', width: 2
        })
      })
    })
  };

  var vectorLayerAnim = new ol.layer.Vector({
    maxResolution: 20,
    source: new ol.source.Vector({
      features: [geoMarker, startMarker, endMarker]
      }),
    style: function(feature) {
      // hide geoMarker if animation is active
      if (animating && feature.get('type') === 'geoMarker') {
        return null;
      }
      return styles[feature.get('type')];
    }
  });

  map.addLayer(vectorLayerAnim);

  var moveFeature = function(event) {
    var vectorContext = event.vectorContext;
    var frameState = event.frameState;

    if (animating) {
      var elapsedTime = frameState.time - now;
      // here the trick to increase speed is to jump some indexes
      // on lineString coordinates
      var index = Math.round(speed * elapsedTime / 1000);

      if (index >= routeLength) {
        stopAnimation(true);
        return;
      }

      var currentPoint = new ol.geom.Point(routeCoords[index]);
      var feature = new ol.Feature(currentPoint);
      vectorContext.drawFeature(feature, styles.geoMarker);
    }
    // tell OpenLayers to continue the postcompose animation
    map.render();
  };

  function startAnimation() {
    if (animating) {
      stopAnimation(false);
    } else {
      animating = true;
      now = new Date().getTime();
      speed = speedInput.value;
      startButton.textContent = 'Cancel Animation';
      // hide geoMarker
      geoMarker.setStyle(null);
      // just in case you pan somewhere else
      map.getView().setCenter(centerAnimation);
      map.getView().setZoom(15);
      map.on('postcompose', moveFeature);
      map.render();
    }
  }

  /**
   * @param {boolean} ended end of animation.
   */
  function stopAnimation(ended) {
    animating = false;
    startButton.textContent = 'Start Animation';

    // if animation cancelled set the marker at the beginning
    var coord = ended ? routeCoords[routeLength - 1] : routeCoords[0];
    /** @type {ol.geom.Point} */ (geoMarker.getGeometry())
      .setCoordinates(coord);
    //remove listener
    map.un('postcompose', moveFeature);
  }
  startButton.addEventListener('click', startAnimation, false);
}

anfahrtSource.once('change', addStartEndMarkers);
<!--ANIMATION END-->


<!-- LAYER SWITCHER -->
$(document).ready(function(){
  $("#layerSwitcherBox").toggle().slideDown(300)
  });
  $("#XX").click(function(){
      $("#layerSwitcherBox").slideToggle(300)
  });


function overlayswitchLayer(){
  var checkedLayer = $('#overlaylayerSwitcher input[name=overlaygrouplayer]:checked').val();
  for (i = 0, ii = overlaygrouplayers.length; i < ii; ++i) overlaygrouplayers[i].setVisible(i==checkedLayer);
  }
  $(function() { overlayswitchLayer() } );
  $("#overlaylayerSwitcher input[name=overlaygrouplayer]").change(function() { overlayswitchLayer() } );

function baseswitchLayer(){
  var checkedLayer = $('#baselayerSwitcher input[name=baselayer]:checked').val();
  for (i = 0, ii = baselayers.length; i < ii; ++i) baselayers[i].setVisible(i==checkedLayer);
  }
  $(function() { baseswitchLayer() } );
  $("#baselayerSwitcher input[name=baselayer]").change(function() { baseswitchLayer() } );

function animationswitchLayer(){
  var checkedLayer = $('#animationlayerSwitcher input[name=animationLayer]:checked').val();
  for (i = 0, ii = animationlayers.length; i < ii; ++i) animationlayers[i].setVisible(i==checkedLayer);
  }
  $(function() { animationswitchLayer() } );
  $("#animationlayerSwitcher input[name=animationLayer]").change(function() { animationswitchLayer() } );

  $(document).ready(function(){

  });

// $(function() {
//   $("#layerSwitcherBox").accordion();
// });
<!-- LAYER SWITCHER -->


<!-- POPUP COORD-->
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
  element: container,
  autoPan: true,
  autoPanAnimation: {
  duration: 250
  }
}));

closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};
<!-- POPUP COORD-->

<!-- POPUP OFFICE-- NOT WORKING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!>
// var element = document.getElementById('popupOffice');
//
// var popupOffice = new ol.Overlay({
//   element: element,
//   positioning: 'bottom-center',
//   stopEvent: false,
//   offset: [0, -50]
// });
<!-- POPUP OFFICE-->

<!-- OFFICEICON DEFINITION-->
var iconFeature = new ol.Feature({
  geometry: new ol.geom.Point([1820179.8919, 6141411.38408]),
  name: 'Ingenieurbüro conGRUent',
  strasse: 'Piaristengasse 11/1-3',
  ort: '1080 Wien'
});

var iconStyle = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 70],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: '../data/icons/ibc_pointer.png'
  }))
});

iconFeature.setStyle(iconStyle);
<!-- OFFICEICON DEFINITION-->


<!------------ LAYER DEFINITIONEN ------------>
var baselayers = [];
var overlaylayers = [];
var overlaygrouplayers = [];
var animationlayers = [];

animationlayers[0] = vectorLayerAnfahrt;

var ogdAttribution = [new ol.Attribution({
  html: '<a href="https://www.data.gv.at"> / OGD-Wien</a>'
})];
var basemapAttribution = [new ol.Attribution({
  html: '<a href="https://www.basemap.at">basemap.at</a> &copy; <a href="http://creativecommons.org/licenses/by/3.0/at/">CC BY 3.0 AT</a>'
})];

var bmapGrauSource = new ol.source.XYZ({
  attributions: basemapAttribution,
  crossOrigin: 'anonymous',
  url: 'https://maps{1-4}.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png'
});

var bmaporthofoto30cmSource = new ol.source.XYZ({
  attributions: basemapAttribution,
  crossOrigin: 'anonymous',
  url: 'https://maps{1-4}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpg'
});

// baselayers[0] = new ol.layer.VectorTile({
//   opacity: 0.6,
//   source: new ol.source.VectorTile({
//     format: new ol.format.MVT(),
//     url: 'https://api.mapbox.com/styles/v1/joehittn/cje1q4ki55wtz2sqkbesgw83x/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam9laGl0dG4iLCJhIjoiY2pjc3RqMjBqMDdzZTMzbW95OHZ1ejh1byJ9.Gjvk7RtS4kfM7jTJGL1Ivg'
//   }),
//   style: 'mapbox://styles/joehittn/cje1q4ki55wtz2sqkbesgw83x'
// });

baselayers[0] = new ol.layer.Tile({
      name: 'bmapgrau',
      extent: basemapExtent,
      // visible: !options.layers || options.layers.indexOf('bmapgrau') >= 0,
      source: bmapGrauSource
}),
baselayers[1] = new ol.layer.Tile({
      name: 'bmaporthofoto30cm',
      extent: basemapExtent,
      source: bmaporthofoto30cmSource
}),

baselayers[2] = new ol.layer.Tile({
      name: 'OSM',
      source: new ol.source.OSM()
}),

baselayers[3] = new ol.layer.Tile({
      name: 'toner',
      // visible: !options.layers || options.layers.indexOf('toner') >= 0,
      source: new ol.source.Stamen({
      layer: 'toner'
  })
}),

overlaylayers[0] = new ol.layer.Image({
        extent: viennaExtent,
        projection : 'epsg 3857',
        source: new ol.source.ImageWMS({
          url: 'https://data.wien.gv.at/daten/geo',
          params: {'LAYERS':['ogdwien:UBAHNOGD',
                             'ogdwien:HALTESTELLEWLOGD',
                             'ogdwien:FUSSGEHERZONEOGD',
                             'ogdwien:CITYBIKEOGD',
                             'ogdwien:BEGEGNUNGSZONEOGD'
                  ]},
          serverType: 'geoserver',
          attributions:ogdAttribution
        })
}),


overlaygrouplayers [0] = new ol.layer.Group({
        layers: [overlaylayers[0]],
        maxResolution: 10
      });

overlaylayers[5] = new ol.layer.Image({
        extent: viennaExtent,
        projection : 'epsg 3857',
        source: new ol.source.ImageWMS({
          url: 'https://data.wien.gv.at/daten/geo',
          params: {'LAYERS':['ogdwien:CARSHARINGOGD',
                             'ogdwien:BEHINDERTENPARKPLATZOGD'
                  ]},
          serverType: 'geoserver',
          attributions:ogdAttribution
        })
}),


overlaygrouplayers [1] = new ol.layer.Group({
        layers: [overlaylayers[5]],
        maxResolution: 10
});

overlaylayers[7] = new ol.layer.Image({
        extent: viennaExtent,
        projection : 'epsg 3857',
        source: new ol.source.ImageWMS({
          url: 'https://data.wien.gv.at/daten/geo',
          params: {'LAYERS':['ogdwien:MUSEUMOGD',
                             'ogdwien:PARKANLAGEOGD',
                             'ogdwien:SCHWIMMBADOGD',
                             'ogdwien:WCANLAGEOGD',
                             'ogdwien:BUECHEREIOGD',
                             'ogdwien:BADESTELLENOGD'
                  ]},
          serverType: 'geoserver',
          attributions:ogdAttribution
        })
}),

overlaygrouplayers [2] = new ol.layer.Group({
        layers: [overlaylayers[7]],
        maxResolution: 10
      });

overlaylayers[13] = new ol.layer.Image({
        extent: viennaExtent,
        projection : 'epsg 3857',
        source: new ol.source.ImageWMS({
          url: 'https://data.wien.gv.at/daten/geo',
          params: {'LAYERS':['ogdwien:ENGEFPVANLOGD',
                             'ogdwien:ENINNOVPRJOGD'
                  ]},
          serverType: 'geoserver',
          attributions:ogdAttribution
        })
}),

overlaygrouplayers [3] = new ol.layer.Group({
        layers: [overlaylayers[13]],
        maxResolution: 10,
      });

vectorSource = new ol.source.Vector({
  features: [iconFeature]
});
vectorLayer = new ol.layer.Vector({
  source: vectorSource
});


var map = new ol.Map({
    controls: [
        new ol.control.ScaleLine({
          "minWidth": 64,
          "units": "metric"
        }),
        new ol.control.FullScreen({
        }),
        new ol.control.Zoom({
        }),
        new ol.control.OverviewMap({
        }),
        new ol.control.Attribution({
          collapsible:false
        })
      ],
    loadTilesWhileAnimating: true,
    target: 'map',
    layers: [baselayers[0], baselayers[1], baselayers[2], baselayers[3], overlaygrouplayers [0], overlaygrouplayers [1], overlaygrouplayers [2], overlaygrouplayers [3], vectorLayerAnfahrt, vectorLayer],
    overlays: [overlay],

  view: new ol.View({
      center: centerCongruent,
      minZoom: 1,
      maxZoom: 22,
      zoom: mapZoom
    })
  });

  map.on('singleclick', function(evt) {
      var coordinate = evt.coordinate;
      var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
          coordinate, 'EPSG:3857', 'EPSG:4326'));

      content.innerHTML = '<p>You clicked here:</p><code>' + hdms +
          '</code>';
      overlay.setPosition(coordinate);
  });

  // map.addOverlay(popupOffice);

// <!--POPUP OFFICE-->
//   map.on('click', function(evt) {
//     var feature = map.forEachFeatureAtPixel(evt.pixel,
//         function(feature) {
//           return feature;
//         });
//     if (feature) {
//       var coordinates = feature.getGeometry().getCoordinates();
//       popupOffice.setPosition(coordinates);
//       $(element).popover({
//         'placement': 'top',
//         'html': true,
//         'content': feature.get('name')
//       });
//       $(element).popover('show');
//     } else {
//       $(element).popover('destroy');
//     }
//   });
// <!--POPUP OFFICE-->

// todo: bürostandort-popup, layerauswahl(minimiert), fahrradfahrtanimation tempoeingabe, performance ogd-data, wfs-einbindung, reparieren animationzoom
