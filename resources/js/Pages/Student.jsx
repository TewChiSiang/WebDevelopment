import React, { useState, useEffect} from 'react';
import CustomNavbar from '../components/CustomNavbar';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import QrReader from 'react-qr-scanner';
import { MdQrCodeScanner, MdStop } from 'react-icons/md';
import { FaCalendarAlt, FaChalkboardTeacher, FaRegClock } from 'react-icons/fa';
import { FaCameraRotate } from "react-icons/fa6";
import axios from 'axios';

const Student = ({ auth }) => {
  const userRole = 'student';
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (data) => {
    if (data && !isProcessing) {
      setIsProcessing(true);
      try {
        // Parse the QR code data with error handling
        let qrData;
        try {
          qrData = JSON.parse(data.text);
        } catch (parseError) {
          throw new Error('Invalid QR code format');
        }

        // Validate QR code structure and required fields
        if (!qrData || !qrData.type || !qrData.sessionId || !qrData.courseId || !qrData.expiresAt) {
          throw new Error('Invalid QR code data structure');
        }

        // Verify this is an attendance QR code
        if (qrData.type !== 'attendance') {
          throw new Error('Invalid QR code type');
        }

        // Check if QR code has expired
        const expirationTime = new Date(qrData.expiresAt);
        const currentTime = new Date();
        if (currentTime > expirationTime) {
          throw new Error('QR code has expired. Please scan a new qr code.');
        }

        const malaysiaTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
        const timestamp = malaysiaTime.toISOString();

        // Send attendance data to the server
        const response = await axios.post('/attendance', {
          sessionId: qrData.sessionId,
          courseId: parseInt(qrData.courseId),
          studentId: parseInt(auth.user.id),
          timestamp: timestamp,
          expiresAt: qrData.expiresAt
        });

        if (response.data.success) {
          setScanResult({
            message: 'Attendance marked successfully!',
            course: qrData.courseName,
            time: malaysiaTime.toLocaleTimeString('en-MY'),
            status: response.data.status
          });
        } else {
          throw new Error(response.data.message || 'Failed to mark attendance');
        }

      } catch (error) {
        setScanError(error.message || 'Failed to process QR code');
      } finally {
        setIsProcessing(false);
        setScannerActive(false);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setScanError('Error accessing the camera or scanning QR code.');
  };

  const toggleScanner = () => {
    setScannerActive(!scannerActive);
    setScanResult(null);
    setScanError(null);
  };

  const toggleCamera = () => {
    setCameraFacingMode((prevMode) =>
      prevMode === 'environment' ? 'user' : 'environment'
    );
  };

  return (
    <div className="tw-bg-gradient-to-b tw-from-blue-50 tw-to-blue-100 tw-min-h-screen">
      <CustomNavbar userRole={userRole} user={auth.user} />

      <Container className="tw-py-10">
        {/* Welcome Section */}
        <div className="tw-text-center tw-mb-8">
          <Card className="tw-shadow-lg tw-rounded-lg tw-p-4 tw-bg-white">
            <Card.Body>
              <h2 className="tw-text-xl tw-font-bold tw-text-gray-700">
                Welcome, {auth.user.name}!
              </h2>
              <p className="tw-text-gray-500">
                You have enrolled in 3 classes. Your attendance rate is 90%.
              </p>
            </Card.Body>
          </Card>
        </div>

        {/* QR Scanner Section */}
        <div className="tw-text-center tw-mb-8">
          <Card className="tw-shadow-lg tw-rounded-lg tw-py-6 tw-bg-white">
            <Card.Header className="tw-bg-transparent tw-text-xl tw-font-semibold tw-text-gray-700">
              QR Code Scanner
            </Card.Header>
            <Card.Body className="tw-relative tw-flex tw-flex-col tw-items-center">
              {scannerActive && (
                <div className="tw-w-full tw-mb-4 tw-relative">
                  <QrReader
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    facingMode={cameraFacingMode}
                    style={{ width: '100%', maxWidth: '400px' }}
                  />
                  <div className="tw-flex tw-justify-center tw-mt-2">
                    <Button
                      onClick={() => setCameraFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                      variant="outline-primary"
                      className="tw-bg-blue-200 hover:tw-bg-blue-400 tw-py-2 tw-px-4 tw-rounded-lg tw-mx-2 tw-flex tw-items-center"
                    >
                      <FaCameraRotate className="tw-h-5 tw-w-5 tw-text-gray-600" />
                      <span className="tw-ml-2">Toggle Camera</span>
                    </Button>
                    <Button
                      onClick={() => setScannerActive(false)}
                      variant="outline-primary"
                      className="tw-bg-blue-200 hover:tw-bg-blue-400 tw-py-2 tw-px-4 tw-rounded-lg tw-flex tw-items-center"
                    >
                      <MdStop className="tw-h-5 tw-w-5 tw-text-gray-600" />
                      <span className="tw-ml-2">Stop Scanning</span>
                    </Button>
                  </div>
                </div>
              )}

              {!scannerActive && !scanResult && (
                <Button
                  onClick={() => {
                    setScannerActive(true);
                    setScanResult(null);
                    setScanError(null);
                  }}
                  variant="primary"
                  className="tw-mt-4 tw-bg-gradient-to-r tw-from-blue-400 tw-to-blue-600 tw-py-3 tw-px-6 tw-rounded-lg tw-flex tw-items-center"
                  disabled={isProcessing}
                >
                  <MdQrCodeScanner className="tw-h-5 tw-w-5 tw-mr-2" />
                  {isProcessing ? 'Processing...' : 'Start QR Scan'}
                </Button>
              )}

              {scanResult && (
                <Alert variant="success" className="tw-mt-4 tw-w-full">
                  <div className="tw-text-center">
                    <h4 className="tw-text-lg tw-font-semibold tw-text-green-700">{scanResult.message}</h4>
                    <p className="tw-mb-1">Course: {scanResult.course}</p>
                    <p className="tw-mb-1">Time: {scanResult.time}</p>
                    <p>Status: {scanResult.status}</p>
                    <Button
                      onClick={() => {
                        setScanResult(null);
                        setScannerActive(false);
                      }}
                      variant="outline-success"
                      className="tw-mt-3"
                    >
                      Close
                    </Button>
                  </div>
                </Alert>
              )}

              {scanError && (
                <Alert variant="danger" className="tw-mt-4 tw-w-full">
                  <div className="tw-text-center">
                    <p>{scanError}</p>
                    <Button
                      onClick={() => {
                        setScanError(null);
                        setScannerActive(true);
                      }}
                      variant="outline-danger"
                      className="tw-mt-3"
                    >
                      Try Again
                    </Button>
                  </div>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Dashboard Section */}
        <div className="tw-mb-8 tw-text-center">
          <h1 className="tw-text-4xl tw-font-bold tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-bg-clip-text tw-text-transparent">
            Student Dashboard
          </h1>
        </div>

        <Row className="tw-mb-6 tw-space-y-6 md:tw-space-y-0">
          {[
            {
              title: 'My Attendance',
              link: '/attendance',
              icon: <FaCalendarAlt className="tw-h-10 tw-w-10 tw-text-blue-600 tw-mb-4" />,
            },
            {
              title: 'Enroll Classes',
              link: '/enroll-classes',
              icon: <FaChalkboardTeacher className="tw-h-10 tw-w-10 tw-text-blue-600 tw-mb-4" />,
            },

          ].map((item, idx) => (
            <Col md={6} key={idx}>
              <Card
                className="tw-shadow-lg tw-rounded-lg tw-p-6 tw-bg-white tw-cursor-pointer tw-transition-transform tw-transform hover:tw-scale-105"
                onClick={() => (window.location.href = item.link)}
              >
                <Card.Body className="tw-flex tw-flex-col tw-items-center tw-text-center">
                  {item.icon}
                  <h3 className="tw-text-gray-600 tw-text-lg tw-font-semibold">{item.title}</h3>
                </Card.Body>
              </Card>
            </Col>
          ))}
          <Col md={12}>
            <Card
              className="tw-mt-4 tw-shadow-lg tw-rounded-lg tw-p-6 tw-bg-white tw-cursor-pointer tw-transition-transform tw-transform hover:tw-scale-105"
              onClick={() => (window.location.href = '/time-table')}
            >
              <Card.Body className="tw-flex tw-flex-col tw-items-center tw-text-center">
                <FaRegClock className="tw-h-10 tw-w-10 tw-text-blue-600 tw-mb-4" />
                <h3 className="tw-text-gray-600 tw-text-lg tw-font-semibold">Timetable</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Student;
