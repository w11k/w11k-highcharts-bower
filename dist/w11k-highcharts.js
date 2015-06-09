/**
 * w11k-highcharts - v0.0.1 - 2015-06-09
 * https://github.com/w11k/w11k-highcharts
 *
 * Copyright (c) 2015 w11k GmbH
 */
'use strict';

angular.module('w11k-highcharts', []);

/**
 * @ngdoc directive
 * @name ww.highcharts.wwHighcharts
 *
 * @description
 * Directive to display a Highcharts chart
 */
angular.module('w11k-highcharts').directive('w11kHighcharts', function ($q, $window) {

  return {
    template: '<div></div>',
    replace: true,
    link: function (scope, element, attrs) {

      var insertedToDocumentDeferred = $q.defer();
      var insertedToDocument = insertedToDocumentDeferred.promise;

      function onDOMNodeInsertedIntoDocument() {
        insertedToDocumentDeferred.resolve();
        element.off('DOMNodeInsertedIntoDocument', onDOMNodeInsertedIntoDocument);
      }

      if (jQuery.contains($window.document.documentElement, element[0])) {
        insertedToDocumentDeferred.resolve();
      }
      else {
        element.on('DOMNodeInsertedIntoDocument', onDOMNodeInsertedIntoDocument);
      }

      var chartObject;
      var creatingChart;

      /**
       * Combines chart configuration object + data object,
       * destroys obsolete Highcharts object and creates a new
       * Highcharts instance.
       */
      var createChart = function () {
        if (angular.isUndefined(creatingChart)) {
          creatingChart = insertedToDocument.then(function () {
            creatingChart = undefined;

            // use default configuration if no configuration given
            var highchartsConfig = scope.$eval(attrs.w11kHighchartsConfig) || {};

            // define target element
            if (!angular.isObject(highchartsConfig.chart)) {
              highchartsConfig.chart = {};
            }
            highchartsConfig.chart.renderTo = element[0];

            // insert/update chart data
            var data = scope.$eval(attrs.w11kHighchartsData);
            if (angular.isDefined(data)) {
              highchartsConfig.series = data;
            }

            // if there is a chart object, destroy it before drawing the new one
            if (angular.isDefined(chartObject)) {
              chartObject.destroy();
              chartObject = undefined;
            }

            if (angular.isDefined(data)) {
              chartObject = new Highcharts.Chart(highchartsConfig);
            }
          });
        }
      };

      // watch for data changes and redraw chart
      scope.$watch(
        function () {
          return scope.$eval(attrs.w11kHighchartsData);
        },
        function (data) {
          if (angular.isDefined(data)) {
            createChart();
          }
        }
      );

      // watch for config changes and redraw chart
      // currently the highcharts directive does not react on changes inside the config object
      // you have to assign a new config object in order to get the chart updated
      // Note: setting third param = true produces an error because there are functions inside the watched object
      scope.$watch(
        function () {
          return scope.$eval(attrs.w11kHighchartsConfig);
        },
        function (config) {
          if (angular.isDefined(config)) {
            createChart();
          }
        }
      );
    }

  };

});
