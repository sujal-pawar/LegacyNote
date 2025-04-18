import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import CreateNote from '../pages/CreateNote';
import EditNote from '../pages/EditNote';
import ViewNote from '../pages/ViewNote';
import SharedNote from '../pages/SharedNote';
import SelfMessage from '../pages/SelfMessage';
import NotFound from '../pages/NotFound';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyEmail from '../pages/VerifyEmail';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/create-note" element={<PrivateRoute><CreateNote /></PrivateRoute>} />
      <Route path="/edit-note/:id" element={<PrivateRoute><EditNote /></PrivateRoute>} />
      <Route path="/view-note/:id" element={<PrivateRoute><ViewNote /></PrivateRoute>} />
      <Route path="/self-message" element={<PrivateRoute><SelfMessage /></PrivateRoute>} />
      
      {/* Public shared note route */}
      <Route path="/shared-note/:id/:accessKey" element={<SharedNote />} />
      
      {/* Not Found route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 