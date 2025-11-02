import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Register } from "./pages/Register"
import { Calendar } from './pages/Calendar'
import { CalendarComponent } from './pages/CalendarComponent'
import { Login } from './pages/Login'
import { VerifyEmail } from './pages/VerifyEmail'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Charts } from './pages/Charts'


function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/comp" element={<CalendarComponent />} />
        <Route path="/verify-email" element={<VerifyEmail/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />
        <Route path="/charts" element={<Charts/>}/>
      </Routes>
    </Router>
    </>
  )
}

export default App
