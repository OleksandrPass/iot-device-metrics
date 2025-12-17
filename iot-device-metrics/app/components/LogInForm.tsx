'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { LoginFormData, UserResponse } from '../types/auth';
import Link from "next/link";

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
            localStorage.setItem('username', user.username);

            localStorage.setItem('userEmail', user.email);

            router.push('./devices');

        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col mb-4">
                <label htmlFor="email" className={"block mb-2.5 text-m font-medium text-heading"}>Email</label>
                <input id="email" type="email" {...register('email')} className= " rounded-lg bg-neutral-secondary-medium border border-default-medium text-heading text-m rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5  placeholder:text-body" placeholder="name@example.com" required/>
            </div>
            <div className="flex flex-col mb-4">
                <label htmlFor="password" className={"block mb-2.5 text-m font-medium text-heading"}>Password</label>
                <input id="password" type="password" {...register('password')} className= " rounded-lg bg-neutral-secondary-medium border border-default-medium text-heading text-m rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5  placeholder:text-body"  required/>
            </div>

            {error && <p style={{color: 'red'}}>{error}</p>}




            <div>

                <button type="submit" disabled={isSubmitting} className="mt-10 mr-3 px-10 py-2 border border-gray-500 text-gray-700 font-semibold rounded-md
            shadow hover:bg-gray-200 transition">
                    {isSubmitting ? 'Logging in...' : 'Log In'}
                </button>

                <Link href="/sign-up" className="mt-10 mr-3 px-10 py-2 border border-gray-500 text-gray-700 font-semibold rounded-md
            shadow hover:bg-gray-200 transition">
                    Go to Sign Up
                </Link>
            </div>
        </form>
    );
};

export default LoginForm;