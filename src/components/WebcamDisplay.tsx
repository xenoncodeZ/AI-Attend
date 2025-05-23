
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoOff } from 'lucide-react';
// Removed Video, Button, useToast as they are no longer used here.

interface WebcamDisplayProps {
  initialMediaStream: MediaStream | null;
  // Removed onStreamStarted, onStreamStopped, showMockRecognition, clearMockRecognition, isWebcamOn, setIsWebcamOn
}

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({ 
  initialMediaStream,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Removed internal stream state and toast as parent controls stream.

  const clearMockRecognitionOverlay = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  
  // Public method to draw mock recognition, registered on window
  useEffect(() => {
    (window as any).drawMockRecognitionOnCanvas = (name: string) => {
      if (canvasRef.current && videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
          clearMockRecognitionOverlay(); 
          
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;
          
          const rectWidth = videoWidth * 0.4;
          const rectHeight = videoHeight * 0.5;
          const rectX = (videoWidth - rectWidth) / 2;
          const rectY = (videoHeight - rectHeight) / 2;

          context.strokeStyle = 'hsl(var(--primary))';
          context.lineWidth = 3;
          context.strokeRect(rectX, rectY, rectWidth, rectHeight);

          context.fillStyle = 'hsl(var(--primary))';
          context.font = 'bold 18px Arial';
          context.textAlign = 'center';
          context.fillText(name, rectX + rectWidth / 2, rectY - 10);
        }
      }
    };
    (window as any).clearMockRecognitionCanvas = clearMockRecognitionOverlay;

    return () => { 
        delete (window as any).drawMockRecognitionOnCanvas;
        delete (window as any).clearMockRecognitionCanvas;
    }
  }, []);


  useEffect(() => {
    // Effect to handle the media stream prop
    if (videoRef.current) {
      if (initialMediaStream) {
        videoRef.current.srcObject = initialMediaStream;
        videoRef.current.onloadedmetadata = () => {
           if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
           }
        }
      } else {
        videoRef.current.srcObject = null;
        clearMockRecognitionOverlay(); // Clear overlay if stream is removed
      }
    }
    // No explicit cleanup for initialMediaStream here, parent (AttendancePage) manages track stopping.
  }, [initialMediaStream]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Webcam Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-muted rounded-md overflow-hidden border border-border">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // Mute to prevent feedback loops if audio was enabled
            className="absolute inset-0 w-full h-full object-cover"
            aria-label="Webcam feed"
          />
          <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-label="Face recognition overlay"
          />
          {!initialMediaStream && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <VideoOff className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebcamDisplay;
