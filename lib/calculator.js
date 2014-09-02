'use strict';

var _ = require('lodash');

var calc = {};

/**
 * Calculates the total logical and physical sloc
 *
 * @param {Object} totals The object that will store the results
 * @param {Object} reports The object that contains the data
 * @param {Integer} len The length of the data object so we don't have to calculate it for each method
 */
calc.sloc = function calculateSLOC(totals, reports, len) {
  totals.total_logical_sloc = 0;
  totals.total_physical_sloc = 0;

  _.forEach(reports, function(report) {
    totals.total_logical_sloc += report.aggregate.sloc.logical;
    totals.total_physical_sloc += report.aggregate.sloc.physical;
  });

  totals.average_logical_sloc = (totals.total_logical_sloc / len).toFixed(0);
  totals.average_physical_sloc = (totals.total_physical_sloc / len).toFixed(0);
};

/**
 * Calculates the cyclomatic complexity
 *
 * @param {Object} totals The object that will store the results
 * @param {Object} reports The object that contains the data
 * @param {Integer} len The length of the data object so we don't have to calculate it for each method
 */
calc.cyclomatic = function calculateCyclomatic(totals, reports, len) {
  totals.total_cyclomatic_complexity = 0;
  var density = 0;

  _.forEach(reports, function(report) {
    totals.total_cyclomatic_complexity += report.aggregate.cyclomatic;
    density += report.aggregate.cyclomaticDensity;
  });

  var complexity = (totals.total_cyclomatic_complexity / len).toFixed(2);
  totals.average_cyclomatic_complexity = complexity;

  totals.average_cyclomatic_density = (density / len).toFixed(2);
};

/**
 * Calculates the estimated effort to develop
 *
 * @param {Object} totals The object that will store the results
 * @param {Object} reports The object that contains the data
 * @param {Integer} len The length of the data object so we don't have to calculate it for each method
 */
calc.effort = function calculateEffort(totals, reports, len) {
  totals.total_effort = 0;

  _.forEach(reports, function(report) {
    totals.total_effort += report.aggregate.halstead.effort;
  });

  totals.average_effort = (totals.total_effort / len).toFixed(2);
  totals.total_effort = totals.total_effort.toFixed(2);
};

/**
 * Calculates the maintainability of the code
 *
 * @param {Object} totals The object that will store the results
 * @param {Object} reports The object that contains the data
 * @param {Integer} len The length of the data object so we don't have to calculate it for each method
 */
calc.maintainability = function calculateMaintainability(totals, reports, len) {
  var maintainability = 0;

  _.forEach(reports, function(report) {
    maintainability += report.maintainability;
  });

  totals.average_maintainability = (maintainability / len).toFixed(2);
};

/**
 * Calculates the estimated difficulty in understanding the code
 *
 * @param {Object} totals The object that will store the results
 * @param {Object} reports The object that contains the data
 * @param {Integer} len The length of the data object so we don't have to calculate it for each method
 */
calc.difficulty = function calculateDifficulty(totals, reports, len) {
  var difficulty = 0;

  _.forEach(reports, function(report) {
    difficulty += report.aggregate.halstead.difficulty;
  });

  totals.average_difficulty = (difficulty / len).toFixed(2);
};

/**
 * Calculates the estimated time to develop the code
 *
 * @param {Object} totals The object that will store the results
 * @param {Object} reports The object that contains the data
 * @param {Integer} len The length of the data object so we don't have to calculate it for each method
 */
calc.time = function calculateTime(totals, reports, len) {
  totals.total_time = 0;

  _.forEach(reports, function(report) {
    totals.total_time += report.aggregate.halstead.time;
  });

  totals.total_time = totals.total_time.toFixed(2);
  totals.average_time = (totals.total_time / len).toFixed(2);
};

/**
 * Calculates the estimated cost to develop
 *
 * @param {Object} totals The object that will store the results
 * @param {Integer} len The length of the data object so we don't have to calculate it for each method
 */
calc.cost = function calculateCost(totals, len) {
  totals.total_cost = (totals.total_time * 0.013).toFixed(2);
  totals.average_cost = (totals.total_cost / len).toFixed(2);
};

/**
 * Calculates the estimated number of bugs
 *
 * @param {Object} totals The object that will store the results
 * @param {Object} reports The object that contains the data
 * @param {Integer} len The length of the data object so we don't have to calculate it for each method
 */
calc.bugs = function calculateBugs(totals, reports, len) {
  totals.total_bugs = 0;

  _.forEach(reports, function(report) {
    totals.total_bugs += report.aggregate.halstead.bugs;
  });

  totals.average_bugs = (totals.total_bugs / len).toFixed(2);
  totals.total_bugs = totals.total_bugs.toFixed(2);
};

/**
 * Calculates the number of dependencies
 *
 * @param {Object} totals The object that will store the results
 * @param {Object} reports The object that contains the data
 * @param {Integer} len The length of the data object so we don't have to calculate it for each method
 */
calc.dependencies = function calculateDependencies(totals, reports, len) {
  totals.dependencies = [];

  _.forEach(reports, function(report) {
    var deps = report.dependencies;
    deps.forEach(function depTotal(dep) {
      var name = dep.path;

      if (totals.dependencies.indexOf(name) === -1) {
        totals.dependencies.push(name);
      }
    });
  });

  totals.total_dependencies = totals.dependencies.length;
  totals.average_dependencies = (totals.total_dependencies / len).toFixed(2);
};

module.exports = calc;
