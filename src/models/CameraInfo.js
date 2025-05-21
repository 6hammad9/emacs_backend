// models/CameraInfo.js
import mongoose from 'mongoose';

const cameraSchema = new mongoose.Schema({
  cam_id: { type: String, required: true, unique: true },
  channel: { type: Number, required: true },
  camera_name: { type: String, required: true },
  color: { type: String, default: '#ffffff' },
  read_status: { type: Number, default: 0 },
  stream_source: { type: String, required: true }, // e.g. "0" for webcam, "rtsp://..."
  stream_port: { type: Number, default: 6033 },
  department: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null,
    validate: {
      validator: (v) => v === null || mongoose.Types.ObjectId.isValid(v),
      message: props => `${props.value} is not a valid department ID!`
    }
  },
  department_area: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DepartmentArea',
    default: null,
    validate: {
      validator: (v) => v === null || mongoose.Types.ObjectId.isValid(v),
      message: props => `${props.value} is not a valid area ID!`
    }
    
  }
  
}, { timestamps: true });

const CameraInfo = mongoose.model('CameraInfo', cameraSchema);
export default CameraInfo;