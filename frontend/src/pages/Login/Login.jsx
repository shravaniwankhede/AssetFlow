import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, HelpCircle, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import './Login.css';

// Validation schemas
const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const signupSchema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  
  const { login, signup } = useAssetFlow();
  const navigate = useNavigate();

  // Track responsive screen size changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors }, reset: resetLogin } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const { register: registerSignup, handleSubmit: handleSubmitSignup, formState: { errors: signupErrors }, reset: resetSignup } = useForm({
    resolver: yupResolver(signupSchema)
  });

  const onLoginSubmit = async (data) => {
    const res = await login(data.email, data.password);
    if (res.success) {
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/dashboard');
    } else {
      toast.error(res.message || 'Login failed');
    }
  };

  const onSignupSubmit = async (data) => {
    const res = await signup(data.name, data.email, data.password);
    if (res.success) {
      toast.success('Account created successfully! Please sign in.');
      setIsSignUp(false);
      resetSignup();
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
    setForgotEmail('');
  };

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const formAnimationVariants = {
    hidden: { opacity: 0, x: isSignUp ? -30 : 30 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, staggerChildren: 0.08, delayChildren: 0.1 } }
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 25 } }
  };

  const blobVariants = {
    animate: {
      x: [0, 30, -20, 0],
      y: [0, -40, 20, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  };

  return (
    <div className="login-page">
      {/* Subtle Animated Background Blobs */}
      <motion.div className="bg-blob blob-1" variants={blobVariants} animate="animate" />
      <motion.div className="bg-blob blob-2" variants={blobVariants} animate="animate" />

      {/* Main Authenticated Sliding Card */}
      <motion.div 
        className="auth-container-card"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ==================== ILLUSTRATION PANEL ==================== */}
        <motion.div 
          className="auth-illustration-side"
          animate={{ x: isMobile ? 0 : (isSignUp ? '100%' : '0%') }}
          transition={{ type: 'spring', stiffness: 180, damping: 24, mass: 0.8 }}
        >
          <div className="illustration-inner">
            <div className="illustration-branding">
              <div className="brand-circle">AF</div>
              <h1 className="brand-name">AssetFlow</h1>
            </div>

            {/* Abstract Node/Grid Graphics in Background */}
            <div className="illustration-vector-graphics">
              <div className="grid-line grid-line-h" style={{ top: '25%' }} />
              <div className="grid-line grid-line-h" style={{ top: '50%' }} />
              <div className="grid-line grid-line-h" style={{ top: '75%' }} />
              <div className="grid-line grid-line-v" style={{ left: '25%' }} />
              <div className="grid-line grid-line-v" style={{ left: '50%' }} />
              <div className="grid-line grid-line-v" style={{ left: '75%' }} />
              
              <div className="node-dot" style={{ top: '25%', left: '50%' }} />
              <div className="node-dot" style={{ top: '50%', left: '25%' }} />
              <div className="node-dot" style={{ top: '75%', left: '75%' }} />
              
              <div className="node-pulse" style={{ top: '48%', left: '23%', width: '40px', height: '40px' }} />
              <div className="node-pulse" style={{ top: '23%', left: '48%', width: '50px', height: '50px' }} />
            </div>

            <div className="illustration-text-content">
              <h2 className="illustration-title">Enterprise Asset & Resource Management</h2>
              <p className="illustration-desc">
                Manage assets, maintenance, bookings, and audits from one intelligent platform.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ==================== FORMS PANELS ==================== */}
        
        {/* Left Form Panel: Signup (Visible when isSignUp is true) */}
        <div className="auth-form-side left-side">
          <AnimatePresence>
            {isSignUp && (
              <motion.div 
                className="auth-form-wrapper"
                variants={formAnimationVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                <motion.h3 className="auth-form-title" variants={formItemVariants}>Create Account</motion.h3>
                <motion.p className="auth-form-subtitle" variants={formItemVariants}>Get started with your employee credentials.</motion.p>
                
                <form style={{ width: '100%' }} onSubmit={handleSubmitSignup(onSignupSubmit)}>
                  <motion.div className="auth-input-group" variants={formItemVariants}>
                    <label className="auth-input-label">Full Name</label>
                    <input 
                      type="text" 
                      className={`auth-input-field ${signupErrors.name ? 'input-error' : ''}`}
                      placeholder="Jane Doe"
                      {...registerSignup('name')}
                    />
                    {signupErrors.name && <span className="auth-error-text">{signupErrors.name.message}</span>}
                  </motion.div>

                  <motion.div className="auth-input-group" variants={formItemVariants}>
                    <label className="auth-input-label">Email Address</label>
                    <input 
                      type="email" 
                      className={`auth-input-field ${signupErrors.email ? 'input-error' : ''}`}
                      placeholder="jane.doe@company.com"
                      {...registerSignup('email')}
                    />
                    {signupErrors.email && <span className="auth-error-text">{signupErrors.email.message}</span>}
                  </motion.div>

                  <motion.div className="auth-input-group" variants={formItemVariants}>
                    <label className="auth-input-label">Password</label>
                    <input 
                      type="password" 
                      className={`auth-input-field ${signupErrors.password ? 'input-error' : ''}`}
                      placeholder="••••••••••••"
                      {...registerSignup('password')}
                    />
                    {signupErrors.password && <span className="auth-error-text">{signupErrors.password.message}</span>}
                  </motion.div>

                  <motion.div className="auth-input-group" variants={formItemVariants}>
                    <label className="auth-input-label">Confirm Password</label>
                    <input 
                      type="password" 
                      className={`auth-input-field ${signupErrors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="••••••••••••"
                      {...registerSignup('confirmPassword')}
                    />
                    {signupErrors.confirmPassword && <span className="auth-error-text">{signupErrors.confirmPassword.message}</span>}
                  </motion.div>

                  <motion.div className="auth-notice-box" variants={formItemVariants}>
                    💡 Default accounts are created with Employee role. Admin access can be granted by system manager later.
                  </motion.div>

                  <motion.button 
                    type="submit" 
                    className="auth-submit-btn"
                    variants={formItemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Create Account
                  </motion.button>
                </form>

                <motion.div className="auth-footer-toggle" variants={formItemVariants}>
                  Already have an account? 
                  <button type="button" className="auth-toggle-link" onClick={() => setIsSignUp(false)}>
                    Sign In
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Form Panel: Login (Visible when isSignUp is false) */}
        <div className="auth-form-side right-side">
          <AnimatePresence>
            {!isSignUp && (
              <motion.div 
                className="auth-form-wrapper"
                variants={formAnimationVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                {forgotPassword ? (
                  /* Forgot Password Form */
                  <form style={{ width: '100%' }} onSubmit={handleForgotPassword}>
                    <motion.h3 className="auth-form-title" variants={formItemVariants}>Reset Password</motion.h3>
                    <motion.p className="auth-form-subtitle" variants={formItemVariants}>Enter your registered email below to receive reset details.</motion.p>
                    
                    <motion.div className="auth-input-group" variants={formItemVariants}>
                      <label className="auth-input-label">Email Address</label>
                      <input 
                        type="email" 
                        className="auth-input-field"
                        placeholder="name@company.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </motion.div>

                    <motion.button 
                      type="submit" 
                      className="auth-submit-btn"
                      variants={formItemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Send Link
                    </motion.button>

                    <motion.button 
                      type="button" 
                      className="auth-footer-toggle auth-toggle-link" 
                      style={{ border: 'none', display: 'block', margin: '20px auto 0 auto' }}
                      onClick={() => setForgotPassword(false)}
                      variants={formItemVariants}
                    >
                      Back to Sign In
                    </motion.button>
                  </form>
                ) : (
                  /* Default Login Form */
                  <>
                    <motion.h3 className="auth-form-title" variants={formItemVariants}>Sign In</motion.h3>
                    <motion.p className="auth-form-subtitle" variants={formItemVariants}>Enter your credential tags to access the dashboard.</motion.p>

                    <form style={{ width: '100%' }} onSubmit={handleSubmitLogin(onLoginSubmit)}>
                      <motion.div className="auth-input-group" variants={formItemVariants}>
                        <label className="auth-input-label">Email Address</label>
                        <input 
                          type="email" 
                          className={`auth-input-field ${loginErrors.email ? 'input-error' : ''}`}
                          placeholder="name@company.com"
                          {...registerLogin('email')}
                        />
                        {loginErrors.email && <span className="auth-error-text">{loginErrors.email.message}</span>}
                      </motion.div>

                      <motion.div className="auth-input-group" variants={formItemVariants}>
                        <div className="auth-label-row">
                          <label className="auth-input-label">Password</label>
                          <button 
                            type="button" 
                            className="auth-forgot-link"
                            onClick={() => setForgotPassword(true)}
                          >
                            Forgot password?
                          </button>
                        </div>
                        <input 
                          type="password" 
                          className={`auth-input-field ${loginErrors.password ? 'input-error' : ''}`}
                          placeholder="••••••••••••"
                          {...registerLogin('password')}
                        />
                        {loginErrors.password && <span className="auth-error-text">{loginErrors.password.message}</span>}
                      </motion.div>

                      <motion.div className="auth-remember-row" variants={formItemVariants}>
                        <input 
                          type="checkbox" 
                          id="remember-me-checkbox"
                          className="auth-checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="remember-me-checkbox" style={{ cursor: 'pointer' }}>Remember me</label>
                      </motion.div>

                      <motion.button 
                        type="submit" 
                        className="auth-submit-btn"
                        variants={formItemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Sign In
                      </motion.button>
                    </form>

                    <motion.div className="auth-divider" variants={formItemVariants}>
                      or
                    </motion.div>

                    <motion.button 
                      className="auth-oauth-btn"
                      onClick={() => toast.success('Google Authentication is simulated in demo mode.')}
                      variants={formItemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="google-icon-svg" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.187 4.114-3.414 0-6.19-2.776-6.19-6.19 0-3.414 2.776-6.19 6.19-6.19 1.483 0 2.844.524 3.92 1.405l3.057-3.057C18.681 1.77 15.683 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.262 0 10.428-4.404 10.428-10.612 0-.693-.077-1.214-.208-1.583H12.24z"
                        />
                      </svg>
                      Continue with Google
                    </motion.button>

                    <motion.div className="auth-footer-toggle" variants={formItemVariants}>
                      New here? 
                      <button type="button" className="auth-toggle-link" onClick={() => setIsSignUp(true)}>
                        Create Account
                      </button>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
