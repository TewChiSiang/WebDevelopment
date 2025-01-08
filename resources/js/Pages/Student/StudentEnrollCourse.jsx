import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';
import { FaChalkboardTeacher, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import CustomNavbar from '../../components/CustomNavbar';
import { Inertia } from '@inertiajs/inertia';

const StudentEnrollCourse = ({ auth }) => {
    const userRole = 'student';

    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const fetchCourses = async () => {
        try {
            const [coursesResponse, enrolledResponse] = await Promise.all([
                axios.get('/courses'),
                axios.get('/student-enrolled-courses')
            ]);

            const enrolled = enrolledResponse.data;
            const allCourses = coursesResponse.data;

            const available = allCourses.filter(course =>
                !enrolled.some(enrolledCourse =>
                    enrolledCourse.course_id === course.course_id
                )
            );

            setAvailableCourses(available);
        } catch (err) {
            setError('Failed to load courses. Please try again.');
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (!selectedCourseId) {
            setError('Please select a course.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/student-enroll', {
                course_id: selectedCourseId,
            });

            if (response.status === 201) {
                setSuccess(true);
                setSelectedCourseId('');
                await fetchCourses();
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to enroll in the course. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        Inertia.visit('/student');
    };

    return (
        <div className="tw-bg-gradient-to-b tw-from-blue-50 tw-to-blue-100 tw-min-h-screen">
            <CustomNavbar userRole={userRole} user={auth.user} />
            <div className="tw-flex tw-items-center tw-justify-center tw-mb-4 tw-mt-2">

                <h1 className="tw-text-4xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-bg-clip-text tw-text-transparent tw-mt-4">
                    Enroll Courses
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
                        <FaChalkboardTeacher className="tw-text-blue-600 tw-mr-2" />
                        Available Courses
                    </Card.Header>
                    <Card.Body>
                        {success && (
                            <Alert variant="success" className="tw-mb-4">
                                Successfully enrolled in the course!
                            </Alert>
                        )}
                        {error && (
                            <Alert variant="danger" className="tw-mb-4">
                                {error}
                            </Alert>
                        )}
                        {availableCourses.length > 0 ? (
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4" controlId="courseSelect">
                                    <Form.Label className="tw-font-medium">
                                        Select Course to Enroll
                                    </Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        required
                                        className="tw-border-gray-300 tw-rounded-lg tw-shadow-sm tw-py-2 tw-px-3"
                                    >
                                        <option value="">-- Select a course --</option>
                                        {availableCourses.map((course) => (
                                            <option key={course.id} value={course.course_id}>
                                                {course.course_name} - {course.course_id} - {course.weekday} ({course.course_start_time} - {course.course_end_time}) - {course.lecture?.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                <Button
                                    type="submit"
                                    className={`tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-700 tw-text-white tw-py-2 tw-px-4 tw-rounded-lg ${loading ? 'tw-opacity-50' : 'hover:tw-opacity-80'
                                        }`}
                                    disabled={loading}
                                >
                                    {loading ? 'Enrolling...' : 'Enroll'}
                                </Button>
                            </Form>
                        ) : (
                            <div className="tw-text-gray-500 tw-my-6">
                                No additional courses available for enrollment at this time.
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default StudentEnrollCourse;