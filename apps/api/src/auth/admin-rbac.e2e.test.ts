import "reflect-metadata";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { AdminController } from "../admin/admin.controller";
import { AuthModule } from "./auth.module";
import { AdminRoleGuard } from "./admin-role.guard";
import { JwtAuthGuard } from "./jwt.guard";
import { MailerModule } from "../mailer/mailer.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { signAccessToken } from "./jwt";

type Role = "STUDENT" | "ADMIN" | "SUPER_ADMIN";

const users = [
  {
    id: "user_student",
    name: "Demo Student",
    email: "student@vidya.test",
    role: "STUDENT" as Role,
    emailVerifiedAt: new Date(),
    department: null,
  },
  {
    id: "user_admin",
    name: "Admin",
    email: "admin@vidya.edu.in",
    role: "ADMIN" as Role,
    emailVerifiedAt: new Date(),
    department: null,
  },
  {
    id: "user_super",
    name: "Super Admin",
    email: "superadmin@vidya.edu.in",
    role: "SUPER_ADMIN" as Role,
    emailVerifiedAt: new Date(),
    department: null,
  },
];

/** Minimal in-memory Prisma double covering what admin auth touches. */
const prisma = {
  user: {
    findUnique: async ({ where }: { where: Record<string, string> }) =>
      users.find(
        (user) => user.id === where.id || user.email === where.email
      ) ?? null,
    update: async () => ({}),
    create: async ({ data }: { data: Record<string, unknown> }) => ({
      id: "user_new_admin",
      ...data,
    }),
  },
};

const tokenFor = (role: Role) => {
  const sub = {
    STUDENT: "user_student",
    ADMIN: "user_admin",
    SUPER_ADMIN: "user_super",
  }[role];
  return signAccessToken(
    { sub, email: `${sub}@vidya.test`, role, name: role },
    { get: () => "test-secret" } as never
  );
};

describe("admin RBAC (e2e)", () => {
  let app: NestFastifyApplication | undefined;
  let studentToken = "";
  let adminToken = "";
  let superAdminToken = "";

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        MailerModule,
        AuthModule,
      ],
      controllers: [AdminController],
      providers: [JwtAuthGuard, AdminRoleGuard],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    studentToken = tokenFor("STUDENT");
    adminToken = tokenFor("ADMIN");
    superAdminToken = tokenFor("SUPER_ADMIN");
  });

  afterAll(async () => {
    await app?.close();
  });

  const get = async (path: string, token?: string) =>
    app!.inject({
      method: "GET",
      url: path,
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });

  it("rejects a student JWT on /api/admin/auth/me with 403", async () => {
    const res = await get("/api/admin/auth/me", studentToken);
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body)).toEqual({
      error: "Forbidden: Admin access required",
    });
  });

  it("rejects a request without a token with 401", async () => {
    const res = await get("/api/admin/auth/me");
    expect(res.statusCode).toBe(401);
  });

  it("allows an ADMIN JWT on /api/admin/auth/me", async () => {
    const res = await get("/api/admin/auth/me", adminToken);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).role).toBe("ADMIN");
  });

  it("allows a SUPER_ADMIN JWT on /api/admin/auth/me", async () => {
    const res = await get("/api/admin/auth/me", superAdminToken);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).role).toBe("SUPER_ADMIN");
  });

  it("blocks a student JWT on /api/admin/ping with 403", async () => {
    const res = await get("/api/admin/ping", studentToken);
    expect(res.statusCode).toBe(403);
  });

  it("allows ADMIN and SUPER_ADMIN JWTs on /api/admin/ping", async () => {
    for (const token of [adminToken, superAdminToken]) {
      const res = await get("/api/admin/ping", token);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ ok: true });
    }
  });

  it("creates an ADMIN (never SUPER_ADMIN) via register with 201", async () => {
    const res = await app!.inject({
      method: "POST",
      url: "/api/admin/auth/register",
      headers: { "content-type": "application/json" },
      payload: {
        name: "New Admin",
        email: "new-admin@vidya.edu.in",
        password: "NewAdmin1!",
      },
    });
    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res.body).message).toContain("Registered as admin");
  });
});
