import { Routes, Route, useLocation } from 'react-router-dom';
import { NavBar } from './components/NavBar/NavBar';
import { CompanySelect } from './pages/CompanySelect/CompanySelect';
import { Index } from './pages/Index/Index';
import { Login } from './pages/Login/Login';
import { Meeting } from './pages/Meeting/Meeting';
import { Report } from './pages/Report/Report';
import { Minute } from './pages/Minute/Minute';
import { Training } from './pages/Training/Training';
import { Gantt } from './pages/Gantt/Gantt';
import { GanttDelivery } from './pages/GanttDelivery/GanttDelivery';
import { Register } from './pages/Register/Register';
import { CreateTraining } from './pages/CreateTraining/CreateTraining';

export function App() {

  const location = useLocation();
  const showNavBar = location.pathname !== '/login' && location.pathname !=='/';

  return (
    <>
        {showNavBar && <NavBar />}
        <Routes>
          <Route path="/" element={<CompanySelect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/index" element={<Index />} />
          <Route path="/meeting" element={<Meeting />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/reports/minute/:id_reunion" element={<Minute />} />
          <Route path="/gantt" element={<Gantt />} />
          <Route path="/gantt/delivery" element={<GanttDelivery />} />
          <Route path="/register" element={<Register />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/create" element={<CreateTraining />} />
        </Routes>
    </>
  );

}
