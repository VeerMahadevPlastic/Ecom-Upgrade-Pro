import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/categories", async (req, res) => {
  const categoryCounts = await db.select({
    slug: productsTable.categorySlug,
    name: productsTable.category,
    productCount: sql<number>`count(*)`,
  }).from(productsTable).groupBy(productsTable.categorySlug, productsTable.category);

  res.json({
    categories: categoryCounts.map(c => ({
      slug: c.slug,
      name: c.name,
      productCount: Number(c.productCount),
    })),
  });
});

export default router;
