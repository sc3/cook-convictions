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

  // Choropleth bins

  /**
   * A single bin.
   */
  var Bin = function(lower, upper, color) {
    this.lower = lower;
    this.upper = upper;
    this.color = color;
  };

  _.extend(Bin.prototype, {
    contains: function(val) {
      return val > this.lower && val <= this.upper;
    }
  });

  /**
   * All the bins for a given property.
   */
  var BinCollection = function(property, label, breaks, colors) {
    var brk, i;

    this.property = property;
    this.label = label;
    this.bins = [];

    for (i = 0; i < breaks.length - 1; i++) {
      this.bins.push(new Bin(breaks[i], breaks[i+1], colors[i]));
    }
  };

  _.extend(BinCollection.prototype, {
    get: function(val) {
      var i, bin;
      for (i = 0; i < this.bins.length; i++) {
        bin = this.bins[i];
        if (bin.contains(val)) {
          return bin;
        }
      }

      return null;
    }
  });

  _.each(['each', 'forEach'], function(method) {
    BinCollection.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(this.bins);
      return _[method].apply(_, args);
    };
  });

  /**
   * Get the BinCollection for a given property.
   */
  var BinLookup = function() {
    this.bins = {};
  };

  _.extend(BinLookup.prototype, {
    add: function(bin) {
      this.bins[bin.property] = bin;
    },

    get: function(property) {
      return this.bins[property];
    }
  });

  var bins = new BinLookup();
  bins.add(new BinCollection('convictions_per_capita',
    "Convictions per capita",
    [0.00293543,  0.04502037,  0.08689594,  0.12877151,  0.17064707,  0.21252264],
    ['#edf8fb', '#b2e2e2', '#66c2a4', '#66c2a4', '#006d2c']
  ));

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
      this.map = L.map(this.$el.get(0), {
        scrollWheelZoom: false
      })
      .setView(initialCenter, initialZoom);

      // Create a tile layer and add it to the map
      this.tileLayer = new L.TileLayer(this.options.tileUrl, {
        attribution: this.options.attribution
      }); 
      this.tileLayer.addTo(this.map);

      this.bindCollectionEvents();

      this.postInitialize();
    },

    postInitialize: function() { return this; },

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
      popupTemplate: _.template("<%= name %>" +
        "<ul>" + 
        "<li>Convictions: <%= num_convictions %>" +
        "<li>Convictions per-capita: <%= convictions_per_capita %></li>" +
        "</ul>"
      ),

      bins: bins,

      defaultFillProperty: 'convictions_per_capita'
    }),

    postInitialize: function() {
      this.fillProperty = this.options.defaultFillProperty;
      this.legendView = new MapLegendView({
        map: this.map,
        bins: this.options.bins,
        defaultFillProperty: this.options.defaultFillProperty
      });
      return this;
    },

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
        fillColor: this.getFillColor(this.fillProperty,
          feature.properties[this.fillProperty]),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
      };
    },

    getFillColor: function(propName, propVal) {
      var propBins = this.options.bins.get(propName);
      var bin = propBins.get(propVal); 

      if (bin) {
        return bin.color;
      }
      else {
        return null;
      }
    },

    onEachFeature: function(feature, layer) {
      layer.bindPopup(this.popupContent(feature));
    },

    popupContent: function(feature) {
      return this.options.popupTemplate(feature.properties);
    }
  });

  var CustomControlView = Backbone.View.extend({
    initialize: function(options) {
      _.extend(this.options, options);

      this.map = this.options.map;
      this.control = L.control({
        position: this.options.position
      });
      this.control.onAdd = _.bind(this.onAdd, this);

      this.postInitialize();

      this.control.addTo(this.map);
    },

    postInitialize: function() {},

    onAdd: function(map) {
      return this.render().$el.get(0);
    }
  });

  var MapLegendView = CustomControlView.extend({
    options: {
      position: 'bottomright'
    },

    attributes: {
      class: 'legend'
    },

    postInitialize: function() {
      this.fillProperty = this.options.defaultFillProperty; 
    },

    render: function() {
      var propBins = this.options.bins.get(this.fillProperty);
      var $dl = $('<dl>');

      this.$el.append($('<h4>' + propBins.label + '</h4>'));

      propBins.each(function(bin) {
        $dl.append(this.renderLegendItem(bin));
      }, this);

      this.$el.append($dl);

      return this;
    },

    renderLegendItem: function(bin) {
      var label = bin.lower + " - " + bin.upper;
      var $item = $('<dt style="background-color: ' + bin.color + '"></dt><dd>' + label + '</dd>');
      return $item;
    }
  });
})(window, document, jQuery, _, Backbone, L, window.Convictions || {});
