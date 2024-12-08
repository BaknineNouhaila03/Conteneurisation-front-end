import './App.css';
import Home from './Home/page';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DetailEtudiant from './DetailEtudiant/DetailEtudiant';

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/student/:id" element={<DetailEtudiant />} />
        </Routes>
    </Router>
);
}

export default App;
