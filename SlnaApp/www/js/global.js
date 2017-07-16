var root = "http://friendgonow.com/API/";
var isShow = false;
    var CommonUtils = {
        showWait: function (val) {
            if (val) {
                if (isShow)
                    return;

                MyApp.fw7.app.showPreloader();
                isShow = val;
            }
                
            else {
                MyApp.fw7.app.hidePreloader();
                isShow = val;
            }
               
        },
        RootUrl: function (url) {
            return root + url;
        },
        GetToken: function () {
            var context = localStorage.getItem('token');
            return JSON.parse(context);
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
        },
        SetValue: function (key,val) {
            localStorage.setItem(key, val);
        },
        GetValue: function (key) {
            var result = localStorage.getItem(key);
            return JSON.parse(result);
        }
       
    };
