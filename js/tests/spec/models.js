describe('CommunityArea', function() {
  var caJSON;

  beforeEach(function(done) {
    $.getJSON('fixtures/humboldt_park.json', function(data) {
      caJSON = data.features[0];
      done();
    });
  });

  describe('initialize()', function() {
    var ca;

    beforeEach(function() {
      ca = new Convictions.CommunityArea(caJSON);
    });

    it('removes the geometry field from the attributes and makes it available as a property', function() {
      expect(ca.has('geometry')).toBeFalsy();
      expect(ca.geometry.type).toEqual(caJSON.geometry.type);
    });

    it('moves the GeoJSON properties to the model attribute', function() {
      expect(ca.get('name')).toEqual(caJSON.properties.name);
      expect(ca.get('number')).toEqual(caJSON.properties.number);
    });

    it('sets the id property to the number attribute', function() {
      expect(ca.id).toEqual(caJSON.properties.number);
    });
  });

  describe('toGeoJSON()', function() {
    var ca;

    beforeEach(function() {
      ca = new Convictions.CommunityArea(caJSON);
    });

    it('returns a valid GeoJSON feature with the model attributes set as properties', function() {
      var gj = ca.toGeoJSON();
      expect(gj.type).toEqual(caJSON.type);
      expect(gj.geometry).toEqual(caJSON.geometry);
      expect(gj.properties).toEqual(caJSON.properties);
    });
  });
});
