import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import WardDashboard from './pages/WardDashboard';
import PatientDetail from './pages/PatientDetail';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen overflow-hidden px-3 py-3 sm:px-4 sm:py-4">
        <NavBar />
        <main className="dashboard-shell flex-1 overflow-hidden min-h-0">
          <Routes>
            <Route path="/" element={<WardDashboard />} />
            <Route path="/patient/:id" element={<PatientDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
