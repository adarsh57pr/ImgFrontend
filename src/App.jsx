
import { ToastContainer } from 'react-toastify';
import './App.css';
import ImageUpload from './pages/ImageUpload';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import CaptureImage from './pages/CaptureImage';
// import CameraToggle from './pages/CameraToggle';
// import Face from './pages/Face';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ImageUpload />} />
          {/* <Route path="/" element={<CaptureImage/>} /> */}
          {/* <Route path="/" element={<Face />} /> */}
          {/* <Route path="/camera" element={<CameraToggle />} /> */}
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </div>
  );
}

export default App;
