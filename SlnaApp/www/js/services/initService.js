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
    if (token == null) {
        // If logined not yet
        fw7.app.mainView.router.load(
            { url: 'login.html', ignoreCache: true, reload: true });
       
    } else {
        fw7.app.mainView.router.load(
            { url: 'invites.html', ignoreCache: true, reload: true});
       
    }
    
  }

  function onReadyDOM() {
      var fw7 = MyApp.fw7,
          i;

      fw7.views.push(fw7.app.addView('.view-main', fw7.options));

      for (i = 0; i < eventListeners.ready.length; i = i + 1) {
          eventListeners.ready[i]();
      }
         
     
   

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
        onReadyDOM();
      }
      
      });

  }());

  return pub;
  
}]);

MyApp.angular.factory("signalR", function ($rootScope) {
    $.connection.hub.url = 'http://friendgonow.com/api/signalr';
    var $hub = $.connection.chat;

    var connection = null;
    var signalR = {
        startHub: function () {
            console.log("started");
            connection = $.connection.hub.start();
        },
        //////////////////// SERVER METHODS/////////////////
       
        JoinGroup: function (groupName) {
            connection.done(function () {
                $hub.server.joinGroup(groupName);
            });
        },
        SendMessage: function (username) {
            connection.done(function () {
                $hub.server.sendMessage(username);
            });
        },
        SendPrivateMessage: function (touser, message, name) {
            connection.done(function () {
                $hub.server.sendPrivateMessage(touser, message, name);
            });
        },
        UpdateStatus: function (status) {
            connection.done(function () {
                $hub.server.updateStatus(status);
            });
        },
        UserTyping: function (connectionid, msg) {
            connection.done(function () {
                $hub.server.userTyping(connectionid, msg);
            });
        },
        ////////////////////// CLIENT METHODS////////////////////            
        joinroom: function (callback) {
            $hub.client.joinroom = callback;
        },
        SendComplete: function (callback) {
            debugger
            $hub.client.sendComplete = callback;
        },
        UserEntered: function (callback) {
            $hub.client.userEntered = callback;
        },
        UserLoggedOut: function (callback) {
            $hub.client.userLoggedOut = callback;
        },
        RecievingPrivateMessage: function (callback) {
            $hub.client.sendPrivateMessage = callback;
        },
        GetOnlineUsers: function (callback) {
            $hub.client.getOnlineUsers = callback;
        },
        NewOnlineUser: function (callback) {
            $hub.client.newOnlineUser = callback;
        },
        NewOfflineUser: function (callback) {
            $hub.client.newOfflineUser = callback;
        },
        StatusChanged: function (callback) {
            $hub.client.statusChanged = callback;
        },
        IsTyping: function (callback) {
            $hub.client.isTyping = callback;
        },
        UpdateConnectionId: function (callback) {
            $hub.client.updateConnectionId = callback;
        }


    }
    return signalR;
});