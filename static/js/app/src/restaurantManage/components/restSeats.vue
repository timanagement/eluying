/**
 * @Author: lwh
 * @Date:   2017-08-02 16:04:29
 * @Last Modified by:   Tplant
 * @Last Modified time: 2017-08-14 13:26:59
 */

 <template>
    <div>
         <div class="select-container">
            <div class="time-select">
                <date-select @change="handleDateChange" :defaultDate="defaultStrDate" :disabledDate="true"></date-select>
            </div>
            <div class="area-select">
                <div v-for="area in areas" @click="toggleArea(area)" :class="{selected: area.selected}">{{area.name}}</div>
            </div>
            <div class="state-select">
                <customer-radio name="area" value="-1" v-model="selectState" checked>全部座位</customer-radio>
                <customer-radio name="area" value="2" v-model="selectState">使用中</customer-radio>
                <customer-radio name="area" value="0" v-model="selectState">空闲</customer-radio>
                <customer-radio name="area" value="4" v-model="selectState">开台未点菜</customer-radio>
                <customer-radio name="area" value="1" v-model="selectState">已预订</customer-radio>
            </div>
            <div class="order-menu">
                <div class="order" @click="reserve" v-show="editorPromission">预订</div>
                <div class="menu" @click="orderDish" v-show="editorPromission">点菜</div>
            </div>
        </div>
        <div class="scroller-container" ref="scrollerContainer">
            <div class="scroller">
                <div class="area-container" v-for="area in tableList">
                    <h3>{{area.areaName}}</h3>
                    <div class="seats-container">
                        <div v-for="(board, index) in area.boardList" class="seat" :class="{leisure: board.boardState === 0,
                            using: board.boardState === 1 && board.caterOrderId,
                            'open-table': board.boardState === 1 && !board.caterOrderId,
                            'select-table': board.selected}" @click="getSeatOrder($event, board, 'currentOrder')" @contextmenu.prevent="$refs.ctxMenu.open($event, board)">
                            <div class="state-twoCode" :class="{'state-twoCode-right': board.orderState !== 2 && board.orderState !== 4 }">
                                <div class="state" :class="{'state-pending': board.orderState === 4 }" v-if="board.orderState === 2 || board.orderState === 4">{{orderState[board.orderState]}}</div>
                                <div class="two-dimensionalcode" v-if="board.hasScan"></div>
                            </div>
                            <div class="seat-num">{{board.boardName}}</div>
                            <div class="eating-time" v-if="board.orderState === 1">{{board.duration}}</div>
                            <div class="reserve-time" v-if="board.time">预{{board.time}}</div>
                            <div class="order-list" v-if="board.caterOrderList.length">
                                <div class="rest-arrow-up"></div>
                                <div class="seat-name"><span>{{board.boardName}}</span></div>
                                <div class="order-info" v-for="o in board.caterOrderList" @click.prevent="getSeatOrder($event, o, 'otherOrder')">
                                    <div class="order-list-item">
                                        <div>
                                            <span>人数: {{o.peopleNum}}</span>
                                            <span style="margin-left: 32px;" v-if="o.state === 0">用餐时间: {{o.diningTime}}</span>
                                            <span style="margin-left: 32px;" v-else>用餐时长: {{o.duration}}</span>
                                        </div>
                                        <div class="seat-state yellow" :class="{blue:o.state === 1}">{{FOOD_STATE[o.state]}}</div>
                                    </div>
                                    <div class="order-list-item">
                                        <div v-show="o.name && o.phone">{{`${o.name}(${o.phone})`}}<span style="margin-left: 8px;">{{o.origin}}</span></div>
                                        <div>{{o.caterOrderOrigin}}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <contextmenu id="context-menu" ref="ctxMenu" @ctx-open="onCtxOpen" @ctx-cancel="resetCtxLocals" @ctx-close="onCtxClose">
            <div class="rest-add-order" @click="addRestOrder" v-show="editorPromission">新增预订</div>
        </contextmenu>
    </div>
 </template>

<script>
import types from '../store/types';
import http from '../../common/http';
import util from '../../common/util.js';
import restBus from '../event.js';
import bus from '../../common/eventBus';
import { mapState, mapMutations, mapActions } from 'vuex';
import customerRadio from './customerRadio.vue';
import DateSelect from '../../accommodation/components/DateSelect';
import contextmenu from '../../common/components/contextmenu';
import { FOOD_STATE } from '../../ordersManage/constant.js';
import IScroll from 'iscroll';
export default {
    data() {
        return {
            defaultStrDate: this.date,
            selectState: '-1',
            areas: [],
            tableList: [],
            orderState: ['预订', '使用中', '已结账', '', '待处理'],
            FOOD_STATE,
            rightClickReserveBoard: undefined,
            areasEmpty: true
        };
    },
    created() {
        this.startFetchDate();
        restBus.$on('refeshView', this.getSeatList);
        bus.$on('refreshView', this.getSeatList);
    },
    computed: {
        ...mapState([
            'date',
            'restId',
            'selectDish',
            'editorPromission'
        ])
    },
    methods: {
        ...mapMutations([
            types.SET_DATE,
            types.SET_LEFT_TYPE,
            types.SET_SELECT_DISH,
            types.DELETE_SELECT_DISH,
            types.SET_CATER_ORDER_DETAIL,
            types.SET_OPEN_DATA,
            types.RESET_SELECT_DISH,
            types.SET_ORDER_DETAIL,
            types.SET_PROMESSION
        ]),
        ...mapActions([
            types.LOAD_CATER_ORDER_DETAIL
        ]),
        handleDateChange(date) {
            this.defaultStrDate = date;
        },
        getSeatOrder(event, board, whichOrder) {
            event.cancelBubble = true;
            if (whichOrder === 'currentOrder') {
                if (board.boardState === 0) {                                                   // 空桌
                    this.$set(board, 'selected', !(board.selected));
                    if (board.selected) {
                        this[types.SET_SELECT_DISH]({ dish: board });
                        this[types.SET_LEFT_TYPE]({ leftType: 1 });
                    } else {
                        this[types.DELETE_SELECT_DISH]({ dish: board });
                        if (this.selectDish.length === 0) {
                            this[types.SET_LEFT_TYPE]({ leftType: 0 });
                        }
                    }
                } else if (board.boardState === 1 && board.caterOrderId) {                      // 使用中的桌子
                    this[types.LOAD_CATER_ORDER_DETAIL]({ caterOrderId: board.caterOrderId });
                    this[types.SET_LEFT_TYPE]({ leftType: 2 });
                } else if (board.boardState === 1 && !board.caterOrderId) {                      // 开台未点菜
                    this.getOpenBoardRecords(board.boardId);
                    this[types.SET_LEFT_TYPE]({ leftType: 2 });
                }
            }
            if (whichOrder === 'otherOrder') {
                if (board.state === 0 || board.state === 1) {      // 预订和使用中的桌子
                    this[types.LOAD_CATER_ORDER_DETAIL]({ caterOrderId: board.caterOrderId });
                    this[types.SET_LEFT_TYPE]({ leftType: 2 });
                } else if (board.state === 7) {                     // 开台未点菜的桌子
                    this.getOpenBoardRecords(board.boardId);
                    this[types.SET_LEFT_TYPE]({ leftType: 2 });
                }
            }
        },
        toggleArea(area) {
            area.selected = !area.selected;
            if (this.areas.find(area => {
                return area.selected && area.id !== -1;
            })) {
                this.areas[0].selected = false;
            }
            if (area.id === -1) {
                this.areas.forEach(area => {
                    if (area.id !== -1) {
                        area.selected = false;
                    }
                });
                this.areas[0].selected = true;
            }
            if (!(this.areas.find(area => {
                return area.selected;
            }))) {
                this.areas[0].selected = true;
            }
            this.getSeatList();
        },
        onCtxOpen(locals) {
            this.rightClickReserveBoard = locals;
        },
        resetCtxLocals() {
            this.rightClickReserveBoard = undefined;
        },
        onCtxClose() {
        },
        addRestOrder() {
            this.$emit('reserve');
            restBus.$emit('rightClickReserve', this.rightClickReserveBoard.boardId);
        },
        reserve() {
            this.$emit('reserve');
            restBus.$emit('reserveType', 'noBoard');
        },
        orderDish() {
            this[types.SET_LEFT_TYPE]({ leftType: 4 });
            const openData = {
                peopleNum: 1,
                boardDetailResps: [
                    {
                        boardName: '无',
                        boardId: '',
                        boardSerialNum: ''
                    }
                ],
                orderState: 1,
                expectStartTime: util.dateFormatLong(new Date())
            };
            this[types.SET_OPEN_DATA]({ openData });
        },
        getSeatList() {
            const param = { date: this.date, restId: this.restId };
            if (!(this.areas.find(area => {
                return area.selected && area.id === -1;
            }))) {
                param.areaIds = [];
                this.areas.forEach(area => {
                    if (area.selected) {
                        param.areaIds.push(area.id);
                    }
                });
                param.areaIds = JSON.stringify(param.areaIds);
            };
            if (this.selectState !== '-1') {
                param.state = Number(this.selectState);
            }
            http.get('/board/list', param).then(res => {
                if (res.code === 1) {
                    this.tableList = [];
                    if (this.areasEmpty) {
                        this.areas = [{ id: -1, name: '全部区域', selected: true }];
                    }
                    res.data.list.map(item => {
                        if (this.areasEmpty) {
                            const areaHasOrNot = this.areas.find(area => {
                                return area.id === item.areaId;
                            });
                            if (areaHasOrNot === undefined) {
                                this.areas.push({ id: item.areaId, name: item.areaName, selected: false });
                            }
                        }
                        var tableHasOrNot = this.tableList.find((table, index) => {
                            return table.areaId === item.areaId;
                        });
                        if (tableHasOrNot === undefined) {
                            this.tableList.push({
                                areaId: item.areaId,
                                areaName: item.areaName,
                                boardList: [item]
                            });
                        } else {
                            tableHasOrNot.boardList.push(item);
                        }
                    });
                    this.areasEmpty = false;
                    this[types.RESET_SELECT_DISH]();
                    this[types.SET_PROMESSION]({ flag: res.data.restPermission });
                    this.$nextTick(() => {
                        this.initScroll();
                    });
                }
            });
        },
        /* getCaterOrderDetail(caterOrderId) {
            http.get('/catering/getCaterOrderDetail', { caterOrderId }).then(res => {
                if (res.code === 1) {
                    this[types.SET_CATER_ORDER_DETAIL]({ caterDetail: res.data });
                    this[types.SET_ORDER_DETAIL]({ orderDetail: res.data });
                    bus.$emit('setRestDetail', res.data);
                }
            });
        }, */
        getOpenBoardRecords(boardId) {
            http.get('board/getOpenBoardRecords', { boardId }).then(res => {
                if (res.code === 1) {
                    res.data.boardDetailResps = res.data.openBoards;
                    delete res.data.openBoards;
                    this[types.SET_CATER_ORDER_DETAIL]({ caterDetail: res.data });
                }
            });
        },
        startFetchDate() {
            if (!this.restId) {
                window.setTimeout(this.startFetchDate, 1000);
            } else {
                this.getSeatList();
            }
        },
        initScroll() {
            this.$refs.scrollerContainer.style.height = (window.innerHeight - 336) + 'px';
            this.scroll = new IScroll(this.$refs.scrollerContainer, { probeType: 3, mouseWheel: true, scrollbars: false });
        }
    },
    watch: {
        defaultStrDate(newValue, oldValue) {
            if (oldValue) {
                this[types.SET_DATE]({ date: newValue });
                this[types.SET_LEFT_TYPE]({ leftType: 0 });
                this[types.RESET_SELECT_DISH]();
            }
        },
        selectState() {
            this.getSeatList();
        },
        restId(newValue) {
            this.areasEmpty = true;
            this.areas = [];
            this.getSeatList();
        },
        date(newValue) {
            this.getSeatList();
        }
    },
    components: {
        customerRadio,
        DateSelect,
        contextmenu
    },
    beforeDestroy() {
        restBus.$off('refeshView', this.getSeatList);
    }
};
</script>

 <style lang="scss" scoped>
    .select-container{
        padding: 16px;
        box-shadow: 0 0 4px 4px rgba(0,0,0,0.1);
        position: relative;
        .time-select{
            .calendar-date-select{
                height: 30px;
                line-height: 30px;
            }
        }
        .area-select{
            display: flex;
            flex-wrap: wrap;
            width: 632px;
            margin-top: 12px;
            div{
                min-width: 72px;
                height: 30px;
                line-height: 30px;
                padding: 0 7px;
                border: 1px solid #ccc;
                text-align: center;
                color: #a3a3a3;
                margin: 4px 8px 4px 0;
                cursor: pointer;
                &.selected{
                    color: #178ce6;
                    border: 1px solid #178ce6;
                }
            }
        }
        .state-select{
            display: flex;
            margin-top: 12px;
            > div{
                margin-right: 10px;
            }
        }
        .order-menu{
            display: flex;
            width: 128px;
            position: absolute;
            top: 48px;
            right: 16px;
            > div{
                width: 56px;
                height: 56px;
                border-radius: 50%;
                color: #fff;
                line-height: 56px;
                text-align: center;
                cursor: pointer;
                &.order{
                    background: #f29130;
                    margin-right: 16px;
                }
                &.menu{
                    background: #178ce6;
                }
            }
        }
    }
    .area-container{
        margin-top: 24px;
        background: #f0f0f0;
        padding: 16px;
        h3{
            font-size: 24px;
            color: #178ce6;
            font-weight: bold;
        }
        .seats-container{
            display: flex;
            flex-wrap: wrap;
            margin-top: 12px;
            .seat{
                width: 88px;
                height: 88px;
                border-radius: 8px;
                box-shadow: 0 0 2px 0 rgba(0,0,0,0.3);
                margin: 4px;
                position: relative;
                cursor: pointer;
                &:nth-child(8n+1){
                    margin-left: 0;
                }
                &:nth-child(8n){
                    margin-right: 0;
                }
                .state-twoCode{
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 6px 0 0;
                    position: absolute;
                    width: 100%;
                    &.state-twoCode-right{
                        justify-content: flex-end;
                    }
                    .two-dimensionalcode{
                        width: 16px;
                        height: 16px;
                        background: url('../../../../../image/two-dimensionalcode.png');
                    }
                    .state{
                        width: 50px;
                        height: 16px;
                        line-height: 16px;
                        border-radius: 0 8px 8px 0;
                        background: #178ce6;
                        font-size: 12px;
                        padding-left: 8px;
                        color: #fff;
                        position: relative;
                        &.state-pending{
                            background: #f24949;
                        }
                    }
                }
                .seat-num{
                    position: absolute;
                    top: 29px;
                    width: 100%;
                    text-align: center;
                    font-size: 14px;
                    color: #333333;
                    opacity: 0.87;
                }
                .eating-time{
                    font-size: 12px;
                    color: #999999;
                    text-align: center;
                    opacity: 0.87;
                    position: absolute;
                    top: 47px;
                    width: 100%;
                }
                .reserve-time{
                    width: 58px;
                    height: 16px;
                    font-size: 12px;
                    color: #fff;
                    background: #ffba75;
                    text-align: center;
                    margin-left: 15px;
                    border-radius: 8px;
                    position: absolute;
                    top: 66px;
                }
                .order-list{
                    position: absolute;
                    top: 86px;
                    width: 341px;
                    box-shadow: 0 0 5px 0 rgba(0,0,0,0.15);
                    background: #fafafa;
                    z-index: 2;
                    display: none;
                    .rest-arrow-up{
                        position: absolute;
                        left: 20px;
                        top: -10px;
                        width: 0;
                        height: 0;
                        border-left: 10px solid transparent;
                        border-right: 10px solid transparent;
                        border-bottom: 10px solid #fafafa;
                        line-height: 0;
                    }
                    .order-list-item{
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        height: 30px;
                        line-height: 30px;
                        font-size: 12px;
                        .seat-state{
                            width: 40px;
                            height: 22px;
                            position: relative;
                            display: inline-flex;
                            justify-content: center;
                            align-items: center;
                            color: #fff;
                            &::before {
                                position: absolute;
                                content: '';
                                display: inline-block;
                                border-right: 12px solid;
                                border-top: 11px solid transparent;
                                border-bottom: 11px solid transparent;
                                border-left: 0;
                                left: -12px;
                            }
                            &.yellow {
                                background: #ffba75;
                                &::before {
                                    border-right-color: #ffba75;
                                }
                            }
                            &.blue {
                                background: #82beff;
                                &::before {
                                    border-right-color: #82beff;
                                }
                            }
                        }
                        &:nth-child(2){
                            color: #99a9bf;
                        }
                    }
                    .seat-name{
                        color: #475669;
                        font-weight: bold;
                        line-height: 30px;
                        padding: 0 8px;
                    }
                    .order-info{
                        border-top: 1px dashed #99a9bf;
                        padding: 0 8px;
                        cursor: pointer;
                        &:hover{
                            background: #e1effa;
                        }
                    }
                }
                &.select-table{
                    border: 2px solid #178ce6;
                }
                &:hover{
                    .order-list{
                        display: block;
                    }
                }
                &:nth-child(8n+6):hover {
                    .order-list{
                        left: -254px;
                        .rest-arrow-up{
                            position: absolute;
                            left: 300px;
                            top: -10px;
                            width: 0;
                            height: 0;
                            border-left: 10px solid transparent;
                            border-right: 10px solid transparent;
                            border-bottom: 10px solid #fafafa;
                            line-height: 0;
                        }
                    }
                }
                &:nth-child(8n+7):hover {
                    .order-list{
                        left: -254px;
                        .rest-arrow-up{
                            position: absolute;
                            left: 300px;
                            top: -10px;
                            width: 0;
                            height: 0;
                            border-left: 10px solid transparent;
                            border-right: 10px solid transparent;
                            border-bottom: 10px solid #fafafa;
                            line-height: 0;
                        }
                    }
                }
                &:nth-child(8n):hover {
                    .order-list{
                        left: -254px;
                        .rest-arrow-up{
                            position: absolute;
                            left: 300px;
                            top: -10px;
                            width: 0;
                            height: 0;
                            border-left: 10px solid transparent;
                            border-right: 10px solid transparent;
                            border-bottom: 10px solid #fafafa;
                            line-height: 0;
                        }
                    }
                }
                &.leisure{
                    background: #ffffff;
                }
                &.using{
                    background: #c6e5ff;
                }
                &.open-table{
                    background: #ffe6c6;
                }
            }
        }
        &:first-child{
            margin-top: 0;
        }
        
    }
    #context-menu{
        .rest-add-order{
            background: #fafafa;
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15);
            text-align: center;
            line-height: 32px;
            z-index: 1;
            cursor: pointer;
        }
    }
    .scroller-container{
        margin-top: 24px;
        position: absolute;
        z-index: 1;
        width: 792px;
        overflow: hidden;
        .scroller{
            position: absolute;
            z-index: 1;
            -webkit-tap-highlight-color: rgba(0,0,0,0);
            width: 100%;
            -webkit-transform: translateZ(0);
            -moz-transform: translateZ(0);
            -ms-transform: translateZ(0);
            -o-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-text-size-adjust: none;
            -moz-text-size-adjust: none;
            -ms-text-size-adjust: none;
            -o-text-size-adjust: none;
            text-size-adjust: none;
        }
    }
 </style>

