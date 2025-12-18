'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { RegisterFormData } from '../types/auth';
import Link from 'next/link';


const EXTERNAL_REGISTER_API = 'https://vdds-iot.duckdns.org/api/users';

const SignUpForm: React.FC = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<RegisterFormData>();

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(EXTERNAL_REGISTER_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData: any = await response.json();
                throw new Error(errorData.message || 'Registration failed. Please check your inputs.');
            }

            setSuccess('Registration successful! You will be redirected to the login page.');

            setTimeout(() => {
                router.push('/log-in');
            }, 2000);

        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={"max-w-sm mx-auto"}>
            <div className="flex flex-col mb-4">
                <label htmlFor="username" className={"block mb-2.5 text-m font-medium text-heading"}>Username</label>
                <input
                    id="username"
                    type="text"
                    {...register('username', { required: 'Username is required' })}
                    className= " rounded-lg bg-neutral-secondary-medium border border-default-medium text-heading text-m rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5  placeholder:text-body" placeholder={"Alfred"} required
                />
                {errors.username && <p className="error-message">{errors.username.message}</p>}
            </div>

            <div className="flex flex-col mb-4">
                <label htmlFor="email" className={"block mb-2.5 text-m font-medium text-heading"}>Email</label>
                <input
                    id="email"
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className= " rounded-lg bg-neutral-secondary-medium border border-default-medium text-heading text-m rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5  placeholder:text-body" placeholder="name@example.com" required
                />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col mb-4">
                <label htmlFor="password" className={"block mb-2.5 text-m font-medium text-heading"}>Password</label>
                <input
                    id="password"
                    type="password"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min length is 6' } })}
                    className= " rounded-lg bg-neutral-secondary-medium border border-default-medium text-heading text-m rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5  placeholder:text-body"  required
                />
                {errors.password && <p className="error-message">{errors.password.message}</p>}
            </div>

            {error && <p className="api-error">{error}</p>}

            <div className={" flex gap-10"}>

                <button type="submit" disabled={isSubmitting} className="mt-10 mr-3 px-10 py-2 border border-gray-500 text-gray-700 font-semibold rounded-md
            shadow hover:bg-gray-200 transition">
                    {isSubmitting ? 'Registering...' : 'Sign Up'}
                </button>
                <Link href="/log-in" className="mt-10  mr-3 px-10 py-3 border border-gray-500 text-gray-700 font-semibold rounded-md
            shadow hover:bg-gray-200 transition">
                   Go to Log In
                </Link>

            </div>

        </form>
    );
};

export default SignUpForm;