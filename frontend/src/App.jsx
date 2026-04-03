import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import WardDashboard from './pages/WardDashboard';
import PatientDetail from './pages/PatientDetail';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <NavBar />
        <main className="flex-1 overflow-hidden min-h-0">
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
