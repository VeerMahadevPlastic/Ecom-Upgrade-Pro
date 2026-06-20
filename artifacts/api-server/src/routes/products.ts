import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { ilike, or, eq, sql } from "drizzle-orm";

const router = Router();

router.get("/products", async (req, res) => {
  const { search, category, limit = "100", offset = "0" } = req.query as Record<string, string>;

  const conditions = [];

  if (search && search.trim()) {
    conditions.push(
      or(
        ilike(productsTable.name, `%${search.trim()}%`),
        ilike(productsTable.sku, `%${search.trim()}%`),
        ilike(productsTable.category, `%${search.trim()}%`)
      )
    );
  }

  if (category && category !== "all") {
    conditions.push(eq(productsTable.categorySlug, category));
  }

  const where = conditions.length > 0
    ? conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)
    : undefined;

  const [products, countResult] = await Promise.all([
    db.select().from(productsTable)
      .where(where as any)
      .limit(parseInt(limit))
      .offset(parseInt(offset)),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where as any),
  ]);

  res.json({
    products: products.map(p => ({
      ...p,
      boxRate: parseFloat(p.boxRate),
      pieceRate: parseFloat(p.pieceRate),
    })),
    total: Number(countResult[0]?.count ?? 0),
  });
});

router.get("/products/search-suggestions", async (req, res) => {
  const { q } = req.query as Record<string, string>;

  if (!q || q.trim().length < 2) {
    return res.json({ suggestions: [] });
  }

  const products = await db.select({
    id: productsTable.id,
    name: productsTable.name,
    category: productsTable.category,
    pieceRate: productsTable.pieceRate,
  }).from(productsTable)
    .where(
      or(
        ilike(productsTable.name, `%${q.trim()}%`),
        ilike(productsTable.sku, `%${q.trim()}%`)
      )
    )
    .limit(8);

  res.json({
    suggestions: products.map(p => ({
      ...p,
      pieceRate: parseFloat(p.pieceRate),
    })),
  });
});

router.get("/products/stats", async (req, res) => {
  const [totalResult, categoryCounts] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(productsTable),
    db.select({
      category: productsTable.category,
      count: sql<number>`count(*)`,
    }).from(productsTable).groupBy(productsTable.category),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);
  const uniqueCategories = categoryCounts.length;

  res.json({
    totalProducts: total,
    totalCategories: uniqueCategories,
    categoryCounts: categoryCounts.map(c => ({
      category: c.category,
      count: Number(c.count),
    })),
  });
});

router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  const products = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);

  if (!products[0]) {
    return res.status(404).json({ error: "Product not found" });
  }

  const p = products[0];
  res.json({
    ...p,
    boxRate: parseFloat(p.boxRate),
    pieceRate: parseFloat(p.pieceRate),
  });
});

export default router;
