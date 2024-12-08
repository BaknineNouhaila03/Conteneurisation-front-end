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
    const [matiere, setMatiere] = useState(""); // State for matière
    const [note, setNote] = useState(""); // State for note

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
        if (!matiere.trim() || !note.trim()) {
            message.error("Please enter both matière and note!");
            return;
        }

        // Assume you have an API endpoint to add a note
        axios
            .post(`http://localhost:8080/api/etudiants/${id}/notes`, { matiere, note })
            .then((response) => {
                // Update the student data with the new note
                setStudent((prevStudent) => ({
                    ...prevStudent,
                    notes: [...prevStudent.notes, { matiere, note }],
                }));
                message.success("Note added successfully!");
                setIsModalVisible(false);
                setMatiere(""); // Reset the matière input
                setNote(""); // Reset the note input
            })
            .catch((error) => {
                message.error("Failed to add note. Please try again.");
                console.error("Error adding note:", error);
            });
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setMatiere(""); // Reset on cancel
        setNote(""); // Reset on cancel
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
                                        {note.matiere}
                                    </td>
                                    <td style={{ padding: "12px 15px", borderBottom: "1px solid #ddd" }}>
                                        {note.note}
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
                    placeholder="Enter matière"
                    value={matiere}
                    onChange={(e) => setMatiere(e.target.value)}
                />
                <Input
                    placeholder="Enter note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ marginTop: "10px" }} // Adding space between inputs
                />
            </Modal>
        </div>
    );
};

export default DetailEtudiant;
