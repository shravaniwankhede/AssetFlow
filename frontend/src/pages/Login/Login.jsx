import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import './Login.css';

// Validation schemas
const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const signupSchema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  
  const { login, signup } = useAssetFlow();
  const navigate = useNavigate();

  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors } } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const { register: registerSignup, handleSubmit: handleSubmitSignup, formState: { errors: signupErrors } } = useForm({
    resolver: yupResolver(signupSchema)
  });

  const onLoginSubmit = (data) => {
    const res = login(data.email, data.password);
    if (res.success) {
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/dashboard');
    } else {
      toast.error(res.message || 'Login failed');
    }
  };

  const onSignupSubmit = (data) => {
    const res = signup(data.name, data.email, data.password);
    if (res.success) {
      toast.success('Account created successfully! Please sign in.');
      setIsSignUp(false);
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }
    toast.success(`Password reset link sent to ${forgotEmail}`);
    setForgotPassword(false);
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-logo">
          <div className="login-logo-circle">AF</div>
          <h2 className="login-title">AssetFlow</h2>
          <p className="login-subtitle">Enterprise Asset & Resource Management</p>
        </div>

        {forgotPassword ? (
          <form className="login-form" onSubmit={handleForgotPassword}>
            <h3 className="form-title">Forgot Password</h3>
            <p className="form-desc">Enter your email address and we'll send you a link to reset your password.</p>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="name@company.com" 
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary login-btn">Send Reset Link</button>
            
            <button 
              type="button" 
              className="back-btn" 
              onClick={() => setForgotPassword(false)}
            >
              Back to Sign In
            </button>
          </form>
        ) : isSignUp ? (
          <form className="login-form" onSubmit={handleSubmitSignup(onSignupSubmit)}>
            <h3 className="form-title">Create Account</h3>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className={`form-input ${signupErrors.name ? 'input-error' : ''}`}
                placeholder="John Doe" 
                {...registerSignup('name')}
              />
              {signupErrors.name && <span className="form-error">{signupErrors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className={`form-input ${signupErrors.email ? 'input-error' : ''}`}
                placeholder="name@company.com" 
                {...registerSignup('email')}
              />
              {signupErrors.email && <span className="form-error">{signupErrors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className={`form-input ${signupErrors.password ? 'input-error' : ''}`}
                placeholder="••••••••••••" 
                {...registerSignup('password')}
              />
              {signupErrors.password && <span className="form-error">{signupErrors.password.message}</span>}
            </div>

            <div className="signup-notice">
              <span>Sign up creates an employee account. Admin roles can be assigned by system administrator later.</span>
            </div>

            <button type="submit" className="btn btn-primary login-btn">Create Account</button>

            <div className="toggle-form-link">
              Already have an account?{' '}
              <button type="button" onClick={() => setIsSignUp(false)}>
                Sign In
              </button>
            </div>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleSubmitLogin(onLoginSubmit)}>
            <h3 className="form-title">Sign In</h3>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className={`form-input ${loginErrors.email ? 'input-error' : ''}`}
                placeholder="name@company.com" 
                {...registerLogin('email')}
              />
              {loginErrors.email && <span className="form-error">{loginErrors.email.message}</span>}
            </div>

            <div className="form-group">
              <div className="label-row">
                <label className="form-label">Password</label>
                <button 
                  type="button" 
                  className="forgot-link" 
                  onClick={() => setForgotPassword(true)}
                >
                  Forgot password
                </button>
              </div>
              <input 
                type="password" 
                className={`form-input ${loginErrors.password ? 'input-error' : ''}`}
                placeholder="••••••••••••" 
                {...registerLogin('password')}
              />
              {loginErrors.password && <span className="form-error">{loginErrors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary login-btn">Sign In</button>

            <div className="toggle-form-link">
              New here?{' '}
              <button type="button" onClick={() => setIsSignUp(true)}>
                Create Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
