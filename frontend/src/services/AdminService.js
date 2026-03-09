import ApiService from './ApiService'

export async function apiGetDashboard() {
    return ApiService.fetchDataWithAxios({
        url: '/admin/dashboard',
        method: 'get',
    })
}

export async function apiGetAllUsers() {
    return ApiService.fetchDataWithAxios({
        url: '/admin/users',
        method: 'get',
    })
}

export async function apiGetAllReservations() {
    return ApiService.fetchDataWithAxios({
        url: '/admin/reservations',
        method: 'get',
    })
}

export async function apiGetAllPayments() {
    return ApiService.fetchDataWithAxios({
        url: '/admin/payments',
        method: 'get',
    })
}

