
import { ToastContainer } from 'react-toastify';
import './App.css';
import ImageUpload from './pages/ImageUpload';

function App() {
  return (
    <div className="App">
      <ImageUpload />
      <ToastContainer/>
    </div>
  );
}

export default App;
