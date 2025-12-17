import SignUpForm from '../components/SignUpForm';

export default function SignUpPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-8">
            <h1 className="text-4xl font-bold mb-15">Create an Account</h1>
            <SignUpForm />

        </div>
    );
}