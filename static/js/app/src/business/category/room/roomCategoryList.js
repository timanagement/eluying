import http from 'http';
var util = require("util");
var modal = require("modal");
var floatInfo = require("floatInfo");

var roomCategoryList = {

    //重新计算库存
    countInventory: function (id) {
        $.each(roomCategoryList.list, function (index, element) {
            if (element.id == id) {
                var inventory = 0;
                $.each(element.subTypeList, function (index, element) {
                    inventory += Number(element.inventory);
                });
                roomCategoryList.list[index].inventory = inventory;
                return false;
            }
        })
    },


    //读取房型列表
    loadRoomCategoryList: function () {
        /*$.ajax({
            url: http.getUrl('getRoomCategoryListUrl'),
            dataFilter: function (result) {
                return http.sessionValidate(result);
            },
            success: function (result) {
                roomCategoryList.list = result.data.list;
                roomCategoryList.render();
            }
        })*/
        http.get('getRoomCategoryListUrl',{})
            .then(function (result) {
                roomCategoryList.list = result.data.list;
                roomCategoryList.render();
            });
    },

    //绘制
    render: function () {
        var str = "";
        $.each(roomCategoryList.list, function (index, element) {
            var state = element.state ? '已上架' : '未上架';
            str += "<tr class='mainClass'>" +
                "<td><span class='gridMore'>" + element.name + "</span>"
                + "<img src='/static/image/rotate.png'></td>" +
                "<td>" + element.shortName + "</td>" +
                "<td>" + element.unit + "</td>" +
                "<td>" + element.fitNum + "</td>" +
                "<td>" + element.inventory + "</td>" +
                "<td>" + element.price + "</td>" +
                "<td>" + state + "</td>" +
                "<input type='hidden' class='state' value=" + element.state + " />" +
                "<input type='hidden' class='id' value=" + element.id + " /></tr>";
            $.each(element.subTypeList, function (index, subElement) {
                str += "<tr class='subclass hide'>" +
                    "<td><div class='first gridMore'>" + subElement.name + "</div></td>" +
                    "<td><div>" + subElement.shortName + "</div></td>" +
                    "<td><div>" + element.unit + "</div></td>" +
                    "<td><div>" + element.fitNum + "</div></td>" +
                    "<td><div>" + subElement.inventory + "</div></td>" +
                    "<td><div>" + element.price + "</div></td>" +
                    "<td><div class='last'>" + state + "</div></td>" +
                    "<input type='hidden' class='id' value=" + subElement.id + " /></tr>";
            })
        });
        $(".categoryGrid tbody").html(str);
        $(".mainOperate .operateItem").addClass("hide");
        $(".mainOperate .second").addClass("hide");
    },
//上下架
    modifyState: function (item) {
        /*$.ajax({
            url: http.getUrl('modifyStateUrl'),
            data: item,
            dataFilter: function (result) {
                return http.sessionValidate(result);
            },
            success: function (result) {
                if (!util.errorHandler(result)) {
                    return;
                }
                $.each(roomCategoryList.list, function (index, element) {
                    if (element.id == item.id) {
                        roomCategoryList.list[index].state = item.state;
                        return false; //等于break
                    }
                });
                roomCategoryList.render();
            }
        })*/
        http.get('/category/modifyStatePC',item)
            .then(function (result) {
                $.each(roomCategoryList.list, function (index, element) {
                    if (element.id == item.id) {
                        roomCategoryList.list[index].state = item.state;
                        return false; //等于break
                    }
                });
                roomCategoryList.render();
            });
    },

    //删除房型
    deleteRoom: function () {
        var id = $(".mainActive .id").val();
        /*$.ajax({
            url: http.getUrl("deleteRoomUrl"),
            data: {id: id},
            success: function (result) {
                if (!util.errorHandler(result)) {
                    return;
                }
                $.each(roomCategoryList.list, function (index, element) {
                    if (element.id == id) {
                        roomCategoryList.list.splice(index, 1);
                        return false; //等于break
                    }
                });
                roomCategoryList.render();
            },
            dataFilter: function (result) {
                return http.sessionValidate(result);
            }
        })*/
        http.post("deleteRoomUrl",{id: id})
            .then(function (result) {
                if (!util.errorHandler(result)) {
                    return;
                }
                $.each(roomCategoryList.list, function (index, element) {
                    if (element.id == id) {
                        roomCategoryList.list.splice(index, 1);
                        return false; //等于break
                    }
                });
                roomCategoryList.render();
            });
    },

    events: {
        //点击主类
        "click .categoryGrid .mainClass": function () {
            $(".mainClass").removeClass("mainActive");
            $(".subclass").removeClass("subActive");
            $(this).addClass("mainActive");
            var that = $(this);
            if ($(this).nextUntil(".mainClass").hasClass("hide")) {
                $(this).find("img").addClass("rotate");
                $(this).nextUntil(".mainClass").removeClass("hide");
                $(this).nextUntil(".mainClass").find("div").slideDown(300);
            } else {
                $(this).find("img").removeClass("rotate");
                $(this).nextUntil(".mainClass").find("div").slideUp(300);
                setTimeout(function () {
                    that.nextUntil(".mainClass").addClass("hide");
                }, 300);
            }
            $(".mainOperate .operateItem").removeClass("hide");
            $(".mainOperate .second").removeClass("hide");
            $(".mainOperate .editSubRoomButton").addClass("hide");
            if ($(this).find(".state").val() == 0) {
                $(".xiajia").addClass("hide");
            } else {
                $(".shangjia").addClass("hide");
            }
        },

        //点击子类
        "click .categoryGrid .subclass": function () {
            $(".subclass").removeClass("subActive");
            $(".mainClass").removeClass("mainActive");
            $(this).prevAll(".mainClass").first().addClass("mainActive");
            $(this).addClass("subActive");
            $(".mainOperate .operateItem").addClass("hide");
            $(".mainOperate .second").addClass("hide");
            $(".mainOperate .editSubRoomButton").removeClass("hide");
            $(".mainOperate .subclassManageButton").removeClass("hide");
        },
        //绑定悬浮信息
        "mouseenter .categoryGrid .gridMore": function () {
            floatInfo.showMoreInfo(event, this);
        },
        "mouseleave .categoryGrid .gridMore": function () {
            floatInfo.hideMoreInfo(event, this)
        },


        //点击删除按钮
        "click #deleteRoomButton": function () {
            var confirmCallback = roomCategoryList.deleteRoom;
            var dialogConfig = {title: "提示", message: "您确定要删除吗？"};
            modal.confirm(dialogConfig, confirmCallback);
        },

        //上架或下架
        "click .modifyStateButton": function () {
            var item = {
                id: $(".mainActive .id").val(),
                state: 1 - $(".mainActive .state").val(),
                channelId: 5,
            };
            roomCategoryList.modifyState(item);
        }
    }
};

module.exports = roomCategoryList;