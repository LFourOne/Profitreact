import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Index } from './components/Index';
import { Login } from './components/Login';
import { Meeting } from './components/Meeting';
import { Report } from './components/Report';
import { Minute } from './components/Minute';
import { Training } from './components/Training';
import { Gantt } from './components/Gantt';
import { GanttDelivery } from './components/GanttDelivery';

export function App() {

  const location = useLocation();
  const showNavbar = location.pathname !== '/';

  return (
    <>
        {showNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/index" element={<Index />} />
          <Route path="/meeting" element={<Meeting />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/reports/minute/:id_reunion" element={<Minute />} />
          <Route path="/gantt" element={<Gantt />} />
          <Route path="/gantt/delivery" element={<GanttDelivery />} />
          <Route path="/training" element={<Training />} />
        </Routes>
    </>
  );

}
