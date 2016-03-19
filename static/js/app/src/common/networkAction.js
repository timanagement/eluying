/**
 * Created by ss on 16/3/18.
 */

var AJAXService = require('AJAXService');
var htmlMaker = require("../../../../tpl/createNetwork.js");
var modal = require('modal');
var baseUrl = AJAXService.urls.host;
var network = {
	status: {
		CREATE_NETWORK: "create",
		JOIN_NETWORK1: "joinStep1",
		JOIN_NETWORK: "joinStep2",
		CREATE_SUCCESS: "createSuccess"
	},
	init: function(status,arg){
		var that = this;
		//先把html输出到页面上
		if($("#"+status).length){
			$("#"+status).remove();
		}
		$("body").append(htmlMaker.getHtml(status,arg));
		var resultDom = $("#"+status);
		//绑定事件
		switch(status){
			case this.status.CREATE_NETWORK:
				var confirmHandler = function (networkName, department, position) {
					$.ajax({
						url: AJAXService.getUrl("/network/createNetwork"),
						data: {
							department: department,
							networkName: networkName,
							position: position
						},
						success: function (data) {
							if(data.code == 1){
								var  result= data.data;
								//创建成功
								resultDom.modal("hide");
								that.init(that.status.CREATE_SUCCESS, result.camp).modal("show");
							}else{
								//创建失败
							}
						}
					})
				}
				resultDom.find(".createNetworkButton").click(function () {
					var post = {};
					post.networkName = resultDom.find(".networkName").val();
					post.department = resultDom.find(".department").val();
					post.position = resultDom.find(".position").val();
					confirmHandler(post.networkName, post.department, post.position);
				});
				break;
			case this.status.JOIN_NETWORK1:
				var that = this;
				resultDom.find(".createNetworkButton").click(function () {
					var networkNum = resultDom.find(".networkId").val();
					$.ajax({
						url: AJAXService.getUrl("/network/getNetworkInfo"),
						data: {
							networkNum: networkNum
						},
						success: function (data) {
							if(data.code == 1){
								var result = data.data.camp;
								resultDom.modal("hide");
								that.init(that.status.JOIN_NETWORK,result).modal("show");
							}else{
								alert(data.msg);
							}
						}
					})

				});
				break;
			case this.status.JOIN_NETWORK:
				var that = this;
				var networkNum = resultDom.find(".networkNum").val();
				var department = resultDom.find(".department").val();
				var position = resultDom.find(".position").val();
				resultDom.find(".createNetworkButton").click(function () {
					$.ajax({
						url: AJAXService.getUrl("/network/applyJoinNetwork"),
						data: {
							networkNum: networkNum,
							department: department,
							position: position
						},
						success: function(data){
							if(data.code == 1){
								alert("申请已发送至该网络，请耐心等待审核");
							}else{
								alert(data.msg);
							}
						}
					})
				});
				break;
			case this.status.CREATE_SUCCESS:
				$(".createNetworkButton").click(function () {
					window.location.href = "/view/category/room.html";
				})
				break;
		}
		return resultDom;
	}
}
module.exports = network;