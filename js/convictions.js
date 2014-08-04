(function(window, document, $, _, Backbone, L, Convictions) {
  window.Convictions = Convictions;

  // Models and Collections

  var CommunityArea = Convictions.CommunityArea = Backbone.Model.extend({
    idAttribute: 'number',

    initialize: function(attrs, options) {
      // To make integration with the data source easy and flexible, we
      // construct instances with a GeoJSON feature object.  However, we
      // want the data in the model, accessible via the setters and getters to
      // reflect the ``properties`` property of the GeoJSON feature object.
      this.clear({silent: true});
      this.geometry = attrs.geometry;
      this.set(attrs.properties);
    },

    /**
     * Like toJSON() but for GeoJSON
     */
    toGeoJSON: function() {
      return {
        type: "Feature", 
        properties: _.clone(this.attributes),
        geometry: _.clone(this.geometry)
      };
    }
  });

  /**
   * Chicago Community Areas
   */
  var CommunityAreas = Convictions.CommunityAreas = Backbone.Collection.extend({
    model: CommunityArea,

    parse: function(response) {
      // @todo Save coordinate reference system?
      if (response.type === 'FeatureCollection') {
        return response.features;
      }
      else {
        return response;
      }
    }
  });

  // Views

  var MapView = Backbone.View.extend({
    options: {
      tileUrl: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      // Start our maps in the center of Chicago
      initialCenter: [41.881944, -87.627778],
      initialZoom: 11 
    },

    initialize: function(options) {
      var initialCenter, initialZoom;

      // Allow overriding our declared options with options passed
      // to the constructor.
      _.extend(this.options, options);

      // Initial map settings can be either a function or a value
      initialCenter = _.result(this.options, 'initialCenter');
      initialZoom = _.result(this.options, 'initialZoom');

      // Create a Leaflet map instance and set it's initial center
      // and zoom level
      this.map = L.map(this.$el.get(0))
                  .setView(initialCenter, initialZoom);

      // Create a tile layer and add it to the map
      this.tileLayer = new L.TileLayer(this.options.tileUrl, {
        attribution: this.options.attribution
      }); 
      this.tileLayer.addTo(this.map);

      this.bindCollectionEvents();
    },

    /**
     * Create a map layer from a GeoJSON-based collection.
     */
    _layerFromCollection: function(map, collection, style, onEachFeature) {
      var layer;

      map = map || this.map;
      collection = collection || this.collection;
      style = style || _.bind(this.style, this);
      onEachFeature = onEachFeature || _.bind(this.onEachFeature, this);

      layer = L.geoJson(null, {
        onEachFeature: onEachFeature,  
      }).addTo(map);
      collection.each(function(model) {
          layer.addData(model.toGeoJSON());
      }, this);
      layer.setStyle(style);

      return layer;
    },

    style: function(feature) {
      return {};
    },

    onEachFeature: function(feature, layer) {
      return;
    },

    bindCollectionEvents: function() {
      return this;
    }
  });

  var CommunityAreaMapView = Convictions.CommunityAreaMapView = MapView.extend({
    options: _.extend({}, MapView.prototype.options, {
      popupTemplate: _.template("<%= name %>"),
    }),

    bindCollectionEvents: function() {
      this.collection.on('sync', this.addGeoJSONLayer, this);
    },

    addGeoJSONLayer: function() {
      // If the layer already exists, remove it first.
      if (this.communityAreasLayer) {
        this.map.removeLayer(this.communityAreasLayer);
      }

      this.communityAreasLayer = this._layerFromCollection();
    },

    style: function(feature) {
      return {
        fillColor: this.getFillColor(feature.properties.per_capita_convictions),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
      };
    },

    getFillColor: function(d) {
      // @todo: Use http://colorbrewer2.org/ to pick coropleth colors based
      // on our data.
      return '#800026';
    },

    onEachFeature: function(feature, layer) {
      layer.bindPopup(this.popupContent(feature));
    },

    popupContent: function(feature) {
      console.debug(feature.properties.name);
      return this.options.popupTemplate(feature.properties);
    }
  });
})(window, document, jQuery, _, Backbone, L, window.Convictions || {});
