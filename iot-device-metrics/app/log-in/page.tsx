import LoginForm from '../components/LogInForm';

const LoginPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-8">
            <h1 className="text-4xl font-bold mb-15">User Login</h1>
            <LoginForm />
        </div>
    );
};

export default LoginPage;