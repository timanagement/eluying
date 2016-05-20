/**
 * Created by Administrator on 2016/1/26.
 */
var AJAXService = require("AJAXService");
var util = require("util");
var modal = require("modal");
var shopList = require('./shopList');
var shopCategory = require('./shopCategory');

var createShop = {



    //获取商品类型数据
    init: function() {
        /*$.ajax({
            url: AJAXService.getUrl('getShopCategory'),
            dataFilter: function (result) {
                return AJAXService.sessionValidate(result);
            },
            success: function (result) {
                var category = result.data.list;
                var str = '';
                $.each(category, function(index, el) {
                    str += '<option value="' + el.goodstypeId + '">' + el.goodstypeName + '</option>'
                });
                $('#category').html(str);

            }
        });*/
        AJAXService.ajaxWithToken('get','/category/getGoodTypeInfo',{},function (result) {
            var category = result.data.list;
            var str = '';
            $.each(category, function(index, el) {
                str += '<option value="' + el.goodstypeId + '">' + el.goodstypeName + '</option>'
            });
            $('#category').html(str);        
        });
    },

    buildData: function(that) {
        var data = {
            name: $('#name').val(),
            shortName: $('#shortName').val(),
            goodstypeId: $('#category').val(),
            unit: $('#unit').val(),
            price: $('#price').val(),
            brand: $('#brand').val(),
            description: $('#description').val()
        };
        createShop.create(data, that)
    },

    create: function(data, that) {
        /*$.ajax({
            url: AJAXService.getUrl('addGood'),
            type: 'POST',
            data: data,
            dataFilter: function (result) {
                return AJAXService.sessionValidate(result);
            },
            success: function (result) {
                if (util.errorHandler(result)) {
                    modal.clearModal(that);
                } else {
                    return;
                }
                shopList.loadShopCategory();
                shopList.loadShopList();
            }
        });*/
        AJAXService.ajaxWithToken('get','/category/addNewGood',data,function (result) {
            if (util.errorHandler(result)) {
                modal.clearModal(that);
            } else {
                return;
            }
            shopList.loadShopCategory();
            shopList.loadShopList();
        });
    },

    events: {
        'click .create': function() {
            createShop.init();
        },

        'click #createShop .btn-ok': function() {
            if (!$("#createShop form").valid()) {
                return;
            }
            var that = this;
            createShop.buildData(that);
        }
    }
};

module.exports = createShop;