'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { RegisterFormData } from '../types/auth';
import Link from 'next/link';


const EXTERNAL_REGISTER_API = 'http://51.103.231.79:3000/api/users';

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

            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    {...register('username', { required: 'Username is required' })}
                    className="form-input"
                />
                {errors.username && <p className="error-message">{errors.username.message}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="form-input"
                />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min length is 6' } })}
                    className="form-input"
                />
                {errors.password && <p className="error-message">{errors.password.message}</p>}
            </div>

            {error && <p className="api-error">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="form-button">
                {isSubmitting ? 'Registering...' : 'Sign Up'}
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{marginBottom: '10px'}}>Already have an account?</p>
                <Link href="/log-in" passHref style={{
                    display: 'block',
                    padding: '10px',
                    backgroundColor: '#aeaeb3',
                    color: '#333',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                }}>
                    Go to Log In
                </Link>
            </div>
        </form>
    );
};

export default SignUpForm;