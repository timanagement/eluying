<template>
    <div>
        <div class="modal fade" id="classifyModal" role="dialog" data-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="classify-modal-header">
                        <h4 v-if="!classifyProps.goodsTypeId">新增分类</h4>
                        <h4 v-if="classifyProps.goodsTypeId">修改分类</h4>
                    </div>
                    <div class="classify-modal-body">
                        <div style="position: relative;">
                            <span style="margin-right: 8px;">分类名称：</span><input type="text" class="dd-input" style="width: 210px;" v-model="classify.name" maxlength="10" @input="validate">
                            <span style="position:absolute;left:80px;top:23px;font-size: 12px;color: #f24949;" v-if="nameIsWrite && classify.name.length === 0">必填</span>
                            <span style="position:absolute;left:80px;top:23px;font-size: 12px;color: #f24949;" v-if="errorAlert">格式错误</span>
                        </div>
                    </div>
                    <div class="classify-modal-footer">
                        <button class="dd-btn dd-btn-primary" style="margin: 0 20px 0 78px;" @click="addClassify">确定</button>
                        <button class="dd-btn dd-btn-ghost" data-dismiss="modal">取消</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import http from '../../../common/http';

    export default {
        props: {
            classifyProps: Object
        },
        data() {
            return {
                classify: {},
                nameReg: /[\w\u4e00-\u9fa5]/,
                nameIsWrite: false,
                errorAlert: false
            }
        },
        methods: {
            addClassify() {
                if (this.errorAlert || this.classify.name === '') {
                    if (this.classify.name === '') {
                        this.nameIsWrite = true;
                    }
                    return false;
                }
                
                let url = this.classify.goodsTypeId ? '/goods/editOtherGoodsType' : '/goods/addOtherGoodsType';
                http.get(url, this.classify).then(res => {
                    if (res.code === 1) {
                        $('#classifyModal').modal('hide');
                        this.$emit('onSuccess');
                    }
                });
            },
            validate() {
                if (this.classify.name === '') {
                    this.errorAlert = false;
                }
                this.classify.name.split('').forEach((element) => {
                    if (!this.nameReg.test(element)) {
                        this.errorAlert = true;
                    } else {
                        this.errorAlert = false;
                    }
                });
            }
        },
        watch: {
            classifyProps(val) {
                this.classify = { ...val };
            }
        }
    }
</script>

<style lang="scss" rel="stylesheet/scss">
    .modal-content{
        .classify-modal-header{
            height: 30px;
            line-height: 30px;
            font-size: 16px;
            color: #178ce6;
        }
        .classify-modal-body{
            margin-bottom: 20px;
        }
        .classify-modal-footer{
            button{
                min-width: 50px;
            }
        }
        
    }
</style>
