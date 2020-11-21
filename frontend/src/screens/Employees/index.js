import React, { useEffect, useState } from "react";
import { Row, Col, Button, Table, Alert } from "react-bootstrap";
import Loading from "../../components/Loading";
import axios from "axios";
import { URL_HOST } from "../../config";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const ListEmployee = ({ list, deleteProfile }) => {
  return (
    <Table striped bordered hover variant="dark">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nume</th>
          <th>Deconectat</th>
          <th style={{ textAlign: "center" }}>
            <div style={{ textAlign: "right" }}>
              <Link to="/ovpn/add" className="btn btn-small btn-primary">
                Adauga
              </Link>
            </div>
            <p style={{ marginTop: 10 }}>Optiuni</p>
          </th>
        </tr>
      </thead>
      <tbody>
        {list.map((each) => (
          <tr key={`ovpn-list-${each.id}`}>
            <td>{each.id}</td>
            <td>{each.name}</td>
            <td>
              {each.lastLoggedOut === "jan/01/1970 00:00:00"
                ? "-"
                : each.lastLoggedOut}
            </td>
            <td style={{ textAlign: "center" }}>
              <Button
                size="sm"
                style={{ marginRight: 5 }}
                onClick={() => deleteProfile(each)}
                variant="danger"
              >
                Sterge
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const Employees = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      axios
        .get(`${URL_HOST}/ovpns`)
        .then(({ data: { employee } }) => setList(employee))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    };

    loadAll();
  }, []);

  const deleteProfile = (profile) => {
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
        axios
          .delete(`${URL_HOST}/ovpn/${profile.id}`)
          .then(() => {
            // remove from lists
            setList(list.filter((each) => each.id !== profile.id));
            Swal.fire(
              "Profilu sters!",
              "Profilul si certificatul a fost sters /revocat.",
              "success"
            );
          })
          .catch(() =>
            Swal.fire("Eroare!", "Profilul nu a putut fi sters.", "error")
          )
          .finally(() => setLoading(false));
      }
    });
  };

  if (loading) return <Loading />;

  return (
    <Row>
      <Col md={12}>
        <Link to="/certificates" className="btn btn-primary my-2">
          Certificate
        </Link>
        <Alert variant="info">
          <h3>Cum se foloseste?</h3>
          <p>
            Se creaza un profil cu user si parola, dupa crearea profilului se
            genereaza automat un certificat. <br /> Se cauta certificatul creat
            in lista de certificate, se semneaza prima data. Durata de semnare a
            certificatului poate dura si 1 minut, se asteapta si se face un
            refresh la pagina. Va aparea un buton "Descarca .ovpn". <br />
            Daca este prima data, se cere o parola pentru criptarea fisierului
            si cateva date, aceste date sunt auto-completate, pentru mai multe
            informatii legate de aceste date, folositi documentatia de la OPEN
            VPN. <br />
            Dupa validarea datelor incepe procesul de descare fisier
            **nume**.opvn cu care se importa in aplicatia Open VPN Connect /
            Client.
          </p>
        </Alert>
        <ListEmployee list={list} deleteProfile={deleteProfile} />
      </Col>
    </Row>
  );
};
export default Employees;
