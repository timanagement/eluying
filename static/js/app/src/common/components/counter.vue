/*
* @Author: lxj
* @Date:   2017-07-17 17:37:17
* @Last Modified by:   lxj
* @Last Modified time: 2017-08-15 14:02:29
* @email: 783384903@qq.com
*/
<template>
    <div class="counter-container" :class="{'notChange': disabled}">
        <span class="decrease-btn" :class="{'notChange': disabled}" @click="decreaseNum">-</span>
        <span class="value" v-text='value' v-if='step !== 1'></span>
        <input class="value" v-model='value' type='Number' @input='changeNum' v-else></input>
        <span class="increase-btn" :class="{'notChange': disabled}" @click="increaseNum">+</span>
        <slot></slot>
    </div>
</template>
<style lang="scss" rel="stylesheet/scss" type="text/css">
    .counter-container {
        font-size: 0;
        display: inline-block;
        .value {
            font-size: 14px;
            display: inline-block;
            text-align: center;
            width: 34px;
            height: 24px;
            line-height: 22px;
            border: none;
            outline: none;
            border-top: 1px solid #cccccc;
            border-bottom: 1px solid #cccccc;
        }
    }
    .decrease-btn, .increase-btn {
        font-size: 14px;
        display: inline-block;
        height: 24px;
        line-height: 22px;
        border: 1px solid #cccccc;
        padding: 0 4px;
        cursor: pointer;
    }
    .notChange {
        cursor: not-allowed !important;
        background: #cccccc;
    }
</style>
<script>
    export default{
        props: {
            del: {
                type: Boolean,
                default: false
            },
            step: {
                type: Number,
                default: 1
            },
            min: {
                type: Number,
                default: 1
            },
            max: {
                type: Number,
                default: 9999
            },
            num: {
                type: Number,
                default: 1
            },
            id: {
                type: Number,
                default: 0
            },
            type: {
                type: Number,
                default: 0
            },
            orderId: {
                type: Number,
                default: -1
            },
            disabled: {
                type: Boolean,
                default: false
            },
            onNumChange: Function
        },
        data() {
            return {
                value: this.num
            };
        },
        computed: {},
        methods: {
            decreaseNum() {
                if (this.disabled) {
                    return false;
                }
                if ((this.value <= this.min || this.value <= this.step) && !this.del) {
                    return false;
                }
                this.value -= this.step;
                if (this.orderId === -1) {
                    this.$emit('numChange', this.type, this.id, this.value / this.step);
                } else {
                    this.$emit('numChange', this.type, this.id, this.value / this.step, this.orderId);
                }
                if (this.onNumChange) {
                    const flag = this.onNumChange(this.type, this.id, this.value / this.step, this.orderId);
                    if (!flag) {
                        this.value += this.step;
                    }
                }
            },
            increaseNum() {
                if (this.disabled) {
                    return false;
                }
                if (this.value >= this.max) {
                    return;
                }
                this.value += this.step;
                if (this.orderId === -1) {
                    this.$emit('numChange', this.type, this.id, this.value / this.step);
                } else {
                    this.$emit('numChange', this.type, this.id, this.value / this.step, this.orderId);
                }
                if (this.onNumChange) {
                    const flag = this.onNumChange(this.type, this.id, this.value / this.step, this.orderId);
                    if (!flag) {
                        this.value -= this.step;
                    }
                }
            },
            changeNum() {
                window.console.log(this.value)
                if (!this.value || this.value == 0) {
                    this.value = 1;
                }
                if (this.value > this.max) {
                    this.value = this.max;
                }
                this.value = Math.abs(parseInt(this.value));
                if (this.orderId === -1) {
                    this.$emit('numChange', this.type, this.id, this.value);
                } else {
                    this.$emit('numChange', this.type, this.id, this.value, this.orderId);
                }
                if (this.onNumChange) {
                    const flag = this.onNumChange(this.type, this.id, this.value, this.orderId);
                    if (!flag) {
                    }
                }
            }
        },
        watch: {
            num(newVal) {
                this.value = newVal;
            },
            max(newVal) {
                if (this.value > newVal) {
                    this.value = newVal;
                }
            }
        }
    };
</script>
