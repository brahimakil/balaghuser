import React, { useRef, useEffect, useState } from 'react';
import { X, RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import * as THREE from 'three';
import { getCORSProxyUrl } from '../utils/corsProxy';

interface Simple360ViewerProps {
  imageUrl: string;
  onClose: () => void;
}

const Simple360Viewer: React.FC<Simple360ViewerProps> = ({ imageUrl, onClose }) => {
  const { language } = useLanguage();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mouse interaction
  const mouseRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    const initViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current!.appendChild(renderer.domElement);

        // Create sphere
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Inside out

        // Load texture using proxy
        const loader = new THREE.TextureLoader();
        const proxyUrl = getCORSProxyUrl(imageUrl);
        
        console.log('Loading image from:', proxyUrl);
        
        const texture = await new Promise<THREE.Texture>((resolve, reject) => {
          loader.load(
            proxyUrl,
            (texture) => {
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;
              resolve(texture);
            },
            (progress) => {
              console.log('Loading progress:', progress);
            },
            (error) => {
              console.error('Texture loading error:', error);
              reject(error);
            }
          );
        });

        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide
        });

        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        camera.position.set(0, 0, 0);

        // Store refs
        sceneRef.current = scene;
        rendererRef.current = renderer;
        cameraRef.current = camera;

        setIsLoading(false);

        // Animation loop
        const animate = () => {
          animationRef.current = requestAnimationFrame(animate);

          if (cameraRef.current) {
            cameraRef.current.rotation.x = rotationRef.current.x;
            cameraRef.current.rotation.y = rotationRef.current.y;
          }

          renderer.render(scene, camera);
        };
        animate();

      } catch (error) {
        console.error('360° viewer error:', error);
        setError('Failed to load 360° image');
        setIsLoading(false);
      }
    };

    initViewer();

    // Handle resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [imageUrl]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - mouseRef.current.x;
    const deltaY = e.clientY - mouseRef.current.y;

    rotationRef.current.y += deltaX * 0.005;
    rotationRef.current.x += deltaY * 0.005;

    // Clamp vertical rotation
    rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));

    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    e.preventDefault();

    const deltaX = e.touches[0].clientX - mouseRef.current.x;
    const deltaY = e.touches[0].clientY - mouseRef.current.y;

    rotationRef.current.y += deltaX * 0.005;
    rotationRef.current.x += deltaY * 0.005;
    rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));

    mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const resetView = () => {
    rotationRef.current = { x: 0, y: 0 };
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.fov = Math.max(30, cameraRef.current.fov - 10);
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.fov = Math.min(120, cameraRef.current.fov + 10);
      cameraRef.current.updateProjectionMatrix();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'r' || e.key === 'R') resetView();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>{language === 'ar' ? 'تحميل العرض 360°...' : 'Loading 360° view...'}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={onClose} className="bg-red-600 px-4 py-2 rounded">
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* 3D Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button onClick={zoomIn} className="bg-black/80 text-white p-3 rounded">
          <ZoomIn className="h-5 w-5" />
        </button>
        <button onClick={zoomOut} className="bg-black/80 text-white p-3 rounded">
          <ZoomOut className="h-5 w-5" />
        </button>
        <button onClick={resetView} className="bg-black/80 text-white p-3 rounded">
          <RotateCcw className="h-5 w-5" />
        </button>
        <button onClick={onClose} className="bg-red-600 text-white p-3 rounded">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-lg p-4 text-white text-center">
        <h3 className="font-semibold mb-2">
          {language === 'ar' ? 'عارض 360° حقيقي' : 'True 360° Viewer'}
        </h3>
        <p className="text-sm">
          {language === 'ar' ? 'اسحب للاستكشاف' : 'Drag to explore'}
        </p>
      </div>
    </div>
  );
};

export default Simple360Viewer; 