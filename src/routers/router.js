import Vue from 'vue'
import Router from 'vue-router'

import index from '../pages/index/index.vue';
import dyt from '../pages/dyt/dyt.vue';
import thy from '../pages/dyt/thy.vue';
Vue.use(Router);

const routers = [
    {
        path: '/',
        redirect: '/index',
        component: index,
        meta: {requiresAuth: false}
    },
    {
        path: '/index',
        name: 'index',
        component: index,
        meta: { requiresAuth: false },
    },
    {
        path: '/dyt',
        name: 'dyt',
        component: dyt,
        meta: { requiresAuth: false },
    },
    {
        path: '/thy',
        name: 'thy',
        component: thy,
        meta: { requiresAuth: false },
    },
];
const router = new Router({
    mode: 'history',
    routers,
});

export default router;