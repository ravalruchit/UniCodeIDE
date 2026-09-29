import Lab from '../../models/Lab.js';
import LabDevice from '../../models/LabDevice.js';

class LabService {
  /**
   * Create a new computer lab
   */
  async createLab(universityId, data, createdBy) {
    const existing = await Lab.findOne({
      universityId,
      code: data.code.trim().toUpperCase(),
    });
    if (existing) {
      throw new Error(`Lab with code "${data.code}" already exists in this university`);
    }

    const lab = new Lab({
      universityId,
      name: data.name,
      code: data.code.trim().toUpperCase(),
      building: data.building || '',
      room: data.room || '',
      description: data.description || '',
      capacity: data.capacity || 30,
      status: data.status || 'ACTIVE',
      policies: data.policies || {},
      createdBy,
    });

    return await lab.save();
  }

  /**
   * Get all labs for a university
   */
  async getLabs(universityId, filters = {}) {
    const query = { universityId };
    if (filters.status) query.status = filters.status;

    const labs = await Lab.find(query).sort({ name: 1 }).lean();

    // Attach active device counts
    const labIds = labs.map((l) => l._id);
    const deviceCounts = await LabDevice.aggregate([
      { $match: { labId: { $in: labIds }, status: { $ne: 'REVOKED' } } },
      { $group: { _id: '$labId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    deviceCounts.forEach((d) => countMap.set(d._id.toString(), d.count));

    return labs.map((lab) => ({
      ...lab,
      deviceCount: countMap.get(lab._id.toString()) || 0,
    }));
  }

  /**
   * Get lab by ID with tenant check
   */
  async getLabById(universityId, labId) {
    const lab = await Lab.findOne({ _id: labId, universityId }).lean();
    if (!lab) {
      throw new Error('Lab not found or access denied');
    }

    const deviceCount = await LabDevice.countDocuments({
      labId,
      status: { $ne: 'REVOKED' },
    });

    return { ...lab, deviceCount };
  }

  /**
   * Update lab configuration & policies
   */
  async updateLab(universityId, labId, updates) {
    const lab = await Lab.findOne({ _id: labId, universityId });
    if (!lab) {
      throw new Error('Lab not found or access denied');
    }

    if (updates.name !== undefined) lab.name = updates.name;
    if (updates.building !== undefined) lab.building = updates.building;
    if (updates.room !== undefined) lab.room = updates.room;
    if (updates.description !== undefined) lab.description = updates.description;
    if (updates.capacity !== undefined) lab.capacity = updates.capacity;
    if (updates.status !== undefined) lab.status = updates.status;

    if (updates.policies) {
      lab.policies = {
        ...lab.policies.toObject(),
        ...updates.policies,
      };
    }

    return await lab.save();
  }

  /**
   * Delete lab (if no active devices)
   */
  async deleteLab(universityId, labId) {
    const activeDevices = await LabDevice.countDocuments({
      labId,
      status: { $in: ['ACTIVE', 'MAINTENANCE'] },
    });
    if (activeDevices > 0) {
      throw new Error(`Cannot delete lab with ${activeDevices} active/maintenance devices`);
    }

    const lab = await Lab.findOneAndDelete({ _id: labId, universityId });
    if (!lab) {
      throw new Error('Lab not found or access denied');
    }
    return { success: true, message: 'Lab deleted successfully' };
  }
}

export const labService = new LabService();
export default labService;
