var root = "http://friendgonow.com/API/";
    var CommonUtils = {
        showWait: function (val) {
            if (val)
                //$('#loading').show();
                MyApp.fw7.app.showIndicator();
            else {
                //setTimeout(function () {
                //    $('#loading').hide();
                //}, 1000);
                MyApp.fw7.app.hideIndicator();
            }
               
        },
        RootUrl: function (url) {
            return root + url;
        },
        GetToken: function () {
            var context = localStorage.getItem('token');
            return context;
        },
        SetToken: function (val) {
            localStorage.setItem("token", val);
        },
        showErrorMessage: function (msg) {
            MyApp.fw7.app.addNotification({
                message: msg,
                hold:1500
            });
        }
       
    };
