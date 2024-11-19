import React, { useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import { Inertia } from '@inertiajs/inertia';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { useSpring, animated } from 'react-spring';

const Home = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);

    // Container sliding animation
    const slideAnimation = useSpring({
        transform: isRegistering ? 'translateX(-50%)' : 'translateX(0%)',
        config: { mass: 1, tension: 280, friction: 30 },
    });

    const validatePassword = (pass) => {
        if (pass.length < 8) {
            return "Password must be at least 8 characters long";
        }
        return null;
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError(null);
        Inertia.post('/login', { email, password }, {
            onError: (errors) => {
                if (errors.email) {
                    setError(errors.email[0]);
                } else if (errors.password) {
                    setError(errors.password[0]);
                } else {
                    setError('Invalid email or password.');
                }
            },
        });
    };

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

        Inertia.post('/register', {
            name,
            email,
            password,
            password_confirmation: confirmPassword
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
                } else {
                    const errorMessage = Object.values(errors).join(', ');
                    setError(errorMessage);
                }
            },
        });
    };

    const toggleForm = () => {
        setIsRegistering(!isRegistering);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setError(null);
    };

    return (
        <div className="tw-bg-cover tw-bg-center tw-h-screen tw-bg-[url('/Images/bg-sc.png')] tw-flex tw-items-center tw-justify-center">
            <div className="tw-w-full tw-max-w-4xl tw-bg-white tw-shadow-2xl tw-rounded-xl tw-relative tw-overflow-hidden">
                {/* Sliding Container */}
                <animated.div
                    style={slideAnimation}
                    className="tw-flex tw-w-[200%] tw-h-full"
                >
                    {/* Login Form */}
                    <div className="tw-w-full sm:tw-p-16 tw-flex tw-flex-col tw-justify-center tw-items-left">
                        <div className="tw-w-2/4 tw-p-2 sm:tw-w-3/4 tw-max-w-xs">
                            <h2 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-bg-clip-text tw-text-transparent tw-mb-4 sm:tw-mb-6 text-center">
                                Welcome Back</h2>
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
                                <Form.Group className="tw-mb-4" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Button
                                    type="submit"
                                    className="tw-w-full tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-600 hover:tw-from-indigo-600 hover:tw-to-blue-500 tw-text-white tw-font-medium tw-py-2 tw-rounded-lg"
                                >
                                    Log In
                                </Button>
                            </Form>
                        </div>
                    </div>

                    {/* Register Form */}
                    <div className="tw-w-full sm:tw-p-16 tw-flex tw-flex-col tw-justify-center tw-items-end">
                        <div className="tw-w-2/4 tw-p-5 sm:tw-w-3/4 tw-max-w-xs">
                            <h2 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-bg-clip-text tw-text-transparent tw-mb-4 sm:tw-mb-6 text-center">Create Account</h2>
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
                                <Form.Group className="tw-mb-4" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password (minimum 8 characters)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                </Form.Group>
                                <Form.Group className="tw-mb-4" controlId="formConfirmPassword">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                    />
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
                    className={`tw-absolute tw-top-0 ${isRegistering ? 'tw-left-0' : 'tw-left-1/2'} tw-w-1/2 tw-h-full tw-transition-all tw-duration-500 tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-4 sm:tw-px-8 tw-text-white 
                    ${isRegistering ? 'tw-rounded-br-[100px] tw-rounded-tr-[100px]' : 'tw-rounded-tl-[100px] tw-rounded-bl-[100px]'} `}
                >
                    <div className="tw-flex tw-items-center tw-mb-4 sm:tw-mb-8">
                        <AcademicCapIcon className="tw-w-8 tw-h-8 sm:tw-w-10 sm:tw-h-10 tw-text-blue-100 tw-mr-2 sm:tw-mr-3" />
                        <h1 className="tw-text-3xl sm:tw-text-4xl tw-font-bold">AttendEZ</h1>
                    </div>
                    <h3 className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-mb-3 sm:tw-mb-4">
                        {isRegistering ? 'Already have an account?' : 'Join Us!'}
                    </h3>
                    <p className="tw-text-center tw-mb-4 sm:tw-mb-6 tw-text-sm sm:tw-text-base">
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

export default Home;