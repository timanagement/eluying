/**
 * Created by huwanqi on 16/6/6.
 */
require("angular");
var modal = require("modal");

var idcObj = {};
idcObj.init = function(){
    var ie = document.getElementById("ieIdc");
    var ff = document.getElementById("myIdc");
    if(typeof(ie.idcard)!='undefined') {
        this.idc = ie;
    }else if(typeof(ff.idcard)!='undefined') {
        this.idc = ff;
    }else{
        $(".readBtn").html('开始读卡');
        modal.somethingAlert("IDCardWeb控件装入失败！");
        return;
    }
    this.data = this.idc.IDCard;
    
    //- 网站授权，此属性必须在属性Verify和RarelyWord设置之前设置。License请与phototake@qq.com联系获取。
    this.idc.License = "QAD3uz5fE0N26Es9Id0UOkC4Fj9qSFcGpp0q3eQi877now/CoJAVPg7KnZnRxdMuILivrVTo4pZLx60OokHnWrtAEefyplUD8Vlsk9U9eThBozc8O5kaOy7jk=";
    
    //- 停止自动读卡间隔时间（秒），默认600秒
    //this.idc.AutoStopTime = 300;
    
    //- 设置界面大小，0－无界面（0*0），1－图标界面（20*20）(默认)，2－基本信息界面（40*134，只显示姓名和身份证号），3－标准界面（220*450），4－照片界面（176*134）
    this.idc.Size = 0;
    
    //- 设置阅读按键类型，0－无按键，1－图标按键(默认)，2－文字按键
    this.idc.ReadButtonType = 0;
    
    //- 设置是否寻找串口设备，ture－启动时寻找一次串口设备，false－不寻找串口设备（默认）
    this.idc.COMEnabled = true;
    
    //- 设置相片图片格式，支持jpg、png、bmp格式输出，默认jpg
    this.idc.PicFormat = "jpg";
};

idcObj.read = function(timeout, type, scope){
    //- timeout为同步阅读搜寻超时时间（秒），正确阅读返回身份证号同时引发onRead事件(其它信息可以通过data读取或在onRead事件中处理)，否则返回空字符串。
    if(!this.idc){
        return false;
    }
    var cid = this.idc.ReadOneCID(timeout);
    /*******************************************************************************************************************
     读卡后数据获取（通过控件的idcard对象）
     idName				姓名，替换了生僻字的（如果有的话）
     idNameCode		姓名编码，字节ASCII码，如：837B 795E F86A，建议在数据库中也保存此编码
     idRarelyWord		姓名中生僻字编码，字节ASCII码+姓名中第几个字，如：837B1 795E2，表示为：第一个字为生僻字(837B)，第二个字为生僻字(795E)
     idOriginalName	姓名，原始的（没有做生僻字替换处理的）

     idCardNo			身份证号码
     idSex				性别
     idSexCode			性别代码，0：未知，1：男，2：女，9：未说明
     idNation				民族
     idNationCode		民族代码，01：汉，02：蒙古，03：回，……
     idBorn				出生日期，格式如：19920606
     idYear				出生年份
     idMonth				出生月份
     idDay				出生日
     idAddress			住址
     idGrantDept		签发机关
     idBeginTime		有效期限的起始日期，格式如：20060524
     idEndTime			有效期限的终止日期，格式如：20260524
     idNewAddress	最新住址

     idPictureBase64	经过Base64编码的照片数据
     idPicture			未经编码的照片原始数据（二进制）

     idVerify				MD5校验码，由用户指定数据组合生成的MD5编码，用于在服务端校验上传的数据是否完整，防止被篡改
     SAMID				阅读器的设备ID
     *******************************************************************************************************************/
    if(cid==""){
        $("#newOrderModal .readBtn").html('开始读卡');
    }else{
        //- 阅读数据写入input
        var name = this.data.IDname;
        var num = this.data.IDCardNo;
        if(type === 0){
            scope.orderNew.customerName = name;
            scope.orderNew.idVal = num;
            scope.selectedId = 0;
            scope.selectedIdLabel = '身份证';
            $("#newOrderModal .readBtn").html('开始读卡');
            // scope.$apply();
            // $("input[name=orderNewCustomerName]").val(name);
            // $("input[name=orderNewId]").val(num);
        }else if(type === 1){
            scope.orderEdit.customerName = name;
            scope.orderEdit.idVal = num;
            scope.orderEdit.selectedId = 0;
            scope.orderEdit.selectedIdLabel = '身份证';
            $("#orderEditModal .readBtn").html('开始读卡');
            // scope.$apply();
        }
    }
};

module.exports = idcObj;