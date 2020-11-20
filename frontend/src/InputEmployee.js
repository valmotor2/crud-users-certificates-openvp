import React from "react";

import { Form, Button } from "react-bootstrap";

const InputEmployee = () => {
  return (
    <Form>
      <Form.Group controlId="formBasicEmail">
        <Form.Label>Nume</Form.Label>
        <Form.Control type="text" placeholder="Introduceti numele" />
        <Form.Text className="text-muted">
          Trebuie sa fie unic si cu forma: nume.prenume.firma.domeniu
        </Form.Text>
      </Form.Group>

      <Form.Group controlId="formBasicPassword">
        <Form.Label>Parola</Form.Label>
        <Form.Control type="password" placeholder="Introduceti parola" />
        <Form.Text className="text-muted">
          Acesta va fi parola pentru utilizator
        </Form.Text>
      </Form.Group>

      <Form.Group controlId="formBasicPassword">
        <Form.Label>Parola 2</Form.Label>
        <Form.Control type="password2" placeholder="Introduceti parola" />
        <Form.Text className="text-muted">
          Acesta va fi parola pentru decodarea fisierului care permite conectare
          la VPN
        </Form.Text>
      </Form.Group>

      <Button variant="primary" type="submit" style={{ marginRight: 10 }}>
        Salveaza
      </Button>

      <Button variant="secondary" type="submit">
        Renunta
      </Button>
    </Form>
  );
};

export default InputEmployee;
