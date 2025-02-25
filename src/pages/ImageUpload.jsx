import React, { useState, useRef, useEffect } from 'react';
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
  const [currentDeviceId, setCurrentDeviceId] = useState('');
  const [videoDevices, setVideoDevices] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Get list of available video devices
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setVideoDevices(videoDevices);
      if (videoDevices.length > 0) {
        setCurrentDeviceId(videoDevices[0].deviceId); // Default to the first available camera
      }
    });
  }, []);

  // Ensure video element is ready before starting the camera
  useEffect(() => {
    if (videoRef.current && isCameraActive) {
      startCamera();
    }
  },[isCameraActive]);

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

  // Start video stream from camera
  const startCamera = () => {
    const constraints = {
      video: { deviceId: currentDeviceId ? { exact: currentDeviceId } : undefined }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        setCameraStream(stream);
        videoRef.current.srcObject = stream;  // Set stream to video element
      })
      .catch((err) => {
        console.error('Error accessing camera: ', err);
        toast.error('Failed to access camera.', { position: 'top-center' });
      });
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame on the canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data URL
    const imageUrl = canvas.toDataURL('image/jpeg');
    setImage(imageUrl);  // Save the image for later use
    stopCamera();
  };

  // Stop the camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  // Switch to the other camera (front/back)
  const switchCamera = () => {
    // Stop current camera stream
    stopCamera();
    // Toggle between front and back camera (by deviceId)
    const nextDeviceId = videoDevices.find(device => device.deviceId !== currentDeviceId)?.deviceId;
    setCurrentDeviceId(nextDeviceId);
    setIsCameraActive(true); // Restart the camera with the new device ID
  };

  // Handle search similar images
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.warning('Please select an image to upload.', { position: 'top-center' });
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
        toast.success('Similar images fetched successfully', { position: 'top-center' });
      } else {
        toast.error('No similar images found.', { position: 'top-center' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error occurred while searching for similar images.', { position: 'top-center' });
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
        toast.success(response.data.message, { position: 'top-center' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error occurred while uploading the image.', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1 className="font-bold">Image Search & Find..</h1>

      <div>
        <form onSubmit={handleUploadSubmit}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Image to Database'}
          </button>
        </form>
      </div>

      <div className="camera-controls">
        <button onClick={() => setIsCameraActive(true)} disabled={isCameraActive || loading}>
          {isCameraActive ? 'Camera Active' : 'Open Camera'}
        </button>
        <button onClick={switchCamera} disabled={!isCameraActive || videoDevices.length <= 1}>
          Switch Camera
        </button>
      </div>

      {isCameraActive && (
        <div className="camera-view">
          <video ref={videoRef} width="100" height="150" autoPlay />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
        </div>
      )}

      {/* Move Capture Button Below Video */}
      {isCameraActive && !loading && (
        <div className="capture-button">
          <button onClick={capturePhoto}>
            Capture Image
          </button>
        </div>
        
      )}
{image && <img src={image} alt="Captured" className='w-20 h-32 mt-2 m-auto' />}
      {message && <p>{message}</p>}

      <hr />

      <form onSubmit={handleSearchSubmit}>
        <button type="submit" disabled={loading || !image}>
          {loading ? 'Searching...' : 'Search Similar Images'}
        </button>
      </form>

      <div>
        {similarImages.length > 0 && (
          <div className="bg-gray-200 py-5 w-2/3 m-auto">
            <h2>Similar Images</h2>
            <div className="image-gallery">
              {similarImages.map((image, index) => (
                <div key={index} className="image-item">
                  <img
                    src={`https://imgbackend-u5mv.onrender.com/uploads/${image.filename}`}
                    alt={image.filename}
                    className="h-48 w-32"
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





// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import '../App.css';

// function ImageUpload() {
//   const [image, setImage] = useState(null);
//   const [message, setMessage] = useState('');
//   const [similarImages, setSimilarImages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isCameraActive, setIsCameraActive] = useState(false);
//   const [cameraStream, setCameraStream] = useState(null);
//   const [currentDeviceId, setCurrentDeviceId] = useState('');
//   const [videoDevices, setVideoDevices] = useState([]);
//   const [currentFacingMode, setCurrentFacingMode] = useState('user'); // 'user' = front camera, 'environment' = back camera

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     // Get available video devices (front and back cameras)
//     navigator.mediaDevices.enumerateDevices().then((devices) => {
//       const videoDevices = devices.filter(device => device.kind === 'videoinput');
//       setVideoDevices(videoDevices);
//       if (videoDevices.length > 0) {
//         setCurrentDeviceId(videoDevices[0].deviceId); // Default to the first device
//       }
//     });
//   }, []);

//   useEffect(() => {
//     // If the camera is active, initialize it
//     if (videoRef.current && isCameraActive) {
//       startCamera();
//     }
//   }, [isCameraActive, currentDeviceId]); // Depend on currentDeviceId to restart camera when switched

//   const startCamera = () => {
//     const constraints = {
//       video: {
//         deviceId: currentDeviceId ? { exact: currentDeviceId } : undefined,
//       }
//     };

//     navigator.mediaDevices.getUserMedia(constraints)
//       .then((stream) => {
//         setCameraStream(stream);
//         videoRef.current.srcObject = stream;
//       })
//       .catch((err) => {
//         console.error('Error accessing camera: ', err);
//         toast.error('Failed to access camera.', { position: 'top-center' });
//       });
//   };

//   const capturePhoto = () => {
//     const canvas = canvasRef.current;
//     const video = videoRef.current;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     const context = canvas.getContext('2d');
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const imageUrl = canvas.toDataURL('image/jpeg');
//     setImage(imageUrl);
//     stopCamera();
//     setIsCameraActive(false);
//   };

//   const stopCamera = () => {
//     if (cameraStream) {
//       cameraStream.getTracks().forEach(track => track.stop());
//       setIsCameraActive(false); // Make sure to stop camera and reset status
//     }
//   };

//   const switchCamera = () => {
//     const nextDevice = videoDevices.find((device) => {
//       return device.facing === (currentFacingMode === 'user' ? 'environment' : 'user');
//     });
    
//     if (nextDevice) {
//       setCurrentDeviceId(nextDevice.deviceId); // Switch to the new camera
//     }

//     // Stop the current stream to avoid conflicts
//     if (cameraStream) {
//       cameraStream.getTracks().forEach(track => track.stop());
//     }

//     // Reactivate the camera after a brief delay
//     setIsCameraActive(false); // Temporarily stop the camera
//     setTimeout(() => {
//       setIsCameraActive(true); // Restart the camera with the new device ID
//     }, 500);
//   };

//   const handleSearchSubmit = async (e) => {
//     e.preventDefault();

//     if (!image) {
//       toast.warning('Please select an image to upload.', { position: 'top-center' });
//       return;
//     }

//     setLoading(true);
//     setMessage('');
//     setSimilarImages([]);

//     try {
//       const response = await axios.post('https://imgbackend-u5mv.onrender.com/search', { imageBase64: image }, {
//         headers: { 'Content-Type': 'application/json' },
//       });

//       if (response.data.similarImages && response.data.similarImages.length > 0) {
//         setSimilarImages(response.data.similarImages);
//         toast.success('Similar images fetched successfully', { position: 'top-center' });
//       } else {
//         toast.error('No similar images found.', { position: 'top-center' });
//       }
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       toast.error('Error occurred while searching for similar images.', { position: 'top-center' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUploadSubmit = async (e) => {
//     e.preventDefault();

//     if (!image) {
//       setMessage('Please select an image to upload.');
//       return;
//     }

//     setLoading(true);
//     setMessage('');

//     try {
//       const response = await axios.post('https://imgbackend-u5mv.onrender.com/upload', { imageBase64: image }, {
//         headers: { 'Content-Type': 'application/json' },
//       });

//       if (response.data.message) {
//         toast.success(response.data.message, { position: 'top-center' });
//       }
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       toast.error('Error occurred while uploading the image.', { position: 'top-center' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="App">
//       <h1 className="font-bold">Image Search & Find..</h1>

//       <div>
//         <form onSubmit={handleUploadSubmit}>
//           <input type="file" accept="image/*" />
//           <button type="submit" disabled={loading}>
//             {loading ? 'Uploading...' : 'Upload Image to Database'}
//           </button>
//         </form>
//       </div>

//       <div className="camera-controls">
//         <button onClick={() => setIsCameraActive(true)} disabled={isCameraActive || loading}>
//           {isCameraActive ? 'Camera Active' : 'Open Camera'}
//         </button>
//         <button onClick={switchCamera} disabled={!isCameraActive}>
//           Switch Camera
//         </button>
//       </div>

//       {isCameraActive && (
//         <div className="camera-view">
//           <video ref={videoRef} className='w-80 h-80 rounded-md' autoPlay />
//           <canvas ref={canvasRef} style={{ display: 'none' }} />
//         </div>
//       )}

//       {isCameraActive && !loading && (
//         <div className="capture-button">
//           <button onClick={capturePhoto}>
//             Capture Image
//           </button>
//         </div>
//       )}

//       {image && <img src={image} alt="Captured" className='w-20 h-32 mt-2 m-auto' />}
//       {message && <p>{message}</p>}

//       <hr />

//       <form onSubmit={handleSearchSubmit}>
//         <button type="submit" disabled={loading || !image}>
//           {loading ? 'Searching...' : 'Search Similar Images'}
//         </button>
//       </form>

//       <div>
//         {similarImages.length > 0 && (
//           <div className="bg-gray-200 py-5 w-2/3 m-auto">
//             <h2>Similar Images</h2>
//             <div className="image-gallery">
//               {similarImages.map((image, index) => (
//                 <div key={index} className="image-item">
//                   <img
//                     src={`https://imgbackend-u5mv.onrender.com/uploads/${image.filename}`}
//                     alt={image.filename}
//                     className="h-48 w-32"
//                   />
//                   <p>{image.filename}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ImageUpload;
