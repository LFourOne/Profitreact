import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { NavBar } from './components/NavBar/NavBar';
import { CompanySelect } from './pages/CompanySelect/CompanySelect';
import { Login } from './pages/Login/Login';
import { UserManagement } from './pages/AdminManagement/UserManagement/UserManagement';
import { ProjectTaskReport } from './pages/AdminManagement/HHManagement/ProjectReportTask/ProjectReportTask';
import { Task } from './pages/AdminManagement/HHManagement/Task/Task';
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
import { HHRegister } from './pages/HHRegister/HHRegister';

export function App() {

  const location = useLocation();
  const showNavBar = location.pathname !== '/login' && location.pathname !=='/';

  return (
    <>
        {showNavBar && <NavBar />}
        <Routes>
          <Route path="/" element={<CompanySelect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/project-report-task" element={<ProjectTaskReport />} />
          <Route path="/admin/task" element={<Task />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/index" element={<Index />} />
          <Route path="/gantt" element={<Gantt />} />
          <Route path="/gantt/delivery" element={<GanttDelivery />} />
          <Route path="/hh-register" element={<HHRegister />} />
          <Route path="/meeting" element={<Meeting />} />
          <Route path="/meeting/create-meeting" element={<CreateMeeting />} />
          <Route path="/meeting/minute/:id_reunion" element={<Minute />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/:id_capacitacion" element={<TrainingDetails />} />
          <Route path="/training/create" element={<CreateTraining />} />
          <Route path='*' element={<Navigate to="/" replace />}></Route>
        </Routes>
    </>
  );

}
