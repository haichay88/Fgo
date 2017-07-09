/*jslint browser: true*/
/*global console, MyApp*/
MyApp.angular.service('FgoService', function ($http) {

    this.AjaxGet = function (Url, callback) {

        $http({
            method: "get",
            url: Url,
            dataType: 'json',
        }).then(callback)
            .catch(function (err) {
            CommonUtils.showErrorMessage(err.statusText);
            CommonUtils.showWait(false);
        });
    };

    this.AjaxPost = function (Url, model, callback) {
        $http({
            method: "POST",
            url: Url,
            data: model,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
        }).then(callback)
            .catch(function (err) {
                CommonUtils.showErrorMessage(err.statusText);            
                CommonUtils.showWait(false);
            });
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
        

        setupPush();


        $scope.UserContext = CommonUtils.GetToken();

    });

    function setupPush() {
        var push = PushNotification.init({
            "android": {
                "senderID": "428508293765"
            },
            "ios": {
                "sound": true,
                "alert": true,
                "badge": true
            },
            "windows": {}
        });

        push.on('registration', function (data) {
            var oldRegId = localStorage.getItem('registrationId');
            if (oldRegId !== data.registrationId) {
                // Save new registration ID
                localStorage.setItem('registrationId', data.registrationId);
                // Post registrationId to your app server as the value has changed
            }
        });

        push.on('notification', function (data) {
            $scope.currentOrderId = data.additionalData.id;
            if (data.additionalData.foreground) {
                navigator.notification.confirm(
                    data.title,
                    function (buttonIndex) {
                        if (buttonIndex === 1) {
                            $scope.GetOrder(data.additionalData.id);
                        }
                    },
                    'More Detail',
                    ['Yes', 'No']
                );
            } 
         console.log(data);
         
     });

        push.on('error', function (e) {
            console.log("push error = " + e.message);
        });
    }
    function MoreDetail() {
        $scope.GetOrder($scope.currentOrderId);
    }
    var today = new Date();
    $scope.Contacts = [];
    app.onPageInit('invites', function (page) {
        debugger
        $scope.SearchOrder = {
            Take:5,
            Skip: 0,
            Token: $scope.UserContext.Token
        };
        console.log($scope.SearchOrder);
        $scope.GetOrders();
        var loading = false;
        // Last loaded index, we need to pass it to script
        var lastLoadedIndex = $('.infinite-scroll .list-block li').length;
        // Attach 'infinite' event handler
        $('.infinite-scroll').on('infinite', function () {
            debugger
            // Exit, if loading in progress
            if (loading) return;
            // Set loading trigger
            loading = true;
            // Request some file with data
            var urlPost = CommonUtils.RootUrl("api/Order/GetOrders");
            $scope.SearchOrder.Skip = lastLoadedIndex + 1
            FgoService.AjaxPost(urlPost, $scope.SearchOrder, function (reponse) {
                loading = false;
                var result = reponse.data.Data;
                if (!result.IsError) {
                    var data = result.Data;
                    if (data === '') {
                        // Nothing more to load, detach infinite scroll events to prevent unnecessary loadings
                        app.detachInfiniteScroll($('.infinite-scroll'));
                    }
                    else {
                        debugger
                        // Append loaded elements to list block
                        $scope.Orders=  $.merge($scope.Orders,data);
                        //$('.infinite-scroll .list-block ul').append(data);
                        // Update last loaded index
                        lastLoadedIndex = $('.infinite-scroll .list-block li').length;
                    }
                } else {
                    toastr.error(result.Message);
                }
               

            });

           
        });
      
    });
    app.onPageInit('searchFriend', function (page) {
        $scope.getContacts();
        $scope.SelectFriends = [];
    });
    app.onPageInit('InviteDetail', function (page) {
        $scope.SelectFriends = [];
    });
   
    app.onPageInit('addPlace', function (page) {
        
        $scope.getLocation();
    });
    app.onPageInit('searchPlace', function (page) {
        cordova.plugins.locationServices.geolocation.getCurrentPosition(function (position) {
            var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + position.coords.latitude + "," + position.coords.longitude + "&radius=1000&type=food&key=AIzaSyAyivWr4pvWYIII9OhQ7XbrpFcxtb1H1Qk";
            $scope.CurrentPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
        }, function (error) {

            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        }, {
                enableHighAccuracy: true,

            });

        $scope.GetPlaces();
    });

    $scope.getCurrentLocation = function () {
        cordova.plugins.locationServices.geolocation.getCurrentPosition(function (position) {
            var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + position.coords.latitude + "," + position.coords.longitude + "&radius=1000&type=food&key=AIzaSyAyivWr4pvWYIII9OhQ7XbrpFcxtb1H1Qk";
            $scope.CurrentPosition = {
                lat: position.coords.latitude,
                log: position.coords.longitude
            };
            CommonUtils.showWait(true);
            FgoService.AjaxGet(
                url,
                function (pl) {
                    CommonUtils.showWait(false);
                    $scope.ResultPlaces = pl.data.results;

                });

        }, function (error) {

            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        }, {
                enableHighAccuracy: true,

            });

    };

 

    app.onPageInit('addOrder', function (page) {
        $scope.Invite = {
            PlaceId: undefined,
            Title: undefined,
            LunchDate: undefined,
            Friends: [],
            Token: undefined,
            Place:{}
        };
        $scope.SelectFriends = [];
        // Default
        var calendarDefault = app.calendar({
            input: '#ks-calendar-default',
        });
       
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

                $scope.Invite.LunchDate = values[0] + '/' + values[1] + '/' + values[2] + ' ' + values[3] + ':' + values[4];
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

    });
    
    
    $scope.getContacts = function () {
        var options = new ContactFindOptions();
        options.filter = "";
        options.multiple = true;
        var filter = ["displayName", "emails"];
        $scope.Contacts = [];
        navigator.contacts.find(filter, function (onSuccess) {
            var hasEmail = $.grep(onSuccess, function (n, i) {
                return n.emails && n.displayName;
            });
            $.each(hasEmail, function (i, n) {

                $scope.Contacts.push({ FirstName: n.displayName, Email: n.emails[0].value });
            });
            $scope.SyncFriend();
        }, function (err) {  }, options);

    };

    $scope.SyncFriend = function () {
        if (!$scope.Contacts) return;
        var request = {
            Friends: $scope.Contacts,
            Token: $scope.UserContext.Token
        };
        var urlPost = CommonUtils.RootUrl("api/Account/SyncFriends");
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, request, function (reponse) {
            var result = reponse.data.Data;
            CommonUtils.showWait(false);
            if (!result.IsError) {
              
              
            } else {
                CommonUtils.showErrorMessage(result.Message);
            }
           
        });

    };
   
    $scope.getLocation = function (callback) {
        CommonUtils.showWait(true);
        cordova.plugins.locationServices.geolocation.getCurrentPosition(function (position) {
            var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + position.coords.latitude + "," + position.coords.longitude + "&radius=1000&type=food&key=AIzaSyAyivWr4pvWYIII9OhQ7XbrpFcxtb1H1Qk";
      
            FgoService.AjaxGet(
                url,
                function (pl) {
                    CommonUtils.showWait(false);
                    $scope.ResultPlaces = pl.data.results;
                    app.mainView.router.loadPage('resultPlaces.html');
                   
                });
          
        }, function (error) {
          
            alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
        }, {
                enableHighAccuracy: true,               

        });
       

    };

    $scope.SearchPlaceAPI = function () {
        if (!$scope.TextSearch) return;

        var url = " https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + $scope.TextSearch + "&location=" + $scope.CurrentPosition.lat + "," + $scope.CurrentPosition.lng + "&radius=50000&key=AIzaSyAyivWr4pvWYIII9OhQ7XbrpFcxtb1H1Qk";

        FgoService.AjaxGet(
            url,
            function (pl) {
                $scope.ResultPlaces = pl.data.results;
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
    $scope.SignIn = function () {
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
        var request={
            Email:$scope.User.Email,
            Password:$scope.User.Password,
            DeviceKey:CommonUtils.GetDeviceKey()
        };
       
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, request, function (reponse) {
            var result = reponse.data.Data;
            if (!result.IsError) {
                CommonUtils.SetToken(JSON.stringify(result.Data));
                $scope.User=undefined;
                $scope.CurrentUser = result.Data;

                app.mainView.router.loadPage('invites.html')
            } else {
                toastr.error(result.Message);
            }
            CommonUtils.showWait(false);
        });
    };
    $scope.SignOut = function () {

        CommonUtils.RemoveToken();
        app.mainView.router.loadPage('login.html')
        
    };
    $scope.SignUp = function () {

        if (!$scope.Register.Email) {
            toastr.error("Username invalid!");
            return;
        }
        if (!$scope.Register.Password) {
            toastr.error("Password invalid !");
            return;
        }

        if ($scope.Register.Password != $scope.Register.ConfirmPassword) {
            toastr.error("Password not match Confirm password !");
            return;
        }
        $scope.Register.Password = CryptoJS.MD5($scope.Register.Password).toString();
        var request = {
            Email: $scope.Register.Email,
            Password: $scope.Register.Password,
            DeviceKey: CommonUtils.GetDeviceKey()
        };
        var urlPost = CommonUtils.RootUrl("api/Account/SignUp");
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, request, function (reponse) {
            var result = reponse.data.Data;
            if (!result.IsError) {
                CommonUtils.SetToken(result.Data.Token);
                $scope.Register=undefined;
                app.mainView.router.loadPage('index.html')
            } else {
                CommonUtils.showErrorMessage(result.Message);
            }
            CommonUtils.showWait(false);
        });

    };

    $scope.InviteClick = function () {
        if (!$scope.Invite.Title) {
            toastr.error("Please input title !");
            return;
        }

       
        if (!$scope.UserContext)
        { return; }
        $scope.Invite.Token = $scope.UserContext.Token;
        var urlPost = CommonUtils.RootUrl("api/Order/AddInvite");
        $scope.Invite.Friends = $scope.SelectFriends;
        if (!$scope.Invite.Friends) {
            toastr.error("Please choose friends !");
            return;
        }
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, $scope.Invite, function (reponse) {
            var result = reponse.data.Data;
            CommonUtils.showWait(false);
            if (!result.IsError) {
                $scope.GetOrders();
                app.mainView.router.back();
                //$scope.Orders = result.Data;
            } else {
                toastr.error(result.Message);
            }
            
        });
    };

    $scope.InviteMoreClick = function () {
       
       
        if (!$scope.UserContext)
        { return; }
        var urlPost = CommonUtils.RootUrl("api/Order/AddMoreFriend");
        if (!$scope.SelectFriends) {
            toastr.error("Please choose friends !");
            return;
        }
        
        var request = {
            Token: $scope.UserContext.Token,
            Friends: $scope.SelectFriends,
            OrderId: $scope.currentOrderId
        };
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, request, function (reponse) {
            var result = reponse.data.Data;
            CommonUtils.showWait(false);
            if (!result.IsError) {
                $scope.GetOrder($scope.currentOrderId);
                $scope.SelectFriends = [];
            } else {
                CommonUtils.showErrorMessage(result.Message);
            }
            
        });
    };
    $scope.GetOrders = function () {
        
       
        if (!$scope.UserContext)
        { return; }
      
        var urlPost = CommonUtils.RootUrl("api/Order/GetOrders");
       
        FgoService.AjaxPost(urlPost, $scope.SearchOrder, function (reponse) {
          
            var result = reponse.data.Data;
            if (!result.IsError) {
                $scope.Orders = result.Data;
            } else {
                toastr.error(result.Message);
            }
          
          
        });
      
    };
   
    $scope.GetOrder = function (val) {

        $scope.currentOrderId = val;

      
        if (!$scope.UserContext)
        { return; }
        var request = { Token: $scope.UserContext.Token, Id: $scope.currentOrderId };
        var urlPost = CommonUtils.RootUrl("api/Order/GetOrder");
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, request, function (reponse) {
            CommonUtils.showWait(false);
            var result = reponse.data.Data;
            if (!result.IsError) {
                $scope.Order = result.Data
                app.mainView.router.loadPage('InviteDetail.html')
            } else {
                toastr.error(result.Message);
            }
           
        });

    };
    $scope.AddOrderDetail = function () {
        
        $scope.Order.OrderDetails = $scope.Order.OrderDetailsCanEdit;
        $scope.Order.Token = $scope.UserContext.Token;
        var urlPost = CommonUtils.RootUrl("api/Order/AddOrderDetail");
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, $scope.Order, function (reponse) {
            var result = reponse.data.Data;
            if (!result.IsError) {
                $scope.Order = result.Data
                app.mainView.router.loadPage('InviteDetail.html')
            } else {
                toastr.error(result.Message);
            }
            CommonUtils.showWait(false);
        });
    };

    $scope.GetPlaces = function () {

        
        if (!$scope.UserContext)
        { return; }
        var request = { Token: $scope.UserContext.Token }
        var urlPost = CommonUtils.RootUrl("api/Order/GetPlaces");
        //CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, request, function (reponse) {
            //CommonUtils.showWait(false);
            var result = reponse.data.Data;
            if (!result.IsError) {
                $scope.Places = result.Data;
            } else {
                toastr.error(result.Message);
            }

           
        });

    };
    $scope.GetFriends = function () {

       
        if (!$scope.UserContext)
        { return; }
        var request = { Token: $scope.UserContext.Token }
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
    $scope.AddToMyMenuClient = function () {
        if ($scope.Menu.MenuItem || $scope.Menu.MenuCost)
            $scope.Order.OrderDetailsCanEdit.push({ MenuItem: $scope.Menu.MenuItem, MenuCost: $scope.Menu.MenuCost });
        $scope.Menu = {};
        app.mainView.router.back();
    };
    $scope.RemoveItem = function (val) {
        $scope.Order.OrderDetailsCanEdit = $.grep($scope.Order.OrderDetailsCanEdit, function (i, n) {
            return n != val;
        });
    };
    $scope.AddOrUpdatePlace = function () {
        
        //MyApp.fw7.app
     
        if (!$scope.UserContext)
        { return; }
    
        var request = {
            Token: $scope.UserContext.Token,
            Name: $scope.Place.Name,
            Address: $scope.Place.Address,
            MenuUrl: $scope.Place.URL,
            Longitude:$scope.Place.Longitude,
            Latitude:$scope.Place.Latitude
        };
        if(!request.Name){
        CommonUtils.showErrorMessage("please input your place name !");
        return;
    }
        var urlPost = CommonUtils.RootUrl("api/Order/AddOrUpdatePlace");
        CommonUtils.showWait(true);
        FgoService.AjaxPost(urlPost, request, function (reponse) {
             CommonUtils.showWait(false);
            var result = reponse.data.Data;
            if (!result.IsError) {
                $scope.GetPlaces();
                $scope.Place={};
                app.mainView.router.back();
            } else {
                toastr.error(result.Message);
            }
           
        });
     
    };

    $scope.AddOrUpdateFriend = function () {

        //MyApp.fw7.app
       
        if (!$scope.UserContext)
        { return; }
        var request = {
            Token: $scope.UserContext.Token,
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

    $scope.OnResultPlaceClick = function (data) {
        $scope.Place = {
            Longitude: data.geometry.location.lng,
            Latitude: data.geometry.location.lat,
            Name: data.name,
            Address: data.vicinity,
            URL:data.website
        };
        app.mainView.router.back();
    };

    $scope.OnResultSearchPlaceAPIClick = function (data) {
        $scope.Place = {
            Longitude: data.geometry.location.lng,
            Latitude: data.geometry.location.lat,
            Name: data.name,
            Address: !data.vicinity ? data.formatted_address : data.vicinity,
            URL: data.website
        };
        $scope.Invite.Place = $scope.Place;
        $('#autocomplete-standalone1').find('.item-after').text(data.name);
        $scope.TextSearch = undefined;
        app.mainView.router.back();
    };

    $scope.SelectPlaceClick = function (data) {
        $('#autocomplete-standalone1').find('.item-after').text(data.Name);
        $scope.Invite.PlaceId = data.Id;
        app.mainView.router.back();
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