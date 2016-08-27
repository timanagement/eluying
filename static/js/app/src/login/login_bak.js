/**
 * Created by huwanqi on 15/12/14.
 */
var modal = require('modal');
var util = require('util');
var loginValidate = require('loginValidate');
var AJAXService = require('AJAXService');
var baseUrl = AJAXService.urls.host;
var networkAction = require("networkAction");
require('bootstrap');
require('cookie');


var resposiveWindow = function(){
    $("html").css({
        "font-size": parseFloat($(window).width()) / 1920 * 20 + 'px'
    });
    $(window).on("resize", function(){
        $("html").css({
            "font-size": parseFloat($(window).width()) / 1920 * 20 + 'px'
        });
    })
};

/*
 验证码按钮倒计时用。
 */
var wait=60;
function time(o) {
    if (wait == 0) {
        $(o).removeAttr('disabled');
        $(o).html("获取验证码");
        wait = 60;
        if($(o).parents(".modal").attr("id") == 'loginRegister'){
            $(o).on("click", registerVCOnClick);
        }else{
            $(o).on("click", forgetVCOnClick);
        }
    } else {
        $(o).attr('disabled', "disabled");
        $(o).html("重新发送(" + wait + ")");
        wait--;
        setTimeout(function() {
            time(o);
        }, 1000);
    }
}


function forgetVCOnClick(){
    var phone = $("#loginForgetPwd .phone").val();
    var result = loginValidate.phoneValidate(phone);
    if(result == true){
        $("#loginForgetPwd .errorTips").hide();
        $(this).unbind("click");
        $.ajax({
            type: "GET",
            url: baseUrl + '/user/sendVerifyCode',
            data: {
                phone: phone,
                origin: 1
            },
            success: function(data){
                if (data.code !== 1) {
                    $("#loginForgetPwd .errorTips").html(data.msg);
                    $("#loginForgetPwd .errorTips").show();
                }
            },
            error: function(data){

            }
        });
        time(this);
    }else{
        $("#loginForgetPwd .errorTips").html(result);
        $("#loginForgetPwd .errorTips").show();
    }
}

function registerVCOnClick(){
    var phone = $("#loginRegister .phone").val();
    var result = loginValidate.phoneValidate(phone);
    if(result == true){
        $("#loginRegister .errorTips").hide();
        $(this).unbind("click");
        $.ajax({
            type: "GET",
            url: AJAXService.getUrl('/user/sendVerifyCode'),
            data: {
                phone: phone
            },
            success: function(data){
                if(data.code !== 1){
                    $("#loginRegister .errorTips").html(data.msg);
                    $("#loginRegister .errorTips").show();
                    wait = 0;
                }
            },
            error: function(data){

            }
        });
        time(this);
    }else{
        $("#loginRegister .errorTips").html(result);
        $("#loginRegister .errorTips").show();
    }
}

$(document).ready(function(){
    util.checkExplorer();
    util.centroidDiv("#loginBox .bg", '#loginBox');
    util.centroidDiv(".loginPic img", '.loginPic');
    $(window).on("resize", function(){
        util.centroidDiv("#loginBox .bg", '#loginBox');
        util.centroidDiv(".loginPic img", '.loginPic');
    });

    if (isPostBack == "False") {
        GetLastUser();
    }

    $(".modal").modal({
        show: false
    });

    //手机网站适配
    if($(window).width() <= 1200){
        //修改viewport
        var scale = $(window).width() / 1200;
        $("meta[name=viewport]").attr("content", 'width=device-width, initial-scale=' + scale);
        $("#loginBox").css({
            "overflow-x": "hidden"
        });
    }else{
        $("#loginBox").css({
            "overflow-x": "visible"
        });
    }
    $(window).on("resize", function(){
        if($(window).width() <= 1200){
            $("#loginBox").css({
                "overflow-x": "hidden"
            });
        }else{
            $("#loginBox").css({
                "overflow-x": "visible"
            });
        }
    });


    $("body").on("keyup", function(ev){

        if(ev.which == 13){
            $("#loginBox .log button").click();
        }//如果是回车
    });

    $("#loginName").on("blur", GetPwdAndChk);
    //$("#loginSave").on("click", SetPwdAndChk);

    /*
     忘记密码点击发送验证码
     */
    $("#loginForgetPwd .get_code").on("click", forgetVCOnClick);

    /*
     忘记密码点击确认
     */
    $("#loginForgetPwd .confirm").on("click", function(){
        var phone = $("#loginForgetPwd .phone").val();
        var verifyCode = $("#loginForgetPwd .verifyCode").val();
        var pwd = $("#loginForgetPwd .pwd").val();
        var pwdConfirm = $("#loginForgetPwd .pwdConfirm").val();
        var result = loginValidate.phoneValidate(phone);
        if(result == true) {
            result = loginValidate.verifyCodeValidate(verifyCode);
        }
        if(result == true) {
            result = loginValidate.passwordValidate(pwd);
        }
        if(result == true) {
            result = loginValidate.passwordConfirmValidate(pwd, pwdConfirm);
        }
        if(result === true){
            $.ajax({
                type: 'GET',
                url: baseUrl + '/user/resetPassword',
                data: {
                    password: pwd,
                    phone: phone,
                    verifyCode: verifyCode
                },
                success: function(data){

                    if(data.code == 1){
                        $("#loginForgetPwd .errorTips").hide();
                        $("#loginForgetPwd").modal('hide');
                        $("#resetSuccess").modal('show');
                        setTimeout(function(){$("#resetSuccess").modal('hide');}, 1000);
                    }else{
                        $("#loginForgetPwd .errorTips").html(data.msg);
                        $("#loginForgetPwd .errorTips").show();
                    }
                },
                error: function(data){

                }
            });
        }else{
            $("#loginForgetPwd .errorTips").html(result);
            $("#loginForgetPwd .errorTips").show();
        }
    });

    /*
     注册点击发送验证码
     */
    $("#loginRegister .get_code").on("click", registerVCOnClick);

    /*
     注册
     */
    $("#loginRegister .confirm").on("click", function(){
        var phone = $("#loginRegister .phone").val();
        var verifyCode = $("#loginRegister .verifyCode").val();
        var realName = $("#loginRegister .realName").val().trim();
        var pwd = $("#loginRegister .pwd").val();
        var pwdConfirm = $("#loginRegister .pwdConfirm").val();
        var name, campName, campAddress, registrationCode;
        var result = loginValidate.phoneValidate(phone);
        if(result == true){
            result = loginValidate.verifyCodeValidate(verifyCode);
        }
        if(result == true){
            result = loginValidate.realNameValidate(realName);
        }
        if(result == true){
            result = loginValidate.passwordValidate(pwd);
        }
        if(result == true){
            result = loginValidate.passwordConfirmValidate(pwd, pwdConfirm);
        }
        var state = $(this).html();



        if(result == true){
            $(this).prop('disabled', true)
                .html('注册中。。。');
            $.ajax({
                type: 'POST',
                url: AJAXService.getUrl('/user/register'),
                data: {
                    realName: realName,
                    password: pwd,
                    phone: phone,
                    verifyCode: verifyCode,
                    terminal: 1
                },
                success: function(data){
                    if(data.code == 1){
                        localStorage.setItem("userName", data.data.user.realName);
                        localStorage.setItem("uid", data.data.user.uid);
                        localStorage.setItem("avatar", data.data.user.avatar);
                        localStorage.setItem("token", data.data.user.token);
                        //$.cookie("jsessionid", data.data.jsessionid, {path: "/"});
                        $("#loginRegister").modal('hide');
                        $("#createOrJoinNetwork").modal('show');
                    }else{
                        $("#loginRegister .errorTips").html(data.msg);
                        $("#loginRegister .errorTips").show();
                    }
                },
                complete: function(data){
                    $('#loginRegister .confirm').prop('disabled', false)
                        .html('注册');
                }
            });
            $("#loginRegister .errorTips").hide();
        }else{
            $("#loginRegister .errorTips").html(result);
            $("#loginRegister .errorTips").show();
        }
    });

    /*
     登录按钮响应
     */
    $("#loginBox .log button").on("click", function(){
        var loginName = $("#loginBox .log .loginName").val();
        var password = $("#loginBox .log .password").val();
        // var result = loginValidate.phoneValidate(loginName);
        var result = true;
        /*if(result == true) {
            result = loginValidate.passwordValidate(password);
        }*/
        if(result === true){
            AJAXService.ajaxWithToken("POST", "loginUrl", {
                terminal: 1,
                version: 4,
                password: password,
                phone: loginName
            }, function(data){
                if(data.code == 1){
                    SetPwdAndChk(); //记住密码和账号
                    if (data.data.camps.length === 0) {
                        $('#createOrJoinNetwork').modal('show');
                    } else {
                        $("#loginLogSuccess").modal('show');
                        $.each(data.data.camps, function(index, el) {
                            if (el.campId === data.data.user.lastCampId) {
                                localStorage.setItem("campName", el.campName);
                                localStorage.setItem("campId", el.campId);
                            }
                        });
                        setTimeout("window.location.href = '/view/accommodation/calender/calender.html';", 1000);
                    }
                    localStorage.setItem("camps", JSON.stringify(data.data.camps));
                    localStorage.setItem("bottom", JSON.stringify(data.data.bottom));
                    localStorage.setItem("avatar", data.data.user.avatar);
                    localStorage.setItem("userName", data.data.user.realName);
                    localStorage.setItem("userType", data.data.user.userType);
                    localStorage.setItem("uid", data.data.user.uid);
                    localStorage.setItem("token", data.data.user.token);
                    //setTimeout(util.checkAuth, 900);
                    //util.checkAuth();
                }else{
                    $("#loginBox .log .errorTips").html(data.msg);
                    $("#loginBox .log .errorTips").show();
                    $("#loginBox .log .text").css("margin-top", "30px");
                }
            });
            $("#loginBox .log .errorTips").hide();
            $("#loginBox .log .text").css("margin-top", "44px");
        }else{
            $("#loginBox .log .errorTips").html(result);
            $("#loginBox .log .errorTips").show();
            $("#loginBox .log .text").css("margin-top", "30px");
        }
    });

    /*创建网络按钮*/
    $("#createNewNetwork").on('click', function () {
        var modalDialog = networkAction.init("create",{});
        $("#createOrJoinNetwork").modal("hide");
        modalDialog.modal("show");
    })

    /*加入网络按钮*/
    $("#joinNetwork").on('click', function () {
        var modalDialog = networkAction.init("joinStep1",{});
        $("#createOrJoinNetwork").modal("hide");
        modalDialog.modal("show");
    })

    /*
     登录表单验证
     */
    $("#loginBox .log .loginName").on("change", function(){
        var loginName = $(this).val();
        var result = loginValidate.phoneValidate(loginName);
        if(result != true){
            $("#loginBox .log .errorTips").html(result);
            $("#loginBox .log .errorTips").show();
            $("#loginBox .log .text").css("margin-top", "30px");
        }else {
            $("#loginBox .log .errorTips").hide();
        }
    });
    $("#loginBox .log .password").on("change", function(){
        var password = $(this).val();
        var result = loginValidate.passwordValidate(password);
        if(result != true){
            $("#loginBox .log .errorTips").html(result);
            $("#loginBox .log .errorTips").show();
            $("#loginBox .log .text").css("margin-top", "30px");
        }else {
            $("#loginBox .log .errorTips").hide();
        }
    });

    /*
     忘记密码表单验证
     */
    $("#loginForgetPwd .phone").on("change", function(){
        var phone = $(this).val();
        var result = loginValidate.phoneValidate(phone);
        if(result != true){
            $("#loginForgetPwd .errorTips").html(result);
            $("#loginForgetPwd .errorTips").show();
        }else{
            $("#loginForgetPwd .errorTips").hide();
        }
    });
    $("#loginForgetPwd .verifyCode").on("change", function(){
        var verifyCode = $(this).val();
        var result = loginValidate.verifyCodeValidate(verifyCode);
        if(result != true){
            $("#loginForgetPwd .errorTips").html(result);
            $("#loginForgetPwd .errorTips").show();
        }else{
            $("#loginForgetPwd .errorTips").hide();
        }
    });
    $("#loginForgetPwd .pwd").on("change", function(){
        var pwd = $(this).val();
        var result = loginValidate.passwordValidate(pwd);
        if(result != true){
            $("#loginForgetPwd .errorTips").html(result);
            $("#loginForgetPwd .errorTips").show();
        }else{
            $("#loginForgetPwd .errorTips").hide();
        }
    });
    $("#loginForgetPwd .pwdConfirm").on("change", function(){
        var pwd = $("#loginForgetPwd .pwd").val();
        var pwdConfirm = $(this).val();
        var result = loginValidate.passwordValidate(pwd);
        if(result != true){
            $("#loginForgetPwd .errorTips").html(result);
            $("#loginForgetPwd .errorTips").show();
        }else{
            result = loginValidate.passwordConfirmValidate(pwd, pwdConfirm);
            if(result != true){
                $("#loginForgetPwd .errorTips").html(result);
                $("#loginForgetPwd .errorTips").show();
            }else{
                $("#loginForgetPwd .errorTips").hide();
            }
        }
    });

    /*
     注册表单验证
     */
    $("#loginRegister .phone").on("change", function(){
        var phone = $(this).val();
        var result = loginValidate.phoneValidate(phone);
        if(result != true){
            $("#loginRegister .errorTips").html(result);
            $("#loginRegister .errorTips").show();
        }else{
            $("#loginRegister .errorTips").hide();
        }
    });
    $("#loginRegister .verifyCode").on("change", function(){
        var verifyCode = $(this).val();
        var result = loginValidate.verifyCodeValidate(verifyCode);
        if(result != true){
            $("#loginRegister .errorTips").html(result);
            $("#loginRegister .errorTips").show();
        }else{
            $("#loginRegister .errorTips").hide();
        }
    });
    $("#loginRegister .loginName").on("change", function(){
        var loginName = $(this).val();
        var result = loginValidate.loginNameValidate(loginName);
        if(result != true){
            $("#loginRegister .errorTips").html(result);
            $("#loginRegister .errorTips").show();
        }else{
            $("#loginRegister .errorTips").hide();
            //验证用户名是否存在
            $.ajax({
                type: 'GET',
                url: baseUrl + '/user/verifyUserName',
                data: {
                    userName: loginName
                },
                success: function(data){
                    if(data.data.exist){
                        $("#loginRegister .errorTips").html('用户名已存在');
                        $("#loginRegister .errorTips").show();
                    }else{
                        $("#loginRegister .errorTips").hide();
                    }
                },
                error: function(data){}
            });
        }
    });
    $("#loginRegister .pwd").on("change", function(){
        var pwd = $(this).val();
        var result = loginValidate.passwordValidate(pwd);
        if(result != true){
            $("#loginRegister .errorTips").html(result);
            $("#loginRegister .errorTips").show();
        }else{
            $("#loginRegister .errorTips").hide();
        }
    });
    $("#loginRegister .pwdConfirm").on("change", function(){
        var pwd = $("#loginRegister .pwd").val();
        var pwdConfirm = $(this).val();
        var result = loginValidate.passwordValidate(pwd);
        if(result != true){
            $("#loginRegister .errorTips").html(result);
            $("#loginRegister .errorTips").show();
        }else{
            result = loginValidate.passwordConfirmValidate(pwd, pwdConfirm);
            if(result != true){
                $("#loginRegister .errorTips").html(result);
                $("#loginRegister .errorTips").show();
            }else{
                $("#loginRegister .errorTips").hide();
            }
        }
    });
    $("#loginRegister .name, #loginRegister .name2").on("change", function(){
        var name = $(this).val();
        var result = loginValidate.nameValidate(name);
        if(result != true){
            $("#loginRegister .errorTips").html(result);
            $("#loginRegister .errorTips").show();
        }else{
            $("#loginRegister .errorTips").hide();
        }
    });
    $("#loginRegister .campName").on("change", function(){
        var campName = $(this).val();
        var result = loginValidate.campNameValidate(campName);
        if(result != true){
            $("#loginRegister .errorTips").html(result);
            $("#loginRegister .errorTips").show();
        }else{
            $("#loginRegister .errorTips").hide();
        }
    });
    $("#loginRegister .address").on("change", function(){
        var address = $(this).val();
        var result = loginValidate.campAddressValidate(address);
        if(result != true){
            $("#loginRegister .errorTips").html(result);
            $("#loginRegister .errorTips").show();
        }else{
            $("#loginRegister .errorTips").hide();
        }
    });
    $("#loginRegister .registrationCode").on("change", function(){
        var registrationCode = $(this).val();
        var result = loginValidate.registrationCodeValidate(registrationCode);
        if(result != true){
            $("#loginRegister .errorTips").html(result);
            $("#loginRegister .errorTips").show();
        }else{
            $("#loginRegister .errorTips").hide();
        }
    });
});

function GetLastUser() {
    var id = "49BAC005-7D5B-4231-8CEA-16939BEACD67";//GUID标识符
    var usr = GetCookie(id);
    if (usr != null) {
        $("#loginBox .loginName").val(usr);
    } else {
        $("#loginBox .loginName").val('');
    }
    GetPwdAndChk();
}
//点击登录时触发客户端事件

function SetPwdAndChk() {
    //取用户名
    var usr = $("#loginBox .loginName").val();;
    //将最后一个用户信息写入到Cookie
    SetLastUser(usr);
    //如果记住密码选项被选中
    if (document.getElementById('loginSave').checked == true) {
        //取密码值
        var pwd = $("#loginBox .password").val();
        var expdate = new Date();
        expdate.setTime(expdate.getTime() + 14 * (24 * 60 * 60 * 1000));
        //将用户名和密码写入到Cookie
        SetCookie(usr, pwd, expdate);
    } else {
        //如果没有选中记住密码,则立即过期
        ResetCookie();
    }
}

/*
 记住密码功能用
 */
function SetLastUser(usr) {
    var id = "49BAC005-7D5B-4231-8CEA-16939BEACD67";
    var expdate = new Date();
    //当前时间加上两周的时间
    expdate.setTime(expdate.getTime() + 14 * (24 * 60 * 60 * 1000));
    SetCookie(id, usr, expdate);
}
//用户名失去焦点时调用该方法

function GetPwdAndChk() {
    var usr = $("#loginBox .loginName").val();
    var pwd = GetCookie(usr);
    if (pwd != null) {
        document.getElementById('loginSave').checked = true;
        $("#loginBox .password").val(pwd);
    } else {
        document.getElementById('loginSave').checked = false;
        $("#loginBox .password").val('');
    }
}
//取Cookie的值

function GetCookie(name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg) return getCookieVal(j);
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break;
    }
    return null;
}
var isPostBack = "False";

function getCookieVal(offset) {
    var endstr = document.cookie.indexOf(";", offset);
    if (endstr == -1) endstr = document.cookie.length;
    return unescape(document.cookie.substring(offset, endstr));
}
//写入到Cookie

function SetCookie(name, value, expires) {
    var argv = SetCookie.arguments;
    //本例中length = 3
    var argc = SetCookie.arguments.length;
    var expires = (argc > 2) ? argv[2] : null;
    var path = (argc > 3) ? argv[3] : null;
    var domain = (argc > 4) ? argv[4] : null;
    var secure = (argc > 5) ? argv[5] : false;
    document.cookie = name + "=" + escape(value) + ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) + ((path == null) ? "" : ("; path=" + path)) + ((domain == null) ? "" : ("; domain=" + domain)) + ((secure == true) ? "; secure" : "");
}

function ResetCookie() {
    var usr = $("#loginBox .loginName").val();;
    var expdate = new Date();
    SetCookie(usr, null, expdate);
}