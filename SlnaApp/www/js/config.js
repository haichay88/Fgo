/*jslint browser: true*/
/*global console, MyApp, angular, Framework7*/

// Init angular
var MyApp = {};
var userLoggedIn = false;
MyApp.config = {
};

MyApp.angular = angular.module('MyApp', []);
//MyApp.angular.config(function ($stateProvider, $urlRouterProvider, $compileProvider) {
//    $urlRouterProvider.otherwise('/login');
//});
MyApp.fw7 = {
  app : new Framework7({
     
      material: true
  }),
  options : {
    dynamicNavbar: true,
    domCache: true
  },
  views : []
};




