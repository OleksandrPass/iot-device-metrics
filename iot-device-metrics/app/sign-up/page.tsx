import SignUpForm from '../components/SignUpForm';
import Link from "next/link";

export default function SignUpPage() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Create an Account</h1>
            <SignUpForm />

        </div>
    );
}