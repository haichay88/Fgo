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
    var RootURL = "http://friendgonow.com/API/";
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
            toastr.error("You must upload an image !");
            return;
        }
        if (!$scope.User.Password) {
            toastr.error("You must enter hotel name !");
            return;
        }
        $scope.User.Password = CryptoJS.MD5($scope.User.Password).toString();
        var urlPost = RootURL + "api/Account/Login";
        FgoService.AjaxPost(urlPost, $scope.User, function (reponse) {
            var result = reponse.data.Data;
            if (!result.IsError) {
                debugger
                localStorage.setItem("token", result.Data.Token);
            } else {
                toastr.error(result.Message);
            }
            console.log(reponse);

        });
    };
}]);