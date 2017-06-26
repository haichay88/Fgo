var root = "http://friendgonow.com/API/";
    var CommonUtils = {
        showWait: function (val) {
            if (val)
                //$('#loading').show();
                MyApp.fw7.app.showPreloader();
            else {
                //setTimeout(function () {
                //    $('#loading').hide();
                //}, 1000);
                MyApp.fw7.app.hidePreloader();
            }
               
        },
        RootUrl: function (url) {
            return root + url;
        },
        GetToken: function () {
            var context = localStorage.getItem('token');
            return context;
        },
        GetDeviceKey: function () {
            return localStorage.getItem('registrationId');
        },
        SetToken: function (val) {
            localStorage.setItem("token", val);
        },
        RemoveToken: function (val) {
            localStorage.removeItem("token");
        },
        showErrorMessage: function (msg) {
            MyApp.fw7.app.addNotification({
                message: msg,
                hold:1500
            });
        }
       
    };
