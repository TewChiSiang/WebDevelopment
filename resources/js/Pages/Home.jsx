import React, { useState } from 'react';
import { Button, Form, Card,Alert,Row,Col  } from 'react-bootstrap';
import { Inertia } from '@inertiajs/inertia';

const Home = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);
  
    Inertia.post('/login', { email, password }, {
      onSuccess:()=>{
        console.log("success")
      },
      onError: (errors) => {
        setError(errors.email ? errors.email[0] : 'An error occurred.');
      },
    });
  };

  const handleRegister = () =>{
    Inertia.get('/register');
  };

  return (
    <div className="body-background">
      <h1 className="tw-text-center">AttendEZ</h1>
      <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '50vh' // Make the container take up the full viewport height
      }}>
      <Card style={{ width: '18rem'}}>
        <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Row>
              <Col>
                <Button variant="primary" type="submit">
                  Log In
                </Button>
              </Col>
              <Col>
                <Button onClick={handleRegister}>
                  Register
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      </div>
    </div>
  );
};

export default Home;
