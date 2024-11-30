import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/Auth.css';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Connexion réussie !', data);
                localStorage.setItem('token', data.token);
            } else {
                alert('Erreur lors de la connexion.');
            }
        } catch (error) {
            console.error('Erreur réseau :', error);
        }
    };

    return (
        <div className="auth-container">
            <h2>Connexion</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Se connecter</button>
            </form>
            <p>
                Pas encore inscrit ? <Link to="/register">Inscription</Link>
            </p>
        </div>
    );
};

export default Login;
