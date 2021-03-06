/**
 * Created by ddll on 17-5-10.
 */
import http from '../../http';
import types from './types';
import { ORDER_TYPE } from '../../../ordersManage/constant';
const date = new Date();
const now = {
    year: date.getFullYear(),
    mouth: date.getMonth() + 1,
    day: date.getDay()
};
const orderSystemModule = {
    state: {
        shopList: [],
        enterList: [],
        otherGoodsList: [],
        orderDetail: {},
        roomBusinessInfo: {},
        roomExtinfo: {
            startDate: new Date(now.year, now.mouth, now.day, 18, 0, 0, 0),
            endDate: new Date(now.year, now.mouth, now.day + 1, 12, 0, 0, 0),
            roomCheckType: 0
        },
        roomTipStatus: {
            tips: '',
            show: false
        }
    },
    getters: {
        catOrder: state => {
            return state.orderDetail;
        }
    },
    mutations: {
        [types.SET_ROOMTIP](state, { roomTipStatus }) {
            if (state.roomTipStatus.tips !== roomTipStatus.tips) {
                state.roomTipStatus = {
                    tips: roomTipStatus.tips,
                    show: true
                };
                window.sessionStorage.setItem('clostTipsShow', false);
            } else {
                if (window.sessionStorage.getItem('clostTipsShow') === '1') {
                    state.roomTipStatus.show = false;
                }
            }
        },
        [types.SET_TIPSSHOW](state, tipsShow) {
            window.sessionStorage.setItem('clostTipsShow', !tipsShow ? 1 : 0);
            state.roomTipStatus.show = tipsShow;
        },
        [types.SET_ROOM_EXITINFO](state, { key, val }) {
            state.roomExtinfo[key] = val;
        },
        [types.SET_SHOP_LIST](state, { shopList }) {
            state.shopList = shopList;
        },
        [types.SET_ENTER_LIST](state, { enterList }) {
            state.enterList = enterList;
        },
        [types.SET_ORDER_DETAIL](state, { orderDetail }) {
            state.orderDetail = orderDetail;
        },
        [types.SET_ROOM_BUSINESS_INFO](state, { roomBusinessInfo }) {
            state.roomBusinessInfo = roomBusinessInfo;
        },
        [types.SET_OTHER_GOODS_LIST](state, { otherGoodsList }) {
            state.otherGoodsList = otherGoodsList;
        }
    },

    actions: {
        [types.LOAD_SHOP_LIST]({ commit }) {
            return new Promise((resolve, reject) => {
                http.get('/shop/list', {})
                    .then(res => {
                        if (res.code === 1) {
                            const shopList = [];
                            res.data.list.forEach((d) => {
                                shopList.push(d);
                            });
                            commit(types.SET_SHOP_LIST, { shopList });
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    });
            });
        },
        [types.LOAD_OTHER_GOODS_LIST]({ commit }) {
            return new Promise((resolve, reject) => {
                http.get('/goods/otherGoodsList', {})
                    .then(res => {
                        const otherGoodsList = [];
                        res.data.list.forEach((d) => {
                            const gList = d.childList.map(item => ({
                                i: item.goodsId,
                                n: item.name,
                                p: item.price
                            }));
                            otherGoodsList.push({
                                cName: d.name,
                                id: d.goodsTypeId,
                                gList: gList
                            });
                        });
                        commit(types.SET_OTHER_GOODS_LIST, { otherGoodsList });
                        resolve(res);
                    });
            });
        },
        [types.LOAD_ENTER_LIST]({ commit }) {
            return new Promise((resolve, reject) => {
                http.get('/entertainment/getCategoryListPC', {})
                    .then(res => {
                        if (res.code === 1) {
                            const enterList = [];
                            res.data.list.map(el => {
                                if (el.categoryList && el.categoryList.length > 0) {
                                    el.categoryList.map(item => {
                                        item.id = item.categoryId;
                                        item.nodeId = item.enterId;
                                        item.type = 2;
                                    });
                                    enterList.push(el);
                                }
                            });
                            commit(types.SET_ENTER_LIST, { enterList });
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    });
            });
        },
        [types.LOAD_ORDER_DETAIL]({ commit }, { orderId }) {
            return new Promise((resolve, reject) => {
                http.get('/order/getOrderDetail', { orderId })
                    .then((res) => {
                        if (res.code === 1) {
                            commit(types.SET_ORDER_DETAIL, { orderDetail: res.data });
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    });
            });
        },
        [types.LOAD_ROOM_BUSINESS_INFO]({ state, commit }, { businessType }) {
            return new Promise((resolve, reject) => {
                http.get('/order/getRoomBusinessInfo', { orderId: state.orderDetail.orderId, businessType })
                    .then((res) => {
                        if (res.code === 1) {
                            res.data.businessType = businessType;
                            commit(types.SET_ROOM_BUSINESS_INFO, { roomBusinessInfo: res.data });
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    });
            });
        },
        [types.GET_CATER_ORDER_DETAIL]({ commit }, { orderId }) {
            return new Promise((resolve, reject) => {
                http.get('/catering/getCaterOrderDetail', { caterOrderId: orderId })
                    .then((res) => {
                        if (res.code === 1) {
                            commit(types.SET_ORDER_DETAIL, { orderDetail: res.data });
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    });
            });
        },
        [types.GET_ENTER_ORDER_DETAIL]({ commit }, { orderId }) {
            return new Promise((resolve, reject) => {
                http.get('/order/getEnterOrderDetail', { enterOrderId: orderId })
                    .then((res) => {
                        if (res.code === 1) {
                            commit(types.SET_ORDER_DETAIL, { orderDetail: res.data });
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    });
            });
        },
        [types.GET_GOODS_ORDER_DETAIL]({ commit }, { orderId }) {
            return new Promise((resolve, reject) => {
                http.get('/order/getGoodsOrderDetail', { goodsOrderId: orderId })
                    .then((res) => {
                        if (res.code === 1) {
                            commit(types.SET_ORDER_DETAIL, { orderDetail: res.data });
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    });
            });
        },
        [types.GET_ROOM_ORDER_DETAIL]({ commit }, { orderId }) {
            return new Promise((resolve, reject) => {
                http.get('/order/getRoomOrderDetail', { serviceId: orderId })
                    .then((res) => {
                        if (res.code === 1) {
                            commit(types.SET_ORDER_DETAIL, { orderDetail: res.data });
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    });
            });
        },
        [types.GET_ORDER_DETAIL]({ dispatch, commit }, { orderId, orderType }) {
            commit(types.SET_ORDER_DETAIL, { orderDetail: {} });
            switch (orderType) {
                case ORDER_TYPE.COMBINATION:
                    return dispatch(types.LOAD_ORDER_DETAIL, { orderId });
                case ORDER_TYPE.ACCOMMODATION:
                    return dispatch(types.GET_ROOM_ORDER_DETAIL, { orderId });
                case ORDER_TYPE.ENTERTAINMENT:
                    return dispatch(types.GET_ENTER_ORDER_DETAIL, { orderId });
                case ORDER_TYPE.CATERING:
                    return dispatch(types.GET_CATER_ORDER_DETAIL, { orderId });
                case ORDER_TYPE.RETAIL:
                    return dispatch(types.GET_GOODS_ORDER_DETAIL, { orderId });
            }
        },
        [types.LOAD_ROOM_BUSINESS_INFO_DAYORDER]({ state, commit }, { businessType, orderId}) {
            return new Promise((resolve, reject) => {
                http.get('/order/getRoomBusinessInfo', { orderId, businessType })
                    .then((res) => {
                        if (res.code === 1) {
                            res.data.businessType = businessType;
                            commit(types.SET_ROOM_BUSINESS_INFO, { roomBusinessInfo: res.data });
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    });
            });
        },
        [types.LOAD_ROOMTIP]({ commit }) {
            http.get('/room/getTips')
                .then((res) => {
                    if (!res.data.tips) {
                        commit(types.SET_TIPSSHOW, false);
                    } else {
                        commit(types.SET_ROOMTIP, { roomTipStatus: { tips: res.data.tips } });
                    }
                });
        }
    }
};

export default function install(store) {
    store.registerModule('orderSystem', orderSystemModule);
}
