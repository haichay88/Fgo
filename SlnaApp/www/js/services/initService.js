/*jslint browser: true*/
/*global console, Framework7, MyApp, $document*/

MyApp.angular.factory('InitService', ['$document', function ($document) {
  'use strict';

  var pub = {},
    eventListeners = {
      'ready' : []
    };
  
  pub.addEventListener = function (eventName, listener) {     
    eventListeners[eventName].push(listener);
  };

  function onReady() {
    var fw7 = MyApp.fw7,
      i;

    fw7.views.push(fw7.app.addView('.view-main', fw7.options));
   
    for (i = 0; i < eventListeners.ready.length; i = i + 1) {
      eventListeners.ready[i]();
    }


    var token = CommonUtils.GetToken();
    if (token !== null) {
        // If already logged in
        fw7.app.closeModal(".login-screen");
    }
    var today = new Date();
    fw7.app.onPageInit('addOrder', function (page) {
        // Default
        var calendarDefault = fw7.app.calendar({
            input: '#ks-calendar-default',
        });
    });
    
  }
  
  // Init
  (function () {
      $document.ready(function () {
      if (document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1) {
        // Cordova
        console.log("Using Cordova/PhoneGap setting");
        document.addEventListener("deviceready", onReady, false);
      } else {
        // Web browser
        console.log("Using web browser setting");
        onReady();
      }
      
    });
  }());

  return pub;
  
}]);