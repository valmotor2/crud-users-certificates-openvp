import React, { useEffect, useState } from "react";
import { Row, Col, Button, Table } from "react-bootstrap";
import Loading from "../../components/Loading";
import axios from "axios";
import { URL_HOST } from "../../config";
import { Link } from "react-router-dom";

const ListEmployee = ({ list }) => {
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
            <td>{each.lastLoggedOut}</td>
            <td style={{ textAlign: "center" }}>
              <Button
                size="sm"
                style={{ margin: 5 }}
                onKeyPress={() => console.log("presed")}
              >
                Descarca .ovpn
              </Button>

              <Button
                size="sm"
                style={{ marginRight: 5 }}
                onKeyPress={() => console.log("presed")}
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

  if (loading) return <Loading />;

  return (
    <Row>
      <Col md={12}>
        <ListEmployee list={list} />
      </Col>
    </Row>
  );
};
export default Employees;
