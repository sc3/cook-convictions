(function(window, document, $, _, Backbone, L, Convictions) {
  window.Convictions = Convictions;

  // Models and Collections

  var GeoJSONModel = Convictions.GeoJSONModel = Backbone.Model.extend({
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
   * A collection wrapping a GeoJSON FeatureCollection, such as Chicago
   * Community Areas.
   */
  var GeoJSONCollection = Convictions.GeoJSONCollection = Backbone.Collection.extend({
    model: GeoJSONModel,

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

  var ConvictionGeoJSONModel = GeoJSONModel.extend({
    initialize: function(attrs, options) {
      var convictionsPerCapita;

      GeoJSONModel.prototype.initialize.apply(this, arguments);

      // Convert per capita rate to per 1000
      // @todo: Decide if this would be better to pre-bake into the data
      // I'm initially doing it here because it makes it more flexible.
      convictionsPerCapita = this.get('convictions_per_capita');
      if (!_.isUndefined(convictionsPerCapita)) {
         this.set('convictions_per_1000', Math.round(convictionsPerCapita * 1000));
      }
    }
  });

  var ConvictionGeoJSONCollection = GeoJSONCollection.extend({
    model: ConvictionGeoJSONModel
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

      this.preInitialize(options);

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

      this.postInitialize(options);
    },

    preInitialize: function(options) { return this; },

    postInitialize: function(options) { return this; },

    /**
     * Create a map layer from a GeoJSON-based collection.
     */
    _layerFromCollection: function(map, collection, style, onEachFeature) {
      var layer = L.geoJson(null, {
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

  /**
   * A choropleth of conviction rate
   */
  var ConvictionRateMapView = MapView.extend({
    options: _.extend({}, MapView.prototype.options, {
      popupTemplate: _.template("<%= name %>" +
        "<ul>" +
        "<li>Convictions: <%= num_convictions %>" +
        "<li>Convictions per 1000: <%= convictions_per_1000 %></li>" +
        "</ul>"
      ),

      defaultFillProperty: 'convictions_per_1000'
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

    addMapLayer: function(layerAttr, collection, style, onEachFeature) {
      collection = collection || this.collection;
      style = style || _.bind(this.style, this);
      onEachFeature = onEachFeature || _.bind(this.onEachFeature, this);

      // If the layer already exists, remove it first.
      if (this[layerAttr]) {
        this.map.removeLayer(this[layerAttr]);
      }

      this[layerAttr] = this._layerFromCollection(this.map, collection, style, onEachFeature);
      return this[layerAttr];
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

  var communityAreaBreaks = [2.93543,  45.02037,  86.89594,  128.77151,  170.64707,  212.52264];
  var communityAreaBins = new BinLookup();
  communityAreaBreaks = _.map(communityAreaBreaks, function(val) {
    return Math.round(val);
  });
  communityAreaBins.add(new BinCollection('convictions_per_1000',
    "Convictions per 1000",
    communityAreaBreaks,
    ['#edf8fb', '#b2e2e2', '#66c2a4', '#66c2a4', '#006d2c']
  ));

  var CommunityAreaMapView = Convictions.CommunityAreaMapView = ConvictionRateMapView.extend({
    options: _.extend({}, ConvictionRateMapView.prototype.options, {
      bins: communityAreaBins
    }),

    preInitialize: function(options) {
      this.chicagoCollection = options.chicagoCollection;
    },

    bindCollectionEvents: function() {
      this.collection.on('sync', this.addCommunityAreasLayer, this);
      this.chicagoCollection.on('sync', this.addChicagoLayer, this);
    },

    addCommunityAreasLayer: function() {
      this.addMapLayer('communityAreasLayer', this.collection);
    },

    addChicagoLayer: function() {
      // HACK: Ensure that this layer is always added last
      if (!this.communityAreasLayer) {
        this.collection.once('sync', this.addChicagoLayer, this);
        return;
      }
      this.addMapLayer('chicagoLayer', this.chicagoCollection, this.styleChicago,
        this.onEachFeatureChicago);
    },

    styleChicago: function(feature) {
      return {
        fillColor: null,
        fillOpacity: 0,
        color: 'black',
        weight: 3,
        opacity: 1
      };
    },

    onEachFeatureChicago: function() {}
  });


  var suburbsBreaks = [0, 0.0004275, 0.00114653,  0.00273978,  0.00827156,  0.06927922];
  var suburbsBins = new BinLookup();
  // Convert breaks from per capita to per 1000, round
  suburbsBreaks = _.map(suburbsBreaks, function(val) {
    return Math.ceil(val * 1000);
  });
  suburbsBins.add(new BinCollection('convictions_per_1000',
    "Convictions per 1000",
    suburbsBreaks,
    ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603']
  ));

  var SuburbsMapView = Convictions.SuburbsMapView = ConvictionRateMapView.extend({
    options: _.extend({}, ConvictionRateMapView.prototype.options, {
      bins: suburbsBins
    }),

    preInitialize: function(options) {
      this.chicagoCollection = options.chicagoCollection;
    },

    bindCollectionEvents: function() {
      this.collection.on('sync', this.addSuburbsLayer, this);
      this.chicagoCollection.on('sync', this.addChicagoLayer, this);
    },

    addSuburbsLayer: function() {
      this.addMapLayer('suburbsLayer', this.collection);
    },

    addChicagoLayer: function() {
      // HACK: Ensure that this layer is always added last
      if (!this.suburbsLayer) {
        this.collection.once('sync', this.addChicagoLayer, this);
        return;
      }
      this.addMapLayer('chicagoLayer', this.chicagoCollection, this.styleChicago,
        this.onEachFeatureChicago);
    },

    styleChicago: function(feature) {
      return {
        fillColor: null,
        fillOpacity: 0,
        color: 'black',
        weight: 3,
        opacity: 1
      };
    },

    onEachFeatureChicago: function() {}
  });

  Convictions.createCommunityAreaMap = function(el, caUrl, chicagoUrl) {
    var communityAreas = new ConvictionGeoJSONCollection();
    var chicago = new GeoJSONCollection();
    var communityAreasMap = new CommunityAreaMapView({
      collection: communityAreas,
      chicagoCollection: chicago,
      el: el
    });

    communityAreas.url = caUrl;
    chicago.url = chicagoUrl;

    communityAreas.fetch();
    chicago.fetch();
  };

  Convictions.createSuburbsMap = function(el, suburbsUrl, chicagoUrl) {
    var suburbs = new ConvictionGeoJSONCollection();
    var chicago = new GeoJSONCollection();
    var map = new SuburbsMapView({
      collection: suburbs,
      chicagoCollection: chicago,
      el: el
    });

    suburbs.url = suburbsUrl;
    chicago.url = chicagoUrl;

    suburbs.fetch();
    chicago.fetch();
  };
})(window, document, jQuery, _, Backbone, L, window.Convictions || {});
