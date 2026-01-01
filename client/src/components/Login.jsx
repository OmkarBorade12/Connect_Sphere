import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, onRegister }) {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const endpoint = isLoginView ? '/api/login' : '/api/register';

        // Auto-detect base URL (localhost:3001 if dev, or relative if served)
        const baseUrl = window.location.hostname === "localhost" && window.location.port === "5173"
            ? "http://localhost:3001"
            : "";

        try {
            const res = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                onLogin(data.username, data.token);
            } else {
                setError(data.error || "Authentication failed");
            }
        } catch (err) {
            setError("Network error. Is server running?");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="brand-logo">
                    <div className="logo-circle">CS</div>
                </div>
                <h1>ConnectSphere</h1>
                <p>{isLoginView ? 'Sign In to your account' : 'Create a new account'}</p>

                {error && <div className="error-msg" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">{isLoginView ? 'Sign In' : 'Sign Up'}</button>
                </form>

                <div className="toggle-view" style={{ marginTop: '15px', fontSize: '14px', cursor: 'pointer', color: '#6264A7' }}>
                    <span onClick={() => setIsLoginView(!isLoginView)}>
                        {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Login;
