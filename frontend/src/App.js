import React from "react";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Employees from "./screens/Employees";
import Employee from "./screens/Employee";
import Certificates from "./screens/Certificates";

function App() {
  return (
    <Router>
      <Container style={{ marginTop: 50 }}>
        <Switch>
          <Route exact path="/">
            <Employees />
          </Route>
          <Route path="/ovpn/add">
            <Employee />
          </Route>

          <Route path="/certificates">
            <Certificates />
          </Route>
        </Switch>
      </Container>
    </Router>
  );
}

export default App;
