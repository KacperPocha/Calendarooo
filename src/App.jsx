import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CheckUser } from "./pages/CheckUser"
import { AddUser } from "./pages/AddUser"
import { Calendar } from './pages/Calendar'
import { DeleteUser } from './pages/DeleteUser'
import { CalendarComponent } from './pages/CalendarComponent'


function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<CheckUser />} />
        <Route path="/register" element={<AddUser />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/deleteuser" element={<DeleteUser />} />
        <Route path="/comp" element={<CalendarComponent />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
