import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Inventory Flow (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let productId: number;
  let categoryId: number;
  let supplierId: number;

  const testUser = {
    email: 'inventory-test@example.com',
    password: 'Test123!@#',
    firstName: 'Inventory',
    lastName: 'Tester',
    role: 'admin',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Create test user and login
    await request(app.getHttpServer())
      .post('/api/users')
      .send(testUser);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    // Clean up test data
    if (dataSource && dataSource.isInitialized) {
      try {
        if (productId) {
          await dataSource.query(`DELETE FROM inventory_movements WHERE product_id = $1`, [productId]);
          await dataSource.query(`DELETE FROM inventory WHERE product_id = $1`, [productId]);
          await dataSource.query(`DELETE FROM products WHERE id = $1`, [productId]);
        }
        if (categoryId) {
          await dataSource.query(`DELETE FROM categories WHERE id = $1`, [categoryId]);
        }
        if (supplierId) {
          await dataSource.query(`DELETE FROM suppliers WHERE id = $1`, [supplierId]);
        }
        await dataSource.query(`DELETE FROM users WHERE email = $1`, [testUser.email]);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    await app.close();
  });

  describe('Setup: Create Category and Supplier', () => {
    it('should create a category', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'E2E Test Category',
          description: 'Category for E2E testing',
        })
        .expect(201);

      categoryId = res.body.id;
      expect(categoryId).toBeDefined();
    });

    it('should create a supplier', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'E2E Test Supplier',
          contactEmail: 'supplier@test.com',
          phone: '1234567890',
        })
        .expect(201);

      supplierId = res.body.id;
      expect(supplierId).toBeDefined();
    });
  });

  describe('Products CRUD', () => {
    it('should create a product', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sku: 'E2E-TEST-001',
          name: 'E2E Test Product',
          barcode: '1234567890123',
          costPrice: 100,
          salePrice: 150,
          reorderPoint: 10,
          categoryId,
          supplierId,
        })
        .expect(201);

      productId = res.body.id;
      expect(productId).toBeDefined();
      expect(res.body.sku).toBe('E2E-TEST-001');
    });

    it('should get product by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(productId);
      expect(res.body.sku).toBe('E2E-TEST-001');
    });

    it('should reject duplicate SKU', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sku: 'E2E-TEST-001', // Same SKU
          name: 'Another Product',
          costPrice: 50,
          salePrice: 75,
          categoryId,
        })
        .expect(409);
    });

    it('should reject sale price <= cost price', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sku: 'E2E-TEST-002',
          name: 'Invalid Price Product',
          costPrice: 100,
          salePrice: 50, // Less than cost
          categoryId,
        })
        .expect(400);
    });
  });

  describe('Inventory Operations', () => {
    it('should register stock entry', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/inventory/entry')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId,
          quantity: 100,
          referenceDoc: 'ORD-E2E-001',
          supplierId,
          notes: 'Initial stock entry',
        })
        .expect(201);

      expect(res.body.movementType).toBe('entry');
      expect(res.body.quantity).toBe(100);
      expect(res.body.stockAfter).toBe(100);
    });

    it('should get current stock', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/inventory/stock/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.currentStock).toBe(100);
    });

    it('should register stock exit (sale)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/inventory/exit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId,
          quantity: 10,
          exitType: 'sale',
          referenceDoc: 'VTA-E2E-001',
          notes: 'Test sale',
        })
        .expect(201);

      expect(res.body.movementType).toBe('sale');
      expect(res.body.stockBefore).toBe(100);
      expect(res.body.stockAfter).toBe(90);
    });

    it('should prevent overselling', async () => {
      await request(app.getHttpServer())
        .post('/api/inventory/exit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId,
          quantity: 1000, // More than available
          exitType: 'sale',
          referenceDoc: 'VTA-E2E-002',
        })
        .expect(400);
    });

    it('should register stock adjustment', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/inventory/adjustment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId,
          newQuantity: 88, // Small adjustment within 10%
          reason: 'Physical count',
        })
        .expect(201);

      expect(res.body.movementType).toBe('adjustment');
      expect(res.body.stockAfter).toBe(88);
    });

    it('should require evidence for large adjustments (>10%)', async () => {
      await request(app.getHttpServer())
        .post('/api/inventory/adjustment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId,
          newQuantity: 50, // Large adjustment
          reason: 'Large adjustment without evidence',
        })
        .expect(400);
    });

    it('should get movement history', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inventory/movements')
        .query({ productId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('Reports', () => {
    it('should get dashboard summary', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.inventory).toBeDefined();
      expect(res.body.activity).toBeDefined();
      expect(res.body.catalog).toBeDefined();
    });

    it('should get inventory report', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.summary).toBeDefined();
    });

    it('should get movements report', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/movements')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.summary).toBeDefined();
    });
  });

  describe('Alerts', () => {
    it('should run manual alert check', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/alerts/check')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(res.body.lowStock).toBeDefined();
      expect(res.body.noMovement).toBeDefined();
    });

    it('should get alerts summary', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/alerts/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.total).toBeDefined();
      expect(res.body.unresolved).toBeDefined();
    });
  });
});
