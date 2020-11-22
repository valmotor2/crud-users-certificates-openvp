import React, { useEffect, useState } from "react";
import { Alert, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import axios from "axios";
import { URL_HOST } from "../../config";
import { getErrorFromResponse } from "../../Helpers";

const Certificate = ({
  match: {
    params: { id = 0 },
  },
}) => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState([]);
  const [certificate, setCertificate] = useState(null);
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const getCertificate = async (id) => {
      try {
        setLoading(true);
        setErr([]);
        const {
          data: { certificate },
        } = await axios(`${URL_HOST}/certificates/${id}`);
        setCertificate(certificate);
      } catch (err) {
        setErr([getErrorFromResponse(err)]);
      } finally {
        setLoading(false);
      }
    };

    getCertificate(id);
  }, [id]);

  const downloadOVPN = () => {
    const errors = [];
    password.length !== 8 && errors.push("Parola trebuie sa aiba 8 cifre.");
    /^[0-9.]+$/.test(password) === false &&
      errors.push("Folositi doar cifre la parola.");

    if (errors.length) {
      setErr(errors);
      return;
    }

    setLoading(true);
    axios({
      url: `${URL_HOST}/certificates/downloads`,
      method: "POST",
      data: {
        certificate,
        password,
      },
      responseType: "blob",
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${certificate.name}.ovpn`);
        document.body.appendChild(link);
        link.click();
      })
      .catch((e) => {
        setErr([getErrorFromResponse(e)]);
      })
      .finally(() => setLoading(false));

    setSuccess(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Row>
      <Col md={12}>
        <Alert variant="info">
          Pentru descarcarea fisierului .ovpn aveti nevoie sa introduceti o
          cheie privata a certificatul, a doua parola.
        </Alert>
        {success && (
          <Alert variant="success">
            Cheia privata a fost generata cu succes!
          </Alert>
        )}
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

        <Form>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>Parola</Form.Label>
            <Form.Control
              type="password"
              value={password}
              placeholder="Introduceti parola"
              onChange={(ev) => setPassword(ev.target.value)}
            />
            <Form.Text className="text-muted">
              Acesta va fi parola pentru cheia privata si contine doar cifre si
              8 in total.
            </Form.Text>
          </Form.Group>

          <Button
            variant="primary"
            disabled={loading}
            type="button"
            style={{ marginRight: 10 }}
            onClick={downloadOVPN}
          >
            Descarca
          </Button>

          <Link to="/certificates" className="btn btn-danger">
            Inapoi la certificate
          </Link>
        </Form>
      </Col>
    </Row>
  );
};

export default Certificate;
