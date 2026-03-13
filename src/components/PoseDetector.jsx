import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const PoseDetector = ({ onAlertTriggered }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [alertState, setAlertState] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Heuristic for alert detection
  const detectHanging = (landmarks) => {
    if (!landmarks || landmarks.length === 0) return false;
    
    // MediaPipe Pose landmarks
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftAnkle = landmarks[31];
    const rightAnkle = landmarks[32];

    if (nose && leftShoulder && rightShoulder && leftAnkle && rightAnkle) {
      // 1. Nose/Head position
      const isNoseHigh = nose.y < 0.5; 
      
      // 2. Arms Raised Check (Critical for the silhouette image)
      const areArmsRaised = (leftWrist && leftWrist.y < nose.y) || (rightWrist && rightWrist.y < nose.y);
      
      // 3. Vertical alignment
      const horizontalMidpointShoulders = (leftShoulder.x + rightShoulder.x) / 2;
      const horizontalMidpointAnkles = (leftAnkle.x + rightAnkle.x) / 2;
      const xDistance = Math.abs(horizontalMidpointShoulders - horizontalMidpointAnkles);
      const isVertical = xDistance < 0.25;

      // 4. Stretched body
      const bodyHeight = Math.abs(nose.y - leftAnkle.y);
      const isBodyStretched = bodyHeight > 0.3; 

      // 5. Feet check (lenient for static image detection)
      const isFeetOffGround = leftAnkle.y < 0.98 && rightAnkle.y < 0.98;

      // Logic: Needs to be Vertical + Stretched + (Feet off ground OR arms raised)
      if (isNoseHigh && isVertical && isBodyStretched && (isFeetOffGround || areArmsRaised)) {
        return true;
      }
    }
    return false;
  };

  const drawBoundingBox = (ctx, landmarks, color, lineWidth) => {
    if (!landmarks || landmarks.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    landmarks.forEach(lm => {
      if (lm.x < minX) minX = lm.x;
      if (lm.y < minY) minY = lm.y;
      if (lm.x > maxX) maxX = lm.x;
      if (lm.y > maxY) maxY = lm.y;
    });

    const padding = 0.08; 
    const width = (maxX - minX + padding * 2) * ctx.canvas.width;
    const height = (maxY - minY + padding * 2) * ctx.canvas.height;
    const x = (minX - padding) * ctx.canvas.width;
    const y = (minY - padding) * ctx.canvas.height;

    // 1. Semi-transparent red fill
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(x, y, width, height);

    // 2. Thick Outer Border
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);
    
    // 3. Corner Accents
    const cornerSize = 30;
    ctx.lineWidth = lineWidth * 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y + cornerSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerSize, y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + width - cornerSize, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + cornerSize);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, y + height - cornerSize);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + cornerSize, y + height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + width - cornerSize, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y + height - cornerSize);
    ctx.stroke();

    // 4. Label
    const label = 'CRITICAL ALERT: POTENTIAL HANGING DETECTED';
    ctx.font = 'bold 24px Inter, system-ui, sans-serif';
    const textWidth = ctx.measureText(label).width;
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y - 40, textWidth + 20, 40);
    
    ctx.fillStyle = 'white';
    ctx.fillText(label, x + 10, y - 12);
  };

  useEffect(() => {
    let consecutiveAlertFrames = 0;
    const ALERT_THRESHOLD = 8; // Ultra-fast detection for the demo

    let pose = null;
    if (window.Pose) {
      pose = new window.Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults((results) => {
        if (!isModelLoaded) setIsModelLoaded(true);
        if (!canvasRef.current || !webcamRef.current?.video) return;

        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;
        
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const canvasCtx = canvasRef.current.getContext('2d');
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
        canvasCtx.drawImage(results.image, 0, 0, videoWidth, videoHeight);

        if (results.poseLandmarks) {
          const isDangerous = detectHanging(results.poseLandmarks);
          
          if (isDangerous) {
            consecutiveAlertFrames++;
            drawBoundingBox(canvasCtx, results.poseLandmarks, '#FF0000', 6);
            
            if (consecutiveAlertFrames >= ALERT_THRESHOLD) {
              setAlertState(true);
              onAlertTriggered(true);
            }
          } else {
            consecutiveAlertFrames = Math.max(0, consecutiveAlertFrames - 1);
            if (consecutiveAlertFrames === 0) {
              setAlertState(false);
              onAlertTriggered(false);
            }
            
            if (window.drawConnectors && window.POSE_CONNECTIONS) {
              window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS,
                             {color: '#00FF00', lineWidth: 4});
            }
            if (window.drawLandmarks) {
              window.drawLandmarks(canvasCtx, results.poseLandmarks,
                            {color: '#FF0000', lineWidth: 2, radius: 4});
            }
          }
        } else {
            consecutiveAlertFrames = 0;
            setAlertState(false);
            onAlertTriggered(false);
        }
        canvasCtx.restore();
      });
    }

    if (!isCameraActive) {
      if (pose) pose.close();
      return;
    }

    let requestAnimationFrameId;
    const processVideo = async () => {
      if (
        pose &&
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        try {
          await pose.send({ image: webcamRef.current.video });
          if (!isScanning) setIsScanning(true);
        } catch (error) {
          console.error("Error processing video frame:", error);
        }
      }
      requestAnimationFrameId = requestAnimationFrame(processVideo);
    };

    if (pose && isCameraActive) {
      processVideo();
    }

    return () => {
      if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
      if (pose) pose.close();
    };
  }, [onAlertTriggered, isCameraActive]);

  const toggleCamera = () => {
    setIsCameraActive(prev => !prev);
    if (isCameraActive) {
      setIsModelLoaded(false);
      setIsScanning(false);
      setAlertState(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, padding: '16px', 
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        zIndex: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={toggleCamera}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '1rem', transition: 'all 0.2s',
              background: isCameraActive ? '#ef4444' : '#10b981', color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
            {isCameraActive ? 'Stop Camera' : 'Open Camera'}
          </button>
          
          {isCameraActive && (
            <span style={{ 
              color: isScanning ? '#10b981' : '#fef08a', 
              fontWeight: '600', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: isScanning ? '#10b981' : '#fef08a',
                animation: isScanning ? 'pulse-soft 1s infinite' : 'none'
              }}></div>
              {isScanning ? 'AI Currently Detecting Hanging Poses...' : 'Initializing AI Scanner...'}
            </span>
          )}
        </div>
      </div>

      {alertState && (
        <div className="overlay-alert" style={{ zIndex: 40, top: '80px' }}>
          WARNING: CRITICAL MOMENT DETECTED
        </div>
      )}
      
      {isCameraActive ? (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            style={{
              position: 'absolute', marginLeft: 'auto', marginRight: 'auto',
              left: 0, right: 0, textAlign: 'center', zIndex: 9,
              width: '100%', height: '100%', objectFit: 'cover', opacity: 0
            }}
            videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
          />

          <canvas
            ref={canvasRef}
            className="output-canvas"
            style={{
              position: 'absolute', marginLeft: 'auto', marginRight: 'auto',
              left: 0, right: 0, textAlign: 'center', zIndex: 10,
              width: '100%', height: '100%', objectFit: 'cover'
            }}
          />
          
          {!isModelLoaded && (
             <div className="camera-placeholder" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 15, color: '#0d9488', fontWeight: 'bold' }}>
                <p>Loading AI Pose Model & Accessing Camera...</p>
             </div>
          )}
        </>
      ) : (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 15, color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', textAlign: 'center' }}>
           <p style={{fontSize: '1.2rem', marginBottom: '16px'}}>Camera Feed Offline</p>
           <p style={{fontSize: '0.9rem', fontWeight: 'normal'}}>Click "Open Camera" to begin real-time algorithmic monitoring.</p>
        </div>
      )}
    </div>
  );
};

export default PoseDetector;
