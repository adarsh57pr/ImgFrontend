// import React, { useState, useRef, useEffect } from 'react';

// function CameraToggle() {
//   const [isCameraActive, setIsCameraActive] = useState(false);
//   const [currentDeviceId, setCurrentDeviceId] = useState('');
//   const [currentFacingMode, setCurrentFacingMode] = useState('user'); // 'user' for front camera, 'environment' for back camera
//   const [videoDevices, setVideoDevices] = useState([]);
//   const videoRef = useRef(null);
//   const cameraStreamRef = useRef(null);

//   // Get list of available video devices (cameras)
//   useEffect(() => {
//     navigator.mediaDevices.enumerateDevices().then((devices) => {
//       const videoDevices = devices.filter(device => device.kind === 'videoinput');
//       setVideoDevices(videoDevices);
//       if (videoDevices.length > 0) {
//         setCurrentDeviceId(videoDevices[0].deviceId); // Default to the first available camera
//       }
//     });
//   }, []);

//   // Start the camera stream
//   const startCamera = () => {
//     const constraints = {
//       video: {
//         deviceId: currentDeviceId ? { exact: currentDeviceId } : undefined,
//         facingMode: currentFacingMode, // 'user' (front) or 'environment' (back)
//       },
//     };

//     navigator.mediaDevices.getUserMedia(constraints)
//       .then((stream) => {
//         cameraStreamRef.current = stream;
//         videoRef.current.srcObject = stream;
//         setIsCameraActive(true);
//       })
//       .catch((err) => {
//         console.error('Error accessing camera: ', err);
//         alert('Failed to access camera');
//       });
//   };

//   // Stop the camera stream
//   const stopCamera = () => {
//     if (cameraStreamRef.current) {
//       cameraStreamRef.current.getTracks().forEach(track => track.stop());
//       setIsCameraActive(false);
//     }
//   };

//   // Toggle camera (front/back)
//   const toggleCamera = () => {
//     // Stop current camera stream
//     stopCamera();

//     // Toggle between front and back camera based on facingMode
//     const nextFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
//     setCurrentFacingMode(nextFacingMode);

//     // Restart camera with the new facingMode
//     setIsCameraActive(false);
//     startCamera();
//   };

//   // Start the camera on initial load
//   useEffect(() => {
//     if (isCameraActive) {
//       startCamera();
//     }
//   }, [currentDeviceId, currentFacingMode]);

//   return (
//     <div>
//       <h1>Camera Toggle Example</h1>
//       <div>
//         <button onClick={toggleCamera} disabled={!videoDevices.length}>
//           Switch Camera
//         </button>
//       </div>

//       {isCameraActive && (
//         <div>
//           <video ref={videoRef} width="300" height="400" autoPlay />
//         </div>
//       )}

//       {!isCameraActive && (
//         <div>
//           <button onClick={startCamera}>Start Camera</button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default CameraToggle;
