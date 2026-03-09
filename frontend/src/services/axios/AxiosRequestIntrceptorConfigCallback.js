const AxiosRequestIntrceptorConfigCallback = (config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('sp_token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
    }
    return config
}

export default AxiosRequestIntrceptorConfigCallback
