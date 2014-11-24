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
      var affectingWomenPerCapita, convictionsPerCapita;

      GeoJSONModel.prototype.initialize.apply(this, arguments);

      // Convert per capita rate to per 1000
      // @todo: Decide if this would be better to pre-bake into the data
      // I'm initially doing it here because it makes it more flexible.
      convictionsPerCapita = this.get('convictions_per_capita');
      if (!_.isUndefined(convictionsPerCapita)) {
       this.set('convictions_per_1000', Math.round(convictionsPerCapita * 1000));
      }

      affectingWomenPerCapita = this.get('affecting_women_per_capita');
      if (!_.isUndefined(affectingWomenPerCapita)) {
        this.set('affecting_women_per_1000', Math.round(affectingWomenPerCapita * 1000));
      }
    }
  });

  Convictions.ConvictionGeoJSONCollection = GeoJSONCollection.extend({
    model: ConvictionGeoJSONModel,

    join: function(objs, joinAttr) {
      var collection = this;

      _.each(objs, function(o) {
        var lookup = {};
        var model;

        lookup[joinAttr] = o[joinAttr];
        model = collection.findWhere(lookup);

        if (model) {
          model.set(o);
        }
      });
    }
  });

  // Choropleth bins

  /**
   * A single bin.
   */
  var RangeBin = function(lower, upper, color) {
    this.lower = lower;
    this.upper = upper;
    this.color = color;
  };

  _.extend(RangeBin.prototype, {
    contains: function(val) {
      return val >= this.lower && val < this.upper;
    },

    label: function() {
      return this.lower + " - " + this.upper;
    }
  });

  var CategoryBin = function(category, color) {
    this.category = category;
    this.color = color;
  };

  _.extend(CategoryBin.prototype, {
    label: function() {
      return this.category;
    }
  });

  /**
   * All the bins for a given property.
   */

  var BinCollection = function(property, label, colors, options) {
    this.property = property;
    this.label = label;
    this.bins = [];

    this.initialize(colors, options);
  };

  _.each(['each', 'forEach'], function(method) {
    BinCollection.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(this.bins);
      return _[method].apply(_, args);
    };
  });

  _.extend(BinCollection.prototype, {
    initialize: function() {}
  });

  var RangeBinCollection = function() {
     BinCollection.apply(this, arguments);
  };
  RangeBinCollection.prototype = new BinCollection();
  _.extend(RangeBinCollection.prototype, {
    initialize: function(colors, options) {
      var breaks = options.breaks;
      var brk, i;
      for (i = 0; i < breaks.length - 1; i++) {
        this.bins.push(new RangeBin(breaks[i], breaks[i+1], colors[i]));
      }
    },

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

  var CategoryBinCollection = function() {
     BinCollection.apply(this, arguments);
  };
  CategoryBinCollection.prototype = new BinCollection();
  _.extend(CategoryBinCollection.prototype, {
    initialize: function(colors, options) {
      this.bins = {};
      var categories = options.categories;
      var i, category;
      for (i = 0; i < categories.length; i++) {
        this.bins[categories[i]] = new CategoryBin(categories[i], colors[i]);
      }
    },

    get: function(val) {
      return this.bins[val];
    }
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
      initialZoom: 10
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
    },

    invalidateSize: function() {
      this.map.invalidateSize(arguments);
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
      var $item = $('<dt style="background-color: ' + bin.color + '"></dt><dd>' + bin.label() + '</dd>');
      return $item;
    }
  });

  var ChoroplethMapView = MapView.extend({
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
        weight: 1,
        opacity: 1,
        //color: 'white',
        color: '#808080',
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

  /**
   * A choropleth of conviction rate
   */
  var ConvictionRateMapView = ChoroplethMapView.extend({
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
    }
  });

  Convictions.CategoryMapView = ChoroplethMapView.extend({
    postInitialize: function() {
      this.fillProperty = this.options.defaultFillProperty;
      this.fillLabel = this.options.defaultFillLabel;
      this.joinProperties = this.options.joinProperties;

      return this;
    },

    bindCollectionEvents: function() {
      this.collection.on('sync', this.handleSync, this);
    },

    handleSync: function() {
      var vals;
      var bins = new BinLookup();
      this.collection.join(this.joinProperties, this.options.joinAttr);
      vals = _.uniq(this.collection.pluck(this.fillProperty));
      bins.add(new CategoryBinCollection(this.fillProperty, this.fillLabel, this.options.colors, {
        categories: vals
      }));

      this.legendView = new MapLegendView({
        map: this.map,
        bins: bins,
        defaultFillProperty: this.fillProperty
      });
      this.options.bins = bins;
      this.addMapLayer('communityAreasLayer', this.collection);
    }
  });

  var convictionRateBreaks = [0, 10, 30, 60, 100, 225];
  var convictionRateBins = new BinLookup();
  convictionRateBins.add(new RangeBinCollection('convictions_per_1000',
    "Convictions per 1000",
    // Purples
    /*
    [
      '#f2f0f7',
      '#cbc9e2',
      '#9e9ac8',
      '#756bb1',
      '#54278f',
    ]
    */
    // Grays
    [
      '#f7f7f7',
      '#cccccc',
      '#969696',
      '#636363',
      '#252525',
    ],
    {
      breaks: convictionRateBreaks,
    }
  ));

  var affectingWomenBreaks = [0, 1, 2, 3];
  convictionRateBins.add(new RangeBinCollection('affecting_women_per_1000',
    "Convictions for crimes affecting women per 1000",
    [
      '#f7f7f7',
      '#cccccc',
      '#969696',
    ],
    {
      breaks: affectingWomenBreaks
    }));

  Convictions.ChicagoMapView = ConvictionRateMapView.extend({
    options: _.extend({}, ConvictionRateMapView.prototype.options, {
      bins: convictionRateBins
    }),

    preInitialize: function(options) {
      this.suburbsCollection = options.suburbsCollection;
      this.bordersCollection = options.bordersCollection;
    },

    bindCollectionEvents: function() {
      this.collection.on('sync', this.addCommunityAreasLayer, this);
      this.suburbsCollection.on('sync', this.addSuburbsLayer, this);
      this.bordersCollection.on('sync', this.addBordersLayer, this);
    },

    addCommunityAreasLayer: function() {
      this.addMapLayer('communityAreasLayer', this.collection);
    },

    addSuburbsLayer: function() {
      this.addMapLayer('suburbsLayer', this.suburbsCollection);
    },

    addBordersLayer: function() {
      // HACK: Ensure that this layer is always added last
      if (!this.communityAreasLayer) {
        this.collection.once('sync', this.addBordersLayer, this);
        return;
      }
      else if (!this.suburbsLayer) {
        this.suburbsCollection.once('sync', this.addBordersLayer, this);
        return;
      }
      this.addMapLayer('bordersLayer', this.bordersCollection, this.styleBorders,
        this.onEachFeatureBorders);
    },

    styleBorders: function(feature) {
      console.debug(feature);
      var style = {
        fillColor: null,
        fillOpacity: 0,
        color: 'black',
        weight: 3,
        opacity: 1
      };

      // Cook County should have a lighter border and a dashed border to
      // differentiate it from Chicago's
      if (feature.properties.name == "Cook County") {
        style.dashArray = '5';
        style.opacity = 0.5;
      }
      return style;
    },

    onEachFeatureBorders: function() {}
  });
})(window, document, jQuery, _, Backbone, L, window.Convictions || {});
