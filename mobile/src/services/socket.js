// Real-time WebSocket / Telematics Streamer

let socket = null;

export const initSocket = (onTelemetryUpdate, onControlAck) => {
  try {
    const io = require('socket.io-client');
    socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 5000
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected to ITS Fleet Telematics server');
    });

    socket.on('trip:telemetry', (data) => {
      if (onTelemetryUpdate) {
        onTelemetryUpdate(data);
      }
    });

    socket.on('vehicle:control_ack', (data) => {
      if (onControlAck) {
        onControlAck(data);
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected from server');
    });
  } catch (err) {
    console.warn('[Socket.io] Could not connect to socket server, falling back to local simulation:', err.message);
  }

  return () => {
    if (socket) {
      socket.disconnect();
    }
  };
};

export const getSocket = () => socket;
