//////////////////////////////////////////////////////////////////////////
//Delete the underscore at the end of the functions and variables.
// underscore (_) is used to make elements ignored/"unusable"
// e.g. function Exam_()  should be: function Exam()

var test_symbol_ = "coss-eth";
var test_side_ = "BUY";
var test_price_ = 0.00001;
var test_qty_ = 251;


function test_final_() {
  // Uncomment and set parameters to test one of the request.
//  Logger.log( accountDetails() );
//  Logger.log( accountBalance(['eth']) ); // 'ETH' // ['eth', 'coss', 'eos', 'lsk', 'btc']
//  Logger.log( placeOrder(test_symbol, test_side, test_price, test_qty) );
//  Logger.log( cancelOrder('YOUR_ORDER_ID', 'coss-eth') );
//  Logger.log( orderDetails("YOUR_ORDER_ID") );
//  Logger.log( openOrders( 10, 'coss-eth') );
//  Logger.log( completedOrders( 10, 'coss-eth') );
//  Logger.log( allOrders( 10, 'coss-eth', accountID) );
//  Logger.log( exchangeInfo() );
//  Logger.log( mktDepth('coss-eth') );
//  Logger.log( mktPrice('coss-eth') );
//  Logger.log( mktSummaries('coss-eth') );
}

//////////////////////////////////////////////////////////////////////////
/*
Examples to spreadsheet
- Copy the function in your script file.

- Also in the example below, I'm using Coss as a IdenfierName.
*/

function examp_accountBalance_(SecP){
  //function that can use an abstract amount of params can be used with the arguments keyword
  var res = Coss.accountBalance(arguments);

  var arr = [];
  res.forEach(function(e){
    arr.push([e.total, e.address, e.available, e.currency_code]);
  });
  return arr;
  /*
  Paste this in spreadsheet:
  =examp_accountBalance("eth", "coss", "eos", "lsk", "btc")
  */
}

function examp_openOrders_(Limit, Symbol){
  //function that have defined params, must hold the right amount of parameter and in the proper order.
  var res = Coss.openOrders(Limit, Symbol);
  Logger.log(res);

  var arr = [];
  res.list.forEach(function(e){
    if (e == null) {
      arr.push(['null']);
    } else {
      arr.push([e.order_size, e.order_price, e.executed, e.type, e.total, e.account_id, e.avg, e.order_symbol, e.stop_price, e.createTime, e.order_side, e.order_id, e.open]);
    }
    Logger.log(e);
  });
  return arr;
  /*
  Paste this in spreadsheet:
  =examp_openOrders(10, "coss-eth")
  */
}

function examp_allOrders_(Limit, Symbol, AccID){
  //function that have defined params, must hold the right amount of parameter and in the proper order.
  var res = Coss.allOrders(Limit, Symbol, AccID);
  Logger.log(res);

  var arr = [];
  res.forEach(function(e){
    if (e == null) {
      arr.push(['null']);
    } else {
      arr.push([e.order_size, e.order_price, e.executed, e.type, e.total, e.account_id, e.avg, e.order_symbol, e.stop_price, e.createTime, e.order_side, e.order_id, e.open]);
    }
    Logger.log(e);
  });
  return arr;
  /*
  Paste this in spreadsheet:
  =examp_allOrders(10, "coss-eth")
  */
}
