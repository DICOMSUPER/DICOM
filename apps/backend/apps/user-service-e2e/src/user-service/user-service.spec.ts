/**
 * User Service E2E Tests
 * 
 * This file imports all E2E test modules for the user-service.
 * Tests connect directly to the user-service container via TCP transport.
 * 
 * Configuration:
 * - Host: process.env.HOST || 'localhost'
 * - Port: process.env.PORT || 5002
 * 
 * To run tests:
 * 1. Ensure user-service is running: nx serve user-service
 * 2. Run tests: nx test user-service-e2e
 */

// Core User Tests
import './modules/user/user.test';

// Department Tests
import './modules/departments/departments.test';

// Room Tests
import './modules/rooms/rooms.test';

// Service Tests
import './modules/services/services.test';

// Shift Template Tests
import './modules/shift-template/shift-template.test';

// Room Schedule Tests
import './modules/room-schedule/room-schedule.test';

// Employee Room Assignments Tests
import './modules/employee-room-assignments/employee-room-assignments.test';

// Service Rooms Tests
import './modules/service-rooms/service-rooms.test';

// Digital Signature Tests
import './modules/digital-signature/digital-signature.test';

describe('User Service E2E Test Suite', () => {
  it('should load all test modules', () => {
    expect(true).toBe(true);
  });
});
