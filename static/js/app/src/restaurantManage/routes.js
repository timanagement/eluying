/**
 * Created by lingchenxuan on 2017/3/20.
 */
import Router from 'vue-router';
import auth from '../common/auth';
import NoAuth from './components/no-auth.vue';
import book from './views/book/index.vue';
import destine from './views/book/destine.vue';
import estimate from './views/book/estimate.vue';
import order from './views/order/index.vue';
import orderList from './views/orderList/index.vue';
const hasAuth = auth.checkModule(auth.RESTRANT);
const hasCompanyAuth = auth.checkModule(auth.COMPANY_ID, auth.COMPANY_VIEW_ID);

export const routes = [
    {
        path: '/',
        redirect: '/order',
        meta: {
            // auth: hasAuth
        }
    },
    {
        path: '/book',
        component: book,
        meta: {
            name: '预订沽清',
            auth: hasAuth
            // invisible: true
        },
        redirect: '/book/destine',
        children: [
            {
                path: '/book/destine',
                component: destine,
                meta: {
                    auth: hasAuth,
                    name: '菜品预定列表'
                }
            },
            {
                path: '/book/estimate',
                component: estimate,
                meta: {
                    auth: hasAuth,
                    name: '菜品沽清列表'
                }
            }
        ]
    },
    {
        path: '/order',
        component: order,
        meta: {
            name: '桌位点餐',
            auth: hasAuth
        }
    },
    {
        path: '/orderList',
        component: orderList,
        meta: {
            name: '餐饮预订',
            auth: hasAuth
        }
    },
    {
        path: '/non-auth',
        component: NoAuth,
        meta: {
        }
    }
];

(function mapChildren(routes) {
    routes.map(route => {
        if (route.children) {
            route.meta.children = route.children;
            mapChildren(route.children);
        }
    });
})(routes);

const router = new Router({
    mode: 'history',
    scrollBehavior(to, from, savedPosition) {
        return savedPosition || { x: 0, y: 0 };
    },
    base: '/view/restaurantManage/',
    linkActiveClass: 'active',
    routes
});
router.beforeEach((to, from, next) => {
    if (!to.meta.auth) {
        router.push({ path: '/non-auth', query: { name: encodeURI(to.meta.name) }, params: { userId: 123 }, meta: { userid: 123 } });
        // next({path:'/non-auth', params: {name: '132'},meta: {name: '132'} })
    } else {
        next();
    }
});
exports.router = router;
