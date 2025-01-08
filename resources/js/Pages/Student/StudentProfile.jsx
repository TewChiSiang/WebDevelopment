import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUser, FaKey, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import CustomNavbar from '../../components/CustomNavbar';

const StudentProfile = ({ auth }) => {
    const userRole = 'student';
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: auth.user.name,
        email: auth.user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await axios.get(`/students/${auth.user.id}`);
                setStudentData(response.data);
            } catch (err) {
                console.error('Error fetching student data:', err);
                setError('Failed to load student data');
            }
        };

        fetchStudentData();
    }, [auth.user.id]);

    const handleBack = () => {
        Inertia.visit('/student');
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/update-profile', {
                name: formData.name,
                email: formData.email
            });

            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            // Refresh the page to update the navbar
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const response = await axios.put('/update-password', {
                current_password: formData.currentPassword,
                new_password: formData.newPassword
            });

            setSuccess('Password updated successfully!');
            setShowPasswordForm(false);
            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password');
        }
    };

    return (
        <div className="tw-bg-gradient-to-b tw-from-blue-50 tw-to-blue-100 tw-min-h-screen">
            <CustomNavbar userRole={userRole} user={auth.user} />

            <Container className="tw-py-8">

                <div className="tw-text-center tw-mb-4">
                    <h1 className="tw-text-4xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-bg-clip-text tw-text-transparent">
                        Student Profile
                    </h1>
                </div>
                <Button
                    onClick={handleBack}
                    className="tw-mb-6 tw-flex tw-items-center tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-700 tw-text-white hover:tw-opacity-80"
                >
                    <FaArrowLeft className="tw-mr-2" />
                    Back
                </Button>
                {error && (
                    <Alert variant="danger" className="tw-mb-4" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" className="tw-mb-4" onClose={() => setSuccess(null)} dismissible>
                        {success}
                    </Alert>
                )}

                <Card className="tw-shadow-lg tw-rounded-lg tw-bg-white">
                    <Card.Body className="tw-p-6">
                        <div className="tw-flex tw-justify-center tw-mb-6">
                            <div className="tw-bg-blue-100 tw-rounded-full tw-p-6">
                                <FaUser className="tw-w-16 tw-h-16 tw-text-blue-600" />
                            </div>
                        </div>

                        <Form onSubmit={handleUpdateProfile}>
                            <div className="tw-space-y-4">
                                <Form.Group>
                                    <Form.Label className="tw-font-medium">Student ID</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={studentData?.student_id || 'Loading...'}
                                        disabled
                                        className="tw-bg-gray-50"
                                    />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label className="tw-font-medium">Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                    />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label className="tw-font-medium">Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                    />
                                </Form.Group>

                                <div className="tw-flex tw-justify-end tw-space-x-3">
                                    {!isEditing ? (
                                        <Button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-700 tw-text-white"
                                        >
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                variant="secondary"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-700 tw-text-white"
                                            >
                                                Save Changes
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Form>

                        <hr className="tw-my-6" />

                        <div className="tw-mt-6">
                            {!showPasswordForm ? (
                                <Button
                                    onClick={() => setShowPasswordForm(true)}
                                    className="tw-w-full tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-700 tw-text-white"
                                >
                                    <FaKey className="tw-inline tw-mr-2" />
                                    Change Password
                                </Button>
                            ) : (
                                <Form onSubmit={handlePasswordChange}>
                                    <div className="tw-space-y-4">
                                        <Form.Group className="tw-relative">
                                            <Form.Label className="tw-font-medium">Current Password</Form.Label>
                                            <div className="tw-relative">
                                                <Form.Control
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                                {formData.currentPassword && (
                                                    <div
                                                        className="tw-absolute tw-right-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-cursor-pointer"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    >
                                                        {showCurrentPassword ? (
                                                            <FaEyeSlash className="tw-w-5 tw-h-5 tw-text-gray-500" />
                                                        ) : (
                                                            <FaEye className="tw-w-5 tw-h-5 tw-text-gray-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Form.Group>

                                        <Form.Group className="tw-relative">
                                            <Form.Label className="tw-font-medium">New Password</Form.Label>
                                            <div className="tw-relative">
                                                <Form.Control
                                                    type={showNewPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                                {formData.newPassword && (
                                                    <div
                                                        className="tw-absolute tw-right-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-cursor-pointer"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? (
                                                            <FaEyeSlash className="tw-w-5 tw-h-5 tw-text-gray-500" />
                                                        ) : (
                                                            <FaEye className="tw-w-5 tw-h-5 tw-text-gray-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Form.Group>

                                        <Form.Group className="tw-relative">
                                            <Form.Label className="tw-font-medium">Confirm New Password</Form.Label>
                                            <div className="tw-relative">
                                                <Form.Control
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                                {formData.confirmPassword && (
                                                    <div
                                                        className="tw-absolute tw-right-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-cursor-pointer"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <FaEyeSlash className="tw-w-5 tw-h-5 tw-text-gray-500" />
                                                        ) : (
                                                            <FaEye className="tw-w-5 tw-h-5 tw-text-gray-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Form.Group>

                                        <div className="tw-flex tw-justify-end tw-space-x-3">
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    setShowPasswordForm(false);
                                                    setFormData({
                                                        ...formData,
                                                        currentPassword: '',
                                                        newPassword: '',
                                                        confirmPassword: ''
                                                    });
                                                }}
                                                variant="secondary"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-700 tw-text-white"
                                            >
                                                Update Password
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default StudentProfile;