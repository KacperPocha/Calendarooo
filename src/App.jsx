import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Register } from "./pages/Register"
import { Calendar } from './pages/Calendar'
import { CalendarComponent } from './pages/CalendarComponent'
import { Login } from './pages/Login'


function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/comp" element={<CalendarComponent />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
