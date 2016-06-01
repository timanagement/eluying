var util = require("util");
require("angular");

var constService = require("../services/constService");

var orderNewService = function(app){
    constService(app);
    app.service("orderNewService", ['constService', function(constService){
        this.resetOrderNew = function(type, rooms, channel, channelId){
            var title = (function(){
                for(var i = 0; i < constService.statusStr.length; i++){
                    if(constService.statusStr[i].classStr === type){
                        return constService.statusStr[i].title;
                    }
                }
                return null;
            })();
            return {
                title: title,
                type: type,
                origin: channel,
                originId: channelId,
                customerName: null,
                customerPhone: null,
                selectedId: 0,
                selectedIdLabel: '身份证',
                idVal: null,
                rooms: rooms,
                foodItems: [],
                playItems: [],
                goodsItems: [],
                remark: '',
                discounts: 0,
            }
        };
    }]);
};

module.exports = orderNewService;