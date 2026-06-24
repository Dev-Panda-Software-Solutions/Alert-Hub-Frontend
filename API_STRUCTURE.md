/**
 * MODULE API STRUCTURE
 * Linked to frontend with dummy data
 * 
 * HIERARCHY: Project -> Module -> Submodule -> ModuleTask
 */

/**
 * ============================================================================
 * MODULE ENDPOINTS
 * ============================================================================
 */

// Create a new module for a project
// POST /api/modules
// Body: {
//   projectId: string,
//   name: string,
//   description: string,
//   status: "pending" | "in-progress" | "completed" | "on-hold",
//   progress: number,
//   startDate: string (YYYY-MM-DD),
//   dueDate: string (YYYY-MM-DD),
//   assignee?: string (userId),
//   priority: "low" | "medium" | "high"
// }

// Get all modules for a project
// GET /api/modules/project/:projectId

// Update a module
// PUT /api/modules/:id
// Body: { ...partial updates }

// Delete a module
// DELETE /api/modules/:id

/**
 * ============================================================================
 * SUBMODULE ENDPOINTS
 * ============================================================================
 */

// Create a new submodule for a module
// POST /api/submodules
// Body: {
//   moduleId: string,
//   projectId: string,
//   name: string,
//   description: string,
//   status: "pending" | "in-progress" | "completed" | "on-hold",
//   progress: number,
//   startDate: string,
//   dueDate: string,
//   assignee?: string,
//   priority: "low" | "medium" | "high"
// }

// Get all submodules for a module
// GET /api/submodules/module/:moduleId

// Update a submodule
// PUT /api/submodules/:id
// Body: { ...partial updates }

// Delete a submodule
// DELETE /api/submodules/:id

/**
 * ============================================================================
 * MODULE TASK ENDPOINTS
 * ============================================================================
 */

// Create a new task for a submodule
// POST /api/tasks
// Body: {
//   submoduleId: string,
//   moduleId: string,
//   projectId: string,
//   title: string,
//   description: string,
//   status: "pending" | "in-progress" | "completed" | "blocked",
//   priority: "low" | "medium" | "high",
//   assignee?: string,
//   dueDate: string
// }

// Get all tasks for a submodule
// GET /api/tasks/submodule/:submoduleId

// Update a task
// PUT /api/tasks/:id
// Body: { ...partial updates }

// Mark task as complete
// PUT /api/tasks/:id/complete
// Returns: task with status="completed" and completedAt timestamp

// Delete a task
// DELETE /api/tasks/:id

/**
 * ============================================================================
 * FRONTEND SERVICE LAYER
 * ============================================================================
 * 
 * File: src/services/moduleService.ts
 * 
 * Methods:
 * - createModule(projectId, moduleData)
 * - getModulesByProject(projectId)
 * - updateModule(moduleId, updates)
 * - deleteModule(moduleId)
 * 
 * - createSubmodule(moduleId, submoduleData)
 * - getSubmodulesByModule(moduleId)
 * - updateSubmodule(submoduleId, updates)
 * - deleteSubmodule(submoduleId)
 * 
 * - createTask(submoduleId, taskData)
 * - getTasksBySubmodule(submoduleId)
 * - updateTask(taskId, updates)
 * - completeTask(taskId)
 * - deleteTask(taskId)
 */

/**
 * ============================================================================
 * DUMMY DATA STRUCTURE
 * ============================================================================
 */

// DUMMY_MODULES: Record<projectId, Module[]>
// Example: DUMMY_MODULES["proj-1"] = [
//   { id: "mod-1-1", projectId: "proj-1", name: "Frontend", ... }
// ]

// DUMMY_SUBMODULES: Record<moduleId, Submodule[]>
// Example: DUMMY_SUBMODULES["mod-1-1"] = [
//   { id: "submod-1-1-1", moduleId: "mod-1-1", name: "Homepage", ... }
// ]

// DUMMY_MODULE_TASKS: Record<submoduleId, ModuleTask[]>
// Example: DUMMY_MODULE_TASKS["submod-1-1-1"] = [
//   { id: "task-1-1-1-1", submoduleId: "submod-1-1-1", title: "Design hero", ... }
// ]

/**
 * ============================================================================
 * USAGE EXAMPLE (FRONTEND)
 * ============================================================================
 */

// import moduleService from "../services/moduleService";
//
// // Get all modules for a project
// const modules = await moduleService.getModulesByProject("proj-1");
//
// // Get submodules for a module
// const submodules = await moduleService.getSubmodulesByModule("mod-1-1");
//
// // Get tasks for a submodule
// const tasks = await moduleService.getTasksBySubmodule("submod-1-1-1");
//
// // Create a new module
// const newModule = await moduleService.createModule("proj-1", {
//   name: "New Module",
//   description: "Description",
//   status: "pending",
//   progress: 0,
//   startDate: "2024-01-28",
//   dueDate: "2024-02-28",
//   priority: "high"
// });
//
// // Update module progress
// await moduleService.updateModule("mod-1-1", { progress: 50 });
//
// // Mark task as complete
// await moduleService.completeTask("task-1-1-1-1");
