/*
* @Author: lxj
* @Date:   2017-07-31 10:52:58
* @Last Modified by:   lxj
* @Last Modified time: 2017-08-23 10:16:10
* @email: 783384903@qq.com
*/

'use strict';
import types from './types';
import Vuex from 'vuex';
import Vue from 'vue';
import http from '../../common/http';
import { dateFormat } from '../../common/util';

Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        restId: 0,
        date: dateFormat(new Date()),
        leftType: 0,
        // 0:今日营业额，1:空桌选中，2:订单详情，4:加菜点菜,
        board: undefined,
        selectDish: [],
        // openData: {
        //     list: [1, 2, 3, 4],
        //     boardDetailResps: [{ id: 123, boardName: '大圆桌', boardId: '2' }, { id: 123, boardName: '大圆桌', boardId: '3' }],
        //     openTime: new Date(),
        //     operatorName: 'mockDate',
        //     peopleNum: 10,
        //     restName: 'asdasd',
        //     state: 2,
        //     isHasOrder: false
        // },
        openData: undefined,
        addFood: [],
        editorPromission: true
    },
    mutations: {
        [types.CANL_FOOD](state) {
            state.addFood = [];
        },
        [types.SET_PROMESSION](state, { flag }) {
            state.editorPromission = flag;
        },
        [types.ADD_FOOD](state, { food }) {
            const selectFood = state.addFood.find((el, index) => {
                return el.dishId === food.dishId;
            });
            if (selectFood) {
                selectFood.num = selectFood.num + 1;
            } else {
                food.num = 1;
                state.addFood.push(food);
            }
        },
        [types.CHANGE_FOOD](state, { food }) {
            state.addFood.forEach((el, index) => {
                if (el.dishId === food.dishId) {
                    if (food.num > 0) {
                        el.num = food.num;
                    } else {
                        state.addFood.splice(index, 1);
                    }
                }
            });
        },
        [types.SET_OPEN_DATA](state, { openData }) {
            state.openData = openData;
        },
        [types.SET_LEFT_TYPE](state, { leftType }) {
            state.leftType = leftType;
        },
        [types.SET_REST](state, { restId }) {
            state.restId = restId;
        },
        [types.SET_DATE](state, { date }) {
            state.date = date;
        },
        [types.SET_SELECT_DISH](state, { dish }) {
            state.selectDish.push(dish);
        },
        [types.DELETE_SELECT_DISH](state, { dish }) {
            state.selectDish.splice(state.selectDish.indexOf(dish), 1);
        },
        [types.RESET_SELECT_DISH](state) {
            state.selectDish = [];
        },
        [types.SET_CATER_ORDER_DETAIL](state, { caterDetail }) {
            state.openData = caterDetail;
        }
    },
    actions: {
        [types.LOAD_CATER_ORDER_DETAIL]({ commit }, { caterOrderId }) {
            return new Promise((resolve, reject) => {
                http.get('/catering/getCaterOrderDetail', { caterOrderId })
                    .then((res) => {
                        if (res.code === 1) {
                            commit(types.SET_CATER_ORDER_DETAIL, { caterDetail: res.data });
                            commit(types.SET_ORDER_DETAIL, { orderDetail: res.data });  // send order detail to caterOrder of common
                            resolve(res);
                        } else {
                            reject(res);
                        }
                    });
            });
        }
    }
});
export default store;
