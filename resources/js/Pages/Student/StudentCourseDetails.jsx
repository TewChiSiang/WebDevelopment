import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { FaBookOpen, FaRegSadCry, FaArrowLeft, FaTrash } from 'react-icons/fa';
import { Inertia } from '@inertiajs/inertia';
import CustomNavbar from '../../components/CustomNavbar';

const StudentCourseDetails = ({ auth }) => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isUnenrolling, setIsUnenrolling] = useState(false);

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    const fetchEnrolledCourses = async () => {
        try {
            const response = await axios.get('/student-enrolled-courses');
            setEnrolledCourses(response.data);
        } catch (err) {
            setError('Failed to load course details. Please try again.');
        }
    };

    const handleBack = () => {
        Inertia.visit('/student');
    };

    const handleUnenrollClick = (course) => {
        setSelectedCourse(course);
        setShowModal(true);
    };

    const handleUnenroll = async () => {
        if (!selectedCourse) return;

        setIsUnenrolling(true);
        try {
            await axios.delete(`/student-unenroll/${selectedCourse.course_id}`);
            setShowModal(false);
            setSelectedCourse(null);
            await fetchEnrolledCourses();
        } catch (err) {
            setError('Failed to unenroll from the course. Please try again.');
        } finally {
            setIsUnenrolling(false);
        }
    };

    const renderCourseCard = (course) => (
        <div
            key={`${course.id}-${course.course_id}`}
            className="tw-bg-gradient-to-r tw-from-blue-100 tw-to-blue-150 tw-shadow-md tw-rounded-lg tw-p-4 tw-transition-transform tw-transform hover:tw-scale-105"
        >
            <h5 className="tw-text-lg tw-font-semibold tw-text-gray-800">
                {course.course_name}
            </h5>
            <p className="tw-text-sm tw-text-gray-800">
                Course ID: <span className="tw-font-medium">{course.course_id}</span>
            </p>
            <p className="tw-text-sm tw-text-gray-800">
                Lecture Name: <span className="tw-font-medium">{course.lecture_name}</span>
            </p>
            <Badge
                key={`weekday-${course.id}`}
                className="tw-bg-blue-500 tw-text-white tw-py-1 tw-px-4 tw-rounded-lg"
            >
                {course.weekday}
            </Badge>

            <div className="tw-mt-2 tw-flex tw-justify-between tw-items-center">
                <Badge
                    key={`time-${course.id}`}
                    className="tw-bg-blue-500 tw-text-white tw-py-1 tw-px-3 tw-rounded-lg"
                >
                    {course.course_start_time} - {course.course_end_time}
                </Badge>
                <Button
                    variant="danger"
                    size="sm"
                    className="tw-flex tw-items-center"
                    onClick={() => handleUnenrollClick(course)}
                >
                    <FaTrash className="tw-mr-1" /> Unenroll
                </Button>
            </div>
        </div>
    );

    return (
        <div className="tw-bg-gradient-to-b tw-from-gray-100 tw-to-blue-50 tw-min-h-screen">
            <CustomNavbar userRole="student" user={auth.user} />
            <div className="tw-flex tw-items-center tw-justify-center tw-mb-4 tw-mt-2">
                <h1 className="tw-text-4xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-bg-clip-text tw-text-transparent tw-mt-4">
                    Courses Details
                </h1>
            </div>
            <Container className="p-2">
                <Button
                    onClick={handleBack}
                    className="tw-mb-4 tw-flex tw-items-center tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-700 tw-text-white hover:tw-opacity-80"
                >
                    <FaArrowLeft className="tw-mr-2" />
                    Back
                </Button>
                <Card className="tw-shadow-lg tw-rounded-lg tw-p-6 tw-bg-white">
                    <Card.Header className="tw-bg-transparent tw-text-xl tw-font-semibold tw-text-gray-700">
                        <FaBookOpen className="tw-inline-block tw-mr-2 tw-text-blue-600" />
                        Course Details
                    </Card.Header>
                    <Card.Body>
                        {error && <div className="tw-text-red-500 tw-mb-4">{error}</div>}
                        {enrolledCourses.length > 0 ? (
                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                                {enrolledCourses.map(renderCourseCard)}
                            </div>
                        ) : (
                            <div className="tw-flex tw-flex-col tw-items-center tw-text-gray-500 tw-my-6">
                                <FaRegSadCry className="tw-text-4xl tw-mb-3" />
                                <p>No courses enrolled yet.</p>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Unenrollment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to unenroll from {selectedCourse?.course_name}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleUnenroll}
                        disabled={isUnenrolling}
                    >
                        {isUnenrolling ? 'Unenrolling...' : 'Confirm Unenroll'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default StudentCourseDetails;