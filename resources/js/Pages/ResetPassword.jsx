import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Button, Form, Alert } from 'react-bootstrap';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const ResetPassword = ({ token, email }) => {
    const [formData, setFormData] = useState({
        email: email || '',
        password: '',
        password_confirmation: '',
        token: token,
    });
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        // Validate password length
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        // Validate password match
        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match');
            return;
        }

        Inertia.post('/reset-password', formData, {
            onSuccess: () => {
                // Redirect will be handled by the backend
            },
            onError: (errors) => {
                setError(Object.values(errors).join(', '));
            },
        });
    };

    return (
        <div className="tw-bg-cover tw-bg-center tw-h-screen tw-bg-[url('/Images/bg-sc.png')] tw-flex tw-items-center tw-justify-center">
            <div className="tw-w-full tw-max-w-md tw-bg-white tw-shadow-2xl tw-rounded-xl tw-p-8">
                <h2 className="tw-text-2xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-bg-clip-text tw-text-transparent tw-mb-6 tw-text-center">
                    Reset Password
                </h2>

                {error && (
                    <Alert variant="danger" className="tw-mb-4">
                        {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>

                    <Form.Group className="tw-mb-4 tw-relative" controlId="password">
                        <Form.Label>New Password</Form.Label>
                        <div className="tw-relative">
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                placeholder="Minimum 8 characters"
                                className="tw-w-full"
                            />
                            {formData.password && (
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

                    <Form.Group className="tw-mb-6 tw-relative" controlId="password_confirmation">
                        <Form.Label>Confirm New Password</Form.Label>
                        <div className="tw-relative">
                            <Form.Control
                                type={showConfirmPassword ? "text" : "password"}
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                required
                                minLength={8}
                                placeholder='Minimum 8 characters'
                                className="tw-w-full"
                            />
                            {formData.password_confirmation && (
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
                        Reset Password
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default ResetPassword;