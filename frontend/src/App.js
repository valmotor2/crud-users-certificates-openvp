import React from "react";
import { Container, Col, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

import Employee from "./Employee";
import InputEmployee from "./InputEmployee";

function App() {
  return (
    <Container style={{ marginTop: 50 }}>
      <Row>
        <Col md={6}>
          <Employee />
        </Col>
        <Col md={6}>
          <InputEmployee />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
