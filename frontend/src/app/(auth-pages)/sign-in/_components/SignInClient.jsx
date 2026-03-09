'use client'
import SignIn from '@/components/auth/SignIn'
import { onSignInWithCredentials } from '@/server/actions/auth/handleSignIn'
import handleOauthSignIn from '@/server/actions/auth/handleOauthSignIn'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSearchParams } from 'next/navigation'

const SignInClient = () => {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get(REDIRECT_URL_KEY)

    const handleSignIn = async ({ values, setSubmitting, setMessage }) => {
        setSubmitting(true)

        try {
            // First call backend to get the JWT token
            const res = await fetch('/backend-api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })
            const json = await res.json()

            if (res.ok && json.success) {
                // Store token for axios interceptor
                localStorage.setItem('sp_token', json.data.token)
            }
        } catch {
            // Token storage failed, continue with NextAuth flow anyway
        }

        onSignInWithCredentials(values, callbackUrl || '').then((data) => {
            if (data?.error) {
                setMessage(data.error)
                setSubmitting(false)
            }
        })
    }

    const handleOAuthSignIn = async ({ type }) => {
        if (type === 'google') {
            await handleOauthSignIn('google')
        }
        if (type === 'github') {
            await handleOauthSignIn('github')
        }
    }

    return <SignIn onSignIn={handleSignIn} onOauthSignIn={handleOAuthSignIn} />
}

export default SignInClient
