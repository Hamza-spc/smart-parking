const AxiosResponseIntrceptorErrorCallback = (error) => {
    /** Let errors propagate to the caller - do not redirect here.
     *  Route protection is handled by NextAuth middleware. */
}

export default AxiosResponseIntrceptorErrorCallback
