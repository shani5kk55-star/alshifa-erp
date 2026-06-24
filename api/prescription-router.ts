import { z } from "zod";
import { createRouter, authedQuery, labTechQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { prescriptions } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const prescriptionRouter = createRouter({
  list: authedQuery
    .input(z.object({ patientId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.patientId) {
        return db.query.prescriptions.findMany({
          where: eq(prescriptions.patientId, input.patientId),
          with: { patient: true },
          orderBy: [desc(prescriptions.createdAt)],
        });
      }
      return db.query.prescriptions.findMany({
        with: { patient: true },
        orderBy: [desc(prescriptions.createdAt)],
        limit: 100,
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.prescriptions.findFirst({
        where: eq(prescriptions.id, input.id),
        with: { patient: true },
      });
    }),

  create: labTechQuery
    .input(
      z.object({
        patientId: z.number(),
        appointmentId: z.number().optional(),
        odSph: z.string().optional(),
        odCyl: z.string().optional(),
        odAxis: z.number().optional(),
        odAdd: z.string().optional(),
        osSph: z.string().optional(),
        osCyl: z.string().optional(),
        osAxis: z.number().optional(),
        osAdd: z.string().optional(),
        pd: z.string().optional(),
        lensType: z.enum(["single_vision", "bifocal", "progressive"]).optional(),
        remarks: z.string().optional(),
        followUpDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [rx] = await db.insert(prescriptions).values({
        patientId: input.patientId,
        appointmentId: input.appointmentId || null,
        prescribedBy: ctx.user.id,
        odSph: input.odSph || null,
        odCyl: input.odCyl || null,
        odAxis: input.odAxis || null,
        odAdd: input.odAdd || null,
        osSph: input.osSph || null,
        osCyl: input.osCyl || null,
        osAxis: input.osAxis || null,
        osAdd: input.osAdd || null,
        pd: input.pd || null,
        lensType: input.lensType || null,
        remarks: input.remarks || null,
        followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
      });
      return rx;
    }),
});
