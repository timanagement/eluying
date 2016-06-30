var AJAXService = require("AJAXService");
var util = require("util");
var trToggle = require("trToggle");
var modal = require("modal");
require("validate");
var foodETPriceList = {
    getFoodETPriceList: function(path){
        /*$.ajax({
            url: path == "food" ? AJAXService.getUrl("getFoodCategoryPriceList") : AJAXService.getUrl("getPlayCategoryPriceList"),
            data: {
                campId: localStorage.getItem("campId")
            },
            dataFilter: function (result) {
                return AJAXService.sessionValidate(result);
            },
            success: function(result){
                foodETPriceList.render(result)
            }
        })*/
        var url = (path == "food") ? "getFoodCategoryPriceList" : "getPlayCategoryPriceList";
        var restId = location.search.split('=')[1];
        var params = { restId: restId };
        if (path === 'food') {
            params.version = 7;
        }
        AJAXService.ajaxWithToken("GET", url, params, function(result){
            foodETPriceList.render(result)
        })
    },
    render: function(result){
        var dishesTbody = "<tbody>";
        var dishesList = result.data.list[1];
        for (var name in dishesList) {
            for (var subName in dishesList[name]) {
                if (subName == 0) {
                    dishesTbody += "<tr class='mainClass'><td>" + dishesList[name][subName].name + (dishesList[name].hasOwnProperty("1") ? "<img src='/static/image/rotate.png' />" : "") + "</td><td>零售价</td><td class='price' category-id='" + dishesList[name][subName].id + "'>" + dishesList[name][subName].salePrice + "</td></tr>"
                } else {
                    dishesTbody += "<tr class='subPrice hide'><td><div>" + dishesList[name][subName].channelName + "</div></td><td><div><p>直销价</p></div></td>" +
                        "<td class='subPriceTd' category-id='" + dishesList[name][subName].id + "' channel-id='" + dishesList[name][subName].channelId + "' ><div><p>"
                        + dishesList[name][subName].netPrice + "</p></div></td></tr>"
                }
            }
        }
        var packageList = result.data.list[0];
        var packageTbody = "<tbody>";
        for (var name in packageList) {
            for (var subName in packageList[name]) {
                if (subName == 0) {
                    packageTbody += "<tr class='mainClass'><td>" + packageList[name][subName].name + (packageList[name].hasOwnProperty("1") ? "<img src='/static/image/rotate.png' />" : "") + "</td><td>零售价</td><td class='price' category-id='" + packageList[name][subName].id + "'>" + packageList[name][subName].salePrice + "</td></tr>"
                } else {
                    packageTbody += "<tr class='subPrice hide'><td><div>" + packageList[name][subName].channelName + "</div></td><td><div><p>直销价</p></div></td>" +
                        "<td class='subPriceTd' category-id='" + packageList[name][subName].id + "' channel-id='" + packageList[name][subName].channelId + "' ><div><p>"
                        + packageList[name][subName].netPrice + "</p></div></td></tr>"
                }
            }
        }
        dishesTbody += "</tbody>";
        packageTbody += "</tbody>";
        $("#packageTable").append(dishesTbody);
        $("#dishesTable").append(packageTbody);
        this.eventBind();
    },
    editSalePrice: function(that){
        /*$.ajax({
            url: AJAXService.getUrl("modifyDefaultPrice"),
            data: {
                newSalePrice: $("#retailPrice").val(),
                newNetPrice: 0,
                newAgreementPrice: 0,
                categoryId: $(".selected").attr("category-id"),
                channelId: 0
            },
            dataFilter: function (result) {
                return AJAXService.sessionValidate(result);
            },
            success: function(result){
                if (util.errorHandler(result)) {
                    $(".selected").html($("#retailPrice").val());
                    modal.clearModal(that);
                }
            }
        })*/
        AJAXService.ajaxWithToken("GET","modifyDefaultPrice",{
            newSalePrice: $("#retailPrice").val(),
            newNetPrice: 0,
            newAgreementPrice: 0,
            categoryId: $("td.selected").attr("category-id"),
            channelId: 0
        },function(result){
            if (util.errorHandler(result)) {
                $("td.selected").html($("#retailPrice").val());
                modal.clearModal(that);
            }
        });
    },
    editNetAgreePrice: function(that){
        /*$.ajax({
            url: AJAXService.getUrl("modifyDefaultPrice"),
            data: {
                newSalePrice: 0,
                newNetPrice: $("#netPrice").val(),
                newAgreementPrice: $("#commissionPrice").val(),
                categoryId: $(".selected").attr("category-id"),
                channelId: $(".selected").attr("channel-id")
            },
            dataFilter: function (result) {
                return AJAXService.sessionValidate(result);
            },
            success: function(result){
                if (util.errorHandler(result)) {
                    $(".selected").find("p:eq(0)").html($("#commissionPrice").val());
                    $(".selected").find("p:eq(1)").html($("#netPrice").val());
                    modal.clearModal(that);
                }
            }
        })*/
        AJAXService.ajaxWithToken("GET","modifyDefaultPrice",{
            newSalePrice: $("#netPrice").val(),
            newNetPrice: $("#netPrice").val(),
            newAgreementPrice: $("#netPrice").val(),
            categoryId: $("td.selected").attr("category-id"),
            channelId: $("td.selected").attr("channel-id")
        },function(result){
            if (util.errorHandler(result)) {
                $("td.selected").find("p:eq(0)").html($("#commissionPrice").val());
                $("td.selected").find("p:eq(0)").html($("#netPrice").val());
                modal.clearModal(that);
            }
        })
    },
    eventBind: function(){
        events= {
            "click .priceGrid .price": function(event){
                $(".price").removeClass("selected");
                $(".subPriceTd").removeClass("selected");
                $(this).toggleClass("selected");
                $(".editSalePrice").removeClass("hide");
                $(".editNetPrice").addClass("hide");
                $(".second").removeClass("hide");
            },
            "click .priceGrid .subPriceTd": function(event){
                $(".subPriceTd").removeClass("selected");
                $(".price").removeClass("selected");
                $(this).toggleClass("selected");
                $(".editNetPrice").removeClass("hide");
                $(".editSalePrice").addClass("hide");
                $(".second").removeClass("hide");
            },
            "click #editSalePriceButton": function(){
                $("#retailPrice").val($("td.selected").html());
            },
            "click #editNetPriceButton": function(){
                $("#netPrice").val($("td.selected").find("p:eq(0)").html());
                $("#commissionPrice").val($("td.selected").find("p:eq(0)").html());
            },
            "click #editSalePriceOk": function(){
                var that = this
                if (!$("#editSalePrice form").valid()) {
                    return;
                }
                foodETPriceList.editSalePrice(that)
            },
            "click #editNetPriceOk": function(){
                if (!$("#editNetPrice form").valid()) {
                    return;
                }
                var that = this;
                foodETPriceList.editNetAgreePrice(that);
            }
        };
        trToggle();
        util.bindDomAction(events);
    }
};
module.exports = foodETPriceList;