import React, { useEffect, useState } from "react";
import axios from "axios";
import { URL_HOST } from "../../config";
import Loading from "../../components/Loading";
import { Link } from "react-router-dom";
import { Button, Col, Table, Row, Alert } from "react-bootstrap";
import Swal from "sweetalert2";

const ListCertificates = ({
  list,
  revoke,
  downloadOvpn,
  signCertificate,
  loading,
}) => {
  console.log(list);
  return (
    <Table striped bordered hover variant="dark">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nume</th>
          <th>Expira in</th>
          <th style={{ textAlign: "center" }}>
            <p style={{ marginTop: 10 }}>Optiuni</p>
          </th>
        </tr>
      </thead>
      <tbody>
        {list.map((each) => (
          <tr key={`ovpn-list-${each.id}`}>
            <td>{each.id}</td>
            <td>{each.name}</td>
            <td>{each.invalidAfter}</td>
            <td style={{ textAlign: "center" }}>
              {each.fingerprint ? (
                <Button
                  size="sm"
                  disabled={loading}
                  style={{ marginRight: 5 }}
                  onClick={() => downloadOvpn(each)}
                >
                  Descarca .ovpn
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={loading}
                  style={{ marginRight: 5 }}
                  variant="info"
                  onClick={() => signCertificate(each)}
                >
                  Semneaza certificatul
                </Button>
              )}
              <Button
                size="sm"
                disabled={loading}
                style={{ marginRight: 5 }}
                onClick={() => revoke(each)}
                variant="danger"
              >
                Revocare / Stergere
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const Certificates = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(false);
  useEffect(() => {
    const loadAll = async () => {
      axios
        .get(`${URL_HOST}/certificates`)
        .then(({ data: { certificates } }) => setList(certificates))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    };

    loadAll();
  }, []);

  const revoke = (certificate) => {
    Swal.fire({
      title: "Sunteti sigur?",
      text:
        "Stergerea profilui va duce si la revokarea certificatul deja semnat daca acesta exista.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Da, sterge-l!",
      cancelButtonText: "Nu, renunta!",
    }).then((result) => {
      if (result.value) {
        setLoadingConfig(true);
        axios
          .delete(`${URL_HOST}/certificates/${certificate.id}`)
          .then(() =>
            Swal.fire(
              "Revocat!",
              "Certificatul a fost revocat / sters.",
              "success"
            )
          )
          .catch((err) => {
            Swal.fire("Error!", "Nu s-a putut revoca sau sterge.", "error");
          })
          .finally(() => setLoadingConfig(false));
      }
    });
  };

  const signCertificate = (certificate) => {
    Swal.fire({
      title: "Sunteti sigur?",
      text: `Semnarea certificatului ii da dreptul de conectare prin VPN
        dar stergerea ulterioara nu mai este posibila decat revocare.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Da, semneaza-l!",
      cancelButtonText: "Nu, renunta!",
    }).then((result) => {
      if (result.value) {
        setLoadingConfig(true);
        axios
          .post(`${URL_HOST}/certificates`, {
            ...certificate,
          })
          .then(() =>
            Swal.fire(
              "Succes!",
              "Certificatul este in proces de semnatura, dati refresh la pagina in 10-20 secunde.",
              "success"
            )
          )
          .catch(() => {
            Swal.fire("Error!", "Nu s-a putut semna certifactul.", "error");
          })
          .finally(() => setLoadingConfig(false));
      }
    });
  };

  const downloadOvpn = (certificate) => {
    const url = `${URL_HOST}/certificates/downloads/${certificate.id}`;
    axios
      .get({
        url,
        method: "GET",
        responseType: "blob",
      })
      .then(({ data }) => {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        link.href = url;
        link.style = { display: "none" };
        link.setAttribute("download", `${certificate.name}.ovpn`);
        document.body.appendChild(link);
        link.click();
      })
      .catch(() =>
        Swal.fire(
          "Eroare descarcare!",
          "Certificatul nu a putut fi descarcat.",
          "error"
        )
      );
  };

  if (loading) return <Loading />;

  return (
    <Row>
      <Col md={12}>
        <Link to="/" className="btn btn-primary my-2">
          Lista cu profile
        </Link>
        <Alert variant="info">
          <h2>Nota!</h2>
          <p>
            Certificatele se creaza automat la crearea unui profil al
            angajatului.
            <br />
            Acesta este o lista de certificate create iar revokarea se poate
            face mai jos, acesta impiedica conectarea la VPN.
            <br /> Nu se poate reactiva certificatul odata revocat sau sters.
            Necesita stergerea profilului si recreare acestuia.
          </p>
        </Alert>
        <ListCertificates
          list={list}
          revoke={revoke}
          downloadOvpn={downloadOvpn}
          signCertificate={signCertificate}
          loading={loadingConfig}
        />
      </Col>
    </Row>
  );
};

export default Certificates;