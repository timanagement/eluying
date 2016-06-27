/**
 * Created by lingchenxuan on 16/6/18.
 */

var Vue = require('vue');
var header = require("header");
var leftMenu = require("leftMenu");
var util = require("util");
var modal = require("modal");
var AJAXService = require('AJAXService');
var restaurantMenu = require('../restaurantMenu');
require("bootstrap");
require("validation");

var auth = require('../../../common/auth');
auth.checkAuth(auth.BUSINESS_ID);

$(function(){
    header.showHeader();
    leftMenu.showLeftMenu();
    restaurantMenu.render();
    util.mainContainer();
    modal.centerModals();
    events = {

        "resize window": util.mainContainer
        
    };

    util.bindDomAction(events);
    var restId = location.search.split('=')[1];
    var table = new Vue({
        el: '.restaurant-container',
        data: {
            boards: [],
            boardIdWillDeleted: undefined,
            restName: undefined
        },
        created: function() {
            this.getBoards();
            this.getRestaurants();
        },
        methods: {
            getBoards: function() {
                AJAXService.ajaxWithToken('GET', '/catering/getBoardListFromRestaurant', { restId: restId }, function(result) {
                    this.boards = result.data.list;
                }.bind(this));
            },
            getRestaurants: function() {
                AJAXService.ajaxWithToken('GET', '/catering/getRestaurantList', {}, function(result) {
                    this.restName = result.data.list.filter(function(el) {
                        return el.restId == restId;
                    })[0].restName;
                }.bind(this));
            },
            openCreateDialog: function() {
                boardDialog.status = 'create';
                $('#boardDialog').modal('show');
            },
            openEditDialog: function(board) {
                boardDialog.status = 'edit';
                boardDialog.boardName = board.boardName;
                boardDialog.boardId = board.boardId;
                boardDialog.seatNum = board.seatNum;
                $('#boardDialog').modal('show');
            },
            openDeleteDialog: function(id) {
                this.boardIdWillDeleted = id;
                modal.confirmDialog(
                    {
                        okText: '删除',
                        message: '删除桌子之后，不可找回。',
                        showTitle: false
                    },
                    this.deleteBoard.bind(this))
            },
            deleteBoard: function() {
                AJAXService.ajaxWithToken('GET',
                    '/catering/deleteBoardsForRestaurant',
                    { restId: restId, boardId: this.boardIdWillDeleted },
                    function(result) {
                        if (result.code === 1) {
                            modal.somethingAlert('删除成功');
                            this.getBoards();
                        } else {
                            modal.somethingAlert(result.msg);
                        }
                    }.bind(this));
            }
        }
    });

    var boardDialog = new Vue({
        el: '#boardDialog',
        data: {
            boardName: '',
            nameList: [],
            submitted: false,
            status: '',
            boardId: undefined,
            seatNum: ''
        },
        methods: {
            createBoard: function() {
                this.submitted = true;
                if ((this.boardName === '' && !this.nameList.length) || seatNum === '') {
                    return;
                }
                var nameList;
                var boardName = this.boardName;
                if (this.nameList.length) {
                    nameList = this.nameList.map(function(el) {
                        return boardName + el;
                    });
                } else {
                    nameList = [this.boardName];
                }
                AJAXService.ajaxWithToken('POST',
                    '/catering/addBoardsForRestaurant',
                    {
                        nameList: JSON.stringify(nameList),
                        restId: restId,
                        seatNum: this.seatNum
                    },
                    function (result) {
                        if (result.code === 1) {
                            this.cancel();
                            table.getBoards();
                        } else {
                            modal.somethingAlert(result.msg);
                        }
                    }.bind(this));
            },
            editBoard: function() {
                this.submitted = true;
                if (this.boardName === '' || seatNum === '') {
                    return;
                }
                AJAXService.ajaxWithToken('POST',
                    '/catering/modifyBoardsForRestaurant',
                    {
                        boardName: this.boardName,
                        restId: restId,
                        seatNum: this.seatNum,
                        boardId: this.boardId
                    },
                    function (result) {
                        if (result.code === 1) {
                            this.cancel();
                            table.getBoards();
                        } else {
                            modal.somethingAlert(result.msg);
                        }
                    }.bind(this));
            },
            addBoardNum: function() {
                var name;
                var length = this.nameList.length;
                if (length === 0) {
                    name = 1
                } else {
                    name = 1 + Number(this.nameList[length - 1]);
                }
                this.nameList.push(name);
            },
            closeBoardNum: function(index) {
                this.nameList.splice(index, 1);
            },
            cancel: function() {
                this.boardName = '';
                this.nameList = [];
                this.seatNum = '';
                this.submitted = false;
                $('#boardDialog').modal('hide');
            }
        }
    });

});