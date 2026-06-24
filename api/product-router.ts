import { z } from "zod";
import { createRouter, authedQuery, adminQuery, labTechQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, stockAdjustments } from "@db/schema";
import { eq, like, and, or, sql, desc, asc } from "drizzle-orm";

export const productRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        search: z.string().optional(),
        categoryId: z.number().optional(),
        brandId: z.number().optional(),
        stockStatus: z.enum(["all", "in_stock", "low_stock", "out_of_stock"]).optional(),
        page: z.number().default(1),
        limit: z.number().default(25),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 25;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (input?.search) {
        conditions.push(
          or(
            like(products.name, `%${input.search}%`),
            like(products.sku, `%${input.search}%`),
            like(products.barcode, `%${input.search}%`)
          )
        );
      }
      if (input?.categoryId) {
        conditions.push(eq(products.categoryId, input.categoryId));
      }
      if (input?.brandId) {
        conditions.push(eq(products.brandId, input.brandId));
      }
      if (input?.stockStatus === "low_stock") {
        conditions.push(sql`${products.quantity} <= ${products.reorderLevel} and ${products.quantity} > 0`);
      }
      if (input?.stockStatus === "out_of_stock") {
        conditions.push(eq(products.quantity, 0));
      }
      if (input?.stockStatus === "in_stock") {
        conditions.push(sql`${products.quantity} > ${products.reorderLevel}`);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.query.products.findMany({
        where: whereClause,
        with: { category: true, brand: true, supplier: true },
        limit,
        offset,
        orderBy: [desc(products.createdAt)],
      });

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause);
      const total = countResult[0]?.count || 0;

      return { items, total, page, limit };
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: { category: true, brand: true, supplier: true },
      });
    }),

  create: adminQuery
    .input(
      z.object({
        sku: z.string().min(1),
        name: z.string().min(1),
        categoryId: z.number(),
        brandId: z.number().optional(),
        supplierId: z.number().optional(),
        color: z.string().optional(),
        size: z.string().optional(),
        frameType: z.enum(["full_rim", "half_rim", "rimless"]).optional(),
        material: z.string().optional(),
        sphMin: z.number().optional(),
        sphMax: z.number().optional(),
        cylMin: z.number().optional(),
        cylMax: z.number().optional(),
        axisValues: z.string().optional(),
        addMin: z.number().optional(),
        addMax: z.number().optional(),
        lensType: z.enum(["single_vision", "bifocal", "progressive"]).optional(),
        quantity: z.number().default(0),
        reorderLevel: z.number().default(10),
        reorderQty: z.number().default(50),
        location: z.enum(["shop", "godown"]).default("shop"),
        purchasePrice: z.number().default(0),
        sellingPrice: z.number().default(0),
        barcode: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const pp = input.purchasePrice;
      const sp = input.sellingPrice;
      const margin = sp > 0 && pp > 0
        ? parseFloat(((sp - pp) / sp * 100).toFixed(2))
        : null;

      const insertData = {
        sku: input.sku,
        name: input.name,
        categoryId: input.categoryId,
        brandId: input.brandId || null,
        supplierId: input.supplierId || null,
        color: input.color || null,
        size: input.size || null,
        frameType: input.frameType || null,
        material: input.material || null,
        sphMin: input.sphMin !== undefined ? input.sphMin.toString() : null,
        sphMax: input.sphMax !== undefined ? input.sphMax.toString() : null,
        cylMin: input.cylMin !== undefined ? input.cylMin.toString() : null,
        cylMax: input.cylMax !== undefined ? input.cylMax.toString() : null,
        axisValues: input.axisValues || null,
        addMin: input.addMin !== undefined ? input.addMin.toString() : null,
        addMax: input.addMax !== undefined ? input.addMax.toString() : null,
        lensType: input.lensType || null,
        quantity: input.quantity,
        reorderLevel: input.reorderLevel,
        reorderQty: input.reorderQty,
        location: input.location,
        purchasePrice: pp.toFixed(2),
        sellingPrice: sp.toFixed(2),
        profitMargin: margin !== null ? margin.toFixed(2) : null,
        barcode: input.barcode || null,
        imageUrl: input.imageUrl || null,
      };

      const [product] = await db.insert(products).values(insertData);

      if (input.quantity > 0) {
        await db.insert(stockAdjustments).values({
          productId: product.insertId,
          userId: ctx.user.id,
          type: "add",
          quantity: input.quantity,
          reason: "initial",
          notes: "Initial stock",
        });
      }

      return product;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        categoryId: z.number().optional(),
        brandId: z.number().optional(),
        supplierId: z.number().optional(),
        color: z.string().optional(),
        size: z.string().optional(),
        frameType: z.enum(["full_rim", "half_rim", "rimless"]).optional(),
        material: z.string().optional(),
        sphMin: z.number().optional(),
        sphMax: z.number().optional(),
        cylMin: z.number().optional(),
        cylMax: z.number().optional(),
        axisValues: z.string().optional(),
        addMin: z.number().optional(),
        addMax: z.number().optional(),
        lensType: z.enum(["single_vision", "bifocal", "progressive"]).optional(),
        reorderLevel: z.number().optional(),
        reorderQty: z.number().optional(),
        location: z.enum(["shop", "godown"]).optional(),
        purchasePrice: z.number().optional(),
        sellingPrice: z.number().optional(),
        barcode: z.string().optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, sphMin, sphMax, cylMin, cylMax, addMin, addMax, purchasePrice, sellingPrice, ...rest } = input;

      const currentProduct = await db.query.products.findFirst({
        where: eq(products.id, id),
      });

      if (!currentProduct) {
        throw new Error("Product not found");
      }

      const pp = purchasePrice !== undefined ? purchasePrice : Number(currentProduct.purchasePrice);
      const sp = sellingPrice !== undefined ? sellingPrice : Number(currentProduct.sellingPrice);
      const margin = sp > 0 && pp > 0
        ? parseFloat(((sp - pp) / sp * 100).toFixed(2))
        : null;

      const updateData: Record<string, unknown> = { ...rest };

      if (sphMin !== undefined) updateData.sphMin = sphMin.toString();
      if (sphMax !== undefined) updateData.sphMax = sphMax.toString();
      if (cylMin !== undefined) updateData.cylMin = cylMin.toString();
      if (cylMax !== undefined) updateData.cylMax = cylMax.toString();
      if (addMin !== undefined) updateData.addMin = addMin.toString();
      if (addMax !== undefined) updateData.addMax = addMax.toString();
      if (purchasePrice !== undefined) updateData.purchasePrice = purchasePrice.toFixed(2);
      if (sellingPrice !== undefined) updateData.sellingPrice = sellingPrice.toFixed(2);
      updateData.profitMargin = margin !== null ? margin.toFixed(2) : null;

      await db.update(products).set(updateData).where(eq(products.id, id));

      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  getLowStock: authedQuery.query(async () => {
    const db = getDb();
    return db.query.products.findMany({
      where: sql`${products.quantity} <= ${products.reorderLevel}`,
      with: { category: true, supplier: true },
      orderBy: [asc(products.quantity)],
    });
  }),

  adjustStock: labTechQuery
    .input(
      z.object({
        productId: z.number(),
        type: z.enum(["add", "subtract"]),
        quantity: z.number().min(1),
        reason: z.enum(["damaged", "sample", "return", "correction", "purchase", "initial"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const product = await db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const newQuantity = input.type === "add"
        ? product.quantity + input.quantity
        : product.quantity - input.quantity;

      if (newQuantity < 0) {
        throw new Error("Insufficient stock");
      }

      await db.update(products)
        .set({ quantity: newQuantity })
        .where(eq(products.id, input.productId));

      await db.insert(stockAdjustments).values({
        productId: input.productId,
        userId: ctx.user.id,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason,
        notes: input.notes,
      });

      return { success: true, newQuantity };
    }),
});
