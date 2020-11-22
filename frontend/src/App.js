import React from "react";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Employees from "./screens/Employees";
import Employee from "./screens/Employee";
import Certificates from "./screens/Certificates";
import Certificate from "./screens/Certificate";
function App() {
  return (
    <Router>
      <Container style={{ marginTop: 50 }}>
        <Switch>
          <Route exact path="/" component={Employees} />
          <Route exact path="/ovpn/add" component={Employee} />
          <Route exact path="/certificates" component={Certificates} />
          <Route exact path="/certificates/:id" component={Certificate} />
        </Switch>
      </Container>
    </Router>
  );
}

export default App;
