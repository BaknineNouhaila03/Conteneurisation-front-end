import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Modal, Input, message } from "antd";
import "antd/dist/reset.css"; // Ensure Ant Design styles are applied

const DetailEtudiant = () => {
    const { id } = useParams(); 
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newNote, setNewNote] = useState("");

    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/etudiants/${id}`)
            .then((response) => {
                setStudent(response.data); 
                setLoading(false);
            })
            .catch((error) => {
                setError("Failed to fetch student details");
                setLoading(false);
            });
    }, [id]);

    const handleAddNote = () => {
        if (!newNote.trim()) {
            message.error("Please enter a valid note!");
            return;
        }

        // Assume you have an API endpoint to add a note
        axios
            .post(`http://localhost:8080/api/etudiants/${id}/notes`, { note: newNote })
            .then((response) => {
                setStudent((prevStudent) => ({
                    ...prevStudent,
                    notes: [...prevStudent.notes, newNote],
                }));
                message.success("Note added successfully!");
                setIsModalVisible(false);
                setNewNote("");
            })
            .catch((error) => {
                message.error("Failed to add note. Please try again.");
                console.error("Error adding note:", error);
            });
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setNewNote("");
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!student) {
        return <div>No student data found.</div>;
    }

    return (
        <div className="centered-container">
            <h2 className="logo">Student Details</h2>
            <div className="student-table-container">
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
                            <th style={{ padding: "12px 15px" }}>Nom Matière</th>
                            <th style={{ padding: "12px 15px" }}>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {student.notes && student.notes.length > 0 ? (
                            student.notes.map((note, index) => (
                                <tr
                                    key={index}
                                    style={{
                                        backgroundColor:
                                            student.moyenne > 10 ? "#d4edda" : "#f8d7da",
                                        color: student.moyenne > 10 ? "#155724" : "#721c24",
                                    }}
                                >
                                    <td style={{ padding: "12px 15px", borderBottom: "1px solid #ddd" }}>
                                        {note.matiere} {/* Assuming each note has a matière property */}
                                    </td>
                                    <td style={{ padding: "12px 15px", borderBottom: "1px solid #ddd" }}>
                                        {note.note} {/* Assuming each note has a note property */}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" style={{ textAlign: "center", padding: "12px 15px" }}>
                                    No notes available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <button className="addNote" onClick={() => setIsModalVisible(true)}>
                    Add Note
                </button>
            </div>

            <Modal
                title="Add New Note"
                visible={isModalVisible}
                onOk={handleAddNote}
                onCancel={handleModalCancel}
                okText="Add"
                cancelText="Cancel"
            >
                <Input
                    placeholder="Enter a new note"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default DetailEtudiant;
