import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { NavBar } from './components/NavBar/NavBar';
import { CompanySelect } from './pages/CompanySelect/CompanySelect';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Profile } from './pages/Profile/Profile';
import { Index } from './pages/Index/Index';
import { CreateMeeting } from './pages/CreateMeeting/CreateMeeting';
import { Meeting } from './pages/Meeting/Meeting';
import { Minute } from './pages/Minute/Minute';
import { Training } from './pages/Training/Training';
import { Gantt } from './pages/Gantt/Gantt';
import { GanttDelivery } from './pages/GanttDelivery/GanttDelivery';
import { CreateTraining } from './pages/CreateTraining/CreateTraining';
import { TrainingDetails } from './pages/TrainingDetails/TrainingDetails';

export function App() {

  const location = useLocation();
  const showNavBar = location.pathname !== '/login' && location.pathname !=='/';

  return (
    <>
        {showNavBar && <NavBar />}
        <Routes>
          <Route path="/" element={<CompanySelect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/index" element={<Index />} />
          <Route path="/meeting" element={<Meeting />} />
          <Route path="/meeting/create-meeting" element={<CreateMeeting />} />
          <Route path="/meeting/minute/:id_reunion" element={<Minute />} />
          <Route path="/gantt" element={<Gantt />} />
          <Route path="/gantt/delivery" element={<GanttDelivery />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/:id_capacitacion" element={<TrainingDetails />} />
          <Route path="/training/create" element={<CreateTraining />} />
          <Route path='*' element={<Navigate to="/" replace />}></Route>
        </Routes>
    </>
  );

}
