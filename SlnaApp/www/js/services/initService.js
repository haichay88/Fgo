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
    } else
        CommonUtils.showWait(false);
    
    
    
  }

  function onReadyDOM() {
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
      } else
          CommonUtils.showWait(false);
      var today = new Date();
      fw7.app.onPageInit('addOrder', function (page) {
          // Default
          var calendarDefault = fw7.app.calendar({
              input: '#ks-calendar-default',
          });
          // Inline date-time
          var pickerInline = fw7.app.picker({
              input: '#set-time',
              toolbar: true,
              rotateEffect: true,
              value: [today.getMonth() + 1, today.getDate(), today.getFullYear(), today.getHours(), (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())],
              onChange: function (picker, values, displayValues) {
                  var daysInMonth = new Date(picker.value[2], picker.value[0] * 1 + 1, 0).getDate();
                  if (values[1] > daysInMonth) {
                      picker.cols[1].setValue(daysInMonth);
                  }
              },
              formatValue: function (p, values, displayValues) {
                  return values[1] + '/' + values[0] + '/' + values[2] + ' ' + values[3] + ':' + values[4];
              },
              cols: [
                  // Months
                  {
                      values: ('1 2 3 4 5 6 7 8 9 10 11 12').split(' '),
                      displayValues: ('January February March April May June July August September October November December').split(' '),
                      textAlign: 'left'
                  },
                  // Days
                  {
                      values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
                  },
                  // Years
                  {
                      values: (function () {
                          var arr = [];
                          for (var i = 1950; i <= 2030; i++) { arr.push(i); }
                          return arr;
                      })(),
                  },
                  // Space divider
                  {
                      divider: true,
                      content: '&nbsp;&nbsp;'
                  },
                  // Hours
                  {
                      values: (function () {
                          var arr = [];
                          for (var i = 0; i <= 23; i++) { arr.push(i); }
                          return arr;
                      })(),
                  },
                  // Divider
                  {
                      divider: true,
                      content: ':'
                  },
                  // Minutes
                  {
                      values: (function () {
                          var arr = [];
                          for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
                          return arr;
                      })(),
                  }
              ]
          });

          var fruits = ('Apple Apricot Avocado Banana Melon Orange Peach Pear Pineapple').split(' ');
          // Multiple Standalone
          var autocompleteStandaloneMultiple = fw7.app.autocomplete({
              openIn: 'page', //open in page
              opener: $('#autocomplete-standalone-multiple'), //link that opens autocomplete
              multiple: true, //allow multiple values
              source: function (autocomplete, query, render) {
                  var results = [];
                  if (query.length === 0) {
                      render(results);
                      return;
                  }
                  // Find matched items
                  for (var i = 0; i < fruits.length; i++) {
                      if (fruits[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(fruits[i]);
                  }
                  // Render items by passing array with result items
                  render(results);
              },
              onChange: function (autocomplete, value) {
                  // Add item text value to item-after
                  $('#autocomplete-standalone-multiple').find('.item-after').text(value.join(', '));
                  // Add item value to input value
                  $('#autocomplete-standalone-multiple').find('input').val(value.join(', '));
              }
          });

          // Dropdown with ajax data
          var autocompleteDropdownAjax = fw7.app.autocomplete({
              input: '#autocomplete-dropdown-ajax',
              openIn: 'dropdown',
              preloader: true, //enable preloader
              valueProperty: 'id', //object's "value" property name
              textProperty: 'name', //object's "text" property name
              limit: 20, //limit to 20 results
              dropdownPlaceholderText: 'Try "JavaScript"',
              source: function (autocomplete, query, render) {
                  var results = [];
                  if (query.length === 0) {
                      render(results);
                      return;
                  }
                  // Show Preloader
                  autocomplete.showPreloader();
                  // Do Ajax request to Autocomplete data
                  $$.ajax({
                      url: 'js/autocomplete-languages.json',
                      method: 'GET',
                      dataType: 'json',
                      //send "query" to server. Useful in case you generate response dynamically
                      data: {
                          query: query
                      },
                      success: function (data) {
                          // Find matched items
                          for (var i = 0; i < data.length; i++) {
                              if (data[i].name.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(data[i]);
                          }
                          // Hide Preoloader
                          autocomplete.hidePreloader();
                          // Render items by passing array with result items
                          render(results);
                      }
                  });
              }
          });
      });

  }
  function GetContacts() {
      var options = new ContactFindOptions();
      options.filter = "";
      options.multiple = true;
      var filter = ["displayName", "emails"];
      navigator.contacts.find(filter, function (onSuccess) {
          console.log(onSuccess)
          var hasEmail = $.grep(onSuccess, function (n, i) {
              return n.emails && n.displayName;
          });
          $.each(hasEmail, function (i, n) {
              Contacts.push({ displayName: n.displayName, email: n.emails[0] });
          });
          console.log(hasEmail)
          // InitService.contacts.push(onSuccess)
      }, function (err) { debugger }, options);

  };
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