/**
 * Created by lingchenxuan on 2017/2/17.
 */
module.exports = {
    css: [
        'static/sass/main.scss',
        'static/sass/order/orders/orders.scss',
        'static/sass/vip/setting.scss'
    ],
    js: {
        'login/login': './static/js/app/src/login/login.js',
        'price/roomEntry': './static/js/app/src/business/price/roomEntry.js',
        'price/foodETEntry': './static/js/app/src/business/price/foodETEntry.js',
        'inventory/room': './static/js/app/src/business/inventory/room.js',
        'inventory/entertainment': './static/js/app/src/business/inventory/entertainment.js',
        'category/roomEntry': './static/js/app/src/business/category/room/roomEntry.js',
        'category/foodEntry': './static/js/app/src/business/category/food/foodEntry.js',
        'category/ETEntry': './static/js/app/src/business/category/entertainment/ETEntry.js',
        'category/shopEntry': './static/js/app/src/business/category/shop/shopEntry.js',
        'other/room': './static/js/app/src/business/other/main.js',
        'consume/room': './static/js/app/src/business/consume/main.js',
        'salesite/info': './static/js/app/src/salesite/info/info.js',
        'salesite/operation': './static/js/app/src/salesite/operation/operation.js',
        'guest/source': './static/js/app/src/guest/source/source.js',
        'setting/method': './static/js/app/src/setting/method/method.js',
        'tips/noauth': './static/js/app/src/tips/noauth.js',
        'tips/noauthfora': './static/js/app/src/tips/noauthfora.js',
        'tips/noauthforvip': './static/js/app/src/tips/noauthforvip.js',
        'tips/upgrade': './static/js/app/src/tips/upgrade.js',
        'tips/expired': './static/js/app/src/tips/expired.js',
        'ordersManage/orders': './static/js/app/src/ordersManage/orders.js',
        'accommodation': './static/js/app/src/accommodation/main.js',
        'restaurant/restaurant': './static/js/app/src/business/restaurant/restaurant/index.js',
        'restaurant/table': './static/js/app/src/business/restaurant/table',
        'restaurant/dishes': './static/js/app/src/business/restaurant/dishes',
        'restaurant/other': './static/js/app/src/business/restaurant/other/main.js',
        'codesite/operation': './static/js/app/src/codesite/operation/operation.js',
        'linesite/operation': './static/js/app/src/linesite/operation/operation.js',
        'salesite/detail': './static/js/app/src/salesite/detail/detail.js',
        'reports/reports': './static/js/app/src/reports/main.js',
        'customer/customer': './static/js/app/src/customer/main.js',
        'block/room': './static/js/app/src/business/block/room.js',
        'hourly/room': './static/js/app/src/business/hourly/room.js',
        'rights/virtual': './static/js/app/src/rights/virtual/main.js',
        'restaurantManage/restaurantManage': './static/js/app/src/restaurantManage/main.js',
        'message/message': './static/js/app/src/message/main.js'
    },
    html: ['./static/tpl/feature.html', './static/tpl/customerCase.html'],
    port: 3000,
    devServer: '//www.dingdandao.com:3443',
    testServer: '//www.dingdandao.com:1443',
    // devServer: '//beta.dingdandao.com',
    // testServer: '//www.dingdandao.com:1443',
    SPA: [
        { url: '/view/reports', path: '/view/reports/index.html' },
        { url: '/view/customer', path: '/view/customer/index.html' },
        { url: '/view/accommodation', path: '/view/accommodation/index.html' },
        { url: '/view/restaurantManage', path: '/view/restaurantManage/index.html' }
    ]
};
