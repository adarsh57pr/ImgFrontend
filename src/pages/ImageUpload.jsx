import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../App.css'; // import the CSS file

function ImageUpload() {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [similarImages, setSimilarImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle file input change (image selection from file picker)
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera: ', err);
      toast.error('Failed to access camera.',{position:'top-center'});
    }
  };

  // Capture a photo from the camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
      setImage(imageDataUrl);
      stopCamera(); // Stop camera after capturing
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  // Handle search similar images
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.warning('Please select an image to upload.',{position:'top-center'});
      return;
    }

    setLoading(true);
    setMessage('');
    setSimilarImages([]);

    try {
      const response = await axios.post('https://imgbackend-u5mv.onrender.com/search', { imageBase64: image }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.similarImages && response.data.similarImages.length > 0) {
        setSimilarImages(response.data.similarImages);
        toast.success('similar images fetch successfully',{position:'top-center'})
      } else {
        toast.error('No similar images found.',{position:'top-center'});
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error occurred while searching for similar images.',{position:'top-center'});
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload to server
  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setMessage('Please select an image to upload.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('https://imgbackend-u5mv.onrender.com/upload',
        { imageBase64: image },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.message) {
        toast.success(response.data.message,{position:'top-center'});
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error occurred while uploading the image.',{position:'top-center'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1 className='font-bold'>Image Search & Find..</h1>

  <div className=''>
  <form onSubmit={handleUploadSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Image to Database'}
        </button>
      </form>

  </div>
      <div className="camera-controls">
        <button onClick={startCamera} disabled={isCameraActive || loading}>
          {isCameraActive ? 'Camera Active' : 'Open Camera'}
        </button>
        <button onClick={capturePhoto} disabled={!isCameraActive || loading}>
          {loading ? 'Capturing...' : 'Capture Image'}
        </button>
      </div>

      {isCameraActive && (
        <div className="camera-view">
          <video ref={videoRef} width="100%" autoPlay />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {message && <p>{message}</p>}

      <hr />

      <form onSubmit={handleSearchSubmit}>
        <button type="submit" disabled={loading || !image}>
          {loading ? 'Searching...' : 'Search Similar Images'}
        </button>
      </form>

    <div className=''>
    {similarImages.length > 0 && (
        <div className='bg-gray-200 py-5 w-2/3 m-auto'>
          <h2>Similar Images</h2>
          <div className="image-gallery ">
            {similarImages.map((image, index) => (
              <div key={index} className="image-item ">
                <img
                  src={`https://imgbackend-u5mv.onrender.com/uploads/${image.filename}`}
                  alt={image.filename}
                className='h-48 w-32'
                />
                <p>{image.filename}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default ImageUpload;