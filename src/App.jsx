import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Register } from "./pages/Register"
import { Calendar } from './pages/Calendar'
import { Login } from './pages/Login'
import { VerifyEmail } from './pages/VerifyEmail'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Charts } from './pages/Charts'
import { Layout } from './pages/Layout' 


function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />

        <Route element={<Layout />}>
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/charts" element={<Charts/>}/>
        </Route>

      </Routes>
    </Router>
    </>
  )
}

export default App