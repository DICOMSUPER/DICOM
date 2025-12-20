/* eslint-disable */
import axios from 'axios';

/**
 * Test setup for user-service E2E tests
 * 
 * This file runs before each test file.
 * Configuration:
 * - HOST: Environment variable for user-service host (default: 'localhost')
 * - PORT: Environment variable for user-service TCP port (default: 5002)
 */

module.exports = async function () {
  // Configure axios for HTTP-based tests (if any)
  const host = process.env.HOST ?? 'localhost';
  const httpPort = process.env.HTTP_PORT ?? '3000';
  axios.defaults.baseURL = `http://${host}:${httpPort}`;

  // Set default timeout for Jest
  jest.setTimeout(30000);

  // Log test environment configuration
  const tcpPort = process.env.PORT ?? '5002';
  console.log(`\n📋 Test Environment Configuration:`);
  console.log(`   TCP Host: ${host}`);
  console.log(`   TCP Port: ${tcpPort}`);
  console.log(`   HTTP Base URL: ${axios.defaults.baseURL}\n`);
};
