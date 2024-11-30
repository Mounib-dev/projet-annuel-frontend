import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/Auth.css';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Inscription réussie !');
            } else {
                alert('Erreur lors de l\'inscription.');
            }
        } catch (error) {
            console.error('Erreur réseau :', error);
        }
    };

    return (
        <div className="auth-container">
            <h2>Inscription</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="firstname"
                    placeholder="Prénom"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="lastname"
                    placeholder="Nom"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                />
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
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmer le mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                <button type="submit">S'inscrire</button>
            </form>
            <p>
                Déjà inscrit ? <Link to="/login">Connexion</Link>
            </p>
        </div>
    );
};

export default Register;
