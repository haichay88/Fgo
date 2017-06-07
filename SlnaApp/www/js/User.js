bizkasa.angular.service("userservice", function ($http) {

    this.Login = function (user) {
        var request = $http({
            method: "post",
            url: "/CPanelAdmin/Home/Login",
            dataType: 'json',
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify({ email: user.Email, password: user.Password, IsRemember: user.IsRemember })
        });
        return request;
    };


    this.GetAllUserByHotel = function () {
        var request = $http({
            method: "post",
            url: "/CPanelAdmin/User/GetUserByHotel",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
        });
        return request;
    };

    this.GetUserForEdit = function (val) {
        var request = $http({
            method: "post",
            url: "/CPanelAdmin/User/GetUserForEdit",
            data: JSON.stringify({userId:val}),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
        });
        return request;
    };

    this.GetUserForEditCurentAccount = function (lat,long) {
        var request = $http({
            method: "get",
            url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=AIzaSyAe9aLVFWUsMHaP86wv2ELU6q4JXeO65Zc",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
        });
        return request;
    };

    this.AddUser = function (userhotel) {
        var request = $http({
            method: "post",
            url: "/CPanelAdmin/User/AddUser",
            data: userhotel,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8'
        });
        return request;
    };

    this.DeleteUser = function (val) {
        var request = $http({
            method: "post",
            url: "/CPanelAdmin/User/DeleteUser",
            data: JSON.stringify({ Ids: val }),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
        });
        return request;
    };
    this.InitPermission = function () {
        var request = $http({
            method: "get",
            url: "/CPanelAdmin/User/InitPermission",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
        });
        return request;
    };

    this.CheckStoreToken = function (val) {
        var request = $http({
            method: "post",
            url: "/CPanelAdmin/Home/CheckStoreToken",
            dataType: 'json',
            data: JSON.stringify({StoreName:val}),
            contentType: 'application/json; charset=utf-8',
        });
        return request;
    };

    this.AddStoreToken = function (model) {
        var request = $http({
            method: "post",
            url: "/CPanelAdmin/Home/AddStoreToken",
            dataType: 'json',
            data: JSON.stringify({ Model: model }),
            contentType: 'application/json; charset=utf-8',
        });
        return request;
    };
});

bizkasa.angular.controller("UserController", "initService", function ($scope, userservice, initService) {
    initService.addEventListener('ready', function () {
        // DOM ready
        console.log('IndexPageController: ok, DOM ready');

        // You can access angular like this:
        // MyApp.angular
        $scope.getLocation = function () {
            debugger
            navigator.geolocation.getCurrentPosition(function (position) {
                alert('Latitude: ' + position.coords.latitude + '\n' +
                 'Longitude: ' + position.coords.longitude + '\n' +
                 'Altitude: ' + position.coords.altitude + '\n' +
                 'Accuracy: ' + position.coords.accuracy + '\n' +
                 'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
                 'Heading: ' + position.coords.heading + '\n' +
                 'Speed: ' + position.coords.speed + '\n' +
                 'Timestamp: ' + position.timestamp + '\n');
            }, function (error) {
                alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
            });
        };



        // And you can access Framework7 like this:
        // MyApp.fw7.app
    });
    


    $scope.AddStoreToken = function (model) {
      
        CommonUtils.showWait(true);
        var promiseGet = userservice.AddStoreToken(model);
        promiseGet.then(function (pl) {
         
            if (pl.data.IsError) {
                toastr.error(pl.data.Message)
            }
            
            CommonUtils.showWait(false);
        },
        function (errorPl) {
        });
      
    };

    $scope.CheckStoreToken = function (val) {
        CommonUtils.showWait(true);
        var promiseGet = userservice.CheckStoreToken(val.StoreName);
        promiseGet.then(function (pl) {
            if (pl.data.IsError) {
                toastr.error(pl.data.Message)
            }
            
            CommonUtils.showWait(false);
        },
        function (errorPl) {
        });
    };

    $scope.Login = function () {
        CommonUtils.showWait(true);
        var promiseGet = userservice.Login($scope.User);
        promiseGet.then(function (pl) {
            
            if (pl.data.IsError) {
                toastr.error(pl.data.Message)
            }
            else {
               
                window.location.href = "/CPanelAdmin/Home/";
            }
        
            CommonUtils.showWait(false);
        },
        function (errorPl) {
        });
    };

    $scope.InitUser = function GetAllRecords() {
        var promiseGet = userservice.GetAllUserByHotel();
        promiseGet.then(function (pl) { $scope.Users = pl.data.Data; },
              function (errorPl) {
                  $log.error('Some Error in Getting Records.', errorPl);
              });
    };

    $scope.InitPermission = function InitPermission() {
        var promiseGet = userservice.InitPermission();
        promiseGet.then(function (pl) { $scope.Permissions = $.parseJSON(pl.data); },
              function (errorPl) {
                  $log.error('Some Error in Getting Records.', errorPl);
              });
    };

    $scope.GetUserForEdit = function (val) {
        if (!val) {
            toastr.error("Cần chọn nhân viên !");
            return;
        };
        CommonUtils.showWait(true);
        var promiseGet = userservice.GetUserForEdit(val);
        promiseGet.then(function (pl) {
            $scope.User = pl.data.Data;
            CommonUtils.showWait(false);
            $("#Adduser").modal("show");
        },
              function (errorPl) {
                  toastr.error('Some Error in Getting Records.', errorPl);
              });
    };


    $scope.GetUserForEditCurentAccount = function () {
      
        CommonUtils.showWait(true);
        var promiseGet = userservice.GetUserForEditCurentAccount();
        promiseGet.then(function (pl) {
            $scope.User = pl.data.Data;
            CommonUtils.showWait(false);
            $("#Adduser").modal("show");
        },
              function (errorPl) {
                  toastr.error('Some Error in Getting Records.', errorPl);
              });
    };


    var ItemSelecteds = [];
    $scope.ItemSelected = function (val) {
        if (val.IsSelected) {
            ItemSelecteds.push(val.Id);
        }
        else {
            ItemSelecteds = $.grep(ItemSelecteds, function (item, i) {
                return item != val.Id;
            });
        }
    };
    $scope.reallyDelete = function (item) {
        DeleteUser(item);
    };
    var DeleteUser = function (val) {
        if (val)
            ItemSelecteds.push(val.Id);
        if (ItemSelecteds.length <= 0)
        {
            toastr.error("Bạn chưa chọn nhân viên cần xóa !");
            return;
        }
        var promiseGet = userservice.DeleteUser(ItemSelecteds);
        promiseGet.then(function (pl) {
            if (!pl.data.IsError) {
                $scope.InitUser();
                toastr.success("Xóa nhân viên thành công !");
            }
            else {
                toastr.error(pl.data.Message);
            }
        },
              function (errorPl) {
                  toastr.error('Some Error in Getting Records.', errorPl);
              });
    };


    $scope.AddUser = function () {
        
        if ($scope.User.Email == null || $scope.User.Email == undefined) {
            toastr.error("Dữ liệu rông !"); return;
        }

        if ($scope.User.Password != $scope.User.RePassword) {
            toastr.error("Nhập lại mật khẩu không trùng khớp !"); return;
        }
        
        var promisePost = userservice.AddUser($scope.User);
        promisePost.then(function (pl) {
            if (!pl.data.IsError) {
                toastr.success("Thêm mới thành công !");
                $("#Adduser").modal('hide');
                $scope.InitUser();
            }
            else
            {
                toastr.error(pl.data.Message);

            }
            
        }, function (err) {
            console.log("Err" + err);
        });
    };

});


var myApp = {};
var mainView = {};
var rightView = {};
var $$ = Dom7;

angular.module("AngularApp", [])

.run(function () {
    myApp = new Framework7({
        modalTitle: 'Framework7',
        material: true,
        pushState: true,
        angular: true
    });
    mainView = myApp.addView('.view-main', {});
})

.config(function () {
    window.location.hash = "#!/home.html";
})

.controller("UserController", ["$scope", function ($scope) {
    $scope.getLocation = function () {
        debugger
        navigator.geolocation.getCurrentPosition(function (position) {
            alert('Latitude: ' + position.coords.latitude + '\n' +
             'Longitude: ' + position.coords.longitude + '\n' +
             'Altitude: ' + position.coords.altitude + '\n' +
             'Accuracy: ' + position.coords.accuracy + '\n' +
             'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
             'Heading: ' + position.coords.heading + '\n' +
             'Speed: ' + position.coords.speed + '\n' +
             'Timestamp: ' + position.timestamp + '\n');
        }, function (error) {
            alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
        });
    };
}])