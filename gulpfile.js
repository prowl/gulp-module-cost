'use strict';

var gulp = require('gulp');

var paths = {
  root: __dirname,
  soften: ['**/*.js', '**/*.json', '!./node_modules/**', '!./docs/**'],
  src: ['**/*.js', '!./node_modules/**', '!./docs/**'],
  specs: ['specs/**/*.js'],
  statements_threshold: 75,
  functions_threshold: 80,
  branches_threshold: 100,
  lines_threshold: 75
};

require('gulp-module')(gulp, paths);
