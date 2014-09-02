'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var calc = require('./calculator');

// These are just references to the config
var config = null;
var gulp = null;

// These are used to store the input and output file paths
var esPath = null;
var costPath = null;

/**
 * Adds the cost analysis task to gulp
 *
 * @param {Object} gulpRef the instance of gulp to attach the task to
 * @param {Object} conf The configuration Object
 */
function costSetup(gulpRef, conf) {
  // store a reference to our parameters
  gulp = gulpRef;
  config = conf;

  // calculate our filepaths
  esPath = path.resolve(config.root, 'docs', 'esComplex');
  costPath = path.resolve(config.root, 'docs', 'cost');

  // register the task
  gulp.task('cost', false, ['escomplex'], costTask);
}

/**
 * Runs the cost analysis task
 *
 */
function costTask() {
  var reportList = getFileList();
  var reportData = {};
  var totals = {};

  // get the report data from the escomplex tool
  getReportData(reportList, reportData);

  // determine size once as an optimization
  var len = _.size(reportData);

  // run our calculations
  calc.sloc(totals, reportData, len);
  calc.cyclomatic(totals, reportData, len);
  calc.effort(totals, reportData, len);
  calc.maintainability(totals, reportData, len);
  calc.difficulty(totals, reportData, len);
  calc.time(totals, reportData, len);
  calc.cost(totals, len);
  calc.bugs(totals, reportData, len);
  calc.dependencies(totals, reportData, len);

  // output the results
  outputToHTML(totals, reportData);
}

/**
 * Gets a list of the output files from escomplex by parsing the index.json file
 */
function getFileList() {
  var indexFile = path.resolve(esPath, 'index.json');
  var indexContent = fs.readFileSync(indexFile, {encoding: 'UTF-8'});
  indexContent = indexContent.replace(/\\/g, '/');
  var indexJson = JSON.parse(indexContent);
  return indexJson.reports;
}

/**
 * Loops through the report list and attaches the data for each report
 *
 * @param {Array} reportList The array of reports we need to get the data for
 * @param {Object} reportData The object where the data will be stored
 */
function getReportData(reportList, reportData) {
  reportList.forEach(function getReportData(file) {
    var data = getReport(file);
    reportData[file] = data;
  });
}

/**
 * Reads the file from the filesystem and returns its data
 *
 * @param {String} file The file to extract the JSON contents from
 * @return {Object} reportData The parsed JSON from the file
 */
function getReport(file) {
  var reportPath = path.resolve(esPath, file);
  var reportContent = fs.readFileSync(reportPath, {encoding: 'UTF-8'});
  reportContent = reportContent.replace(/\\""/g, '');
  reportContent = reportContent.replace(/\\/g, '/');
  var reportData = JSON.parse(reportContent);
  return reportData;
}

/**
 * Outputs the results as html files
 *
 * @param {Object} totals The totals object used to generate the index page
 * @param {Object} reports The reports object used to generate the file pages
 */
function outputToHTML(totals, reports) {
  outputIndex(totals, reports);

  _.forEach(reports, function(report, file) {
    outputReport(file, report);
  });
}

/**
 * Sets up the writing of the index.html file
 *
 * @param {Object} totals The totals object used to generate the index page
 * @param {Object} reports The reports object used to generate the file pages
 */
function outputIndex(totals, reports) {
  // this is the path to our custom template
  var indexTemplate = path.resolve(__dirname, '../templates/index.html');

  var outputFile = path.resolve(costPath, 'index.html');
  // setup the data structure our template expects
  var data = {
    totals: totals,
    reports: reports
  };

  renderTemplate(indexTemplate, data, outputFile);
}

/**
 * Output the individual report to html format
 *
 * @param {String} file The file the report is based off of
 * @param {Object} report The data used to generate the output
 */
function outputReport(file, report) {
  // this is the path to our custom template
  var fileTemplate = path.resolve(__dirname, '../templates/costFile.html');

  // this is  the path to the output file
  var baseFile = file.replace('.json', '.html');
  var outputFile = path.resolve(costPath, baseFile);

  // setup the data structure our template expects
  var data = {
    report: report
  };

  renderTemplate(fileTemplate, data, outputFile);
}

/**
 * Renders the template into html with the data passed in
 *
 * @param {String} templatePath The path to the template file
 * @param {Object} data The data for the template
 * @param {String} outputFile The file to be written to
 */
function renderTemplate(templatePath, data, outputFile) {
  var template = fs.readFileSync(templatePath);
  var compileTemplate = _.template(template);
  var html = compileTemplate(data);

  writeFile(html, outputFile);
}

/**
 * Writes the file to disk
 *
 * If the file exists it will be overwritten
 *
 * @param {String|Buffer} data The data to be written to the file
 * @param {String} fp The filepath to the file that will be written to
 */
function writeFile(data, fp) {
  // make sure the directory exists
  var dir = path.dirname(fp);
  mkdirp.sync(dir);

  fs.writeFileSync(fp, data);
}

module.exports = costSetup;
