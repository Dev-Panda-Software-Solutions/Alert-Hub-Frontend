/**
 * TESTING THE BACKEND INTEGRATION
 * Complete guide to test your React frontend with backend API
 */

/**
 * ============================================================================
 * PART 1: PRE-INTEGRATION CHECKLIST
 * ============================================================================
 */

// Before starting, ensure:
// ✓ Backend is running on http://localhost:5000
// ✓ Frontend is running on http://localhost:5174
// ✓ .env file has REACT_APP_API_URL=http://localhost:5000/api
// ✓ CORS is enabled in backend (server.js)
// ✓ Database migrations are run (if applicable)
// ✓ Backend npm install && npm start completed successfully

/**
 * ============================================================================
 * PART 2: CURL TESTS (Test backend directly)
 * ============================================================================
 */

// Test 1: Backend Health Check
// curl http://localhost:5000/api/health
// Expected: 200 OK or similar success response

// Test 2: Create a Module
// curl -X POST http://localhost:5000/api/modules \
//   -H "Content-Type: application/json" \
//   -d '{
//     "projectId": "proj-1",
//     "name": "Frontend Development",
//     "description": "React UI components",
//     "status": "pending",
//     "progress": 0,
//     "startDate": "2024-01-28",
//     "dueDate": "2024-02-28",
//     "priority": "high"
//   }'
// Expected: 201 Created with module object

// Test 3: Get Modules for Project
// curl http://localhost:5000/api/modules/project/proj-1
// Expected: 200 OK with array of modules

// Test 4: Update Module
// curl -X PUT http://localhost:5000/api/modules/mod-1-1 \
//   -H "Content-Type: application/json" \
//   -d '{"progress": 50, "status": "in-progress"}'
// Expected: 200 OK with updated module

/**
 * ============================================================================
 * PART 3: BROWSER TESTING (Test from React App)
 * ============================================================================
 */

// Step 1: Open React App
// http://localhost:5174

// Step 2: Open Browser Dev Tools (F12)
// Go to Console tab

// Step 3: Test HTTP Client
// Paste in console:
// (async () => {
//   const httpClient = (await import('./src/services/httpClient.ts')).default;
//   const res = await httpClient.get('/modules/project/proj-1');
//   console.log(res);
// })()

// Expected output: Array of modules from backend

/**
 * ============================================================================
 * PART 4: REACT COMPONENT TESTING
 * ============================================================================
 */

// File: src/pages/AdminDashboard.tsx
// 
// To test with real API:
// 
// 1. Change this line:
//    import projectService from "../services/projectService";
// 
// 2. To:
//    import projectService from "../services/moduleService.api";
// 
// 3. Then change loadProjects() function:
//    OLD: const data = await projectService.getProjects();
//    NEW: const data = await projectService.getModulesByProject("proj-1");
//
// 4. Reload page - should see modules from backend

/**
 * ============================================================================
 * PART 5: TESTING INDIVIDUAL FUNCTIONS
 * ============================================================================
 */

// Create a test component: src/TestAPI.tsx

// import React, { useState } from "react";
// import moduleService from "../services/moduleService.api";
// 
// export const TestAPI: React.FC = () => {
//   const [result, setResult] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
// 
//   const handleTest = async (testName: string) => {
//     try {
//       let res;
//       switch (testName) {
//         case "getModules":
//           res = await moduleService.getModulesByProject("proj-1");
//           break;
//         case "createModule":
//           res = await moduleService.createModule("proj-1", {
//             name: "Test Module",
//             description: "Test description",
//             status: "pending",
//             progress: 0,
//             startDate: "2024-01-28",
//             dueDate: "2024-02-28",
//             priority: "high"
//           });
//           break;
//       }
//       setResult(res);
//       setError(null);
//     } catch (err: any) {
//       setError(err.message);
//       setResult(null);
//     }
//   };
// 
//   return (
//     <div className="p-8">
//       <h1>API Test Panel</h1>
//       <button onClick={() => handleTest("getModules")}>Get Modules</button>
//       <button onClick={() => handleTest("createModule")}>Create Module</button>
//       {error && <div className="text-red-500">{error}</div>}
//       {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
//     </div>
//   );
// };

/**
 * ============================================================================
 * PART 6: TESTING AUTH FLOW
 * ============================================================================
 */

// Test with authentication:
// 
// 1. Login in your app
// 2. Check localStorage for token:
//    localStorage.getItem("authToken")
// 
// 3. In console, set token:
//    const httpClient = (await import('./src/services/httpClient.ts')).default;
//    httpClient.setAuthToken("your-token-here");
// 
// 4. Make request:
//    const res = await httpClient.get('/modules/project/proj-1');
//    console.log(res);

/**
 * ============================================================================
 * PART 7: TESTING ERROR HANDLING
 * ============================================================================
 */

// Test 401 Unauthorized:
// Clear token and try to make request
// httpClient.clearAuthToken();
// const res = await httpClient.get('/modules/project/proj-1');
// Should redirect to login

// Test 404 Not Found:
// const res = await httpClient.get('/modules/project/invalid-id');
// Should return error with code 404

// Test Network Error:
// Stop backend server
// Try to make request
// Should catch network error

/**
 * ============================================================================
 * PART 8: DEBUGGING TIPS
 * ============================================================================
 */

// 1. Check Network Tab in DevTools
//    - See all API requests
//    - Check request/response headers
//    - View request/response body
//    - Check status codes

// 2. Check Console for errors
//    - API errors
//    - TypeScript errors
//    - Network errors

// 3. Use breakpoints in Network tab
//    - Right-click request → Edit and resend

// 4. Check localStorage
//    - localStorage.getItem("authToken")
//    - localStorage.getItem("user")

// 5. Check CORS errors
//    - Red cross icons in Network tab
//    - "Access to XMLHttpRequest blocked by CORS policy"
//    - Fix: Update backend CORS configuration

// 6. Check Backend Logs
//    - Terminal where npm start was run
//    - Should see request logs

/**
 * ============================================================================
 * PART 9: COMMON ISSUES AND FIXES
 * ============================================================================
 */

// Issue 1: CORS Error
// Error: "Access to XMLHttpRequest blocked by CORS policy"
// Fix: Update backend server.js
// app.use(cors({
//   origin: 'http://localhost:5174',
//   credentials: true
// }));

// Issue 2: Connection Refused
// Error: "Failed to fetch" or "net::ERR_CONNECTION_REFUSED"
// Fix: Ensure backend is running on localhost:5000
// curl http://localhost:5000

// Issue 3: 401 Unauthorized
// Error: Token invalid or expired
// Fix: 
// - Check if token is being sent correctly
// - Verify token format (Bearer <token>)
// - Check token expiration

// Issue 4: 404 Not Found
// Error: API endpoint returns 404
// Fix: Check endpoint path matches backend routes
// Use correct: /api/modules not /api/modules/

// Issue 5: REACT_APP_API_URL not loading
// Error: API calls going to wrong URL
// Fix: 
// - Add REACT_APP_API_URL to .env file
// - Restart dev server after changing .env
// - npm run dev (with npm, not vite)

/**
 * ============================================================================
 * PART 10: MONITORING REQUESTS IN REAL TIME
 * ============================================================================
 */

// Add logging to httpClient.ts:
// 
// In request interceptor:
// console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
// 
// In response interceptor:
// console.log(`[API] Response:`, response.data);
// 
// View all requests in console as they happen

export {};
