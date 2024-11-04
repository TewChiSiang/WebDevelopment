import React from "react";
import { Nav, Navbar, NavDropdown, Container } from "react-bootstrap";
import { Inertia } from "@inertiajs/inertia";
const CustomNavbar = ({ userRole,user }) => {
    const handleLogout = () => {
        Inertia.post('/logout'); // 使用 Inertia.post 方法发送注销请求
      };
    return (
        <div>
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
            <Navbar.Brand href="#home">AttendEZ</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ms-auto">

                <NavDropdown title={user.name} id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">
                    Another action
                    </NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
                </Nav>
            </Navbar.Collapse>
            </Container>
        </Navbar>
        </div>
    );
    };

export default CustomNavbar;
