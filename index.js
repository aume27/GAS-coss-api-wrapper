/**************************************************************
GAS (googleAppScript) limitations:
- A script that uses a library does not run as quickly as
  single script project. Recommend to copy this code to
  a script file in your project.
- Can't call anonym functions contained in an object from
  spreadsheet. The Variable.functionName() structure is
  reserved for library reference name in googleAppScript.
- Can't send an object as function parametter from
  spreadsheet,params must be hard coded.
- Get method doesn't handle payloads using UrlFetchApp,
  concatenated query_params to url.
- Will not automaticaly arrange the response object to
  fit spreadsheets, must build your own function with it.

Credits:
- @27aude, Author.
- @cryptodeal, This GAS script is based on the Node.Js
  Coss-api-wapper created by @cryptodeal.
  Source: https://github.com/cryptodeal/Coss-API-Node
- @manucart for his cryptocurrency-portfolio.
  Used as example from other exchanges
  Source: https://github.com/ManuCart/Cryptocurrency-Portfolio
**************************************************************/
/*
@customfunction
*/

var apiKey = 'YOUR_PUBLIC_API_KEY';
var apiSecret = 'YOUR_API_SECRET_KEY';
var accountID = 'YOUR_ACCOUNT_ID'; //IdenfierName.accountDetails().account_id; //Shortcut to get account_id. IdenfierName is only usefull as library user

var uriMap = {
  end_point: "https://api.coss.io/v1",
  order: {
    //POST method URIs (private)
    add: "/order/add",
    details: "/order/details",
    list: {
      open: "/order/list/open",
      completed: "/order/list/completed",
      all: "/order/list/all" },
    //DELETE method URIs (private)
    cancel: "/order/cancel" },
  //GET method URIs account functions (private)
  account: {
    balance: "/account/balances",
    details: "/account/details" },
  ex_info: "/exchange-info",
  market: {
    depth: "/dp",
    price: "/market-price",
    summ: "/getmarketsummaries"
  }};


/**
 * Return the signed header, require get_payloadSig().
 * @param {string} sign
 * @return {Object} header
 */
function get_signedHeader(sign) {
  var headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Authorization': apiKey,
    'Signature': sign,
  }
  return headers
}


/**
 * Generate signature using googleAppScript Utilities.
 * @param {object} payload Query_params of the request.
 * @param {string} secret Api secret provided by exchange.
 * @return {string} signature
 */
function get_payloadSig(payload, secret) {
  /*CHECK THIS LINK FOR HASHING SIGNATURES IN GAS:
  https://stackoverflow.com/questions/41232615/how-to-get-hex-value-from-computehmacsha256signature-method-of-google-apps-scrip
  */
  var sign = Utilities.computeHmacSha256Signature(payload, secret).reduce(function(sig,bit){
    bit = (bit < 0 ? bit + 256 : bit).toString(16);
    return sig + (bit.length==1?'0':'') + bit;
  },'');
  return sign;
}


/**
 * Process private request
 * @param {string} method
 * @param {string} url
 * @param {object} query_params
 * @return {Object} response
 */
function privReq(method, url, query_params) {
  try {
    query_params = method.toLowerCase() === 'get' ? query_params : JSON.stringify(query_params);
    var sign = get_payloadSig(query_params, apiSecret);

    var headers = get_signedHeader(sign);
    var params = {
      'method': method,
      'headers': headers,
      'muteHttpExceptions':true
    };
    if (method.toLowerCase() !== 'get') params.payload = query_params;

    var result = UrlFetchApp.fetch(url, params);
    var response = JSON.parse(result.getContentText());
    return response;

  } catch(e) {
    Logger.log(e);
    return "\n error: "+ e;
  }
}

/**
 * Process public request
 * @param {string} url
 * return {Object} response
 */
function pubReq(url) {
  try {
    var headers = {
      'content-Type': 'application/json'
    }
    var params = {
      'method': 'get',
      'headers': headers,
      'muteHttpExceptions':true
    };
    var result = UrlFetchApp.fetch(url, params);
    var response = JSON.parse(result.getContentText());
    return response;

  } catch(e) {
    Logger.log(e);
    return "\n error: "+ e;
  }
}



//////////////////////////////////////////////////////////////////////////
//Private calls:
//secP stand for second parameter, allow for more precision where avalaible.

/**
 * Retreive your account informations
 * Does not require any params.
 * @return {Object} The responce object.
 * @customfunction
 */
function accountDetails() {

  var now = Math.floor(new Date().getTime()).toString();
  var query_params = "recvWindow=5000&timestamp="+ now;
  var url = uriMap.end_point + uriMap.account.details+ "?"+ query_params;

  var response = privReq('GET', url, query_params);
//  Logger.log(response);
  return response;
}


/**
 * Get your wallet information addresses, totals, available ,and reserved.
 * @param {string} secP Optional. Can be equal to "ign0" (show only balances >0), a string or an array.
 * @return {Object} The response object.
 * @customfunction
 */
function accountBalance(secP) {
  // secP can be = ign0( show only total balances > 0), a precise coin(e.g: btc), an array of coins

  var now = Math.floor(new Date().getTime()).toString();
  var query_params = "recvWindow=5000&timestamp="+ now;
  var url = uriMap.end_point + uriMap.account.balance+ "?"+ query_params;

  var response = privReq('GET', url, query_params);
  if (!secP) { //raw Response
//    Logger.log(response);
    return response;

  } else if (secP == 'ign0') { //Filter zero
    var array = [];
    for ( var i = 0; i < response.length; i++) {
      if (response[i].total > 0) array.push(response[i]);
    };
//    Logger.log(array);
    return array;

  } else { //defined-search: one or multiple coin at the time
    if (typeof(secP) == 'string') secP = [secP];
    var array = [];
    for (var i = 0; i < secP.length; i++) {
      for ( var j = 0; j < response.length; j++) {
        if (response[j].currency_code == secP[i].toUpperCase()) {
          array.push(response[j]);
          if(array.length !== i+1) Logger.log("Can't find your search: "+secP[i] +"\n Make sure to supply a valid coin ticker e.g. 'btc' or ['btc','eth','coss']" );
        }}};
//    Logger.log(array);
    return array;
  }
}


/**
 * Place order of different types.
 * @param {string} Symbol A valid trading pair symbol, e.g. 'eth-btc'.
 * @param {string} Side A valid order side, e.g. 'BUY' or 'SELL'
 * @param {number} Price The price of your order.
 * @param {number} Qty The quantity,must contain 8 decimals e.g.  '123.00000000'.
 * @return {Object} The response object.
 * @customfunction
 */
function placeOrder(Symbol, Side, Price, Qty) {
  //Type isnt yet supported. Always leave to 'limit' for the moment. * @param {string} Type The order type e.g. 'limit', 'market'.

  if (!Symbol) {
    return "placeOrder(), You must supply a valid trading pair Symbol, e.g. 'eth-btc'!";
  } else if (Symbol && typeof(Symbol) !== 'string') {
    return "placeOrder(), You must supply a valid trading pair Symbol as a string, e.g. 'eth-btc'!";
  } else if (!Side || Side && Side.toLowerCase() !== 'buy' && Side.toLowerCase() !== 'sell') {
    return "placeOrder(), You must supply a valid Side, e.g. 'BUY' or 'SELL'!";
  } else if (!Qty) {
    return "placeOrder(), You must supply a valid Amount, e.g. Amount: '123.00000000'!";
  } else if (typeof(Qty) !== 'number') {
    return "placeOrder(), You must supply a valid Amount as a number, e.g. Amount: '123.00000000'!";
  }
  if(!Type) Type = 'limit'; //to delete when new order types are available.
  if (!Type) {
    return "placeOrder(), You must supply a valid order Type, e.g. 'limit'!";
  } else if (Type && typeof(Type) !== 'string') {
    return "placeOrder(), You must supply a valid order Type as a string, e.g. 'limit'!";
  }

  var now = Math.floor(new Date().getTime()).toString();
  var query_params = {
    order_symbol: Symbol,
    order_side: Side,
    order_price: Price.toString(),
    order_size: Qty.toString(),
    type: Type,
    timestamp: now,
    recvWindow: 5000
  };
  var url = uriMap.end_point + uriMap.order.add;

  var response = privReq('POST', url, query_params);
//  Logger.log(response);
  return response;
}


/**
 * Remove the specified order.
 * @param {string} ID A valid order id, e.g. '0oi9u87y-2345-271d-71f2-1q2w3e4r5te7'.
 * @param {string} Symbol A valid trading pair symbol, e.g. 'eth-btc'.
 * @return {Object} The response object.
 * @customfunction
 */
function cancelOrder(ID, Symbol) {

  if (!ID) {
    return "cancelOrder(), You must supply a valid order_ID to cancel, e.g. '0oi9u87y-2345-271d-71f2-1q2w3e4r5te7'!";
  } else if (ID && typeof(ID) !== 'string') {
    return "cancelOrder(), You must supply a valid order_ID to cancel as a string, e.g. '0oi9u87y-2345-271d-71f2-1q2w3e4r5te7'!";
  } else if (!Symbol) {
    return "cancelOrder(), You must supply a valid trading pair Symbol, e.g. 'eth-btc'!";
  } else if (Symbol && typeof(Symbol) !== 'string') {
    return "cancelOrder(), You must supply a valid trading pair Symbol as a string, e.g. 'eth-btc'!";
  }

  var now = Math.floor(new Date().getTime()).toString();
  var query_params = {
    order_id: ID,
    order_symbol: Symbol,
    timestamp: now,
    recvWindow: 5000
  }
  var url = uriMap.end_point + uriMap.order.cancel;

  var response = privReq('DELETE', url, query_params);
//  Logger.log(response);
  return response;
}



/**
 * Get details about a specified order.
 * @param {string} ID A valid order id, e.g. '0oi9u87y-2345-271d-71f2-1q2w3e4r5te7'.
 * @return {Object} The response object.
 * @customfunction
 */
function orderDetails(ID) {

  if (!ID) {
    return "orderDetails(), You must supply a valid order_ID , e.g. '0oi9u87y-2345-271d-71f2-1q2w3e4r5te7'!";
  } else if (ID && typeof(ID) !== 'string') {
    return "orderDetails(), You must supply a valid order_ID as a string, e.g. '0oi9u87y-2345-271d-71f2-1q2w3e4r5te7'!";
  }

  var now = Math.floor(new Date().getTime());//.toString();
  var query_params = {
    order_id: ID,
    timestamp: now,
    recvWindow: 5000
  }

  var url = uriMap.end_point + uriMap.order.details;
  var response = privReq('POST', url, query_params);
//  Logger.log(response);
  return response;
}


/**
 * Get a list of your open orders.
 * @param {number} Limit The number of order to list.
 * @param {string} Symbol A valid trading pair symbol, e.g. 'eth-btc'.
 * @return {Object} The response object.
 * @customfunction
 */
function openOrders(Limit, Symbol) {

  if (!Limit) {
    return "getOpenOrders(), You must supply a valid Limit for your open orders, e.g. '10'!";
  } else if (Limit && typeof(Limit) !== 'number') {
    return "getOpenOrders(), You must supply a valid Limit as a number for your open orders, e.g. '10'!";
  } else if (!Symbol) {
    return "getOpenOrders(), You must supply a valid trading pair Symbol, e.g. 'eth-btc'!";
  } else if (Symbol && typeof(Symbol) !== 'string') {
    return "getOpenOrders(), You must supply a valid trading pair Symbol as a string, e.g. 'eth-btc'!";
  }

  var now = Math.floor(new Date().getTime()).toString();
  var query_params = {
    limit: Limit.toString(),
    page: 0,
    symbol: Symbol,
    timestamp: now,
    recvWindow: 5000
  }

  var url = uriMap.end_point + uriMap.order.list.open;
  var response = privReq('POST', url, query_params);
//  Logger.log(response);
  return response;
}


/**
 * Get a list of your completed orders.
 * @param {number} Limit The number of order to list.
 * @param {string} Symbol A valid trading pair symbol, e.g. 'eth-btc'.
 * @return {Object} The response object.
 * @customfunction
 */
function completedOrders(Limit, Symbol) {

  if (!Limit) {
    return "getCompletedOrders(), You must supply a valid Limit for your open orders, e.g. '10'!";
  } else if (Limit && typeof(Limit) !== 'number') {
    return "getCompletedOrders(), You must supply a valid Limit as a number for your open orders, e.g. '10'!";
  } else if (!Symbol) {
    return "getCompletedOrders(), You must supply a valid trading pair Symbol, e.g. 'eth-btc'!";
  } else if (Symbol && typeof(Symbol) !== 'string') {
    return "getCompletedOrders(), You must supply a valid trading pair Symbol as a string, e.g. 'eth-btc'!";
  }

  var now = Math.floor(new Date().getTime()).toString();
  var query_params = {
    limit: Limit.toString(),
    page: 0,
    symbol: Symbol,
    timestamp: now,
    recvWindow: 5000
  }
  var url = uriMap.end_point+ uriMap.order.list.completed;
  var response = privReq('POST', url, query_params);
//    Logger.log(response);
  return response;
}


/**
 * Get a list of your orders.
 * @param {number} Limit The number of order to list.
 * @param {string} Symbol A valid trading pair symbol, e.g. 'eth-btc'.
 * @param {string} AccID A valid account ID.
 * @return {Object} The response object.
 * @customfunction
 */
function allOrders(Limit, Symbol, AccID) {

  if (!Limit) {
    return "getAllOrders(), You must supply a valid Limit for your open orders, e.g. '10'!";
  } else if (Limit && typeof(Limit) !== 'number') {
    return "getAllOrders(), You must supply a valid Limit as a number for your open orders, e.g. '10'!";
  } else if (!Symbol) {
    return "getAllOrders(), You must supply a valid trading pair Symbol, e.g. 'eth-btc'!";
  } else if (Symbol && typeof(Symbol) !== 'string') {
    return "getAllOrders(), You must supply a valid trading pair Symbol as a string, e.g. 'eth-btc'!";
  } else if (!AccID) {
    return "getAllOrders(), You must supply a valid account ID";
  } else if (AccID && typeof(AccID) !== 'string') {
    return "getAllOrders(), You must supply a valid account ID as a string";
  }

  var now = Math.floor(new Date().getTime()).toString();
  var query_params = {
    limit: Limit.toString(),
    from_id: AccID,
    page: 0,
    symbol: Symbol,
    timestamp: now,
    recvWindow: 5000
  }
  var url = uriMap.end_point+ uriMap.order.list.all;
  var response = privReq('POST', url, query_params);
//  Logger.log(response);
  return response;
}


//////////////////////////////////////////////////////////////////////////
//Public calls:


/**
 * Get exchange informations and status.
 * @return {Object} The response object.
 * @customfunction
 */
function exchangeInfo() {
  var url = uriMap.end_point+ uriMap.ex_info;

  var response = pubReq(url);
//  Logger.log(response);
  return response;
}


/**
 * Get market depth for a pair.
 * @param {string} Symbol A valid trading pair symbol, e.g. 'eth-btc'.
 * @return {Object} The response object.
 * @customfunction
 */
function marketDepth(symbol) {

  if (!symbol) {
    return "mktSummaries(), You must supply a valid trading pair Symbol, e.g. 'eth-btc'!";
  } else if (symbol && typeof(symbol) !== 'string') {
    return "mktSummaries(), You must supply a valid trading pair Symbol as a string, e.g. 'eth-btc'!";
  }

  var url = uriMap.end_point+ uriMap.market.depth+ '?symbol='+ symbol;
  var response = pubReq(url);
//  Logger.log(response);
  return response;
}


/**
 * Get market price for a pair.
 * @param {string} Symbol A valid trading pair symbol, e.g. 'eth-btc'.
 * @return {Object} The response object.
 * @customfunction
 */
function marketPrice(symbol) {

  if (!symbol) {
    return "mktSummaries(), You must supply a valid trading pair Symbol, e.g. 'eth-btc'!";
  } else if (symbol && typeof(symbol) !== 'string') {
    return "mktSummaries(), You must supply a valid trading pair Symbol as a string, e.g. 'eth-btc'!";
  }

  var url = uriMap.end_point+ uriMap.market.price+ '?symbol='+ symbol;
  var response = pubReq(url);
//  Logger.log(response);
  return response;
}


/**
 * Get market summaries for a pair.
 * @param {string} Symbol A valid trading pair symbol, e.g. 'eth-btc'.
 * @return {Object} The response object.
 * @customfunction
 */
function marketSummaries(symbol) {

  if (!symbol) {
    return "mktSummaries(), You must supply a valid trading pair Symbol, e.g. 'eth-btc'!";
  } else if (symbol && typeof(symbol) !== 'string') {
    return "mktSummaries(), You must supply a valid trading pair Symbol as a string, e.g. 'eth-btc'!";
  }

  var url = uriMap.end_point+ uriMap.market.summ+ '?symbol='+ symbol;
  var response = pubReq(url);
//  Logger.log(response);
  return response;
}
