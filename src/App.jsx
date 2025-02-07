
import { ToastContainer } from 'react-toastify';
import './App.css';
import ImageUpload from './pages/ImageUpload';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CameraToggle from './pages/CameraToggle';
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ImageUpload />} />
          <Route path="/camera" element={<CameraToggle />} />
        </Routes>
      </BrowserRouter>
      <ImageUpload />
      <ToastContainer />
    </div>
  );
}

export default App;
