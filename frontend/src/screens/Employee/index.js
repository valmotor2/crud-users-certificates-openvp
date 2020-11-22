import React, { useState } from "react";

import { Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { getErrorFromResponse } from "../../Helpers";
import { URL_HOST } from "../../config";

const INIT_EMPLOYEE = {
  name: "",
  password: "",
};

const Employee = () => {
  const [employee, setEmployee] = useState(INIT_EMPLOYEE);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState([]);
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const errors = [];
    employee.name.length < 10 &&
      errors.push("Completati numele cu cel putin 10 caractere.");
    /^[a-z.]+$/.test(employee.name) === false &&
      errors.push(
        "Folositi doar literele alfabetului si puncte, fara spatiu sau alte caractere si litere mici."
      );
    employee.password.length < 10 &&
      errors.push("Completati parola cu cel putin 10 caractere.");

    return errors;
  };

  const receivedFromInput = (value, attr) => {
    setEmployee({ ...employee, [attr]: value });
  };

  const saveEmployee = () => {
    const errors = validate();
    setErr([]);
    setSaved(false);
    if (errors.length) {
      return setErr(errors);
    }

    setLoading(true);

    axios
      .post(`${URL_HOST}/ovpn`, employee)
      .then(() => {
        setEmployee(INIT_EMPLOYEE);
        setSaved(true);
      })
      .catch((err) => {
        setErr([getErrorFromResponse(err)]);
      })
      .finally(() => setLoading(false));
  };

  return (
    <Form>
      <h3>Creati un profil nou pentru VPN</h3>
      {saved && <Alert variant="success">Inregistrarea a fost salvata!</Alert>}
      {err.length > 0 && (
        <Alert variant="danger">
          <h3>Eroare</h3>
          {err.map((e, k) => (
            <span key={k}>
              {e}
              <br />
            </span>
          ))}
        </Alert>
      )}
      <Form.Group controlId="formBasicEmail">
        <Form.Label>Nume</Form.Label>
        <Form.Control
          type="text"
          placeholder="Introduceti numele"
          value={employee.name}
          onChange={(ev) => receivedFromInput(ev.target.value, "name")}
        />
        <Form.Text className="text-muted">
          Trebuie sa fie unic si cu forma: nume.prenume.firma.domeniu
        </Form.Text>
      </Form.Group>

      <Form.Group controlId="formBasicPassword">
        <Form.Label>Parola</Form.Label>
        <Form.Control
          type="password"
          value={employee.password}
          placeholder="Introduceti parola"
          onChange={(ev) => receivedFromInput(ev.target.value, "password")}
        />
        <Form.Text className="text-muted">
          Acesta va fi parola pentru utilizator
        </Form.Text>
      </Form.Group>

      <Button
        variant="primary"
        disabled={loading}
        type="button"
        style={{ marginRight: 10 }}
        onClick={saveEmployee}
      >
        Salveaza
      </Button>

      <Link to="/" className="btn btn-danger">
        Inapoi la profile
      </Link>
    </Form>
  );
};

export default Employee;
