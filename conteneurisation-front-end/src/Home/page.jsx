import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
    Card,
    Row,
    Col,
    Button,
    Modal,
    Input,
    Dropdown,
    Menu,
    notification,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    EllipsisOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";

const Home = () => {
    const [etudiants, setEtudiants] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalEditingVisible, setIsModalEditingVisible] = useState(false);
    const [newStudentName, setNewStudentName] = useState("");
    const [editingStudent, setEditingStudent] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = () => {
        axios
            .get("http://localhost:8080/api/etudiants")
            .then((response) => {
                setEtudiants(response.data);
            })
            .catch((error) => {
                notification.error({
                    message: "Error",
                    description: "Failed to fetch students",
                });
                console.error("Error fetching students:", error);
            });
    };

    const handleAddButtonClick = () => {
        setIsModalVisible(true);
    };
    const calculerMoyenne = (notes) => {
        console.log("Student notes:", notes); // Add this for debugging
        if (!Array.isArray(notes) || notes.length === 0) {
            return 0;
        }
        const total = notes.reduce((acc, note) => acc + note.valeur, 0);
        return total / notes.length;
    };
    
    const handleModalOk = () => {
        if (!newStudentName.trim()) {
            notification.error({
                message: "Invalid Input",
                description: "Please enter a valid name!",
            });
            return;
        }

        axios
            .post("http://localhost:8080/api/etudiants", { nom: newStudentName })
            .then((response) => {
                setEtudiants([...etudiants, response.data]);
                notification.success({
                    message: "Success",
                    description: "Student added successfully!",
                });
                setIsModalVisible(false);
                setNewStudentName("");
            })
            .catch((error) => {
                notification.error({
                    message: "Error",
                    description: "Failed to add student. Please try again.",
                });
                console.error("Error adding student:", error);
            });
    };

    const handleUpdateButtonClick = (etudiant) => {
        setEditingStudent(etudiant);
        setIsModalEditingVisible(true);
    };

    const handleModalEditingOk = () => {
        if (!editingStudent || !editingStudent.nom.trim()) {
            notification.error({
                message: "Invalid Input",
                description: "Please enter a valid name!",
            });
            return;
        }

        axios
            .patch(`http://localhost:8080/api/etudiants/${editingStudent.id}`, {
                nom: editingStudent.nom,
            })
            .then(() => {
                fetchStudents();
                notification.success({
                    message: "Success",
                    description: "Student updated successfully!",
                });
                setIsModalEditingVisible(false);
                setEditingStudent(null);
            })
            .catch((error) => {
                notification.error({
                    message: "Error",
                    description: "Failed to update student. Please try again.",
                });
                console.error("Error updating student:", error);
            });
    };

    const handleDelete = (etudiant) => {
        Modal.confirm({
            title: "Confirm Deletion",
            content: `Are you sure you want to delete ${etudiant.nom}?`,
            onOk: () => {
                axios
                    .delete(`http://localhost:8080/api/etudiants/${etudiant.id}`)
                    .then(() => {
                        setEtudiants(etudiants.filter((e) => e.id !== etudiant.id));
                        notification.success({
                            message: "Deleted",
                            description: "Student deleted successfully!",
                        });
                    })
                    .catch((error) => {
                        notification.error({
                            message: "Error",
                            description: "Failed to delete student.",
                        });
                        console.error("Error deleting student:", error);
                    });
            },
        });
    };

    const renderMenu = (etudiant) => (
        <Menu
            items={[
                {
                    key: "edit",
                    label: "Edit",
                    icon: <EditOutlined />,
                    onClick: () => handleUpdateButtonClick(etudiant),
                },
                {
                    key: "delete",
                    label: "Delete",
                    icon: <DeleteOutlined />,
                    onClick: () => handleDelete(etudiant),
                },
            ]}
        />
    );

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ textAlign: "center", marginBottom: "20px" }} className="logo">
                🎓 Student Manager
            </h1>

            <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ marginBottom: "20px" , backgroundColor:"grey"}}
                onClick={handleAddButtonClick}
            >
                Add Student
            </Button>

            <Row gutter={[16, 16]}>
                {etudiants.map((etudiant) => (
                    <Col xs={24} sm={12} lg={8} key={etudiant.id}>
                        <Card
                            title={
                                <Link
                                    to={`/student/${etudiant.id}`}
                                    style={{ color: "inherit", textDecoration: "none" }}
                                >
                                    {etudiant.nom}
                                </Link>
                            }
                            extra={
                                <Dropdown overlay={renderMenu(etudiant)} trigger={["click"]}>
                                    <EllipsisOutlined style={{ fontSize: "20px" }} />
                                </Dropdown>
                            }
                            style={{
                                border: `2px solid "#F4C2C2"`,
                            }}
                        >
                            <p>
                                <strong>Date de Création:</strong> {etudiant.dateCreation}
                            </p>
                            <p style={{color :calculerMoyenne(etudiant.notes).toFixed(2) >10 ?"#80ee6d" : "#ff7e6e" }}>
                                <strong>Moyenne:</strong> {calculerMoyenne(etudiant.notes).toFixed(2)}
                            </p>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Add Student Modal */}
            <Modal
                title="Add New Student"
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Add"
                cancelText="Cancel"
            >
                <Input
                    placeholder="Enter student's name"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                />
            </Modal>

            {/* Edit Student Modal */}
            <Modal
                title="Update Student"
                visible={isModalEditingVisible}
                onOk={handleModalEditingOk}
                onCancel={() => setIsModalEditingVisible(false)}
                okText="Update"
                cancelText="Cancel"
            >
                <Input
                    placeholder="Enter student's name"
                    value={editingStudent?.nom || ""}
                    onChange={(e) =>
                        setEditingStudent((prev) => ({ ...prev, nom: e.target.value }))
                    }
                />
            </Modal>
        </div>
    );
};

export default Home;
