import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Form, FormGroup, Input, FormActions } from '../Shared/Form';
import './Auth.css';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        onLoginSuccess && onLoginSuccess(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <Form onSubmit={handleSubmit} loading={loading}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <FormGroup label="Email Address" required>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </FormGroup>

          <FormGroup label="Password" required>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </FormGroup>

          <FormActions>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </FormActions>
        </Form>

        <div className="auth-footer">
          <p>Demo credentials:</p>
          <p><strong>Admin:</strong> admin@example.com / password</p>
          <p><strong>User:</strong> user@example.com / password</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
