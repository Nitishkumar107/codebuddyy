// app/auth/error/page.tsx
export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
            <p className="mb-4">There was an error during authentication.</p>
            <a href="/auth/sign-in" className="text-blue-500 hover:underline">
            Try again
            </a>
        </div>
        </div>
    );
}