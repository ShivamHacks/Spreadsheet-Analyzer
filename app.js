var express = require('express');
var path = require('path');
var app = express();

var server = require('http').Server(app);
var port = process.env.PORT || '3000';
app.set('port', port);
server.listen(port, function(){
  console.log('listening on: ' + this.address().port);
});

var _ = require("underscore");

var GoogleSpreadsheet = require("google-spreadsheet");
var creds = require('../creds/gservice.json');

app.get('/api', function (req, res, next) {
  var spreadsheetID = req.query.sid;
  var sheetName = req.query.sname;
  var sortBy = req.query.sby;
  var sortType = req.query.stype;
  var order = req.query.order;
  var headingRow = req.query.hrow;
  var dataRowStart = req.query.drow;
  var dataRowEnd = req.query.dend;

  var params1 = {
    'spreadsheetID': spreadsheetID,
    'worksheet': sheetName
  };

  //var obj;

  retrieve(params1, function(data) {
    console.log('here we go');
    var params2 = {
      "headingRow": headingRow,
      "dataRowStart": dataRowStart,
      "dataRowEnd": dataRowEnd,
      "sortBy": sortBy,
      "sortType": sortType,
      "order": order,
      "data": data
    }
    var dones = analyze(params2);
   // console.log('here we go 2:');
   // console.log(dones);
    res.send(dones);

    ///console.log(data);
    //res.send(data);
    //res.send(done);
  });

  //console.log(obj);

 // var rand = retrieve(spreadsheetID, sheetName, sortBy, sortType, order, headingRow, dataRowStart, dataRowEnd);
  //console.log(rand);
  //console.log("------------------------------------------");
 // res.send('done');
});

function retrieve(params, callback) {
  var spreadsheet = new GoogleSpreadsheet(params.spreadsheetID);
  spreadsheet.useServiceAccountAuth(creds, function(err) {
    spreadsheet.getInfo( function( err, data ){
      var sheet = _.find(data.worksheets, function(sheet) { return sheet.title == params.worksheet; });
      sheet.getCells( function( err, cells ) {
        console.log('retrieved');
        if (err) callback(err);
        else { callback(cells); }
      });
    });
  });
};

/*function retrieve(spreadsheetID, sheetName, sortBy, sortType, order, headingRow, dataRowStart, dataRowEnd) {
  var data;
  var spreadsheet = new GoogleSpreadsheet(spreadsheetID);
  spreadsheet.useServiceAccountAuth(creds, function(err) {
    spreadsheet.getInfo( function( err, data ){
      var sheet = _.find(data.worksheets, function(sheet) { return sheet.title == sheetName; });
      sheet.getCells( function( err, cells ){
        if (err) console.log(err);
        //else { analyze(cells, sortBy, sortType, order, headingRow, dataRowStart, dataRowEnd); }
        data = cells;
      });
    });
  });
  console.log(data);
  return data;
}*/

// http://localhost:3000/api?sid=1vQ1TIcmrNnzqaR0bzuAW4hZ2TTG6A_-LTV79n0er4Uw&sname=Sheet%201&sby=Number&stype=alphabetical&order=ascending&hrow=1&drow=4&dend=8

function analyze(params) {
  // creates a rectangle using heading and data start

  var headings = _.pluck(_.filter(params.data, function(cell) { return cell.row == parseInt(params.headingRow); }), 'value');
  var sorter = headings.indexOf(params.sortBy) == -1 ? undefined : headings[ headings.indexOf(params.sortBy) ];

 // var data = params.data;

  var cells = _.filter(params.data, function(cell) {
    return (cell.row >= parseInt(params.dataRowStart) && cell.row <= parseInt(params.dataRowEnd));
  });

  var rows = _.groupBy(cells, function(cell) { return cell.row; });

  rows = _.sortBy(rows, function(row) {
    var o = row[ headings.indexOf(params.sortBy) ];
    console.log(o.numericValue);
    return parseInt(o.numericValue); 
  })


 // data = _.sortBy()


 /* var cells = _.filter(params.data, function(cell) {
    return (cell.row >= parseInt(params.dataRowStart) && cell.row <= parseInt(params.dataRowEnd));
  });
  var columns = _.groupBy(cells, function(cell) { return cell.col; });
  console.log("*******************************************************");
  console.log(columns);
  console.log("*******************************************************");

  var col = columns[headings.indexOf(sorter)];
  if (params.sortType == 1) {
    col = _.sortBy(col, function(o) { return o.value; });
  } else if (params.sortType == 2) {
    col = _.sortBy(col, function(o) { return o.numericValue; });
  }*/

  return rows;

}

//http://localhost:3000/api?

// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
});


module.exports = app;

//analyze@spreadsheetanalyzer-1219.iam.gserviceaccount.com

//var sortBy = sorters.indexOf(req.query.sby) == -1 ? undefined : sorters[ sorters.indexOf(req.query.sby) ];
// var sorters = [ "date", "number", "alphabetical" ];




  // alphabetical sort
 /* col = _.sortBy(_.map(col, function(obj) { 
    var obj2 = obj;
    obj2.numericValue = parseInt(obj.numericValue)
    return obj2; 
  }), function(obj){ return obj.numericValue });  


  // numerical sort
  col = _.sortBy(_.map(col, function(obj) { 
    var obj2 = obj;
    obj2.numericValue = parseInt(obj.numericValue)
    return obj2; 
  }), function(obj){ return obj.numericValue }); */

  //console.log(col);



  //console.log(col[0]);
  //console.log(row);
   //var data1 = _.pluck(row, 'value');
  //_.sortBy(row, 'numericValue');

 // var data2 = _.pluck(col, 'numericValue');
  //console.log(data2);
 // data2 = _.map(data2, function(str){ return parseInt(str) });
  //console.log(data2);
 // data2 = _.sortBy(data2, function(ro){ return ro });


  /*if (typeof sorter != undefined) {
    var numericRow = _.pluck(rows[headings.indexOf(sorter)], 'numericValue');
    var row = 
  }*/

  //console.log(headings);
  //console.log(sorter);
  //console.log(data1);
 // console.log(data2);


  //var headings = _.pluck(headingData, 'value');
  //console.log(headingRow);
