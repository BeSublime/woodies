if (Meteor.isClient) {
  Meteor.startup(function () {
    Meteor.call('getItems', function(err, res) { 
      if (res.data) {
        var tempArray =  [],
            rowSize = 4,
            result = [],
            row = {};
        
        // TODO: DRY this off.
        // hoodies
        _.each(res.data, function(event, i) {
          var hoodies = _.filter(event.Offers, function(offer) {
            return offer.Title.toLowerCase().indexOf('hoodie') > -1;
          });
          tempArray = tempArray.concat(hoodies);
        });
        
        if (tempArray.length) {
          var hoodies = {
            title: "Hoodies",
            count: tempArray.length,
            rows: []
          };
  
          while (tempArray.length > 0) {
            row = {items: tempArray.splice(0, rowSize)};
            hoodies.rows.push(row);
          }
          
          result.push(hoodies);
        }
        
        // journals
        _.each(res.data, function(event, i) {
          var journals = _.filter(event.Offers, function(offer) {
            return offer.Title.toLowerCase().indexOf('journal') > -1;
          });
          tempArray = tempArray.concat(journals);
        });
        
        if (tempArray.length) {
          var journals = {
            title: "Journals",
            count: tempArray.length,
            rows: []
          };
  
          while (tempArray.length > 0) {
            row = {items: tempArray.splice(0, rowSize)};
            journals.rows.push(row);
          }
          
          result.push(journals);
        }
        
        // totes
        _.each(res.data, function(event, i) {
          var totes = _.filter(event.Offers, function(offer) {
            return offer.Title.toLowerCase().indexOf(' tote') > -1;
          });
          tempArray = tempArray.concat(totes);
        });
        
        if (tempArray.length) {
          var totes = {
            title: "Totes",
            count: tempArray.length,
            rows: []
          };
  
          while (tempArray.length > 0) {
            row = {items: tempArray.splice(0, rowSize)};
            totes.rows.push(row);
          }
          
          result.push(totes);
        }

        Session.set("items", result);
      }
      else {
        Session.set("items", {success: false, message: "Error loading items."}); 
      }
    });
  });
  
  Template.itemset.isLargePhoto = function() {
    return this.Width === 278;
  };
  
  Template.items.items = function () {
    return Session.get("items");
  };
  
  Meteor.methods({
    getItems: function () {
      Session.set("items", null);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    
  });
  
  Meteor.methods({
    getItems: function () {
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