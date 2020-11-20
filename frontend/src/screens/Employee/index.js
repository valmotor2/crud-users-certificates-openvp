import React, { useState } from "react";

import { Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

import { URL_HOST } from "../../config";

const INIT_EMPLOYEE = {
  name: "",
  password: "",
  password2: "",
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
    employee.password2.length !== 8 &&
      errors.push(
        "Parola 2 trebuie sa fie de 8 caracatere si sa includa doar cifre."
      );
    /^[0-9.]+$/.test(employee.password2) === false &&
      errors.push("Folositi doar cifre la parola secundara.");

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
        setErr([err.message || "Error SYSTEM!"]);
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

      <Form.Group controlId="formBasicPassword">
        <Form.Label>Parola 2</Form.Label>
        <Form.Control
          type="password"
          value={employee.password2}
          placeholder="Introduceti parola"
          onChange={(ev) => receivedFromInput(ev.target.value, "password2")}
        />
        <Form.Text className="text-muted">
          Acesta va fi parola pentru decodarea fisierului care permite conectare
          la VPN
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
        Renunta
      </Link>
    </Form>
  );
};

export default Employee;
