/*jslint browser: true*/
/*global console, MyApp*/
MyApp.angular.service('FgoService', function ($http) {

    this.AjaxGet = function (Url, callback) {
        $http({
            method: "get",
            url: Url,
            dataType: 'json',
        }).then(callback);
    };

    this.AjaxPost = function (Url, model, callback) {
        $http({
            method: "POST",
            url: Url,
            data: model,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
        }).then(callback);
    };

});
MyApp.angular.controller('IndexPageController', ['$scope', '$http', 'InitService', 'FgoService', function ($scope, $http, InitService, FgoService) {
    'use strict';
    var app = MyApp.fw7.app;
    var destinationType = null;
    var pictureSource = null;
    InitService.addEventListener('ready', function () {
        // DOM ready
        console.log('IndexPageController: ok, DOM ready');
       // destinationType = navigator.camera.DestinationType;
       // pictureSource = navigator.camera.PictureSourceType;
        // You can access angular like this:
        // MyApp.angular

        // And you can access Framework7 like this:
        // MyApp.fw7.app
        




        $scope.Hotel = {
            Name: undefined,
            Address: undefined,
            Longitude: 0,
            Latitude: 0,
            Source: 2,
            Logo:undefined
        };

    });
    var today = new Date();
    $scope.Contacts = [];
    app.onPageInit('addOrder', function (page) {

        $scope.SelectFriends = [];
        // Default
        var calendarDefault = app.calendar({
            input: '#ks-calendar-default',
        });
        // get contacts
        $scope.getContacts();
        // Inline date-time
        var pickerInline = app.picker({
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

        // Multiple Standalone
        var autocompleteStandaloneMultiple = app.autocomplete({
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
                for (var i = 0; i < $scope.Contacts.length; i++) {
                    if ($scope.Contacts[i].displayName.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push($scope.Contacts[i].displayName);
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
        var autocompleteDropdownAjax = app.autocomplete({
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
                // data send
                var data = {
                    Token: CommonUtils.GetToken(),
                    Keyword: query
                };
                // Do Ajax request to Autocomplete data
                $.ajax({
                    url: CommonUtils.RootUrl('api/Order/GetPlaces'),
                    method: 'POST',
                    dataType: 'json',
                    //send "query" to server. Useful in case you generate response dynamically
                    data: data,
                    success: function (data) {
                        var result = data.Data.Data;
                        // Find matched items
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].Name.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(result[i].Name);
                        }
                        // Hide Preoloader
                        autocomplete.hidePreloader();
                        // Render items by passing array with result items
                        render(results);
                    }
                });
            }
        });

        // Pull to refresh content
        var ptrContent = $(page.container).find('.pull-to-refresh-content');
        // Add 'refresh' listener on it
        ptrContent.on('refresh', function (e) {
            debugger
            // Emulate 2s loading
            setTimeout(function () {

                // When loading done, we need to "close" it
                app.pullToRefreshDone();
            }, 2000);
        });

    });
    $scope.getContacts = function () {
        var options = new ContactFindOptions();
        options.filter = "";
        options.multiple = true;
        var filter = ["displayName", "emails"];
        navigator.contacts.find(filter, function (onSuccess) {
            var hasEmail = $.grep(onSuccess, function (n, i) {
                return n.emails && n.displayName;
            });
            $.each(hasEmail, function (i, n) {
                
                $scope.Contacts.push({ displayName: n.displayName, email: n.emails[0] });
            });
          
        }, function (err) { debugger }, options);

    };
   
    $scope.getLocation = function () {
        navigator.geolocation.getCurrentPosition(function (position) {
            console.log('getCurrentPosition: ' + position.coords.longitude);
            $scope.Hotel.Longitude = position.coords.longitude;
            $scope.Hotel.Latitude = position.coords.latitude;
            var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&key=AIzaSyDf7hUxmzsiDyklIfcM93ESrtZXmG9Dqq4";

            HotelService.AjaxGet(
                url,
                function (pl) {
                    $scope.Hotel.Address = pl.data.results[0].formatted_address;
                    toastr.success($scope.Hotel.Address);

                });
            console.log('$scope.Hotel.Address: ' + $scope.Hotel.Address);

        }, function (error) {
            alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
        }, {
            enableHighAccuracy: true,
        });

    };

    $scope.UploadImage = function () {
        var uri = encodeURI("http://api.bizkasa.com/api/Upload/Gallery");
        var uploadingImage = document.getElementById('file');
        var fileURL = uploadingImage.src;
        window.resolveLocalFileSystemURI(fileURL,
            function (entry) {
                fileURL = entry.toURL();
            }, 
            function (message) {
            });

        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1) + ".jpg";
        options.mimeType = "image/jpeg";

        var headers = { 'headerParam': 'headerValue' };

        options.headers = headers;

        var ft = new FileTransfer();
        ft.onprogress = function (progressEvent) {
            //if (progressEvent.lengthComputable) {
            //    loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
            //} else {
            //    loadingStatus.increment();
            //}
        };
        ft.upload(fileURL, uri,
            function (r) {
                //console.log("Code = " + r.responseCode);
                //console.log("Response = " + r.response);
                var result = JSON.parse(r.response);
                toastr.success("upload image success !");
                $scope.Hotel.Logo = result.Data;
                //console.log("Logo = " + $scope.Hotel.Logo);
                //console.log("Sent = " + r.bytesSent);
            },
            function (error) {
                console.log("upload error source " + error.source);
                console.log("upload error target " + error.target);
            }, options);


    };

    $scope.Checkin = function () {
        if (!$scope.Hotel.Logo) {
            toastr.error("You must upload an image !");
            return;
        }
        if (!$scope.Hotel.Name) {
            toastr.error("You must enter hotel name !");
            return;
        }

        if (!$scope.Hotel.FirstHour) {
            toastr.error("You must enter First Hour Price !");
            return;
        }
        var urlPost = "http://api.bizkasa.com/api/Account/AddHotel";
        HotelService.AjaxPost(urlPost, $scope.Hotel, function (reponse) {
            toastr.success("insert success !");
        });
    };
    $scope.getImage = function () {
        // Retrieve image file location from specified source
        navigator.camera.getPicture(function (imageURI) {
            var largeImage = document.getElementById('file');
            largeImage.src = imageURI;
        },
        function (message) {
            
        },
        {
            quality: 50,
            destinationType: destinationType.FILE_URI,
            sourceType: pictureSource.SAVEDPHOTOALBUM
        });


    };
    $scope.Singin = function () {
        if (!$scope.User.Email) {
            toastr.error("Username invalid!");
            return;
        }
        if (!$scope.User.Password) {
            toastr.error("Password invalid !");
            return;
        }
        $scope.User.Password = CryptoJS.MD5($scope.User.Password).toString();
        var urlPost = CommonUtils.RootUrl("api/Account/Login");
        FgoService.AjaxPost(urlPost, $scope.User, function (reponse) {
            var result = reponse.data.Data;
            if (!result.IsError) {
                CommonUtils.SetToken(result.Data.Token);
                app.closeModal(".login-screen");
            } else {
                toastr.error(result.Message);
            }

        });
    };

    $scope.GetOrders = function () {
        
        var token = CommonUtils.GetToken();
        if (!token)
        { return; }
        var request = { Token: token }
        var urlPost = CommonUtils.RootUrl("api/Order/GetOrders");
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, request, function (reponse) {
            var result = reponse.data.Data;
            if (!result.IsError) {
                $scope.Orders = result.Data;
            } else {
                toastr.error(result.Message);
            }
          
            CommonUtils.showWait(false);
        });
      
    };

    $scope.GetPlaces = function () {

        var token = CommonUtils.GetToken();
        if (!token)
        { return; }
        var request = { Token: token }
        var urlPost = CommonUtils.RootUrl("api/Order/GetPlaces");
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, request, function (reponse) {
            var result = reponse.data.Data;
            if (!result.IsError) {
                $scope.Places = result.Data;
            } else {
                toastr.error(result.Message);
            }

            CommonUtils.showWait(false);
        });

    };
    $scope.GetFriends = function () {

        var token = CommonUtils.GetToken();
        if (!token)
        { return; }
        var request = { Token: token }
        var urlPost = CommonUtils.RootUrl("api/Account/GetFriends");
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, request, function (reponse) {
            var result = reponse.data.Data;
            if (!result.IsError) {
                $scope.Friends = result.Data;
            } else {
                toastr.error(result.Message);
            }

            CommonUtils.showWait(false);
        });

    };
    

    $scope.AddOrUpdatePlace = function () {
        
        //MyApp.fw7.app
        var token = CommonUtils.GetToken();
        if (!token)
        { return; }
        var request = {
            Token: token,
            Name: $scope.Place.Name,
            Address: $scope.Place.Address,
            MenuUrl: $scope.Place.URL
        };
        var urlPost = CommonUtils.RootUrl("api/Order/AddOrUpdatePlace");
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, request, function (reponse) {
            var result = reponse.data.Data;
            if (!result.IsError) {
                $scope.GetPlaces();
                app.mainView.router.back();
            } else {
                toastr.error(result.Message);
            }
            CommonUtils.showWait(false);
        });
     
    };

    $scope.AddOrUpdateFriend = function () {

        //MyApp.fw7.app
        var token = CommonUtils.GetToken();
        if (!token)
        { return; }
        var request = {
            Token: token,
            FirstName: $scope.Friend.FirstName,
            Email: $scope.Friend.Email,
          
        };
        var urlPost = CommonUtils.RootUrl("api/Account/AddOrUpdateFriend");
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, request, function (reponse) {
            var result = reponse.data.Data;
            if (!result.IsError) {
                app.mainView.router.back();
            } else {
                toastr.error(result.Message);
            }
            CommonUtils.showWait(false);
        });

    };
   
    $scope.SelectFriendClick = function (data) {
        data.IsSelected = !data.IsSelected;
        var exist = $.grep($scope.SelectFriends, function (n, i) {
            return n.Email == data.Email;
        });
        if (exist.length <= 0) {
            if (data.IsSelected) {
                $scope.SelectFriends.push(data);
            }
        } else {
            if (!data.IsSelected) {
                $scope.SelectFriends = $.grep($scope.SelectFriends, function (n, i) {
                    return n.Email != data.Email;
                });
            }
        }
    };

    $scope.SelectedOK = function () {
        app.mainView.router.back();
    };

    $scope.RemoveFriendSelected = function (data) {
        $scope.SelectFriends = $.grep($scope.SelectFriends, function (n, i) {
            return n.Email != data.Email;
        });
    };

}]);