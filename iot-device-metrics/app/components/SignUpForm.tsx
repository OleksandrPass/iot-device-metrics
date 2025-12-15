'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { RegisterFormData } from '../types/auth';


const EXTERNAL_REGISTER_API = ' http://localhost:3000/api/users';

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
        <form onSubmit={handleSubmit(onSubmit)}>
            <h2>Register New Account</h2>


            <div>
                <label htmlFor="username">Username</label>
                <input id="username" type="text" {...register('username', { required: 'Username is required' })} />
                {errors.username && <p className="error-message">{errors.username.message}</p>}
            </div>

            <div>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" {...register('email', { required: 'Email is required' })} />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min length is 6' } })} />
                {errors.password && <p className="error-message">{errors.password.message}</p>}
            </div>

            {error && <p style={{color: 'red', marginTop: '10px'}}>{error}</p>}

            <button type="submit" disabled={isSubmitting} style={{ marginTop: '15px' }}>
                {isSubmitting ? 'Registering...' : 'Sign Up'}
            </button>
        </form>
    );
};

export default SignUpForm;