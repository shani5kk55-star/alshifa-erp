import { customAuthRouter } from "./custom-auth-router";
import { categoryRouter } from "./category-router";
import { brandRouter } from "./brand-router";
import { productRouter } from "./product-router";
import { patientRouter } from "./patient-router";
import { prescriptionRouter } from "./prescription-router";
import { appointmentRouter } from "./appointment-router";
import { saleRouter } from "./sale-router";
import { supplierRouter } from "./supplier-router";
import { reportRouter } from "./report-router";
import { internalUseRouter } from "./internal-use-router";
import { dashboardRouter } from "./dashboard-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: customAuthRouter,
  category: categoryRouter,
  brand: brandRouter,
  product: productRouter,
  patient: patientRouter,
  prescription: prescriptionRouter,
  appointment: appointmentRouter,
  sale: saleRouter,
  supplier: supplierRouter,
  report: reportRouter,
  internalUse: internalUseRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
