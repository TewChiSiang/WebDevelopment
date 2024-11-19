import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/inertia-react';
import { Button, Form, Card, Container, Row, Col, Modal } from 'react-bootstrap';
import QRCode from "react-qr-code";
import { ArrowPathIcon, ClockIcon, AcademicCapIcon, BookOpenIcon, QrCodeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import StudentList from './StudentList';
import CustomNavbar from '../components/CustomNavbar';

const Attendance = ({ auth }) => {
  const { props } = usePage();
  const { message, sessionId: initialSessionId, students, lectures, courses = [] } = props;
  const userRole = 'lecture';

  const [selectedCourse, setSelectedCourse] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdown, setCountdown] = useState(60);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(''); 

  // QR Code settings
  const [back] = useState('#FFFFFF');
  const [fore] = useState('#000000');
  const [size] = useState(256);

  const getSelectedCourseDetails = () => {
    return courses.find(course => course.id.toString() === selectedCourse.toString());
  };

  const generateQRData = () => {
    const courseDetails = getSelectedCourseDetails();
    if (!courseDetails) return ''; 
    
    const currentTime = new Date();
    const expirationTime = new Date(currentTime.getTime() + (60 * 1000)); // 60 seconds from now
    
    return JSON.stringify({
      sessionId: sessionId,
      courseId: selectedCourse,
      courseName: courseDetails.course_name,
      courseTime: courseDetails.course_time,
      timestamp: currentTime.toISOString(),
      expiresAt: expirationTime.toISOString(),
      type: 'attendance'
    });
  };

  useEffect(() => {
    if (selectedCourse) {
      setQrData(generateQRData());
    }
  }, [selectedCourse, sessionId]);

  useEffect(() => {
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeTimer);
  }, []);

  const handleRefreshQRCode = () => {
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
    setQrData(generateQRData());
  };

  useEffect(() => {
    if (showQRCode) {
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleRefreshQRCode();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownTimer);
    }
  }, [showQRCode]);

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setShowQRCode(false);
    setCountdown(60);
  };

  const handleShowQRCode = () => {
    setQrData(generateQRData());
    setShowQRCode(true);
  };

  const formatTime = (date) => {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return `${dateStr} ${timeStr}`;
  };

  const handleQRClick = () => {
    setShowQRModal(true);
  };

  const getCurrentCourseStudents = () => {
    if (!selectedCourse) return [];

    // Filter students who are enrolled in the selected course
    return students.filter(student =>
      student.courses && student.courses.some(course =>
        course.id.toString() === selectedCourse.toString()
      )
    );
  };

  return (

    <div className="tw-bg-gradient-to-b tw-from-blue-50 tw-to-blue-100 tw-min-h-screen">
      <CustomNavbar userRole={userRole} user={auth.user} />
      <div className="tw-flex tw-items-center tw-justify-center tw-mb-6 tw-mt-2">

        <h1 className="tw-text-4xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-bg-clip-text tw-text-transparent">
          Attendance
        </h1>
      </div>

      <Row className="tw-justify-center">
        <Col md={10}>
          <Card className="tw-shadow-2xl tw-rounded-xl tw-border-0">
            <Card.Body className="tw-p-8">
              <Form>
                <Form.Group className="tw-mb-6">
                  <div className="tw-flex tw-items-center tw-mb-2">
                    <BookOpenIcon className="tw-w-5 tw-h-5 tw-text-blue-600 tw-mr-2" />
                    <Form.Label className="tw-font-semibold tw-text-lg tw-text-gray-700 tw-m-0">
                      Select Course
                    </Form.Label>
                  </div>
                  <Form.Select
                    value={selectedCourse}
                    onChange={handleCourseChange}
                    className="tw-w-full tw-p-3 tw-border tw-rounded-lg tw-shadow-sm hover:tw-border-blue-400 focus:tw-border-blue-500 focus:tw-ring-1 focus:tw-ring-blue-500"
                  >
                    <option value="" disabled hidden>Choose a course...</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_id} - {course.course_name} - {course.course_time}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {selectedCourse && (
                  <div className="tw-text-center">
                    <Button
                      variant="primary"
                      onClick={handleShowQRCode}
                      className="tw-group tw-inline-flex tw-items-center tw-gap-2 tw-bg-gradient-to-r tw-from-blue-400 tw-to-blue-500 hover:tw-from-blue-500 hover:tw-to-blue-600 tw-text-white tw-font-medium tw-px-6 tw-py-3 tw-rounded-lg tw-shadow-md hover:tw-shadow-lg tw-transition-all tw-duration-200 disabled:tw-opacity-50 tw-cursor-pointer"
                    >
                      <QrCodeIcon className="tw-w-5 tw-h-5 tw-opacity-90 tw-transition-transform tw-duration-200 tw-group-hover:tw-scale-110" />
                      <span className="tw-tracking-wide">Generate QR Code</span>
                    </Button>
                    <div className="tw-mt-2 tw-text-sm tw-text-gray-500">
                      Click to generate a unique QR code for attendance
                    </div>
                  </div>
                )}

                {showQRCode && selectedCourse && (
                  <div className="tw-text-center tw-mt-6">
                    <div className="tw-bg-gray-100 tw-p-6 tw-rounded-lg tw-inline-block">
                      {getSelectedCourseDetails() && (
                        <div className="tw-mb-4">
                          <h3 className="tw-text-lg tw-font-semibold">
                            {getSelectedCourseDetails().course_id} - {getSelectedCourseDetails().course_name}
                          </h3>
                          <p className="tw-text-gray-600 tw-mb-2">{getSelectedCourseDetails().course_time}</p>
                          <div className="tw-flex tw-justify-center tw-items-center tw-gap-2 tw-mb-2">
                            <ClockIcon className="tw-h-5 tw-w-5 tw-text-gray-500 tw-mb-3" />
                            <p className="tw-text-gray-600">{formatTime(currentTime)}</p>
                          </div>
                          <div className="tw-bg-blue-100 tw-text-blue-700 tw-px-4 tw-py-2 tw-rounded-md tw-text-sm tw-flex tw-items-center tw-justify-center tw-gap-2">
                            <ArrowPathIcon className="tw-h-4 tw-w-4" />
                            <span>QR Code will refresh in {countdown} seconds</span>
                          </div>
                        </div>
                      )}
                      <div
                        className="tw-relative tw-group tw-cursor-pointer tw-transition-transform hover:tw-scale-[1.02]"
                        onClick={handleQRClick}
                      >
                        <QRCode
                          title="Attendance Session"
                          value={qrData}
                          bgColor={back}
                          fgColor={fore}
                          size={size}
                        />
                        <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-black/0 group-hover:tw-bg-black/5 tw-transition-colors">
                          <div className="tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity">
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline-secondary"
                        onClick={() => {
                          handleRefreshQRCode();
                          setCountdown(60);
                        }}
                        className="tw-mt-4 tw-flex tw-items-center tw-mx-auto tw-bg-blue-200 hover:tw-bg-blue-400 tw-border-2 tw-border-gray-400 tw-rounded-full tw-py-2 tw-px-6 tw-shadow-md tw-transition-colors tw-duration-200 tw-cursor-pointer tw-border-none"
                      >
                        <ArrowPathIcon className="tw-h-5 tw-w-5 tw-mr-2 tw-text-gray-700 group-hover:tw-text-white" />
                        Refresh Now
                      </Button>
                    </div>
                    <p className="tw-mt-4 tw-text-sm tw-text-gray-600">{message}</p>
                  </div>
                )}

                {/* QR Code Modal */}
                <Modal
                  show={showQRModal}
                  onHide={() => setShowQRModal(false)}
                  centered
                  size="lg"
                  className="tw-flex tw-items-center tw-justify-center tw-fixed tw-inset-0 tw-z-50"
                >
                  <div className="tw-bg-white tw-rounded-xl tw-shadow-2xl tw-max-w-2xl tw-relative tw-p-6 tw-mx-auto">
                    {/* Improved close button */}
                    <button
                      onClick={() => setShowQRModal(false)}
                      className="tw-absolute tw-right-4 tw-top-4 tw-p-0 tw-bg-transparent tw-border-none "
                    >
                      <XMarkIcon className="tw-h-6 tw-w-6 tw-text-gray-500 hover:tw-text-gray-700 tw-cursor-pointer" />
                    </button>

                    <div className="tw-text-center">
                      {getSelectedCourseDetails() && (
                        <div className="tw-mb-6">
                          <h3 className="tw-text-2xl tw-font-semibold tw-mb-2">
                            {getSelectedCourseDetails().course_id} - {getSelectedCourseDetails().course_name}
                          </h3>
                          <p className="tw-text-gray-600">{getSelectedCourseDetails().course_time}</p>
                          <div className="tw-flex tw-justify-center tw-items-center tw-gap-2 tw-mt-2">
                            <ClockIcon className="tw-h-5 tw-w-5 tw-text-gray-500" />
                            <p className="tw-text-gray-600">{formatTime(currentTime)}</p>
                          </div>
                        </div>
                      )}

                      <div className="tw-flex tw-justify-center tw-mb-6">
                        <QRCode
                          title="Attendance Session"
                          value={qrData}
                          bgColor={back}
                          fgColor={fore}
                          size={400}  // Larger size for the modal
                        />
                      </div>

                      <div className="tw-bg-blue-50 tw-p-4 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-gap-2">
                        <ArrowPathIcon className="tw-h-5 tw-w-5 tw-text-blue-600" />
                        <span className="tw-text-blue-700">
                          QR Code will refresh in {countdown} seconds
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="tw-fixed tw-inset-0 tw-bg-black/50 tw--z-10" onClick={() => setShowQRModal(false)} />
                </Modal>
              </Form>
            </Card.Body>
          </Card>

          {selectedCourse && (
            <div className="tw-mt-8">
              <StudentList students={getCurrentCourseStudents()} />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Attendance;