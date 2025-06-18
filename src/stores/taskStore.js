import { makeAutoObservable } from "mobx";
import Task from "../models/Task";
import * as taskService from "../services/taskService";

class TaskStore {
  tasks = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Create a new task
  async createTask(taskData) {
    try {
      this.loading = true;
      const response = await taskService.createTask(taskData);
      const task = new Task(response);
      this.tasks.push(task);
      return task;
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Update an existing task
  async updateTask(taskId, taskData) {
    try {
      this.loading = true;
      const response = await taskService.updateTask(taskId, taskData);
      const updatedTask = new Task(response);
      const index = this.tasks.findIndex((t) => t.id === taskId);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
      return updatedTask;
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Delete a task
  async deleteTask(taskId) {
    try {
      this.loading = true;
      await taskService.deleteTask(taskId);
      this.tasks = this.tasks.filter((t) => t.id !== taskId);
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Load tasks for a lesson
  async loadTasksByLesson(lessonId) {
    try {
      this.loading = true;
      const response = await taskService.getTasksByLesson(lessonId);
      this.tasks = response.map((taskData) => new Task(taskData));
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Publish a task
  async publishTask(taskId) {
    try {
      this.loading = true;
      const response = await taskService.publishTask(taskId);
      const updatedTask = new Task(response);
      const index = this.tasks.findIndex((t) => t.id === taskId);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
      return updatedTask;
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Archive a task
  async archiveTask(taskId) {
    try {
      this.loading = true;
      const response = await taskService.archiveTask(taskId);
      const updatedTask = new Task(response);
      const index = this.tasks.findIndex((t) => t.id === taskId);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
      return updatedTask;
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Get a task by ID
  getTaskById(taskId) {
    return this.tasks.find((t) => t.id === taskId);
  }

  // Get tasks by lesson ID
  getTasksByLessonId(lessonId) {
    return this.tasks.filter((t) => t.lessonId === lessonId);
  }

  // Clear error
  clearError() {
    this.error = null;
  }
}

export default new TaskStore();
