import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const PoseDetector = ({ onAlertTriggered, setConfidence, currentConfidence }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [alertState, setAlertState] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Heuristic for alert detection
  const detectHanging = (landmarks) => {
    if (!landmarks || landmarks.length === 0) return false;
    
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftAnkle = landmarks[31];
    const rightAnkle = landmarks[32];

    if (nose && leftShoulder && rightShoulder && leftAnkle && rightAnkle) {
      const isNoseHigh = nose.y < 0.5; 
      const areArmsRaised = (leftWrist && leftWrist.y < nose.y) || (rightWrist && rightWrist.y < nose.y);
      const horizontalMidpointShoulders = (leftShoulder.x + rightShoulder.x) / 2;
      const horizontalMidpointAnkles = (leftAnkle.x + rightAnkle.x) / 2;
      const xDistance = Math.abs(horizontalMidpointShoulders - horizontalMidpointAnkles);
      const isVertical = xDistance < 0.25;
      const bodyHeight = Math.abs(nose.y - leftAnkle.y);
      const isBodyStretched = bodyHeight > 0.3; 
      const isFeetOffGround = leftAnkle.y < 0.98 && rightAnkle.y < 0.98;

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

    // Semi-transparent fill
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.fillRect(x, y, width, height);

    // Thick Outer Border (Glow effect emulation via shadow)
    ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);
    ctx.shadowBlur = 0; // reset
    
    // Corner Accents
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

    // Label
    const label = 'CRITICAL ALERT: POTENTIAL DANGER IDENTIFIED';
    ctx.font = 'bold 20px "Outfit", system-ui, sans-serif';
    const textWidth = ctx.measureText(label).width;
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y - 40, textWidth + 24, 40);
    
    ctx.fillStyle = 'white';
    ctx.fillText(label, x + 12, y - 12);
  };

  useEffect(() => {
    let consecutiveAlertFrames = 0;
    const ALERT_THRESHOLD = 8; 

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
            
            // Calculate a fake confidence metric based on consecutive frames detected
            let calcConfidence = Math.min(20 + (consecutiveAlertFrames * 10), 92);
            if (setConfidence) setConfidence(calcConfidence);

            drawBoundingBox(canvasCtx, results.poseLandmarks, '#ef4444', 4);
            
            if (consecutiveAlertFrames >= ALERT_THRESHOLD) {
              if (!alertState) {
                 setAlertState(true);
                 if (onAlertTriggered) onAlertTriggered(true);
              }
            }
          } else {
            consecutiveAlertFrames = Math.max(0, consecutiveAlertFrames - 1);
            
            if (consecutiveAlertFrames > 0) {
               let calcConfidence = Math.max(15, (consecutiveAlertFrames * 10));
               if (setConfidence) setConfidence(calcConfidence);
            } else {
               if (setConfidence && !alertState) setConfidence(15);
            }

            if (consecutiveAlertFrames === 0 && alertState) {
              setAlertState(false);
              if (onAlertTriggered) onAlertTriggered(false);
            }
            
            if (window.drawConnectors && window.POSE_CONNECTIONS) {
              window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS,
                             {color: 'rgba(20, 184, 166, 0.8)', lineWidth: 3});
            }
            if (window.drawLandmarks) {
              window.drawLandmarks(canvasCtx, results.poseLandmarks,
                            {color: 'rgba(255, 255, 255, 0.6)', lineWidth: 1, radius: 3});
            }
          }
        } else {
            consecutiveAlertFrames = 0;
            if (setConfidence && !alertState) setConfidence(12);
            if (alertState) {
              setAlertState(false);
              if (onAlertTriggered) onAlertTriggered(false);
            }
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
  }, [onAlertTriggered, isCameraActive, setConfidence, alertState]);

  const toggleCamera = () => {
    setIsCameraActive(prev => !prev);
    if (isCameraActive) {
      setIsModelLoaded(false);
      setIsScanning(false);
      setAlertState(false);
      if (setConfidence) setConfidence(12);
    } else {
       if (setConfidence) setConfidence(15); // baseline looking empty room
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col bg-slate-900 rounded-xl overflow-hidden">
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-30 flex justify-between items-center w-full">
        <div className="flex gap-4 items-center">
          <button 
            onClick={toggleCamera}
            className={`px-5 py-2 rounded-lg font-bold text-sm tracking-wide transition-all shadow-lg ${isCameraActive ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-brand-primary hover:bg-teal-400 text-slate-900 shadow-brand-primary/20 hover:shadow-brand-primary/40'}`}>
            {isCameraActive ? 'Stop Stream' : 'Initialize Feed'}
          </button>
          
          {isCameraActive && (
            <span className={`font-semibold text-xs transition-colors flex items-center gap-2 ${isScanning ? 'text-brand-primary' : 'text-brand-secondary'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-brand-primary animate-pulse-soft shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'bg-brand-secondary'}`}></div>
              {isScanning ? 'AI Skeleton Scanning Active...' : 'Loading Model Weights...'}
            </span>
          )}
        </div>
      </div>

      {isCameraActive ? (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            className="absolute inset-0 w-full h-full object-cover z-10 opacity-0"
            videoConstraints={{ facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }}
            onUserMediaError={(err) => {
              console.error("Camera access error log:", err);
              alert("Camera access denied or device not found. Please ensure camera permissions are granted in your browser settings.");
            }}
          />

          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover z-20"
          />
          
          {!isModelLoaded && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-25 text-brand-primary font-bold text-lg font-display tracking-wide animate-pulse">
                Accessing Optics & AI Core...
             </div>
          )}
        </>
      ) : (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-25 text-center flex flex-col items-center">
           <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <span className="block w-6 h-6 border-b-2 border-r-2 border-slate-500 transform rotate-45 mb-1"></span>
           </div>
           <p className="text-xl text-slate-300 font-display font-bold mb-2 tracking-wide">Stream Offline</p>
           <p className="text-sm text-slate-500 font-light">Activate sequence to begin autonomous monitoring.</p>
        </div>
      )}
    </div>
  );
};

export default PoseDetector;
