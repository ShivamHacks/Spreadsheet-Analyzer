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
    res.send(dones);
  });
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

function analyze(params) {
  var headings = _.pluck(_.filter(params.data, function(cell) { return cell.row == parseInt(params.headingRow); }), 'value');
  if ( headings.indexOf(params.sortBy) == -1 ) {
    return 'error';
  } else {
    var cells = _.filter(params.data, function(cell) {
      return (cell.row >= parseInt(params.dataRowStart) && cell.row <= parseInt(params.dataRowEnd));
    });
    if (params.sortType == 1) { // alphabetical
      var rows = _.sortBy(_.groupBy(cells, function(cell) { return cell.row; }), function(row) {
        return row[ headings.indexOf(params.sortBy) ].value; 
      });
      var returnData = _.map(rows, function(row) { return _.pluck(row, 'value'); });
    } else if (params.sortType == 2) { // numerical
      var rows = _.sortBy(_.groupBy(cells, function(cell) { return cell.row; }), function(row) {
        return parseInt(row[ headings.indexOf(params.sortBy) ].numericValue); 
      });
      var returnData = _.map(rows, function(row) { return _.pluck(row, 'value'); });
    } else if (params.sortType == 3) { // matching
      var rows = _.groupBy(_.groupBy(cells, function(cell) { return cell.row; }), function(row) {
        return row[ headings.indexOf(params.sortBy) ].value;
      });
      var returnData = _.map(rows, function(row) { return _.pluck(row, 'value'); }); // error
      // console.log(_.keys(rows));
    } else {
      return 'error';
    }
  }


 // returns array of rows (array) where each row has an array of cells (objects);
  // add more than just order/sort, add in matching, and others based on custom algorithms. also make the user process much easier. for example, instead of typing in a row for end and start, why not make it a box that users can highlight. maybe even show a preview of the spreadsheet and allow for live editting through the algorithms i have.


  return returnData;
}

// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
});


module.exports = app;

//analyze@spreadsheetanalyzer-1219.iam.gserviceaccount.com


      

     // console.log(_.keys(rows));

     // rows = _.sortBy(rows, function(row) {
        //console.log(row[0]);
        //return row;
      //})

      /*, function(group) {
        console.log(group);
        return _.keys(group)[0];
      });*/

      // _.groupBy(cells, function(cell) { return cell.row; })

// http://localhost:3000/api?sid=1vQ1TIcmrNnzqaR0bzuAW4hZ2TTG6A_-LTV79n0er4Uw&sname=Sheet%201&sby=Number&stype=alphabetical&order=ascending&hrow=1&drow=4&dend=8
