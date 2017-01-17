shopifyOrders = function() {

  var Q = require("q");
  var http = require("https");
  var baseUrl = "shopicruit.myshopify.com";
  var path = "/admin/orders.json?page="; 
  var token = "c32313df0d0ef512ca64d5b336a0d7c6"; 
  var hasMore = true;
  var pageNum = 1;

  var orders = [];

  var calculateRevenue = function () {
    getPage(pageNum)
      .then(updateOrders)
      .then(getNextPage);
  };

  var getNextPage= function () {
    if (hasMore) {
      pageNum++;
      calculateRevenue();
    } else {
      sumValues();
    }
  }

  //Gets a single page of orders from the Shopify API
  var getPage = function (pageNum) {

    var deferred = Q.defer();

    var options = {
      host: baseUrl,
      path: path + pageNum + '&access_token=' + token
    };

    page = http.request(options, function(resp) {

      var data = '';
      resp.setEncoding('utf8');

      //response is downloaded in chunks, so we must concat new chunks
      //to the data variable as they arrive.
      resp.on('data', function (chunk) {
        data += chunk;  
      });

      //once all data has been downloaded, add the it to the
      //array of orders
      resp.on('end', function () {
        var obj = JSON.parse(data);
        deferred.resolve(obj);
      });

    }).end();

    return deferred.promise;

  };

   //Takes a single API response and adds the orders to the order array.
   //If the orders array is empty, the hasMore variable is updated to reflect that
  var updateOrders= function (page) {
    if (page.orders.length !== 0) {
      Array.prototype.push.apply(orders, page.orders);
    } else {
      hasMore = false;  
    }
  }

  var sumValues = function() {

    var totalCad = 0;
    var totalUsd = 0

      //Multiplying float values by 100 to prevent precision errors in summing
      for (var i = 0; i < orders.length; i++) {
        totalCad += parseFloat(orders[i].total_price) * 100; 
        totalUsd += parseFloat(orders[i].total_price_usd) * 100;
      } 

    console.log("Total revenue in CAD: $", totalCad / 100);
    console.log("Total revenue in USD: $" , totalUsd / 100);
  }

  return{calculateRevenue: calculateRevenue}; 

}();

shopifyOrders.calculateRevenue();
