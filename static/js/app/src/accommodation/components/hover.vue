<template>
    <div class="calendar-glyph-detail ing down " :class='{hoverRight : overflow}'>
        <div class="glyph-arrow-up"></div>
        <!-- <div class="glyph-arrow-down"></div> -->
        <div v-for='(item, index) in date.eventList' class="glyph-detail" @click.stop='tadayClick(item)'>
            <div class="glyph-detail-content" :class="{'glyph-detail-box': index !== date.eventList.length - 1}">
                <div class="glyph-detail-name" v-if='item.type !== 1 && item.type !== 2 && item.type !== 3'>
                    <div>{{item.customerName}} ({{item.customerPhone}})</div>
                    <span class="checkType">{{getcheckType(item.checkType)}}</span>
                </div>
                <div class="glyph-detail-time">
                    <div class="start">{{item.startDate.slice(5,16)}}<span class="glyph-label">&nbsp;{{(item.type === 1 || item.type === 2 || item.type === 3) ? '开始': '到达' }}</span></div>
                    <div class="end">{{item.endDate.slice(5,16)}}<span class="glyph-label">&nbsp;{{(item.type === 1 || item.type === 2 || item.type === 3) ? '结束': '离开' }}</span></div>
                    <div class="glyph-label" v-if='!(item.type === 1 || item.type === 2 || item.type === 3)'>共<span>{{item.checkType === 1 ? getHAndMs(item.nights) : item.nights + '晚'}}</span></div>
                    <div class="glyph-label glyph-status" :style='{"background-color" : colorList[item.type]}' :date-type='item.type'>{{nameList[item.type]}}</div>
                </div>
                <div class="remark" v-if='!(item.type === 1 || item.type === 2 || item.type === 3)'>
                    <span class="glyph-label">备注：</span>{{item.remark}}
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.calendar-glyph-detail {
    padding: 10px 0;
}

.glyph-detail:hover {
    background-color: #e1effa;
}

.glyph-detail-content {
    margin: 0 8px;
}

.glyph-detail-box {
    border-bottom: 1px solid #e6e6e6
}

.glyph-status {
    padding: 3px 10px;
    color: #fff;
    border-radius: 2px;
    font-size: 12px;
    line-height: 12px;
    margin-top: 3px;
    height: 17px;
    width: 48px;
}

.checkType {
    font-size: 14px;
    color: #999999;
}

.calendar-glyph-detail {
    position: relative;
    width: 380px;
}

.hoverRight {
    left: -220px!important;
}

.hoverRight .glyph-arrow-up {
    left: 260px;
}
</style>
<script>
import bus from '../../common/eventBus';
import {
    colorList,
    nameList
} from '../colorList';
import {
    roomCheckType
} from '../../common/orderSystem/roomCheckType.js';
import { getHAndMs } from '../../common/util.js';
export default {
    props: {
        date: {
            default: {},
            type: Object
        },
        hoverShow: {
            default: undefined,
            type: MouseEvent
        }
    },
    data() {
        return {
            colorList,
            nameList,
            checkType: roomCheckType
        };
    },
    computed: {
        overflow() {
            if (this.hoverShow && this.date) {
                return window.document.body.clientWidth - this.hoverShow.x < 350;
            }
        }
    },
    watch: {

    },
    methods: {
        getHAndMs,
        getcheckType(type) {
            return this.checkType.find(function(el) {
                return el.id === type;
            }).name;
        },
        tadayClick(it) {
            const date = {
                checkOutDate: it.endDate,
                checkInDate: it.startDate,
                roomState: it.type,
                isArrival: false,
                roomName: this.date.roomName,
                roomId: this.date.roomId,
                roomNum: this.date.roomNum
            };
            if (it.type === 1 || it.type === 2 || it.type === 3) {
                date.logId = it.eventId;
            } else {
                if (it.roomOrderId) {
                    date.roomOrderId = it.roomOrderId;
                }
                date.orderId = it.eventId;
            }
            bus.$emit('tadayClick', date);
        }
    }
};
</script>
