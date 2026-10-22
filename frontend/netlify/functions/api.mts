import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { and, asc, count, desc, eq, gt, gte, ilike, lte, type SQL } from "drizzle-orm";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "../../db/index.js";
import { properties, sessions, users } from "../../db/schema.js";

const COOKIE = "access_token";
const SESSION_DAYS = 7;
const uploads = () => getStore("uploads");

// ---------- helpers ----------

const json = (data: unknown, status = 200) => Response.json(data, { status });
const fail = (detail: string, status: number) => json({ detail }, status);

const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
};

const verifyPassword = (password: string, stored: string) => {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

const publicUser = (u: typeof users.$inferSelect) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

// Creates the first admin account on first login, from ADMIN_EMAIL / ADMIN_PASSWORD
// environment variables (falling back to the original site's admin credentials).
async function ensureAdmin() {
  const [{ n }] = await db.select({ n: count() }).from(users);
  if (n > 0) return;
  const email = (process.env.ADMIN_EMAIL || "admin@esforconotavel.pt").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@2026";
  await db.insert(users).values({ email, name: "Admin", passwordHash: hashPassword(password) }).onConflictDoNothing();
}

async function currentUser(req: Request, context: Context) {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const token = context.cookies.get(COOKIE) || bearer;
  if (!token) return null;
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));
  return row?.user ?? null;
}

const serialize = (p: typeof properties.$inferSelect) => ({
  id: String(p.id),
  reference: p.reference,
  title: p.title,
  description: p.description,
  operation: p.operation,
  property_type: p.propertyType,
  price: p.price,
  city: p.city,
  zone: p.zone,
  address: p.address,
  bedrooms: p.bedrooms,
  bathrooms: p.bathrooms,
  area: p.area,
  energy_certificate: p.energyCertificate,
  features: p.features,
  images: p.images,
  videos: p.videos,
  featured: p.featured,
  status: p.status,
  created_at: p.createdAt,
  updated_at: p.updatedAt,
});

const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);
const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// Maps the snake_case JSON body sent by the admin form onto table columns.
function toColumns(b: Record<string, unknown>) {
  return {
    title: String(b.title ?? "").trim(),
    description: String(b.description ?? ""),
    operation: b.operation === "rent" ? "rent" : "buy",
    propertyType: String(b.property_type || "apartment"),
    price: num(b.price),
    city: String(b.city ?? ""),
    zone: String(b.zone ?? ""),
    address: String(b.address ?? ""),
    bedrooms: Math.trunc(num(b.bedrooms)),
    bathrooms: Math.trunc(num(b.bathrooms)),
    area: num(b.area),
    energyCertificate: String(b.energy_certificate ?? ""),
    features: strList(b.features),
    images: strList(b.images),
    videos: strList(b.videos),
    featured: Boolean(b.featured),
    status: b.status === "active" ? "active" : "draft",
  };
}

const parseId = (s: string | undefined) => {
  const n = Number(s);
  return Number.isInteger(n) && n > 0 ? n : null;
};

// ---------- handler ----------

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const [resource, idPart, action] = parts;
  const method = req.method;

  try {
    // ----- auth -----
    if (resource === "auth") {
      if (idPart === "login" && method === "POST") {
        await ensureAdmin();
        const { email, password } = await req.json().catch(() => ({}));
        if (!email || !password) return fail("Email e palavra-passe obrigatórios", 400);
        const [user] = await db.select().from(users).where(eq(users.email, String(email).toLowerCase().trim()));
        if (!user || !verifyPassword(String(password), user.passwordHash)) {
          return fail("Email ou palavra-passe inválidos", 401);
        }
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
        await db.insert(sessions).values({ token, userId: user.id, expiresAt });
        context.cookies.set({
          name: COOKIE, value: token, path: "/", httpOnly: true, secure: true, sameSite: "Lax", expires: expiresAt,
        });
        return json({ user: publicUser(user), token });
      }
      if (idPart === "me" && method === "GET") {
        const user = await currentUser(req, context);
        return user ? json(publicUser(user)) : fail("Não autenticado", 401);
      }
      if (idPart === "logout" && method === "POST") {
        const token = context.cookies.get(COOKIE);
        if (token) await db.delete(sessions).where(eq(sessions.token, token));
        context.cookies.delete({ name: COOKIE, path: "/" });
        return json({ ok: true });
      }
      return fail("Not found", 404);
    }

    // ----- uploaded files (public) -----
    if (resource === "files" && idPart && method === "GET") {
      const entry = await uploads().getWithMetadata(idPart, { type: "stream" });
      if (!entry) return new Response("Not found", { status: 404 });
      return new Response(entry.data, {
        headers: {
          "Content-Type": String(entry.metadata?.contentType || "application/octet-stream"),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // ----- public property reads -----
    if (resource === "properties" && method === "GET") {
      if (idPart) {
        const id = parseId(idPart);
        if (!id) return fail("Not found", 404);
        const [p] = await db.select().from(properties).where(eq(properties.id, id));
        if (!p) return fail("Not found", 404);
        if (p.status !== "active" && !(await currentUser(req, context))) return fail("Not found", 404);
        return json(serialize(p));
      }

      const q = url.searchParams;
      const where: SQL[] = [eq(properties.status, "active")];
      if (q.get("operation")) where.push(eq(properties.operation, q.get("operation")!));
      if (q.get("property_type")) where.push(eq(properties.propertyType, q.get("property_type")!));
      if (q.get("city")) where.push(ilike(properties.city, `%${q.get("city")}%`));
      if (q.get("bedrooms")) where.push(gte(properties.bedrooms, num(q.get("bedrooms"))));
      if (q.get("min_price")) where.push(gte(properties.price, num(q.get("min_price"))));
      if (q.get("max_price")) where.push(lte(properties.price, num(q.get("max_price"))));
      if (q.get("featured") === "true") where.push(eq(properties.featured, true));

      const sort = q.get("sort");
      const order =
        sort === "price_asc" ? asc(properties.price) : sort === "price_desc" ? desc(properties.price) : desc(properties.createdAt);
      const limit = Math.min(Math.max(num(q.get("limit")) || 24, 1), 100);
      const skip = Math.max(num(q.get("skip")), 0);

      const filter = and(...where);
      const [rows, [{ n }]] = await Promise.all([
        db.select().from(properties).where(filter).orderBy(order, desc(properties.id)).limit(limit).offset(skip),
        db.select({ n: count() }).from(properties).where(filter),
      ]);
      return json({ items: rows.map(serialize), total: n });
    }

    // ----- everything below requires login -----
    const user = await currentUser(req, context);
    if (!user) return fail("Não autenticado", 401);

    if (resource === "stats" && method === "GET") {
      const rows = await db.select({ operation: properties.operation, n: count() }).from(properties).groupBy(properties.operation);
      const by = Object.fromEntries(rows.map((r) => [r.operation, r.n]));
      return json({ total: (by.buy || 0) + (by.rent || 0), buy: by.buy || 0, rent: by.rent || 0 });
    }

    if (resource === "admin" && idPart === "properties" && method === "GET") {
      const rows = await db.select().from(properties).orderBy(desc(properties.createdAt), desc(properties.id));
      return json({ items: rows.map(serialize) });
    }

    if (resource === "upload" && method === "POST") {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return fail("Ficheiro em falta", 400);
      const ext = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const key = `${randomUUID()}${ext ? `.${ext}` : ""}`;
      await uploads().set(key, await file.arrayBuffer(), { metadata: { contentType: file.type, name: file.name } });
      return json({ url: `${url.origin}/api/files/${key}` });
    }

    if (resource === "properties") {
      if (!idPart && method === "POST") {
        const body = toColumns(await req.json());
        if (!body.title) return fail("Título obrigatório", 400);
        const [created] = await db.insert(properties).values(body).returning();
        const [p] = await db
          .update(properties)
          .set({ reference: `EN-${String(created.id).padStart(4, "0")}` })
          .where(eq(properties.id, created.id))
          .returning();
        return json(serialize(p), 201);
      }

      const id = parseId(idPart);
      if (!id) return fail("Not found", 404);

      let changes: Partial<typeof properties.$inferInsert> | null = null;
      if (!action && method === "PUT") {
        changes = toColumns(await req.json());
        if (!changes.title) return fail("Título obrigatório", 400);
      } else if (action === "featured" && method === "PATCH") {
        const { featured } = await req.json();
        changes = { featured: Boolean(featured) };
      } else if (action === "status" && method === "PATCH") {
        const { status } = await req.json();
        changes = { status: status === "active" ? "active" : "draft" };
      } else if (!action && method === "DELETE") {
        const deleted = await db.delete(properties).where(eq(properties.id, id)).returning({ id: properties.id });
        return deleted.length ? json({ ok: true }) : fail("Not found", 404);
      }

      if (changes) {
        const [p] = await db
          .update(properties)
          .set({ ...changes, updatedAt: new Date() })
          .where(eq(properties.id, id))
          .returning();
        return p ? json(serialize(p)) : fail("Not found", 404);
      }
    }

    return fail("Not found", 404);
  } catch (err) {
    console.error(err);
    return fail("Erro interno", 500);
  }
};

export const config: Config = {
  path: "/api/*",
};
