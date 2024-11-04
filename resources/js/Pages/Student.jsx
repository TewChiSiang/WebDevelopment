import React, { useState, useEffect } from 'react';
import CustomNavbar from '../components/CustomNavbar';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import QrReader from 'react-qr-scanner'

const Student = ({ auth }) => {
  const userRole = 'student';

  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);

  const handleScan = (data) => {
    if (data) {
      setScanResult(data.text); // If the scan is successful, save the result
      setScannerActive(false);  // Stop scanning
      setScanError(null);
    }
  };

  const handleError = (err) => {
    console.error(err);
    setScanError("Error accessing the camera or scanning QR code.");
  };

  const toggleScanner = () => {
    setScannerActive(!scannerActive);
    setScanResult(null);  // Reset the scan result when re-opening the scanner
    setScanError(null);   // Reset any previous errors
  };

  return (
    <div>
      <CustomNavbar userRole={userRole} user={auth.user} />

      <div className="container mt-5">
        <Card className="text-center">
          <Card.Header as="h5">QR Code Scanner</Card.Header>
          <Card.Body>
            <Button variant="primary" onClick={toggleScanner} >
              {scannerActive ? "Stop Scanning" : "Start QR Scan"}
            </Button>

            {/* QR Scanner */}
            {scannerActive && (
              <QrReader
                delay={100} // Set the delay between each scan attempt
                onError={handleError}
                onScan={handleScan}
                style={{ width: '50%', marginTop: '20px' }}
              />
            )}

            {/* Display scan result or error */}
            {scanResult && (
              <Alert variant="success" className="mt-4">
                Successfully scanned: {scanResult}
              </Alert>
            )}
            {scanError && (
              <Alert variant="danger" className="mt-4">
                {scanError}
              </Alert>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Student;
