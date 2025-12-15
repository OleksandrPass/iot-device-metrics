import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

const EXTERNAL_LOGIN_API = ' http://localhost:3000/api/auth/login';

export async function POST(request: NextRequest) {

    const { email, password } = await request.json();

    const apiResponse = await fetch(EXTERNAL_LOGIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        return NextResponse.json(
            { message: errorData.message || 'Authentication failed' },
            { status: apiResponse.status }
        );
    }



    const authData = await apiResponse.json();
    const { token } = authData;

    const serializedCookie = serialize('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.headers.set('Set-Cookie', serializedCookie);

    return response;
}