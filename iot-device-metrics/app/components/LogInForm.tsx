'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { LoginFormData, UserResponse } from '../types/auth';
import Link from "next/link"; // Ensure UserResponse is imported

const EXTERNAL_LOGIN_API = 'http://51.103.231.79:3000/api/auth/login';

const LoginForm: React.FC = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { isSubmitting }
    } = useForm<LoginFormData>();

    const [error, setError] = useState<string | null>(null);

    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        setError(null);
        try {
            const response = await fetch(EXTERNAL_LOGIN_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData: any = await response.json();
                throw new Error(errorData.message || 'Login failed. Check credentials.');
            }

            const responseData: UserResponse = await response.json();
            const { token, user } = responseData;

            localStorage.setItem('authToken', token);
            localStorage.setItem('userId', user.id);

            localStorage.setItem('userEmail', user.email);

            router.push('./devices');

        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" {...register('email', { required: true })} />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" {...register('password', { required: true })} />
            </div>

            {error && <p style={{color: 'red'}}>{error}</p>}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{marginBottom: '10px'}}>Don't have an account?</p>
                <Link href="/sign-up" passHref style={{
                    display: 'block',
                    padding: '10px',
                    backgroundColor: '#ddd',
                    color: '#333',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                }}>
                    Go to Sign Up
                </Link>
            </div>
        </form>
    );
};

export default LoginForm;