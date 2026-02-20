const axios = require('axios');

/**
 * LIGHTWEIGHT LOAD SIMULATION SCRIPT
 * For ANUBHAV Gaming Studio Backend
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENT_USERS = 50;
const DURATION_SECONDS = 10;

async function simulateUser(id) {
  const start = Date.now();
  try {
    // Simulate common health check/ping
    await axios.get(`${BASE_URL}/api`, { timeout: 2000 });
    const latency = Date.now() - start;
    return { success: true, latency };
  } catch (err) {
    return { success: false, error: err.message, latency: Date.now() - start };
  }
}

async function runSimulation() {
  console.log(`🚀 Starting load simulation: ${CONCURRENT_USERS} concurrent users for ${DURATION_SECONDS}s`);
  console.log(`📍 Target: ${BASE_URL}`);

  const results = [];
  const endTime = Date.now() + (DURATION_SECONDS * 1000);

  while (Date.now() < endTime) {
    const batch = Array.from({ length: CONCURRENT_USERS }, (_, i) => simulateUser(i));
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    
    // Tiny sleep to avoid local socket exhaustion
    await new Promise(r => setTimeout(r, 100));
  }

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const latencies = successful.map(r => r.latency);
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

  console.log('\n--- Simulation Results ---');
  console.log(`Total Requests: ${results.length}`);
  console.log(`Success Rate:   ${((successful.length / results.length) * 100).toFixed(2)}%`);
  console.log(`Avg Latency:    ${avgLatency.toFixed(2)}ms`);
  console.log(`P95 Latency:    ${p95Latency}ms`);
  console.log(`Total Failures: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('Sample Error:', failed[0].error);
  }
}

runSimulation();
