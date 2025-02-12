// import React, { useRef } from 'react';
// import Webcam from 'react-webcam';
// import axios from 'axios';

// const CaptureImage = () => {
//   const webcamRef = useRef(null);

//   // Function to capture the image
//   const capture = () => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     console.log(imageSrc);
//     // Send the captured image to the backend
//     sendImageToBackend(imageSrc);
//   };

//   const sendImageToBackend = async (image) => {
//     try {
//       const response = await axios.post('http://localhost:5000/upload', { image });
//       console.log(response.data);  // Show the results from the backend
//     } catch (error) {
//       console.error('Error uploading image:', error);
//     }
//   };

//   return (
//     <div>
//       <Webcam
//         audio={false}
//         ref={webcamRef}
//         screenshotFormat="image/jpeg"
//         width="100%"
//       />
//       <button onClick={capture}>Capture</button>
//     </div>
//   );
// };

// export default CaptureImage;
