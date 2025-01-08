import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Modal } from 'react-bootstrap';
import { Inertia } from '@inertiajs/inertia';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSpring, animated } from 'react-spring';
import { usePage } from '@inertiajs/inertia-react';

const Login = () => {
    // State variables for form inputs and UI states
    const [email, setEmail] = useState(localStorage.getItem('email') || '');
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetStatus, setResetStatus] = useState(null);
    const { flash } = usePage().props;
    const [showFlash, setShowFlash] = useState(true);
    const [rememberMe, setRememberMe] = useState(true);

    useEffect(() => {
        if (flash.status || flash.error) {
            setShowFlash(true);
            const timer = setTimeout(() => {
                setShowFlash(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash.status, flash.error]);

    const flashAnimation = useSpring({
        opacity: showFlash ? 1 : 0,
        transform: showFlash ? 'translateY(0)' : 'translateY(-100%)',
        config: { tension: 280, friction: 60 }
    });

    // Animation for sliding container between login and register forms
    const slideAnimation = useSpring({
        transform: isRegistering ? 'translateX(-50%)' : 'translateX(0%)',
        config: { mass: 1, tension: 280, friction: 30 },
    });

    // Validate password for minimum length requirement
    const validatePassword = (pass) => {
        if (pass.length < 8) {
            return "Password must be at least 8 characters long";
        }
        return null;
    };

    // Handle login form submission
    const handleLogin = (e) => {
        e.preventDefault();
        setError(null);

        if (rememberMe) {
            localStorage.setItem('email', email);
        } else {
            localStorage.removeItem('email');
        }

        Inertia.post('/login', { email, password }, {
            onError: (errors) => {
                const errorMessage = errors.email || errors.password;
                setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
            },
        });
    };

    // Handle register form submission
    const handleRegister = (e) => {
        e.preventDefault();
        setError(null);

        // Password validation
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!studentId.trim()) {
            setError("Student ID is required.");
            return;
        }

        

        Inertia.post('/register', {
            name,
            email,
            password,
            password_confirmation: confirmPassword,
            student_id: studentId 
        }, {
            onSuccess: () => {
                setError(null);
            },
            onError: (errors) => {
                if (errors.email) {
                    setError("This email has already been registered.");
                } else if (errors.password) {
                    setError(errors.password[0]);
                } else if (errors.name) {
                    setError(errors.name[0]);
                } else if (errors.student_id) {
                    setError(errors.student_id[0]);
                } else {
                    const errorMessage = Object.values(errors).join(', ');
                    setError(errorMessage);
                }
            },
        });
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        setResetStatus(null);

        setResetStatus({
            type: 'info',
            message: 'Sending reset link...'
        });

        Inertia.post('/forgot-password', { email: forgotEmail }, {
            onSuccess: () => {
                setResetStatus({
                    type: 'success',
                    message: 'Password reset link has been sent to your email.'
                });

                setTimeout(() => {
                    setShowForgotPassword(false);
                    setForgotEmail('');
                }, 1500);
            },
            onError: (errors) => {
                setResetStatus({
                    type: 'danger',
                    message: errors.email || 'Unable to send reset link. Please try again.'
                });
            },
        });
    };

    useEffect(() => {
        if (showForgotPassword) {
            setResetStatus(null);
        }
    }, [showForgotPassword]);

    // Toggle between login and register forms
    const toggleForm = () => {
        setIsRegistering(!isRegistering);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setStudentId('');
        setError(null);
    };

    const handleRememberMeChange = () => {
        setRememberMe(!rememberMe);
    };

    return (

        <div className="tw-bg-cover tw-bg-center tw-h-screen tw-bg-[url('/Images/bg-sc.png')] tw-flex tw-items-center tw-justify-center tw-py-8 tw-px-4">
            <div className="tw-w-full tw-max-w-4xl tw-bg-white tw-shadow-2xl tw-rounded-xl tw-relative tw-overflow-hidden">
                {(flash.status || flash.error) && showFlash && (
                    <animated.div
                        style={flashAnimation}
                        className="tw-absolute tw-top-0 tw-left-0 tw-right-0 tw-z-50 tw-p-4"
                    >
                        <Alert
                            variant={flash.status ? 'success' : 'danger'}
                            dismissible
                            onClose={() => setShowFlash(false)}
                            className="tw-mb-0"
                        >
                            {flash.status || flash.error}
                        </Alert>
                    </animated.div>
                )}
                {/* Sliding Container */}
                <animated.div
                    style={slideAnimation}
                    className="tw-flex tw-w-[200%] tw-h-full"
                >
                    {/* Login Form */}
                    <div className="tw-w-full sm:tw-p-16 tw-flex tw-flex-col tw-justify-center tw-items-left">
                        <div className="tw-w-2/4 tw-p-2 sm:tw-w-3/4 tw-max-w-xs">
                        <h2 className="tw-text-xl sm:tw-text-2xl lg:tw-text-3xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-bg-clip-text tw-text-transparent tw-mb-4 sm:tw-mb-6 tw-text-center">
                                Welcome Back
                            </h2>
                            {error && (
                                <Alert variant="danger" className="tw-mb-4">
                                    {error}
                                </Alert>
                            )}
                            <Form onSubmit={handleLogin}>
                                <Form.Group className="tw-mb-4" controlId="formBasicEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="tw-mb-4 tw-relative" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <div className="tw-relative">
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        {password && ( // Icon only shows if the password is entered
                                            <div
                                                className="tw-absolute tw-right-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-cursor-pointer"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="tw-w-5 tw-h-5 tw-text-gray-500" />
                                                ) : (
                                                    <EyeIcon className="tw-w-5 tw-h-5 tw-text-gray-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Form.Group>
                                {/* Remember Me & Forgot Password */}
                                <Form.Group className="tw-mb-4 tw-flex tw-items-center tw-justify-between">
                                    <div className="tw-flex tw-items-center">
                                        <Form.Check
                                            type="checkbox"
                                            id="rememberMe"
                                            label="Remember me"
                                            checked={rememberMe}
                                            onChange={handleRememberMeChange}
                                            className="tw-text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            variant="link"
                                            className="tw-p-0 tw-text-sm tw-text-blue-600 hover:tw-text-blue-800 tw-mb-2"
                                            onClick={() => setShowForgotPassword(true)}
                                        >
                                            Forgot Password?
                                        </Button>
                                    </div>
                                </Form.Group>
                                <Button
                                    type="submit"
                                    className="tw-w-full tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-600 hover:tw-from-indigo-600 hover:tw-to-blue-500 tw-text-white tw-font-medium tw-py-2 tw-rounded-lg"
                                >
                                    Log In
                                </Button>
                            </Form>
                        </div>
                        <Modal
                            show={showForgotPassword}
                            onHide={() => {
                                setShowForgotPassword(false);
                                setForgotEmail('');
                            }}
                            centered
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Reset Password</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {resetStatus && (
                                    <Alert variant={resetStatus.type} className="tw-mb-4">
                                        {resetStatus.message}
                                    </Alert>
                                )}
                                <Form onSubmit={handleForgotPassword}>
                                    <Form.Group className="tw-mb-4" controlId="forgotPasswordEmail">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter your email"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Button
                                        type="submit"
                                        className="tw-w-full tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-600 hover:tw-from-indigo-600 hover:tw-to-blue-500 tw-text-white tw-font-medium tw-py-2 tw-rounded-lg"
                                    >
                                        Send Reset Link
                                    </Button>
                                </Form>
                            </Modal.Body>
                        </Modal>
                    </div>

                    {/* Register Form */}
                    <div className="tw-w-full sm:tw-p-16 tw-flex tw-flex-col tw-justify-center tw-items-end">
                        <div className="tw-w-2/4 tw-p-5 sm:tw-w-3/4 tw-max-w-xs">
                        <h2 className="tw-text-xl sm:tw-text-2xl lg:tw-text-3xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-bg-clip-text tw-text-transparent tw-mb-4 sm:tw-mb-6 tw-text-center">
                                Create Account
                            </h2>
                            {error && (
                                <Alert variant="danger" className="tw-mb-4">
                                    {error}
                                </Alert>
                            )}
                            <Form onSubmit={handleRegister}>
                                <Form.Group className="tw-mb-4" controlId="formBasicName">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="tw-mb-4" controlId="formBasicEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="tw-mb-4" controlId="formBasicStudentId">
                                    <Form.Label>Student Id</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your student id"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="tw-mb-4 tw-relative" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <div className="tw-relative">
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password (minimum 8 characters)"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={8}
                                        />
                                        {password && ( 
                                            <div
                                                className="tw-absolute tw-right-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-cursor-pointer"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="tw-w-5 tw-h-5 tw-text-gray-500" />
                                                ) : (
                                                    <EyeIcon className="tw-w-5 tw-h-5 tw-text-gray-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Form.Group>
                                <Form.Group className="tw-mb-4 tw-relative" controlId="formConfirmPassword">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <div className="tw-relative">
                                        <Form.Control
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={8}
                                        />
                                        {confirmPassword && ( // Icon only shows if the password is entered
                                            <div
                                                className="tw-absolute tw-right-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-cursor-pointer"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeSlashIcon className="tw-w-5 tw-h-5 tw-text-gray-500" />
                                                ) : (
                                                    <EyeIcon className="tw-w-5 tw-h-5 tw-text-gray-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Form.Group>
                                <Button
                                    type="submit"
                                    className="tw-w-full tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-600 hover:tw-from-indigo-600 hover:tw-to-blue-500 tw-text-white tw-font-medium tw-py-2 tw-rounded-lg"
                                >
                                    Sign Up
                                </Button>
                            </Form>
                        </div>
                    </div>
                </animated.div>

                {/* Fixed Overlay Panel */}
                <div
                    className={`tw-absolute tw-top-0 ${isRegistering ? 'tw-left-0' : 'tw-left-1/2'} 
                        tw-w-1/2 tw-h-full tw-transition-all tw-duration-500 
                        tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 
                        tw-flex tw-flex-col tw-items-center tw-justify-center 
                        tw-px-2 sm:tw-px-4 lg:tw-px-8 tw-text-white
                        ${isRegistering ? 'tw-rounded-br-[50px] sm:tw-rounded-br-[100px] tw-rounded-tr-[50px] sm:tw-rounded-tr-[100px]' : 
                        'tw-rounded-tl-[50px] sm:tw-rounded-tl-[100px] tw-rounded-bl-[50px] sm:tw-rounded-bl-[100px]'}`}
                >
                    <div className="tw-flex tw-items-center tw-mb-4 sm:tw-mb-6 lg:tw-mb-8">
                        <AcademicCapIcon className="tw-w-6 tw-h-6 sm:tw-w-8 sm:tw-h-8 lg:tw-w-10 lg:tw-h-10 tw-text-blue-100 tw-mr-2" />
                        <h1 className="tw-text-2xl sm:tw-text-3xl lg:tw-text-4xl tw-font-bold">AttendEZ</h1>
                    </div>
                    <h3 className="tw-text-xl sm:tw-text-2xl lg:tw-text-3xl tw-font-bold tw-mb-2 sm:tw-mb-3 lg:tw-mb-4 tw-text-center">
                        {isRegistering ? 'Already have an account?' : 'Join Us!'}
                    </h3>
                    <p className="tw-text-center tw-mb-4 tw-text-xs sm:tw-text-sm lg:tw-text-base tw-px-2">
                        {isRegistering
                            ? 'Sign in to continue with AttendEZ'
                            : "Don't have an account? Register now to get started!"}
                    </p>
                    <Button
                        variant="outline-light"
                        onClick={toggleForm}
                        className="tw-font-medium tw-rounded-lg tw-px-4 sm:tw-px-6 tw-py-1.5 sm:tw-py-2"
                    >
                        {isRegistering ? 'Log In' : 'Register'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Login;
