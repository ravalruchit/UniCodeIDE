import { apiClient } from './api';

export const lmsService = {
  // --- Departments ---
  async getDepartments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/departments${query ? `?${query}` : ''}`;
    return apiClient(endpoint);
  },

  async getDepartment(id) {
    return apiClient(`/departments/${id}`);
  },

  async createDepartment(data) {
    return apiClient('/departments', {
      method: 'POST',
      body: data,
    });
  },

  async updateDepartment(id, data) {
    return apiClient(`/departments/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async deleteDepartment(id) {
    return apiClient(`/departments/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Courses ---
  async getCourses(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/courses${query ? `?${query}` : ''}`;
    return apiClient(endpoint);
  },

  async getTeacherCourses(params = {}) {
    return this.getCourses({ myCourses: 'true', ...params });
  },

  async getCourse(id) {
    return apiClient(`/courses/${id}`);
  },

  async createCourse(data) {
    return apiClient('/courses', {
      method: 'POST',
      body: data,
    });
  },

  async updateCourse(id, data) {
    return apiClient(`/courses/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async updateCourseStatus(id, status) {
    return apiClient(`/courses/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  async deleteCourse(id) {
    return apiClient(`/courses/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Curriculum & Modules & Lessons ---
  async getCourseCurriculum(courseId) {
    return apiClient(`/courses/${courseId}/curriculum`);
  },

  async createModule(courseId, data) {
    return apiClient(`/courses/${courseId}/modules`, {
      method: 'POST',
      body: data,
    });
  },

  async updateModule(moduleId, data) {
    return apiClient(`/modules/${moduleId}`, {
      method: 'PUT',
      body: data,
    });
  },

  async deleteModule(moduleId) {
    return apiClient(`/modules/${moduleId}`, {
      method: 'DELETE',
    });
  },

  async createLesson(moduleId, data) {
    return apiClient(`/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: data,
    });
  },

  async getLesson(lessonId) {
    return apiClient(`/lessons/${lessonId}`);
  },

  async updateLesson(lessonId, data) {
    return apiClient(`/lessons/${lessonId}`, {
      method: 'PUT',
      body: data,
    });
  },

  async deleteLesson(lessonId) {
    return apiClient(`/lessons/${lessonId}`, {
      method: 'DELETE',
    });
  },

  // --- Enrollment & Progress ---
  async enrollInCourse(courseId) {
    return apiClient(`/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  },

  async unenrollFromCourse(courseId) {
    return apiClient(`/courses/${courseId}/unenroll`, {
      method: 'DELETE',
    });
  },

  async getMyEnrolledCourses(status = 'ACTIVE') {
    return apiClient(`/enrollments/my-courses?status=${status}`);
  },

  async getCourseStudents(courseId) {
    return apiClient(`/courses/${courseId}/students`);
  },

  async toggleLessonProgress(lessonId, completed) {
    return apiClient(`/lessons/${lessonId}/progress`, {
      method: 'PATCH',
      body: completed !== undefined ? { completed } : {},
    });
  },

  // --- LMS Role Stats ---
  async getLMSStats() {
    return apiClient('/lms/stats');
  },
};
