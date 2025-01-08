import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FaBookOpen, FaRegSadCry, FaArrowLeft, FaUsers, FaSearch, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import CustomNavbar from '../../components/CustomNavbar';
import { Inertia } from '@inertiajs/inertia';

const LectureCourseDetails = ({ auth }) => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [courseStudentCounts, setCourseStudentCounts] = useState({});

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                const response = await axios.get(`/courses/lecturer/${auth.user.id}`);
                setEnrolledCourses(response.data);

                // Fetch student counts for all courses
                const counts = {};
                for (const course of response.data) {
                    try {
                        const studentsResponse = await axios.get(`/api/courses/${course.id}/students`);
                        counts[course.id] = studentsResponse.data.length;
                    } catch (err) {
                        console.error(`Error fetching students for course ${course.id}:`, err);
                        counts[course.id] = 0;
                    }
                }
                setCourseStudentCounts(counts);
            } catch (err) {
                setError('Failed to load course details. Please try again.');
                console.error('Error fetching courses:', err);
            }
        };
        fetchEnrolledCourses();
    }, [auth.user.id]);

    const handleBack = () => {
        Inertia.visit('/lecture');
    };

    const handleViewStudents = async (courseId) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/courses/${courseId}/students`);
            setStudents(response.data);
            setSelectedCourse(enrolledCourses.find(course => course.id === courseId));
            setIsModalOpen(true);
        } catch (err) {
            setError('Failed to load student details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setStudents([]);
        setSearchTerm('');
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toString().includes(searchTerm)
    );

    return (
        <div className="tw-bg-gradient-to-b tw-from-gray-100 tw-to-blue-50 tw-min-h-screen">
            <CustomNavbar userRole="lecture" user={auth.user} />
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
                                {enrolledCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="tw-bg-gradient-to-r tw-from-blue-100 tw-to-blue-150 tw-shadow-md tw-rounded-lg tw-p-4 tw-transition-transform tw-transform hover:tw-scale-105 tw-cursor-pointer"
                                        onClick={() => handleViewStudents(course.id)}
                                    >
                                        <div className="tw-flex tw-justify-between tw-items-start">
                                            <div>
                                                <h5 className="tw-text-lg tw-font-semibold tw-text-gray-800">
                                                    {course.course_name}
                                                </h5>
                                                <p className="tw-text-sm tw-text-gray-800">
                                                    Course ID: <span className="tw-font-medium">{course.course_id}</span>
                                                </p>
                                            </div>
                                            <Badge className="tw-ml-2 tw-px-3 tw-py-2 tw-bg-blue-100 tw-text-blue-600 tw-rounded-full tw-font-medium">
                                                {courseStudentCounts[course.id] || 0} Students
                                            </Badge>
                                        </div>

                                        <div className="tw-mt-3">
                                            <Badge className="tw-bg-blue-500 tw-text-white tw-py-1 tw-px-3 tw-rounded-lg tw-mr-2">
                                                {course.weekday}
                                            </Badge>
                                            <Badge className="tw-bg-blue-500 tw-text-white tw-py-1 tw-px-3 tw-rounded-lg">
                                                {course.course_start_time} - {course.course_end_time}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
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

            <Modal show={isModalOpen} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="tw-flex tw-items-center tw-flex-wrap tw-gap-3 tw-mb-1">
                        <span className="tw-text-base sm:tw-text-xl">{selectedCourse?.course_name} - Student List</span>
                        <span className="tw-px-3 tw-py-1 tw-bg-blue-100 tw-text-blue-600 tw-rounded-full tw-text-sm tw-font-medium"> 
                            {students.length} Students
                        </span>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="tw-p-0">
                    <div className="tw-p-4">
                        <div className="tw-relative tw-mb-4">
                            <FaSearch className="tw-absolute tw-left-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-text-gray-400" />
                            <Form.Control
                                type="text"
                                placeholder="Search by name or Student ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="tw-pl-10 tw-py-2 tw-pr-10 tw-border-gray-200 tw-rounded-lg"
                            />
                            {searchTerm && (
                                <FaTimes
                                    className="tw-absolute tw-right-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-text-gray-400 tw-cursor-pointer hover:tw-text-gray-600"
                                    onClick={() => setSearchTerm('')}
                                />
                            )}
                        </div>
                        {loading ? (
                            <div className="tw-text-center tw-py-8">
                                <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-blue-500 tw-mx-auto"></div>
                                <p className="tw-mt-4 tw-text-gray-600">Loading students...</p>
                            </div>
                        ) : (
                            <div className="tw-divide-y tw-divide-gray-100">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student, index) => (
                                        <div
                                            key={student.student_id}
                                            className="tw-flex tw-items-center tw-justify-between tw-py-4 hover:tw-bg-gray-50 tw-transition-colors tw-rounded-lg tw-px-4"
                                        >
                                            <div className="tw-flex tw-items-center tw-gap-4">
                                                <div className="tw-text-gray-500 tw-font-semibold tw-text-lg">
                                                    {index + 1}
                                                </div>
                                                <div className="tw-pl-3">
                                                    <h3 className="tw-font-medium tw-text-gray-900">{student.name}</h3>
                                                    <p className="tw-text-sm tw-text-gray-500">ID: {student.student_id}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="tw-text-center tw-py-8">
                                        <FaUsers className="tw-text-4xl tw-text-gray-300 tw-mx-auto tw-mb-3" />
                                        <p className="tw-text-gray-500 tw-text-lg">
                                            {searchTerm ? 'No matching students found.' : 'No students enrolled in this course.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default LectureCourseDetails;