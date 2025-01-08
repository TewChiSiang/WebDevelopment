import React, { useState } from 'react';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';
import { FaPlusCircle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import CustomNavbar from '../../components/CustomNavbar';
import { Inertia } from '@inertiajs/inertia';

const LectureEnrollCourse = ({ auth }) => {
    const userRole = 'lecture';

    const [courseId, setCourseId] = useState('');
    const [courseName, setCourseName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [weekday, setWeekday] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const weekdays = [
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday' },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday' },
        { value: '7', label: 'Sunday' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (!courseId || !courseName || !startTime || !endTime || !weekday) {
            setError('All fields are required.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/courses', {
                course_id: courseId,
                course_name: courseName,
                course_start_time: startTime,
                course_end_time: endTime,
                weekday: weekday,
                lecture_id: auth.user.id,
            });

            if (response.status === 201) {
                setSuccess(true);
                setCourseId('');
                setCourseName('');
                setStartTime('');
                setEndTime('');
                setWeekday('');
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to enroll course. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        Inertia.visit('/lecture');
    };

    return (
        <div className="tw-bg-gradient-to-b tw-from-blue-50 tw-to-blue-100 tw-min-h-screen">
            <CustomNavbar userRole={userRole} user={auth.user} />
            <div className="tw-flex tw-items-center tw-justify-center tw-mb-4 tw-mt-2">
                <h1 className="tw-text-4xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-bg-clip-text tw-text-transparent tw-mt-4">
                    Add Courses
                </h1>
            </div>
            <Container>
                <Button
                    onClick={handleBack}
                    className="tw-mb-4 tw-flex tw-items-center tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-700 tw-text-white hover:tw-opacity-80"
                >
                    <FaArrowLeft className="tw-mr-2" />
                    Back
                </Button>
                <Card className="tw-shadow-lg tw-rounded-lg tw-p-6 tw-bg-white">
                    <Card.Header className="tw-bg-transparent tw-text-xl tw-font-semibold tw-text-gray-700 tw-flex tw-items-center">
                        <FaPlusCircle className="tw-text-blue-600 tw-mr-2" />
                        Add Course
                    </Card.Header>
                    <Card.Body>
                        {success && (
                            <Alert variant="success" className="tw-mb-4">
                                Course enrolled successfully!
                            </Alert>
                        )}
                        {error && (
                            <Alert variant="danger" className="tw-mb-4">
                                {error}
                            </Alert>
                        )}
                        <Form onSubmit={handleSubmit}>
                            {/* Course ID */}
                            <Form.Group className="mb-4" controlId="courseId">
                                <Form.Label className="tw-font-medium">Course ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={courseId}
                                    onChange={(e) => setCourseId(e.target.value)}
                                    placeholder="Enter a unique Course ID"
                                    className="tw-rounded-lg tw-shadow-sm"
                                    required
                                />
                            </Form.Group>

                            {/* Course Name */}
                            <Form.Group className="mb-4" controlId="courseName">
                                <Form.Label className="tw-font-medium">Course Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    placeholder="Enter Course Name"
                                    className="tw-rounded-lg tw-shadow-sm"
                                    required
                                />
                            </Form.Group>

                            {/* Weekday */}
                            <Form.Group className="mb-4" controlId="weekday">
                                <Form.Label className="tw-font-medium">Day of Week</Form.Label>
                                <Form.Select
                                    value={weekday}
                                    onChange={(e) => setWeekday(e.target.value)}
                                    className="tw-rounded-lg tw-shadow-sm"
                                    required
                                >
                                    <option value="">Select a day</option>
                                    {weekdays.map((day) => (
                                        <option key={day.value} value={day.value}>
                                            {day.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {/* Start Time */}
                            <Form.Group className="mb-4" controlId="startTime">
                                <Form.Label className="tw-font-medium">Start Time</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="tw-rounded-lg tw-shadow-sm"
                                    required
                                />
                            </Form.Group>

                            {/* End Time */}
                            <Form.Group className="mb-4" controlId="endTime">
                                <Form.Label className="tw-font-medium">End Time</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="tw-rounded-lg tw-shadow-sm"
                                    required
                                />
                            </Form.Group>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className={`tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-700 tw-text-white tw-py-2 tw-px-4 tw-rounded-lg ${loading ? 'tw-opacity-50' : 'hover:tw-opacity-80'}`}
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default LectureEnrollCourse;