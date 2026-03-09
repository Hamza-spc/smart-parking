import authRoute from './authRoute'

export const protectedRoutes = {
    '/home': {
        key: 'home',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/parkings': {
        key: 'parkings',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/parking-map': {
        key: 'parkingMap',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'gutterless',
        },
    },
    '/parkings/[id]': {
        key: 'parkingDetail',
        authority: [],
        dynamicRoute: true,
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/my-reservations': {
        key: 'myReservations',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/my-payments': {
        key: 'myPayments',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/dashboard': {
        key: 'adminDashboard',
        authority: ['admin'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/users': {
        key: 'adminUsers',
        authority: ['admin'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/reservations': {
        key: 'adminReservations',
        authority: ['admin'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/admin/payments': {
        key: 'adminPayments',
        authority: ['admin'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
}

export const publicRoutes = {}

export const authRoutes = authRoute
