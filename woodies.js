if (Meteor.isClient) {
  Meteor.startup(function () {
    Meteor.call('getAPIResult', function(err, res) { 
      
      // FIXME: this is kinda hacky, should be changed to strings, but with a way to specify titles
      var searchTerms = {
        hoodie: {},
        journal: {},
        tote: {},
        mug: {}
      };
      
      // FIXME: this can be consolidated; messages can go in a session var
      var woodiesData = {
        resultSets : []
      };
        
      if (res.data) {
        var buildResultSet = function(searchTerm) {
          var items = [];
          
          _.each(res.data, function(event, i) {
            var searchResults = _.filter(event.Offers, function(offer) {
              return offer.Title.toLowerCase().indexOf(' ' + searchTerm) > -1;
            });
            items = items.concat(searchResults);
          });
          console.log(items);
    
          _.each(items, function(item, i) {
            item._index = i;
          });
            
          return items;
        };

        // Do the damn thang.
        for (var searchTerm in searchTerms) {
          var items = buildResultSet(searchTerm),
              title = searchTerms[searchTerm].title || // quick n dirty capitalization/pluralization:
                searchTerm.charAt(0).toUpperCase() +
                searchTerm.slice(1).toLowerCase() + 's';
                
          if (items.length) {
            woodiesData.resultSets.push({
              items: items,
              title: title
            });
          }
        }
        
        if (!woodiesData.resultSets.length) {
          woodiesData.message = "No woodies today =/";
        }
      }
      else {
        woodiesData.message = 'Sorry, an error occured while trying to reach the woot servers. =/';
      }
      
      Session.set("woodiesData", woodiesData);
    });
  });
  
  Template.items.isLargePhoto = function() {
    return this.Width === 278;
  };
  
  Template.woodies.data = function () {
    return Session.get("woodiesData");
  };
  
  Template.items.modIndex = function(modValue) {
      return this._index > 0 && (this._index + 1) % modValue === 0;
  };

  Meteor.methods({
    getAPIResult: function () {
      Session.set("woodiesData", null);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (typeof Meteor.settings.wootApiKey === "undefined") {
        throw "Please create a settings file with your woot API key and run meteor with --settings settings.json."
    }
  });
  
  Meteor.methods({
    getAPIResult: function () {
      this.unblock();
      
      var params = {
        key:    Meteor.settings.wootApiKey,
        site:   "shirt.woot.com",
        select: "Title,Offers"
      };
      
      var query = "eventType=Daily&eventType=WootPlus";
      
      return HTTP.get("http://api.woot.com/2/events.json", {query: query, params: params});
      // simulate lag
      //setTimeout(function(){ /*do nothing*/ }, 2000);
     //return [{ Offers: { Id: "loaded" } }];
    }
  });
}