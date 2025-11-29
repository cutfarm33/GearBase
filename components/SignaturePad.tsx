import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface SignaturePadRef {
  getSignature: () => string | undefined;
  clearSignature: () => void;
}

const SignaturePad = forwardRef<SignaturePadRef>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };
  
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  };

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    const context = getCanvasContext();
    if (context) {
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.lineCap = 'round';
    }

    return () => {
        window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // FIX: Updated event types to React's synthetic events and improved type guarding.
  const getCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) { // Touch Event
      if (e.touches[0]) {
        return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
      }
    } else { // Mouse Event
      return [e.clientX - rect.left, e.clientY - rect.top];
    }
    return [0, 0];
  };

  // FIX: Updated event handler parameter type to accept React's synthetic events.
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const context = getCanvasContext();
    if (!context) return;
    const [x, y] = getCoords(e);
    context.beginPath();
    context.moveTo(x, y);
    isDrawing.current = true;
  };

  // FIX: Updated event handler parameter type to accept React's synthetic events.
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const context = getCanvasContext();
    if (!context) return;
    const [x, y] = getCoords(e);
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  useImperativeHandle(ref, () => ({
    getSignature: () => {
      const canvas = canvasRef.current;
      if (!canvas) return undefined;
      // Check if canvas is blank
      const context = getCanvasContext();
      if (!context) return undefined;
      const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
      const isBlank = !pixelBuffer.some(color => color !== 0);
      return isBlank ? undefined : canvas.toDataURL('image/png');
    },
    clearSignature: () => {
      const canvas = canvasRef.current;
      const context = getCanvasContext();
      if (canvas && context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-48 bg-slate-700 rounded-lg cursor-crosshair touch-none"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
});

export default SignaturePad;
