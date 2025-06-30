const request = require('supertest');
const app = require('../index');

// Mock external dependencies that might be imported
jest.mock('../database', () => ({
  getUser: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getAllUsers: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
}));

jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  authorize: jest.fn((roles) => (req, res, next) => next()),
}));

const mockDb = require('../database');
const mockAuth = require('../middleware/auth');

describe('Server Application', () => {
  beforeAll(async () => {
    // Setup test environment
    process.env.NODE_ENV = 'test';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    // Cleanup after all tests
    if (app?.close) {
      await app.close();
    }
  });

  describe('Health Check Endpoint', () => {
    test('GET /health should return 200 with status OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });

    test('GET /health should include valid timestamp format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    test('GET /health should return positive uptime', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    test('GET /healthz should also work (alternative health endpoint)', async () => {
      const response = await request(app)
        .get('/healthz')
        .expect(200);

      expect(response.body.status).toBe('OK');
    });
  });

  describe('User Management Endpoints', () => {
    describe('GET /users', () => {
      test('should return all users successfully', async () => {
        const mockUsers = [
          { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: '2023-01-01' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: '2023-01-02' },
        ];
        mockDb.getAllUsers.mockResolvedValue(mockUsers);

        const response = await request(app)
          .get('/users')
          .expect(200);

        expect(response.body).toEqual(mockUsers);
        expect(mockDb.getAllUsers).toHaveBeenCalledTimes(1);
      });

      test('should return empty array when no users exist', async () => {
        mockDb.getAllUsers.mockResolvedValue([]);

        const response = await request(app)
          .get('/users')
          .expect(200);

        expect(response.body).toEqual([]);
      });

      test('should handle database errors gracefully', async () => {
        mockDb.getAllUsers.mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app)
          .get('/users')
          .expect(500);

        expect(response.body).toEqual({
          error: 'Internal server error',
          message: expect.any(String),
        });
      });

      test('should support pagination', async () => {
        const mockUsers = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
        }));
        mockDb.getAllUsers.mockResolvedValue(mockUsers.slice(0, 2));

        const response = await request(app)
          .get('/users?page=1&limit=2')
          .expect(200);

        expect(response.body).toHaveLength(2);
        expect(mockDb.getAllUsers).toHaveBeenCalledWith({ page: 1, limit: 2 });
      });

      test('should validate pagination parameters', async () => {
        const response = await request(app)
          .get('/users?page=-1&limit=abc')
          .expect(400);

        expect(response.body.error).toContain('Invalid pagination parameters');
      });
    });

    describe('GET /users/:id', () => {
      test('should return specific user by ID', async () => {
        const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
        mockDb.getUser.mockResolvedValue(mockUser);

        const response = await request(app)
          .get('/users/1')
          .expect(200);

        expect(response.body).toEqual(mockUser);
        expect(mockDb.getUser).toHaveBeenCalledWith(1);
      });

      test('should return 404 when user not found', async () => {
        mockDb.getUser.mockResolvedValue(null);

        const response = await request(app)
          .get('/users/999')
          .expect(404);

        expect(response.body).toEqual({
          error: 'User not found',
        });
      });

      test('should validate user ID parameter as numeric', async () => {
        const response = await request(app)
          .get('/users/invalid-id')
          .expect(400);

        expect(response.body).toEqual({
          error: 'Invalid user ID format',
        });
      });

      test('should handle negative user IDs', async () => {
        const response = await request(app)
          .get('/users/-1')
          .expect(400);

        expect(response.body.error).toBe('Invalid user ID format');
      });

      test('should handle very large user IDs', async () => {
        const response = await request(app)
          .get('/users/999999999999999')
          .expect(400);

        expect(response.body.error).toBe('Invalid user ID format');
      });
    });

    describe('POST /users', () => {
      test('should create new user with valid data', async () => {
        const newUser = { name: 'New User', email: 'new@example.com' };
        const createdUser = { id: 3, ...newUser, createdAt: '2023-01-03' };
        mockDb.createUser.mockResolvedValue(createdUser);

        const response = await request(app)
          .post('/users')
          .send(newUser)
          .expect(201);

        expect(response.body).toEqual(createdUser);
        expect(mockDb.createUser).toHaveBeenCalledWith(newUser);
      });

      test('should validate required name field', async () => {
        const response = await request(app)
          .post('/users')
          .send({ email: 'test@example.com' })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toContain('Name is required');
      });

      test('should validate required email field', async () => {
        const response = await request(app)
          .post('/users')
          .send({ name: 'Test User' })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toContain('Email is required');
      });

      test('should validate email format', async () => {
        const response = await request(app)
          .post('/users')
          .send({ name: 'Test User', email: 'invalid-email' })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toContain('Invalid email format');
      });

      test('should handle duplicate email addresses', async () => {
        const duplicateError = new Error('Email already exists');
        duplicateError.code = 'DUPLICATE_EMAIL';
        mockDb.createUser.mockRejectedValue(duplicateError);

        const response = await request(app)
          .post('/users')
          .send({ name: 'Test User', email: 'existing@example.com' })
          .expect(409);

        expect(response.body).toEqual({
          error: 'Conflict',
          message: 'Email already exists',
        });
      });

      test('should sanitize XSS attempts in name field', async () => {
        const maliciousInput = {
          name: '<script>alert("xss")</script>',
          email: 'test@example.com',
        };
        const sanitizedUser = {
          id: 1,
          name: '&lt;script&gt;alert("xss")&lt;/script&gt;',
          email: 'test@example.com',
        };
        mockDb.createUser.mockResolvedValue(sanitizedUser);

        const response = await request(app)
          .post('/users')
          .send(maliciousInput)
          .expect(201);

        expect(response.body.name).not.toContain('<script>');
      });

      test('should trim whitespace from input fields', async () => {
        const inputWithWhitespace = {
          name: '  John Doe  ',
          email: '  john@example.com  ',
        };
        const trimmedUser = {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
        };
        mockDb.createUser.mockResolvedValue(trimmedUser);

        await request(app)
          .post('/users')
          .send(inputWithWhitespace)
          .expect(201);

        expect(mockDb.createUser).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
        });
      });

      test('should reject names that are too long', async () => {
        const longName = 'A'.repeat(256);
        const response = await request(app)
          .post('/users')
          .send({ name: longName, email: 'test@example.com' })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toContain('Name too long');
      });

      test('should reject names that are too short', async () => {
        const response = await request(app)
          .post('/users')
          .send({ name: 'A', email: 'test@example.com' })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toContain('Name too short');
      });
    });

    describe('PUT /users/:id', () => {
      test('should update existing user with valid data', async () => {
        const updateData = { name: 'Updated Name', email: 'updated@example.com' };
        const updatedUser = { id: 1, ...updateData, updatedAt: '2023-01-04' };
        mockDb.updateUser.mockResolvedValue(updatedUser);

        const response = await request(app)
          .put('/users/1')
          .send(updateData)
          .expect(200);

        expect(response.body).toEqual(updatedUser);
        expect(mockDb.updateUser).toHaveBeenCalledWith(1, updateData);
      });

      test('should return 404 when updating non-existent user', async () => {
        mockDb.updateUser.mockResolvedValue(null);

        const response = await request(app)
          .put('/users/999')
          .send({ name: 'Test', email: 'test@example.com' })
          .expect(404);

        expect(response.body).toEqual({
          error: 'User not found',
        });
      });

      test('should validate update data format', async () => {
        const response = await request(app)
          .put('/users/1')
          .send({ email: 'invalid-email' })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
      });

      test('should allow partial updates', async () => {
        const partialUpdate = { name: 'Only Name Updated' };
        const updatedUser = { 
          id: 1, 
          name: 'Only Name Updated', 
          email: 'existing@example.com',
          updatedAt: '2023-01-04'
        };
        mockDb.updateUser.mockResolvedValue(updatedUser);

        const response = await request(app)
          .put('/users/1')
          .send(partialUpdate)
          .expect(200);

        expect(response.body).toEqual(updatedUser);
      });

      test('should prevent updating with empty data', async () => {
        const response = await request(app)
          .put('/users/1')
          .send({})
          .expect(400);

        expect(response.body.error).toBe('No update data provided');
      });
    });

    describe('DELETE /users/:id', () => {
      test('should delete existing user', async () => {
        mockDb.deleteUser.mockResolvedValue(true);

        const response = await request(app)
          .delete('/users/1')
          .expect(204);

        expect(response.body).toEqual({});
        expect(mockDb.deleteUser).toHaveBeenCalledWith(1);
      });

      test('should return 404 when deleting non-existent user', async () => {
        mockDb.deleteUser.mockResolvedValue(false);

        const response = await request(app)
          .delete('/users/999')
          .expect(404);

        expect(response.body).toEqual({
          error: 'User not found',
        });
      });

      test('should validate user ID for deletion', async () => {
        const response = await request(app)
          .delete('/users/invalid')
          .expect(400);

        expect(response.body.error).toBe('Invalid user ID format');
      });
    });
  });

  describe('Data Processing Endpoints', () => {
    describe('POST /api/data/process', () => {
      test('should process valid numeric data successfully', async () => {
        const inputData = { values: [1, 2, 3, 4, 5] };
        const expectedResult = { 
          processed: true, 
          sum: 15, 
          average: 3,
          count: 5,
          min: 1,
          max: 5
        };

        const response = await request(app)
          .post('/api/data/process')
          .send(inputData)
          .expect(200);

        expect(response.body).toEqual(expectedResult);
      });

      test('should handle empty data arrays', async () => {
        const inputData = { values: [] };

        const response = await request(app)
          .post('/api/data/process')
          .send(inputData)
          .expect(200);

        expect(response.body).toEqual({
          processed: true,
          sum: 0,
          average: 0,
          count: 0,
          min: null,
          max: null
        });
      });

      test('should validate required values field', async () => {
        const response = await request(app)
          .post('/api/data/process')
          .send({ invalid: 'data' })
          .expect(400);

        expect(response.body.error).toBe('Invalid data format');
        expect(response.body.message).toBe('Values array is required');
      });

      test('should reject non-array values', async () => {
        const response = await request(app)
          .post('/api/data/process')
          .send({ values: 'not-an-array' })
          .expect(400);

        expect(response.body.error).toBe('Invalid data format');
      });

      test('should handle non-numeric values in array', async () => {
        const inputData = { values: [1, 'invalid', 3] };

        const response = await request(app)
          .post('/api/data/process')
          .send(inputData)
          .expect(400);

        expect(response.body.error).toBe('All values must be numeric');
      });

      test('should handle floating point numbers', async () => {
        const inputData = { values: [1.5, 2.7, 3.2] };

        const response = await request(app)
          .post('/api/data/process')
          .send(inputData)
          .expect(200);

        expect(response.body.sum).toBeCloseTo(7.4);
        expect(response.body.average).toBeCloseTo(2.47, 2);
      });

      test('should handle negative numbers', async () => {
        const inputData = { values: [-1, -2, 3, 4] };

        const response = await request(app)
          .post('/api/data/process')
          .send(inputData)
          .expect(200);

        expect(response.body.sum).toBe(4);
        expect(response.body.min).toBe(-2);
        expect(response.body.max).toBe(4);
      });

      test('should handle large datasets efficiently', async () => {
        const largeArray = Array.from({ length: 10000 }, (_, i) => i);
        const inputData = { values: largeArray };

        const startTime = Date.now();
        const response = await request(app)
          .post('/api/data/process')
          .send(inputData)
          .expect(200);
        const processTime = Date.now() - startTime;

        expect(response.body.processed).toBe(true);
        expect(response.body.sum).toBe(49995000);
        expect(processTime).toBeLessThan(5000); // Should process within 5 seconds
      });

      test('should limit array size to prevent abuse', async () => {
        const hugeArray = Array.from({ length: 100001 }, (_, i) => i);
        const inputData = { values: hugeArray };

        const response = await request(app)
          .post('/api/data/process')
          .send(inputData)
          .expect(413);

        expect(response.body.error).toBe('Payload too large');
      });
    });
  });

  describe('Authentication and Authorization', () => {
    describe('Protected Routes', () => {
      test('should require authentication for user creation', async () => {
        mockAuth.authenticate.mockImplementation((req, res, next) => {
          res.status(401).json({ error: 'Authentication required' });
        });

        const response = await request(app)
          .post('/users')
          .send({ name: 'Test', email: 'test@example.com' })
          .expect(401);

        expect(response.body.error).toBe('Authentication required');
      });

      test('should require admin role for user deletion', async () => {
        mockAuth.authorize.mockImplementation((roles) => (req, res, next) => {
          if (!roles.includes('admin')) {
            return res.status(403).json({ error: 'Insufficient privileges' });
          }
          next();
        });

        const response = await request(app)
          .delete('/users/1')
          .expect(403);

        expect(response.body.error).toBe('Insufficient privileges');
      });

      test('should allow authenticated users to view their own profile', async () => {
        mockAuth.authenticate.mockImplementation((req, res, next) => {
          req.user = { id: 1, role: 'user' };
          next();
        });

        const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
        mockDb.getUser.mockResolvedValue(mockUser);

        const response = await request(app)
          .get('/users/1')
          .set('Authorization', 'Bearer valid-token')
          .expect(200);

        expect(response.body).toEqual(mockUser);
      });
    });
  });

  describe('Error Handling Middleware', () => {
    test('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Route not found',
        path: '/non-existent-route',
      });
    });

    test('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.error).toBe('Invalid JSON format');
    });

    test('should handle unsupported HTTP methods', async () => {
      const response = await request(app)
        .patch('/users/1')
        .expect(405);

      expect(response.body).toEqual({
        error: 'Method not allowed',
        allowed: expect.arrayContaining(['GET', 'POST', 'PUT', 'DELETE']),
      });
    });

    test('should handle request timeout errors', async () => {
      // Mock a slow database operation
      mockDb.getAllUsers.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 31000)) // 31 seconds
      );

      const response = await request(app)
        .get('/users')
        .timeout(5000)
        .expect(408);

      expect(response.body.error).toBe('Request timeout');
    });
  });

  describe('Security Headers and Middleware', () => {
    test('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    test('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/users')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });

    test('should sanitize SQL injection attempts', async () => {
      const maliciousInput = {
        name: "'; DROP TABLE users; --",
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/users')
        .send(maliciousInput)
        .expect(400);

      expect(response.body.error).toBe('Invalid input detected');
    });

    test('should implement rate limiting', async () => {
      // Make rapid requests to trigger rate limiting
      const requests = Array.from({ length: 101 }, () =>
        request(app).get('/health')
      );

      const responses = await Promise.allSettled(requests);
      const rateLimitedResponses = responses
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .filter(r => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Content Type and Request Handling', () => {
    test('should accept application/json content type', async () => {
      const userData = { name: 'Test User', email: 'test@example.com' };
      mockDb.createUser.mockResolvedValue({ id: 1, ...userData });

      await request(app)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send(userData)
        .expect(201);
    });

    test('should reject unsupported content types for POST requests', async () => {
      const response = await request(app)
        .post('/users')
        .set('Content-Type', 'text/plain')
        .send('invalid data')
        .expect(415);

      expect(response.body.error).toBe('Unsupported media type');
    });

    test('should return JSON responses with correct content type', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('should handle request body size limits', async () => {
      const largePayload = {
        name: 'A'.repeat(1000000), // 1MB string
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/users')
        .send(largePayload)
        .expect(413);

      expect(response.body.error).toBe('Payload too large');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    test('should handle special characters in user names', async () => {
      const specialCharData = {
        name: 'José María Azñar-González',
        email: 'josé@müller-domain.com',
      };
      mockDb.createUser.mockResolvedValue({ id: 1, ...specialCharData });

      const response = await request(app)
        .post('/users')
        .send(specialCharData)
        .expect(201);

      expect(response.body.name).toBe(specialCharData.name);
      expect(response.body.email).toBe(specialCharData.email);
    });

    test('should handle null and undefined values gracefully', async () => {
      const response = await request(app)
        .post('/users')
        .send({ name: null, email: undefined })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    test('should handle concurrent requests to same resource', async () => {
      const userData = { name: 'Concurrent User', email: 'concurrent@example.com' };
      mockDb.createUser.mockResolvedValue({ id: 1, ...userData });

      const concurrentRequests = Array.from({ length: 10 }, () =>
        request(app).post('/users').send(userData)
      );

      const responses = await Promise.all(concurrentRequests);
      const successfulResponses = responses.filter(r => r.status === 201);

      // Should handle concurrent requests without crashes
      expect(responses.length).toBe(10);
    });

    test('should handle Unicode characters in requests', async () => {
      const unicodeData = {
        name: '测试用户 🚀',
        email: 'test@测试.com',
      };
      mockDb.createUser.mockResolvedValue({ id: 1, ...unicodeData });

      const response = await request(app)
        .post('/users')
        .send(unicodeData)
        .expect(201);

      expect(response.body.name).toBe(unicodeData.name);
    });
  });

  describe('Performance and Load Testing', () => {
    test('should respond within acceptable time limits', async () => {
      mockDb.getAllUsers.mockResolvedValue([]);

      const startTime = Date.now();
      await request(app)
        .get('/users')
        .expect(200);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(1000); // 1 second max
    });

    test('should handle multiple concurrent requests efficiently', async () => {
      mockDb.getAllUsers.mockResolvedValue([]);

      const concurrentRequests = Array.from({ length: 50 }, () =>
        request(app).get('/health')
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      const successfulResponses = responses.filter(r => r.status === 200);
      expect(successfulResponses.length).toBe(50);
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should maintain performance under sustained load', async () => {
      mockDb.getAllUsers.mockResolvedValue([]);

      // Sequential requests to test sustained performance
      const responseTimes = [];
      for (let i = 0; i < 20; i++) {
        const startTime = Date.now();
        await request(app).get('/health').expect(200);
        responseTimes.push(Date.now() - startTime);
      }

      const averageResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
      expect(averageResponseTime).toBeLessThan(100); // Average under 100ms
    });
  });
});