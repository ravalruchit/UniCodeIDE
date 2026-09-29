import { Department } from '../models/Department.js';
import { Course } from '../models/Course.js';

export const getDepartments = async (req, res) => {
  try {
    const universityId = req.user.role === 'SUPER_ADMIN' && req.query.universityId
      ? req.query.universityId
      : req.user.universityId?._id || req.user.universityId;

    const filter = universityId ? { universityId } : {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const departments = await Department.find(filter)
      .populate('headOfDepartment', 'name email avatar')
      .sort({ name: 1 });

    // Count courses per department
    const deptIds = departments.map((d) => d._id);
    const courseCounts = await Course.aggregate([
      { $match: { departmentId: { $in: deptIds } } },
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    courseCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const enriched = departments.map((d) => ({
      ...d.toObject(),
      courseCount: countMap[d._id.toString()] || 0,
    }));

    res.json({
      success: true,
      count: enriched.length,
      departments: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve departments',
      error: error.message,
    });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      'headOfDepartment',
      'name email avatar'
    );

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && department.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized department access' });
    }

    res.json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const universityId = req.user.role === 'SUPER_ADMIN' && req.body.universityId
      ? req.body.universityId
      : req.user.universityId?._id || req.user.universityId;

    if (!universityId) {
      return res.status(400).json({
        success: false,
        message: 'University association required to create department',
      });
    }

    const { name, code, description, headOfDepartment } = req.body;

    const existing = await Department.findOne({
      universityId,
      code: code.trim().toUpperCase(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Department code ${code} already exists in this university`,
      });
    }

    const department = await Department.create({
      universityId,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || '',
      headOfDepartment: headOfDepartment || null,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: error.message,
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && department.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized department access' });
    }

    const { name, description, status, headOfDepartment } = req.body;
    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description;
    if (status) department.status = status;
    if (headOfDepartment !== undefined) department.headOfDepartment = headOfDepartment || null;

    await department.save();

    res.json({
      success: true,
      message: 'Department updated successfully',
      department,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const userUni = req.user.universityId?._id?.toString() || req.user.universityId?.toString();
    if (req.user.role !== 'SUPER_ADMIN' && department.universityId.toString() !== userUni) {
      return res.status(403).json({ success: false, message: 'Unauthorized department access' });
    }

    // Check if courses exist under this department
    const courseCount = await Course.countDocuments({ departmentId: department._id });
    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: ${courseCount} course(s) are assigned to it`,
      });
    }

    await department.deleteOne();

    res.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
