export const getAllCameras = async (req, res) => {
  try {
    const cameras = await CameraInfo.find()
      .populate("department")
      .populate("department_area");
    res.json(cameras);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCamera = async (req, res) => {
  try {
    const { cam_id, channel, camera_name, color, department, department_area } = req.body;

    const camera = new CameraInfo({
      cam_id,
      channel,
      camera_name,
      color,
      department: department || null,
      department_area: department_area || null,
      image_path: req.file?.path || null,
    });

    const newCamera = await camera.save();
    res.status(201).json(newCamera);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCamera = async (req, res) => {
  try {
    const { cam_id, channel, camera_name, color, department, department_area } = req.body;

    const updateData = {
      cam_id,
      channel,
      camera_name,
      color,
      department: department || null,
      department_area: department_area || null,
    };

    if (req.file) {
      const camera = await CameraInfo.findById(req.params.id);
      if (camera?.image_path) {
        fs.unlinkSync(camera.image_path);
      }
      updateData.image_path = req.file.path;
    }

    const updatedCamera = await CameraInfo.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json(updatedCamera);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCamera = async (req, res) => {
  try {
    const camera = await CameraInfo.findById(req.params.id);
    if (!camera) {
      return res.status(404).json({ message: "Camera not found" });
    }

    if (camera.image_path) {
      fs.unlinkSync(camera.image_path);
    }

    await camera.remove();
    res.json({ message: "Camera deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
