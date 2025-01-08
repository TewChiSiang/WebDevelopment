import React from 'react';
import CustomNavbar from '../../components/CustomNavbar';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { QrCodeIcon, ClipboardDocumentCheckIcon, AcademicCapIcon, ClockIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const Lecture = ({ auth }) => {
    const userRole = 'lecture';

    const handleGenerateQRCode = () => {
        window.location.href = '/qr-attendance';
    };

    return (
        <div className="tw-bg-gradient-to-b tw-from-blue-50 tw-to-blue-100 tw-min-h-screen">
            <CustomNavbar userRole={userRole} user={auth.user} />

            <Container className="tw-py-10">
                {/* QR Generator Section */}
                <div className="tw-text-center tw-mb-8">
                    <Card className="tw-shadow-lg tw-rounded-lg tw-py-6 tw-bg-white">
                        <Card.Header className="tw-bg-transparent tw-text-xl tw-font-semibold tw-text-gray-700">
                            Manage QR Codes
                        </Card.Header>
                        <Card.Body className="tw-flex tw-flex-col tw-items-center">
                            <Button
                                onClick={handleGenerateQRCode}
                                variant="primary"
                                className="tw-bg-gradient-to-r tw-from-blue-400 tw-to-blue-600 tw-py-3 tw-px-6 tw-rounded-lg tw-flex tw-items-center"
                            >
                                <QrCodeIcon className="tw-h-6 tw-w-6 tw-text-white" />
                                <span className="tw-ml-2">Proceed to QR Generator</span>
                            </Button>
                        </Card.Body>
                    </Card>
                </div>

                {/* Dashboard Section */}
                <div className="tw-mb-8 tw-text-center">
                    <h1 className="tw-text-4xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-bg-clip-text tw-text-transparent">
                        Lecture Dashboard
                    </h1>
                </div>

                <Row className="tw-mb-6 tw-space-y-6 md:tw-space-y-0">
                    {[
                        { title: 'Add Courses', link: '/lecture-addcourse', icon: AcademicCapIcon },
                        { title: 'Courses Details', link: '/lecture-course-details', icon: BookOpenIcon },
                        { title: 'Student Attendance', link: '/student-attendance', icon: ClipboardDocumentCheckIcon },
                        { title: 'Time Table', link: '/lecture-time-table', icon: ClockIcon },
                    ].map((item, idx) => (
                        <Col md={6} key={idx}>
                            <Card
                                className="tw-shadow-lg tw-rounded-lg tw-p-6 tw-bg-white tw-cursor-pointer tw-transition-transform tw-transform hover:tw-scale-105 tw-mb-4"
                                onClick={() => window.location.href = item.link}
                            >
                                <Card.Body className="tw-flex tw-flex-col tw-items-center tw-text-center">
                                    <item.icon className="tw-h-12 tw-w-12 tw-text-blue-600 tw-mb-4" />
                                    <h3 className="tw-text-gray-600 tw-text-lg tw-font-semibold">{item.title}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default Lecture;
