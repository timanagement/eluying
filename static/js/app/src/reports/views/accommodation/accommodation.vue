<template>
    <div>
        <div style="margin: 20px 0;">
            <p><i>订单金额拆分到每日订单，统计每日产生的消费金额，</i></p>
            <p><i>包括已预订、进行中、已结束订单的订单金额，以及已取消订单的违约金。</i></p>
        </div>
        <div style="display: flex">
            <div class="card"
                 style="width: 204px;height: 420px; margin-right: 20px; display: flex;justify-content: space-around;flex-direction: column">
                <div>
                    <p>
                        <small><i>房费</i></small>
                    </p>
                    <h4>¥{{roomFee}}</h4>
                    <p>
                        <small><i>消费金额：¥{{consumeAmount}}</i></small>
                    </p>
                    <p>
                        <small><i>违约金：¥{{penalty}}</i></small>
                    </p>
                    <p>
                        <small><i>其他消费：¥{{extraConsume}}</i></small>
                    </p>
                </div>
                <div>
                    <p>
                        <small>间夜量</small>
                    </p>
                    <h4>{{roomNights}}</h4>
                </div>
                <div>
                    <p>
                        <small>平均房价</small>
                    </p>
                    <h4>¥{{avgPrice}}</h4>
                </div>
                <div>
                    <p>
                        <small>平均入住率</small>
                    </p>
                    <h4 v-if="occupancyRate !== 'undefined'">{{(occupancyRate * 100).toFixed(2)}}%</h4>
                </div>
            </div>
            <div class="card" style="flex: 1">
                <h5 class="card-title"><b>住宿运营分析</b></h5>
                <div id="line" style="width: 100%;height:352px"></div>
            </div>
        </div>
        <div style="margin: 20px 0 10px;display: flex;justify-content: space-between">
            <p>房间消费明细
                <small><i>({{date.startDate}}~{{date.endDate}})</i></small>
            </p>
            <a :href="exportUrl" download><button class="dd-btn dd-btn-primary">导出Excel</button></a>
        </div>
        <div>
            <dd-Table :columns="columns" :data-source="dataSource" :bordered="true" size="small"></dd-Table>
        </div>
    </div>
</template>
<style>
</style>
<script>
    import { mapState } from 'vuex';
    import http from '../../../common/http';
    import { getTableData } from '../../utils/tableHelper';
    import { DdTable } from 'dd-vue-component';
    import { setLine } from '../../utils/chartHelper';
    export default{
        data() {
            return {
                avgPrice: undefined,
                occupancyRate: undefined,
                penalty: undefined,
                roomFee: undefined,
                roomNights: undefined,
                consumeAmount: undefined,
                columns: [],
                dataSource: [],
                extraConsume: undefined
            };
        },
        components: {
            DdTable
        },
        computed: {
            ...mapState(['date']),
            exportUrl() {
                const paramsObj = {
                    exportType: 0,
                    reportType: 2,
                    params: JSON.stringify({
                        startDate: this.date.startDate,
                        endDate: this.date.endDate
                    })
                };
                const host = http.getUrl('/stat/exportReport');
                const pa = http.getDataWithToken(paramsObj);
                pa.params = JSON.parse(pa.params);
                const params = http.paramsToString(pa);
                return `${host}?${params}`;
            }
        },
        watch: {
            date() {
                this.getRoomStatistics();
            }
        },
        created() {
            this.getRoomStatistics();
        },
        methods: {
            getRoomStatistics() {
                http.get('/stat/getRoomStatistics', {
                    startDate: this.date.startDate,
                    endDate: this.date.endDate
                }).then(res => {
                    const data = res.data;
                    setLine([
                        {
                            name: '房费(元)',
                            type: 'line',
                            data: data.roomFee.map(i => i.value)
                        },
                        {
                            name: '间夜量(间夜)',
                            type: 'line',
                            data: data.roomNights.map(i => i.value)
                        },
                        {
                            name: '入住率(％)',
                            type: 'line',
                            data: data.occupancyRate.map(i => i.value * 100)
                        },
                        {
                            name: '平均房价(元)',
                            type: 'line',
                            data: data.avgPrice.map(i => i.value)
                        }
                    ],
                        data.avgPrice.map(i => i.date.substr(5, 5)),
                    '',
                    'line',
                    'single');
                    this.avgPrice = res.data.summary.avgPrice;
                    this.occupancyRate = res.data.summary.occupancyRate;
                    this.penalty = res.data.summary.penalty;
                    this.roomFee = res.data.summary.roomFee;
                    this.consumeAmount = res.data.summary.consumeAmount;
                    this.roomNights = res.data.summary.roomNights;
                    this.extraConsume = res.data.summary.extraConsume;
                    const penalty = {
                        name: '违约金',
                        dateValues: res.data.penaltys
                    };
                    res.data.roomFeeDetail.push(penalty);
                    const concatData = res.data.roomFeeDetail.concat(res.data.extraConsumes);
                    const tableData = getTableData({
                        list: concatData,
                        firstTitle: '房间名称',
                        secondTitle: '合计',
                        foot: true
                    });
                    this.dataSource = tableData.dataSource;
                    this.columns = tableData.columns;
                });
            }
        }
    };
</script>
