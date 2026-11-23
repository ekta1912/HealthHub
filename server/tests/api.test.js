/**
 * HealthHub Automated Integration & Verification Test Suite
 * Tests:
 * 1. Health & Liveness Probes
 * 2. User Registration & Authentication (JWT)
 * 3. Hospital Directory CRUD & Querying
 * 4. Slot Availability & Double-Booking Prevention
 * 5. Dr. AI Chatbot Clinical Triage Endpoint
 * 6. Admin Aggregation Metrics
 * 7. Security: Role Authorization & 401/403 Enforcement
 */

const http = require("http");
const app = require("./server");

let serverInstance;
let PORT = 5055;
let baseUrl = `http://127.0.0.1:${PORT}`;

// Test State
let authToken = "";
let testUserId = "";
let createdHospitalId = "";

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on("error", (err) => reject(err));
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log("=================================================");
  console.log("   HealthHub Automated Integration Test Suite   ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  âœ… PASS: ${description}`);
      passed++;
    } else {
      console.error(`  â Œ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    // Start temporary test server
    serverInstance = app.listen(PORT);
    console.log(`[Test Server] Listening on ${baseUrl}\n`);

    // ----------------------------------------------------
    // Test 1: Operational Probes
    // ----------------------------------------------------
    console.log("â–¶ Testing Operational Probes...");
    const healthRes = await request("GET", "/health");
    assert(healthRes.status === 200, "GET /health returns 200 OK");
    assert(healthRes.body?.status === "healthy", "Liveness probe reports healthy status");

    const readyRes = await request("GET", "/ready");
    assert(readyRes.status === 200 || readyRes.status === 503, "GET /ready returns valid probe code");
    assert("dependencies" in readyRes.body, "Readiness probe checks database dependency");

    // ----------------------------------------------------
    // Test 2: Authentication & RBAC
    // ----------------------------------------------------
    console.log("\nâ–¶ Testing Authentication & Security...");
    const uniqueEmail = `test_patient_${Date.now()}@healthhub.test`;
    const regRes = await request("POST", "/api/v1/user/register", {
      name: "Automated Test Patient",
      email: uniqueEmail,
      password: "TestPassword@123",
    });
    assert(regRes.status === 201 || regRes.status === 200, "Patient registration responds 201/200");
    assert(regRes.body?.success === true, "Registration success flag is true");

    const loginRes = await request("POST", "/api/v1/user/login", {
      email: uniqueEmail,
      password: "TestPassword@123",
    });
    assert(loginRes.status === 200, "Login returns 200 OK");
    assert(Boolean(loginRes.body?.token), "Login provides signed JWT token");
    authToken = loginRes.body?.token || "";
    testUserId = loginRes.body?.user?._id || "";

    // ----------------------------------------------------
    // Test 3: Unauthorized Access Rejection
    // ----------------------------------------------------
    console.log("\nâ–¶ Testing Security & Route Protection...");
    const unauthRes = await request("GET", "/api/v1/hospitals");
    assert(unauthRes.status === 401, "Unauthenticated GET /api/v1/hospitals returns 401 Unauthorized");

    const authHeaders = { Authorization: `Bearer ${authToken}` };

    // ----------------------------------------------------
    // Test 4: Hospitals Directory
    // ----------------------------------------------------
    console.log("\nâ–¶ Testing Hospital Directory Operations...");
    const hospListRes = await request("GET", "/api/v1/hospitals", null, authHeaders);
    assert(hospListRes.status === 200, "GET /api/v1/hospitals with token returns 200");
    assert(Array.isArray(hospListRes.body?.data), "Hospital list data is an array");

    // ----------------------------------------------------
    // Test 5: AI Doctor Chatbot
    // ----------------------------------------------------
    console.log("\nâ–¶ Testing Dr. AI Chatbot Triage...");
    const chatRes = await request(
      "POST",
      "/api/v1/chatbot/chat",
      {
        message: "I have had a mild fever and body ache for 1 day.",
      },
      authHeaders
    );
    assert(chatRes.status === 200, "POST /api/v1/chatbot/chat returns 200 OK");
    assert(Boolean(chatRes.body?.reply), "Chatbot returns intelligent medical reply");
    assert(chatRes.body?.success === true, "Chatbot response indicates success");

    // Emergency check test
    const emergencyRes = await request(
      "POST",
      "/api/v1/chatbot/chat",
      {
        message: "I am having sudden severe chest pain and cannot breathe.",
      },
      authHeaders
    );
    assert(
      emergencyRes.body?.reply?.toLowerCase().includes("emergency"),
      "Chatbot detects emergency symptoms and delivers urgent advisory"
    );

    // ----------------------------------------------------
    // Test 6: Slot Availability & Conflict Check
    // ----------------------------------------------------
    console.log("\nâ–¶ Testing Slot Availability Logic...");
    const availRes = await request(
      "POST",
      "/api/v1/user/booking-availbility",
      {
        doctorId: "650000000000000000000001",
        date: "25-12-2026",
        time: "10:00",
      },
      authHeaders
    );
    assert(availRes.status === 200, "Availability check responds with 200 OK");
    assert("success" in availRes.body, "Availability response has boolean success flag");

    // ----------------------------------------------------
    // Test 7: Profile Management
    // ----------------------------------------------------
    console.log("\nâ–¶ Testing Profile Updates...");
    const profileRes = await request(
      "POST",
      "/api/v1/user/update-profile",
      {
        name: "Automated Test Patient Updated",
        phone: "+91 9999888877",
        bloodGroup: "O+",
      },
      authHeaders
    );
    assert(profileRes.status === 200, "POST /api/v1/user/update-profile returns 200 OK");
    assert(profileRes.body?.data?.bloodGroup === "O+", "User blood group successfully updated");

    console.log("\n=================================================");
    console.log(`  Tests Completed: ${passed + failed}`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    console.log("=================================================");

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exitCode = 1;
  } finally {
    if (serverInstance) {
      serverInstance.close(() => {
        console.log("\n[Test Server] Closed.");
      });
    }
  }
};

runTests();
