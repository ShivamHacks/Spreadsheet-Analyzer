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

var sorters = [ "date", "number", "alphabetical" ];

app.get('/api', function (req, res, next) {
  var spreadsheetID = req.query.sid;
  var sheetName = req.query.sname;
  var sortBy = sorters.indexOf(req.query.sby) == -1 ? undefined : sorters[ sorters.indexOf(req.query.sby) ];
  var headingRow = req.query.hrow;
  var dataRowStart = req.query.drow;
  retrieve(spreadsheetID, sheetName, sortBy, headingRow, dataRowStart);
  console.log("------------------------------------------");
  res.send('done');
});

function retrieve(spreadsheetID, sheetName, sortBy, headingRow, dataRowStart) {
  var spreadsheet = new GoogleSpreadsheet(spreadsheetID);
  spreadsheet.useServiceAccountAuth(creds, function(err) {
    spreadsheet.getInfo( function( err, data ){
      var sheet = _.find(data.worksheets, function(sheet) { return sheet.title == sheetName });
      sheet.getCells( function( err, cells ){
        if (err) console.log(err);
        else { analyze(cells, headingRow, dataRowStart); }
      });
    });
  });
}

function analyze(data, headingRow, dataRowStart) {
  // creates a rectangle using heading and data start
  var headings = _.filter(data, function(cell) { return cell.row == parseInt(headingRow) });
  var headingNames = _.pluck(headings, 'value');
  console.log(headingNames);
}

//http://localhost:3000/api?

// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
});


module.exports = app;

//analyze@spreadsheetanalyzer-1219.iam.gserviceaccount.com