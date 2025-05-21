import express from 'express';
import Department from '../models/Department.js';
import DepartmentArea from '../models/DepartmentArea.js';

const router = express.Router();

// GET all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching departments',
      error: err.message 
    });
  }
});

// GET all department areas
// Modify GET areas route
router.get('/areas', async (req, res) => {
  try {
    const areas = await DepartmentArea.find().populate('department');
    res.json(areas);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching department areas',
      error: err.message 
    });
  }
});
// Add these routes to your departmentRoutes.js

// POST new department
router.post('/', async (req, res) => {
    try {
      const { dep_name } = req.body;
      const department = new Department({ dep_name });
      const newDepartment = await department.save();
      res.status(201).json(newDepartment);
    } catch (err) {
      res.status(400).json({ 
        message: 'Error creating department',
        error: err.message 
      });
    }
  });
  
  // POST new department area
  router.post('/areas', async (req, res) => {
    try {
      const { name, department } = req.body;
      const area = new DepartmentArea({ 
        area_name: name,
        department 
      });
      const newArea = await area.save();
      res.status(201).json(newArea);
    } catch (err) {
      res.status(400).json({ 
        message: 'Error creating department area',
        error: err.message 
      });
    }
  });
export default router;