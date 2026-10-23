// Camera & Webcam Stream Manager
import { sound } from './audio.js';
import { DEFAULT_PHOTOS } from './assets.js';

export class CameraManager {
  constructor(videoElement, flashOverlayElement) {
    this.video = videoElement;
    this.flashOverlay = flashOverlayElement;
    this.stream = null;
    this.isMirrored = true;
    this.isFlashEnabled = true;
    this.devices = [];
    this.selectedDeviceId = null;
    this.isSimulated = false;
    this.simulationTimer = null;
    this.currentFilter = 'original';
  }

  async init() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API not supported in this browser');
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter(d => d.kind === 'videoinput');
      return true;
    } catch (err) {
      console.warn('Camera enumeration error, falling back to simulation', err);
      return false;
    }
  }

  async startStream(deviceId = null) {
    this.stopStream();
    this.isSimulated = false;

    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 960 },
        facingMode: 'user'
      },
      audio: false
    };

    if (deviceId) {
      constraints.video.deviceId = { exact: deviceId };
      this.selectedDeviceId = deviceId;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.video) {
        this.video.srcObject = this.stream;
        await this.video.play();
      }
      return { success: true, simulated: false };
    } catch (err) {
      console.warn('Unable to access hardware camera, activating camera simulation mode:', err.message);
      this.activateSimulation();
      return { success: true, simulated: true, error: err.message };
    }
  }

  activateSimulation() {
    this.isSimulated = true;
    if (!this.video) return;

    // Create an animated canvas stream for simulation
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    let frame = 0;
    const drawSim = () => {
      if (!this.isSimulated) return;
      frame++;
      
      // Cyber animated background
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, '#ffb7d5');
      grad.addColorStop(0.5, '#bdb2ff');
      grad.addColorStop(1, '#70d6ff');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Dot grid
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      for (let x = 10; x < 640; x += 25) {
        for (let y = 10; y < 480; y += 25) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Simulated smiley pose
      const floatY = Math.sin(frame * 0.05) * 8;
      ctx.save();
      ctx.translate(320, 240 + floatY);

      // Glow aura
      ctx.beginPath();
      ctx.arc(0, -10, 100, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();

      // Face
      ctx.beginPath();
      ctx.arc(0, -20, 60, 0, Math.PI * 2);
      ctx.fillStyle = '#ff69b4';
      ctx.strokeStyle = '#2B213A';
      ctx.lineWidth = 4;
      ctx.fill();
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-20, -25, 12, 0, Math.PI * 2);
      ctx.arc(20, -25, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2B213A';
      ctx.beginPath();
      ctx.arc(-18, -25, 6, 0, Math.PI * 2);
      ctx.arc(22, -25, 6, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.beginPath();
      ctx.arc(0, -15, 25, 0.2, Math.PI - 0.2);
      ctx.strokeStyle = '#2B213A';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Sparkles
      ctx.font = '24px sans-serif';
      ctx.fillStyle = '#ffd166';
      ctx.fillText('★', -90, -40);
      ctx.fillText('✦', 75, -50);
      ctx.fillText('✨', -80, 50);

      ctx.restore();

      // Cam HUD
      ctx.fillStyle = 'rgba(43, 33, 58, 0.8)';
      ctx.fillRect(20, 20, 210, 28);
      ctx.font = 'bold 12px Space Grotesk, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('● SIMULATOR LIVE [4:3]', 30, 38);

      this.simulationTimer = requestAnimationFrame(drawSim);
    };

    drawSim();
    try {
      this.stream = canvas.captureStream(30);
      this.video.srcObject = this.stream;
      this.video.play();
    } catch (e) {
      console.warn('captureStream not supported, falling back to static poster', e);
    }
  }

  stopStream() {
    if (this.simulationTimer) {
      cancelAnimationFrame(this.simulationTimer);
      this.simulationTimer = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  }

  toggleMirror() {
    this.isMirrored = !this.isMirrored;
    if (this.video) {
      this.video.style.transform = this.isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
    }
    return this.isMirrored;
  }

  toggleFlash() {
    this.isFlashEnabled = !this.isFlashEnabled;
    return this.isFlashEnabled;
  }

  triggerFlashEffect() {
    if (!this.flashOverlay) return;
    this.flashOverlay.classList.remove('opacity-0', 'pointer-events-none');
    this.flashOverlay.classList.add('opacity-100');

    setTimeout(() => {
      this.flashOverlay.classList.remove('opacity-100');
      this.flashOverlay.classList.add('opacity-0', 'pointer-events-none');
    }, 180);
  }

  captureFrame(slotIndex = 0) {
    // Shutter sound
    sound.playShutter();

    // Trigger visual screen flash
    if (this.isFlashEnabled) {
      this.triggerFlashEffect();
    }

    // If using simulation, return styled fallback photo for variety
    if (this.isSimulated || !this.video || this.video.videoWidth === 0) {
      const fallbackPhoto = DEFAULT_PHOTOS[slotIndex % DEFAULT_PHOTOS.length];
      return fallbackPhoto;
    }

    // Capture from active video element
    const canvas = document.createElement('canvas');
    canvas.width = this.video.videoWidth || 640;
    canvas.height = this.video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (this.isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  }
}
