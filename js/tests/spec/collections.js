describe('CommunityAreas', function() {
  var communityAreas;
  var featuresJSON;

  beforeEach(function(done) {
    communityAreas = new Convictions.CommunityAreas();
    communityAreas.url = 'fixtures/humboldt_park.json';
    $.getJSON('fixtures/humboldt_park.json', function(data) {
      featuresJSON = data;
      done();
    });
  });

  describe('fetch()', function() {
    beforeEach(function(done) {
      communityAreas.fetch({
        success: function(collection, response, options) {
          done();
        }
      });
    });

    it('Populates the collection with models from the GeoJSON FeatureCollection', function() { 
      var ca;
      var caJSON = featuresJSON.features[0];

      expect(communityAreas.length).toEqual(featuresJSON.features.length);
      
      ca = communityAreas.get(caJSON.properties.number);
      expect(ca.get('number')).toEqual(caJSON.properties.number);
      expect(ca.get('name')).toEqual(caJSON.properties.name);
    });
  });
});
