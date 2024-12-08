import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dropdown, Menu, Modal, Input, message } from "antd";
import { Link } from "react-router-dom";
import { EllipsisOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";

const Home = () => {
    const [etudiants, setEtudiants] = useState([]);
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalEditingVisible, setIsModalEditingVisible] = useState(false);
    const [newStudentName, setNewStudentName] = useState("");
    const [editingStudent, setEditingStudent] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = () => {
        axios.get("http://localhost:8080/api/etudiants")
            .then((response) => {
                setEtudiants(response.data);
            })
            .catch((error) => {
                message.error("Failed to fetch students");
                console.error("Error fetching students:", error);
            });
    };

    const sortData = (field) => {
        const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortOrder(order);

        const sortedData = [...etudiants].sort((a, b) => {
            if (field === "nom") {
                return order === "asc"
                    ? a.nom.localeCompare(b.nom)
                    : b.nom.localeCompare(a.nom);
            }
            return 0;
        });

        setEtudiants(sortedData);
    };

    const handleAddButtonClick = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        if (!newStudentName.trim()) {
            message.error("Please enter a valid name!");
            return;
        }    
        axios
            .post("http://localhost:8080/api/etudiants", { nom: newStudentName }) 
            .then((response) => {
                setEtudiants([...etudiants, response.data]); 
                message.success("Student added successfully!");
                setIsModalVisible(false);
                setNewStudentName("");
            })
            .catch((error) => {
                message.error("Failed to add student. Please try again.");
                console.error("Error adding student:", error);
            });
    };

    const handleUpdateButtonClick = (etudiant) => {
        setEditingStudent(etudiant);
        setIsModalEditingVisible(true);
    };

    const handleModalEditingOk = () => {
        if (!editingStudent || !editingStudent.nom.trim()) {
            message.error("Please enter a valid name!");
            return;
        }    
        axios
            .patch(`http://localhost:8080/api/etudiants/${editingStudent.id}`, { nom: editingStudent.nom }) 
            .then((response) => {
                fetchStudents(); // Refetch students to get updated list
                message.success("Student updated successfully!");
                setIsModalEditingVisible(false);
                setEditingStudent(null);
            })
            .catch((error) => {
                message.error("Failed to update student. Please try again.");
                console.error("Error updating student:", error);
            });
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setIsModalEditingVisible(false);
        setNewStudentName("");
        setEditingStudent(null);
    };

    const handleMenuClick = (key, etudiant) => {
        if (key === "edit") {
            handleUpdateButtonClick(etudiant);
        } else if (key === "delete") {
            Modal.confirm({
                title: 'Are you sure you want to delete this student?',
                content: `Student Name: ${etudiant.nom}`,
                onOk() {
                    axios.delete(`http://localhost:8080/api/etudiants/${etudiant.id}`)
                        .then(() => {
                            setEtudiants(etudiants.filter((e) => e.id !== etudiant.id));
                            message.success('Student deleted successfully');
                        })
                        .catch((error) => {
                            console.error('Error deleting student:', error);
                            message.error('Failed to delete student');
                        });
                },
            });
        }
    };

    const renderMenu = (etudiant) => (
        <Menu
            onClick={({ key }) => handleMenuClick(key, etudiant)}
            items={[
                { label: "Edit", key: "edit" },
                { label: "Delete", key: "delete" },
            ]}
        />
    );

    return (
        <div>
            <div className="centered-container">
                <h2 className="logo">Student Manager</h2>
                <table className="student-table">
                    <thead>
                        <tr
                            style={{
                                backgroundColor: "grey",
                                color: "white",
                                textAlign: "left",
                                fontWeight: "bold",
                            }}
                        >
                            <th
                                style={{ padding: "12px 15px", cursor: "pointer" }}
                                onClick={() => sortData("nom")}
                            >
                                Nom {sortField === "nom" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>

                            <th style={{ padding: "12px 15px" }}>Date de Création</th>
                            <th
                                style={{
                                    textAlign: "center",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <button className="addButton" onClick={handleAddButtonClick}>
                                    +
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {etudiants.map((etudiant) => (
                            <tr
                                key={etudiant.id}
                                style={{
                                    backgroundColor: etudiant.moyenne > 10 ? "#d4edda" : "#f8d7da",
                                    color: etudiant.moyenne > 10 ? "#155724" : "#721c24",
                                    textAlign: "left",
                                }}
                            >
                                <td style={{ padding: "12px 15px", borderBottom: "1px solid #ddd" }}>
                                    <Link to={`/student/${etudiant.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                                        {etudiant.nom}
                                    </Link>
                                </td>
                                <td style={{ padding: "12px 15px", borderBottom: "1px solid #ddd" }}>
                                    {etudiant.dateCreation}
                                </td>
                                <td
                                    style={{
                                        padding: "12px 15px",
                                        textAlign: "center",
                                        borderBottom: "1px solid #ddd",
                                    }}
                                >
                                    <Dropdown overlay={renderMenu(etudiant)} trigger={["click"]}>
                                        <EllipsisOutlined
                                            style={{ fontSize: "20px", cursor: "pointer" }}
                                        />
                                    </Dropdown>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Modal
                    title="Add New Student"
                    visible={isModalVisible}
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                    okText="Add"
                    cancelText="Cancel"
                >
                    <Input
                        placeholder="Enter student's name"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                    />
                </Modal>

                <Modal
                    title="Update Student"
                    visible={isModalEditingVisible}
                    onOk={handleModalEditingOk}
                    onCancel={handleModalCancel}
                    okText="Update"
                    cancelText="Cancel"
                >
                    <Input
                        placeholder="Enter student's name"
                        value={editingStudent?.nom || ''}
                        onChange={(e) => setEditingStudent(prev => ({ ...prev, nom: e.target.value }))}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default Home;