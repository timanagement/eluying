<template>
    <div>
        <OBJECT ID="ieIdc"
                CLASSID="clsid:63CAB467-5BB8-4CB2-8C87-C8F3B66040C0"
                WIDTH="0" HEIGHT="0" style="float:left;width:0px; height:0px; padding:0px; margin:0px"
        >
            <embed id="myIdc"
                   TYPE="application/x-itst-activex"
                   style="float:left;width:20px; height:20px; visibility: hidden"
                   clsid="{63CAB467-5BB8-4CB2-8C87-C8F3B66040C0}"
                   event_OnStatus="onStatus"
                   event_OnMessage="onMessage"
            >
        </OBJECT>
        <order-editor
                :order-editor-visible="orderEditorVisible"
                :check-state="checkState"
                :categories="roomCategory"
                :hidePreStep="noBack"
        ></order-editor>
        <order-detail
                :id="detailId"
                :type="detailType"
                :visible="detailVisible"
        ></order-detail>
        <Check-Out-Modal
        ></Check-Out-Modal>
        <Check-In-Modal
        ></Check-In-Modal>
        <Cashier-Modal
                :show="cashierShow"
                :type="cashierType"
                :business="cashierBusiness"
        ></Cashier-Modal>
        <Cancel-Order-Modal
                :show="cancelOrderShow"
        ></Cancel-Order-Modal>
        <Get-Money-With-Code
                :show="getMoneyShow"
                :type="getMoneyType"
                :business="getMoneyBusiness"
                :params="getMoneyParams"
                :total-price="payWithAlipay"
        ></Get-Money-With-Code>
        <order-menu-modal :visible="orderMenuVisible" :restOrder="restOrder"></order-menu-modal>
        <change-seat-modal :visible="changeSeatVisible" :restOrder="restOrder"></change-seat-modal>
        <handlePoint v-if="handlePoint" :caterOrderId="caterOrderId" :restId="restId" @closeHandlePoint="() => {this.handlePoint = false;}"/>
        <automaticPoint v-if="automaticPoint" @closeAutomaticPoint="() => {this.automaticPoint = false;}" :caterOrderId="caterOrderId" :restId="restId" :operationId="operationId"/>
    </div>
</template>
<style>
    .js-order-num {
        color: #178ce6;
        cursor: pointer;
    }
</style>
<script>
    import OrderDetail from './Detail/OrderDetail.vue';
    import OrderEditor from './OrderEditor/OrderEditor.vue';
    import CheckInModal from './CheckInModal.vue';
    import CheckOutModal from './CheckOutModal.vue';
    import CancelOrderModal from './CancelOrderModal.vue';
    // import CashierModal from './CashierModal.vue';
    import CashierModal from './newCashModal.vue';
    import GetMoneyWithCode from './GetMoneyWithCode.vue';
    import orderMenuModal from './orderMenu.vue';
    import changeSeatModal from './changeSeat.vue';
    import handlePoint from '../../../restaurantManage/components/handlePoint.vue';
    import automaticPoint from '../../../restaurantManage/components/automaticPoint.vue';
    import bus from '../../eventBus';
    import http from '../../http';
    import { mapMutations } from 'vuex';
    import types from '../store/types';

    export default {
        components: {
            OrderDetail,
            OrderEditor,
            CheckInModal,
            CheckOutModal,
            CancelOrderModal,
            CashierModal,
            GetMoneyWithCode,
            orderMenuModal,
            changeSeatModal,
            handlePoint,
            automaticPoint
        },
        data() {
            return {
                orderDetailShow: false,
                orderEditorVisible: false,
                orderId: undefined,
                orderDetail: {},
                checkState: undefined,
                registerRooms: [],
                cashierType: '',
                cashierShow: false,
                cancelOrderShow: false,
                getMoneyShow: false,
                getMoneyType: '',
                getMoneyBusiness: {},
                getMoneyParams: {},
                payWithAlipay: 0,
                cashierBusiness: {},
                detailType: undefined,
                detailId: undefined,
                detailVisible: false,
                roomCategory: [], // 订单编辑中使用
                bacnHandel: [],
                noBack: true,
                caterOrderId: Number,
                restId: Number,
                operationId: Number,
                orderMenuVisible: false,
                restOrder: undefined,
                changeSeatVisible: false,
                handlePoint: false,
                automaticPoint: false
            };
        },
        created() {
            bus.$on('changeBack', this.changeBack);
            bus.$on('setRestDetail', this.setRestDetail);
            bus.$on('back', this.back);
            bus.$on('onClose', this.hideDetail);
            bus.$on('onShowDetail', this.showOrderDetail);
            bus.$on('onHandlePoint', this.showHandlePoint);
            bus.$on('onAutomaticPoint', this.showAutomaticPoint);
            bus.$on('editOrder', this.editOrder);
            bus.$on('hideOrderEditor', this.hideOrderEditor);
            bus.$on('showCashier', this.showCashier);
            bus.$on('hideCashier', this.hideCashier);
            bus.$on('showGetMoney', this.showGetMoney);
            bus.$on('hideGetMoney', this.hideGetMoney);
            bus.$on('hideCancelOrder', this.hideCancelOrder);
            bus.$on('showCancelOrder', this.showCancelOrder);
            bus.$on('changeCheckState', this.changeCheckState);
            bus.$on('showOrderMenu', this.showOrderMenu);
            bus.$on('hideOrderMenu', this.hideOrderMenu);
            bus.$on('showChangeSeat', this.showChangeSeat);
            bus.$on('hideChangeSeat', this.hideChangeSeat);
            this.getRoomsList();
            document.addEventListener('click', this.handleOrderNumClick);
        },
        beforeDestroy: function() {
            bus.$off('changeBack', this.changeBack);
            bus.$off('setRestDetail', this.setRestDetail);
            bus.$off('back', this.back);
            bus.$off('onClose', this.hideDetail);
            bus.$off('onShowDetail', this.showOrderDetail);
            bus.$off('editOrder', this.editOrder);
            bus.$off('hideOrderEditor', this.hideOrderEditor);
            bus.$off('showCashier', this.showCashier);
            bus.$off('hideCashier', this.hideCashier);
            bus.$off('showGetMoney', this.showGetMoney);
            bus.$off('hideGetMoney', this.hideGetMoney);
            bus.$off('hideCancelOrder', this.hideCancelOrder);
            bus.$off('showCancelOrder', this.showCancelOrder);
            bus.$off('changeCheckState', this.changeCheckState);
            bus.$off('showOrderMenu', this.showOrderMenu);
            bus.$off('hideOrderMenu', this.hideOrderMenu);
            bus.$off('showChangeSeat', this.showChangeSeat);
            bus.$off('hideChangeSeat', this.hideChangeSeat);
            document.removeEventListener('click', this.handleOrderNumClick);
        },
        methods: {
            ...mapMutations([types.SET_ORDER_DETAIL]),
            changeBack(handel, that) {
                this.bacnHandel.unshift(handel);
                if (this.bacnHandel.length > 10) {
                    this.bacnHandel.splice(10, 1);
                }
            },
            back() {
                if (this.bacnHandel.length) {
                    this.bacnHandel.shift()();
                }
            },
            setRestDetail(orderDetail) {
                this[types.SET_ORDER_DETAIL]({ orderDetail });
            },
            handleOrderNumClick(ev) {
                const el = ev.target;
                if (!el.classList.contains('js-order-num')) {
                    return;
                }
                http.get('/order/getOrderTypeAndId', { serialNum: el.innerHTML })
                    .then(res => {
                        bus.$emit('onShowDetail', {
                            type: res.data.orderType,
                            orderId: res.data.orderId
                        });
                    });
            },
            getRoomsList() {
                return http.get('/room/getRoomsList', {})
                    .then(res => {
                        this.roomCategory = res.data.list;
                    });
            },
            showOrderDetail(order) {
                if (order) {
                    this.detailType = order.type;
                    this.detailId = order.orderId;
                    this.detailVisible = true;
                } else {
                    this.detailVisible = true;
                }
                this.noBack = true;
            },
            showHandlePoint(order) {
                this.caterOrderId = order.caterOrderId;
                this.restId = order.restId;
                this.handlePoint = true;
            },
            showAutomaticPoint(order) {
                this.restId = order.restId;
                this.caterOrderId = order.orderId;
                this.operationId = -1;
                this.automaticPoint = true;
            },
            hideDetail() {
                this.detailId = undefined;
                this.detailVisible = false;
            },
            changeCheckState(type, rooms) {
                this[types.SET_ORDER_DETAIL]({ orderDetail: {} });
                this.checkState = type;
                this.registerRooms = rooms;
                this.orderEditorVisible = true;
                this.$nextTick(function() {
                    bus.$emit('register', rooms);
                });
            },
            editOrder(type, order, noBack) {
                this.checkState = type;
                this.orderEditorVisible = true;
                this.orderDetail = order;
                if (noBack === 'hidePreStep') {
                    this.noBack = false;
                }
            },
            showCashier({ type, business }) {
                this.cashierType = type;
                this.cashierBusiness = business;
                this.cashierShow = true;
            },
            hideCashier() {
                this.cashierShow = false;
            },
            showGetMoney({ type, business, params, payWithAlipay }) {
                this.getMoneyType = type;
                this.getMoneyBusiness = business;
                this.getMoneyParams = params;
                this.payWithAlipay = payWithAlipay;
                this.getMoneyShow = true;
            },
            showOrderMenu(restOrder) {
                this.orderMenuVisible = true;
                this.restOrder = restOrder;
            },
            showChangeSeat(restOrder) {
                this.changeSeatVisible = true;
                this.restOrder = restOrder;
            },
            hideGetMoney() {
                this.getMoneyShow = false;
            },
            showCancelOrder() {
                this.cancelOrderShow = true;
            },
            hideCancelOrder() {
                this.cancelOrderShow = false;
            },
            hideOrderEditor() {
                this.orderEditorVisible = false;
            },
            hideOrderMenu() {
                this.orderMenuVisible = false;
            },
            hideChangeSeat() {
                this.changeSeatVisible = false;
            }
        }
    };
</script>
