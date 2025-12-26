import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const AuthGuard = ({ children }) => {
    const { user, login, logout, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
                </div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-2xl p-8 max-w-md w-full mx-4"
                >
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Sparkles size={32} className="text-yellow-400" />
                            <h1 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                Curious AI
                            </h1>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Sign in with Google to access your ambient intelligence assistant
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                login(credentialResponse.credential);
                            }}
                            onError={() => {
                                console.error('Login Failed');
                            }}
                            theme="filled_black"
                            size="large"
                            text="signin_with"
                            shape="rectangular"
                        />
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-6">
                        By signing in, you agree to use this service responsibly.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            {children}
            {/* User Profile Menu (Optional) */}
            <div className="fixed top-4 right-4 z-50">
                <div className="glass-panel rounded-full p-2 flex items-center gap-2">
                    {user.picture && (
                        <img
                            src={user.picture}
                            alt={user.name}
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <button
                        onClick={logout}
                        className="px-3 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default AuthGuard;
