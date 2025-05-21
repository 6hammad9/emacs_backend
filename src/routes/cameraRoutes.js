import express from 'express';
import CameraInfo from '../models/CameraInfo.js';

const router = express.Router();

// GET all cameras
router.get('/', async (req, res) => {
  try {
    const cameras = await CameraInfo.find()
      .populate('department')
      .populate('department_area');
    res.json(cameras);
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to fetch cameras',
      error: err.message 
    });
  }
});

// GET single camera
router.get('/:id', async (req, res) => {
  try {
    const camera = await CameraInfo.findById(req.params.id)
      .populate('department')
      .populate('department_area');
    if (!camera) {
      return res.status(404).json({ message: 'Camera not found' });
    }
    res.json(camera);
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to fetch camera',
      error: err.message 
    });
  }
});

// POST new camera
router.post('/', async (req, res) => {
  try {
    const { 
      cam_id, 
      channel, 
      camera_name, 
      color, 
      department, 
      department_area,
      stream_source,
      stream_port,
      stream_type
    } = req.body;

    // Validate required fields
    if (!cam_id || !channel || !camera_name || !stream_source) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['cam_id', 'channel', 'camera_name', 'stream_source']
      });
    }

    const cameraData = {
      cam_id,
      channel,
      camera_name,
      color: color || '#ffffff',
      department: department || null,
      department_area: department_area || null,
      stream_source,
      stream_port: stream_port || 6033,
      stream_type: stream_type || 'local'
    };

    const camera = new CameraInfo(cameraData);
    const newCamera = await camera.save();
    
    res.status(201).json(newCamera);
  } catch (err) {
    res.status(400).json({ 
      message: 'Error creating camera',
      error: err.message 
    });
  }
});

// PUT update camera
router.put('/:id', async (req, res) => {
  try {
    const { 
      department, 
      department_area,
      stream_source,
      stream_port,
      stream_type,
      ...otherData 
    } = req.body;

    // Validate required fields if they're being updated
    if (stream_source === '') {
      return res.status(400).json({ 
        message: 'stream_source cannot be empty'
      });
    }

    const updateData = {
      ...otherData,
      department: department || null,
      department_area: department_area || null,
      stream_source: stream_source !== undefined ? stream_source : undefined,
      stream_port: stream_port !== undefined ? stream_port : undefined,
      stream_type: stream_type !== undefined ? stream_type : undefined
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedCamera = await CameraInfo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedCamera) {
      return res.status(404).json({ message: 'Camera not found' });
    }
    
    res.json(updatedCamera);
  } catch (err) {
    res.status(400).json({ 
      message: 'Error updating camera',
      error: err.message 
    });
  }
});

// DELETE camera
router.delete('/:id', async (req, res) => {
  try {
    const deletedCamera = await CameraInfo.findByIdAndDelete(req.params.id);
    if (!deletedCamera) {
      return res.status(404).json({ message: 'Camera not found' });
    }
    res.json({ 
      message: 'Camera deleted successfully',
      deletedCamera 
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error deleting camera',
      error: err.message 
    });
  }
});

// GET camera by cam_id (for streaming service)
router.get('/by-id/:cam_id', async (req, res) => {
  try {
    const camera = await CameraInfo.findOne({ cam_id: req.params.cam_id })
      .populate('department')
      .populate('department_area');

    if (!camera) {
      return res.status(404).json({ 
        message: 'Camera not found',
        details: `Camera ${req.params.cam_id} not registered`
      });
    }

    // Return streaming configuration
    res.json({
      success: true,
      cam_id: camera.cam_id,
      camera_name: camera.camera_name,
      stream_source: camera.stream_source,
      stream_port: camera.stream_port || 6033,
      stream_type: camera.stream_type || 'local',
      department: camera.department,
      department_area: camera.department_area
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching camera config',
      error: err.message 
    });
  }
});

// GET stream URL for a camera
router.get('/:id/stream-url', async (req, res) => {
  try {
    const camera = await CameraInfo.findById(req.params.id)
      .select('cam_id stream_source stream_port stream_type');
      
    if (!camera) {
      return res.status(404).json({ message: 'Camera not found' });
    }

    // Generate stream URL based on type
    let streamUrl;
    switch(camera.stream_type) {
      case 'rtsp':
        streamUrl = `rtsp://${camera.stream_source}`;
        break;
      case 'http':
        streamUrl = `http://${camera.stream_source}:${camera.stream_port}`;
        break;
      default: // local
        streamUrl = `http://localhost:${camera.stream_port}/video_feed/${camera.cam_id}`;
    }

    res.json({
      stream_url: streamUrl,
      config: {
        cam_id: camera.cam_id,
        stream_type: camera.stream_type,
        stream_source: camera.stream_source,
        stream_port: camera.stream_port
      }
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error generating stream URL',
      error: err.message 
    });
  }
});

export default router;