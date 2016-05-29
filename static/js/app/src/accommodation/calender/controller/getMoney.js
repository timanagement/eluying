var AJAXService = require("AJAXService");
var util = require("util");
var modal = require("modal");
require("angular");

var orderService = require("../services/orderService");
var getMoneyService = require("../services/getMoneyService");
var getDataService = require("../services/getDataService");
var accommodationService = require("../services/accommodationService");

var getMoneyCtrl = function(app){
    orderService(app);
    getMoneyService(app);
    getDataService(app);
    accommodationService(app);
    app.controller("getMoneyCtrl", ['$rootScope', '$scope', 'orderService', 'getMoneyService',
        'getDataService', 'accommodationService',
        function(rootScope, scope, orderService, getMoneyService, getDataService, accommodationService){
            scope.calPrice = orderService.calPrice;
            scope.calLeft = orderService.calLeft;
            scope.totalPrice = orderService.totalPrice;
            scope.calDeposit = orderService.calDeposit;
            scope.itemPrice = orderService.itemPrice;
            scope.addPayment = getMoneyService.addPayment;
            scope.changePayChannel = getMoneyService.changePayChannel;
            scope.finishPay = function(){
                var getMoney = rootScope.getMoney;
                var payments_new = [];
                getMoney.payments.forEach(function(d){
                    if(d.isNew && d.fee > 0){
                        payments_new.push(d);
                    }
                });
                // var rooms = [];
                // getMoney.rooms.forEach(function(d){
                //     if(d.selected){
                //         rooms.push({
                //             startDate: d.startDate,
                //             endDate: d.endDate,
                //             roomId: d.roomId,
                //         });
                //     }
                // });
                // AJAXService.ajaxWithToken('GET', 'checkInOrCheckoutUrl', {
                //     payments: JSON.stringify(payments_new),
                //     orderId: getMoney.orderId,
                //     type: 0,
                //     rooms: JSON.stringify(rooms)
                // }, function(result){
                //     if(result.code === 1){
                //         //TODO 提示入住/退房成功
                //         $("#getMoneyModal").modal("hide");
                //         getDataService.getRoomsAndStatus(rootScope);
                //     }else{
                //         modal.somethingAlert(result.msg);
                //     }
                // });

                AJAXService.ajaxWithToken('GET', 'finishPaymentUrl', {
                    payments: JSON.stringify(payments_new),
                    remark: getMoney.remark,
                    orderId: getMoney.orderId
                }, function(result){
                    if(result.code === 1){
                        //TODO 提示收银成功
                        $("#getMoneyModal").modal("hide");
                        getDataService.getRoomsAndStatus(rootScope);
                        accommodationService.emptySelectedEntries(rootScope);
                    }
                });
            };
        }]);
};

module.exports = getMoneyCtrl;