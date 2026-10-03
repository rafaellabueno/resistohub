
/// <reference lib="dom" />

import { authProcedure, publicProcedure, router } from "../trpc"
import { db, dbSchema } from "../../db"
import { sql, eq, inArray, or, and, like, desc } from "drizzle-orm"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

type GeocodeResult = {
    lat: number
    lon: number
}

function buildSurveillanceFilters(input: {
    severity?: string[];
    status?: string[];
    country?: string;
    state?: string;
    city?: string;
    bacterium?: string;
    resistance?: string;
    eventType?: string[];
    environment?: string[];
    detectionType?: string[];
    certaintyDegree?: string[];
    searchTerm?: string;
    sampleOrigin?: string[];
}) {
    const conditions: any[] = [];

    if (input.severity?.length) {
        conditions.push(inArray(dbSchema.Surveillance.severity, input.severity as ("critical" | "watch" | "info")[]));
    }
    if (input.status?.length) {
        conditions.push(inArray(dbSchema.Surveillance.status, input.status as ("monitoring" | "resolved" | "closed")[]));
    }
    if (input.eventType?.length) {
        conditions.push(inArray(dbSchema.Surveillance.eventType, input.eventType as ("isolated" | "cluster" | "suspected_outbreak" | "confirmed_outbreak" | "regional_emergency")[]));
    }
    if (input.environment?.length) {
        conditions.push(inArray(dbSchema.Surveillance.environment, input.environment as ("community" | "hospital" | "icu" | "outpatient" | "other")[]));
    }
    if (input.sampleOrigin?.length) {
        conditions.push(inArray(dbSchema.Surveillance.sampleOrigin, input.sampleOrigin as ("blood_culture" | "urine" | "swab" | "respiratory_secretion" | "csf" | "other")[]));
    }
    if (input.detectionType?.length) {
        conditions.push(inArray(dbSchema.Surveillance.detectionType, input.detectionType as ("phenotypic" | "pcr" | "wgs" | "other")[]));
    }
    if (input.certaintyDegree?.length) {
        conditions.push(inArray(dbSchema.Surveillance.certaintyDegree, input.certaintyDegree as ("lab_confirmed" | "preliminary_data" | "clinical_report" | "sequencing_in_progress")[]));
    }

    if (input.bacterium) {
        conditions.push(like(dbSchema.Surveillance.bacterium, `%${input.bacterium}%`));
    }
    if (input.resistance) {
        conditions.push(like(dbSchema.Surveillance.resistance, `%${input.resistance}%`));
    }

    const sqlJSON_UNQUOTE = (col: any) => sql`JSON_UNQUOTE(${col})`;
    const JSON_EXTRACT = (col: any, path: string) => sql`JSON_EXTRACT(${col}, ${path})`;

    if (input.country) {
        conditions.push(sql`JSON_UNQUOTE(JSON_EXTRACT(${dbSchema.Surveillance.location}, '$.country')) LIKE ${`%${input.country}%`}`);
    }
    if (input.state) {
        conditions.push(sql`JSON_UNQUOTE(JSON_EXTRACT(${dbSchema.Surveillance.location}, '$.state')) LIKE ${`%${input.state}%`}`);
    }
    if (input.city) {
        conditions.push(sql`JSON_UNQUOTE(JSON_EXTRACT(${dbSchema.Surveillance.location}, '$.city')) LIKE ${`%${input.city}%`}`);
    }

    if (input.searchTerm) {
        conditions.push(
            or(
                like(dbSchema.Surveillance.title, `%${input.searchTerm}%`),
                like(dbSchema.Surveillance.description, `%${input.searchTerm}%`),
                like(dbSchema.Surveillance.bacterium, `%${input.searchTerm}%`)
            )
        );
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function geocodeLocation(
    city: string,
    state: string,
    country: string,
): Promise<GeocodeResult | null> {
    const query = `${city},${state},${country}`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000);

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
            {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
                signal: controller.signal
            },
        );
        clearTimeout(id);

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const data = await res.json() as any[];
        return data.length ? { lat: Number(data[0].lat), lon: Number(data[0].lon) } : null;
    } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
            console.error("Request timed out");
        }
        throw err;
    }
}

export const surveillanceRouter = router({
    deleteAlert: authProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const alert = await db
                .select()
                .from(dbSchema.Surveillance)
                .where(eq(dbSchema.Surveillance.id, input.id))
                .limit(1)
                .then((res) => res[0]);

            if (!alert) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });
            }

            if (alert.idUser !== ctx.user.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete this alert" });
            }

            await db.delete(dbSchema.Surveillance).where(eq(dbSchema.Surveillance.id, input.id));

            await db.insert(dbSchema.DeletionLog).values({
                entityType: "alert",
                entityId: input.id,
                deletedBy: ctx.user.id,
                payload: alert,
            });

            return { ok: true };
        }),

    getAlerts: publicProcedure
        .input(
            z.object({
                severity: z.array(z.string()).optional(),
                status: z.array(z.string()).optional(),
                country: z.string().optional(),
                state: z.string().optional(),
                city: z.string().optional(),
                bacterium: z.string().optional(),
                resistance: z.string().optional(),
                eventType: z.array(z.string()).optional(),
                environment: z.array(z.string()).optional(),
                detectionType: z.array(z.string()).optional(),
                certaintyDegree: z.array(z.string()).optional(),
                searchTerm: z.string().optional(),
                sampleOrigin: z.array(z.string()).optional(),
                limit: z.number().min(1).max(100).default(10),
                offset: z.number().min(0).default(0),
            }).default({})
        )
        .query(async ({ input }) => {
            const conditions: any[] = [];

            if (input.severity?.length) {
                conditions.push(inArray(dbSchema.Surveillance.severity, input.severity as ("critical" | "watch" | "info")[]));
            }
            if (input.status?.length) {
                conditions.push(inArray(dbSchema.Surveillance.status, input.status as ("monitoring" | "resolved" | "closed")[]));
            }
            if (input.eventType?.length) {
                conditions.push(inArray(dbSchema.Surveillance.eventType, input.eventType as ("isolated" | "cluster" | "suspected_outbreak" | "confirmed_outbreak" | "regional_emergency")[]));
            }
            if (input.environment?.length) {
                conditions.push(inArray(dbSchema.Surveillance.environment, input.environment as ("community" | "hospital" | "icu" | "outpatient" | "other")[]));
            }
            if (input.sampleOrigin?.length) {
                conditions.push(inArray(dbSchema.Surveillance.sampleOrigin, input.sampleOrigin as ("blood_culture" | "urine" | "swab" | "respiratory_secretion" | "csf" | "other")[]));
            }
            if (input.detectionType?.length) {
                conditions.push(inArray(dbSchema.Surveillance.detectionType, input.detectionType as ("phenotypic" | "pcr" | "wgs" | "other")[]));
            }
            if (input.certaintyDegree?.length) {
                conditions.push(inArray(dbSchema.Surveillance.certaintyDegree, input.certaintyDegree as ("lab_confirmed" | "preliminary_data" | "clinical_report" | "sequencing_in_progress")[]));
            }

            if (input.bacterium) {
                conditions.push(like(dbSchema.Surveillance.bacterium, `%${input.bacterium}%`));
            }
            if (input.resistance) {
                conditions.push(like(dbSchema.Surveillance.resistance, `%${input.resistance}%`));
            }

            if (input.country) {
                conditions.push(sql`JSON_UNQUOTE(JSON_EXTRACT(${dbSchema.Surveillance.location}, '$.country')) LIKE ${`%${input.country}%`}`);
            }
            if (input.state) {
                conditions.push(sql`JSON_UNQUOTE(JSON_EXTRACT(${dbSchema.Surveillance.location}, '$.state')) LIKE ${`%${input.state}%`}`);
            }
            if (input.city) {
                conditions.push(sql`JSON_UNQUOTE(JSON_EXTRACT(${dbSchema.Surveillance.location}, '$.city')) LIKE ${`%${input.city}%`}`);
            }

            if (input.searchTerm) {
                conditions.push(
                    or(
                        like(dbSchema.Surveillance.title, `%${input.searchTerm}%`),
                        like(dbSchema.Surveillance.description, `%${input.searchTerm}%`),
                        like(dbSchema.Surveillance.bacterium, `%${input.searchTerm}%`)
                    )
                );
            }

            const finalConditions = conditions.length > 0 ? and(...conditions) : undefined;

            const [countResult, results] = await Promise.all([
                db
                    .select({ count: sql<number>`count(*)` })
                    .from(dbSchema.Surveillance)
                    .where(finalConditions),
                db
                    .select({
                        id: dbSchema.Surveillance.id,
                        title: dbSchema.Surveillance.title,
                        description: dbSchema.Surveillance.description,
                        severity: dbSchema.Surveillance.severity,
                        bacterium: dbSchema.Surveillance.bacterium,
                        resistance: dbSchema.Surveillance.resistance,
                        location: dbSchema.Surveillance.location,
                        facility: dbSchema.Surveillance.facility,
                        reportedBy: dbSchema.Surveillance.reportedBy,
                        isolatesCount: dbSchema.Surveillance.isolatesCount,
                        status: dbSchema.Surveillance.status,
                        antibiogram: dbSchema.Surveillance.antibiogram,
                        eventType: dbSchema.Surveillance.eventType,
                        environment: dbSchema.Surveillance.environment,
                        sampleOrigin: dbSchema.Surveillance.sampleOrigin,
                        detectionDate: dbSchema.Surveillance.detectionDate,
                        createdAt: dbSchema.Surveillance.createdAt,
                        idUser: dbSchema.Surveillance.idUser,
                        userName: dbSchema.User.name,
                        userLastName: dbSchema.User.lastName,
                    })
                    .from(dbSchema.Surveillance)
                    .leftJoin(dbSchema.User, eq(dbSchema.Surveillance.idUser, dbSchema.User.id))
                    .where(finalConditions)
                    .limit(input.limit)
                    .offset(input.offset)
                    .orderBy(desc(dbSchema.Surveillance.createdAt)),
            ]);

            const totalCount = Number(countResult[0]?.count) || 0;

            return {
                ok: true,
                totalCount,
                alerts: results.map((alert) => ({
                    ...alert,
                    createdBy: alert.userName ? `${alert.userName} ${alert.userLastName || ""}`.trim() : "Unknown",
                })),
            };
        }),
    getSurveillanceAnalytics: publicProcedure
        .input(
            z.object({
                severity: z.array(z.string()).optional(),
                status: z.array(z.string()).optional(),
                country: z.string().optional(),
                state: z.string().optional(),
                city: z.string().optional(),
                bacterium: z.string().optional(),
                resistance: z.string().optional(),
                eventType: z.array(z.string()).optional(),
                environment: z.array(z.string()).optional(),
                detectionType: z.array(z.string()).optional(),
                certaintyDegree: z.array(z.string()).optional(),
                searchTerm: z.string().optional(),
                sampleOrigin: z.array(z.string()).optional(),
            }).default({})
        )
        .query(async ({ input }) => {
            const finalConditions = buildSurveillanceFilters(input);

            const severityDistribution = await db
                .select({
                    severity: dbSchema.Surveillance.severity,
                    total: sql<number>`count(*)`,
                })
                .from(dbSchema.Surveillance)
                .where(finalConditions)
                .groupBy(dbSchema.Surveillance.severity);

            const topBacteria = await db
                .select({
                    bacterium: dbSchema.Surveillance.bacterium,
                    total: sql<number>`count(*)`,
                })
                .from(dbSchema.Surveillance)
                .where(finalConditions)
                .groupBy(dbSchema.Surveillance.bacterium)
                .orderBy(sql`count(*) desc`)
                .limit(10);

            const topResistance = await db
                .select({
                    resistance: dbSchema.Surveillance.resistance,
                    total: sql<number>`count(*)`,
                })
                .from(dbSchema.Surveillance)
                .where(finalConditions)
                .groupBy(dbSchema.Surveillance.resistance)
                .orderBy(sql`count(*) desc`)
                .limit(10);

            const environmentDistribution = await db
                .select({
                    environment: dbSchema.Surveillance.environment,
                    total: sql<number>`count(*)`,
                })
                .from(dbSchema.Surveillance)
                .where(finalConditions)
                .groupBy(dbSchema.Surveillance.environment);

            const monthlyTrend = await db
                .select({
                    month: sql<string>`DATE_FORMAT(${dbSchema.Surveillance.detectionDate}, '%Y-%m')`,
                    total: sql<number>`count(*)`,
                })
                .from(dbSchema.Surveillance)
                .where(finalConditions)
                .groupBy(sql`DATE_FORMAT(${dbSchema.Surveillance.detectionDate}, '%Y-%m')`)
                .orderBy(sql`DATE_FORMAT(${dbSchema.Surveillance.detectionDate}, '%Y-%m') asc`);



            const riskScoreQuery = await db.execute(sql`
                SELECT AVG(
                    (
                        CASE ${dbSchema.Surveillance.eventType}
                            WHEN 'confirmed_outbreak' THEN 5
                            WHEN 'suspected_outbreak' THEN 3
                            ELSE 1
                        END
                    )
                    +
                    (
                        CASE ${dbSchema.Surveillance.environment}
                            WHEN 'icu' THEN 3
                            WHEN 'hospital' THEN 2
                            ELSE 1
                        END
                    )
                    +
                    IFNULL(${dbSchema.Surveillance.isolatesCount}, 0)
                ) as avgRisk
                FROM ${dbSchema.Surveillance}
                ${finalConditions ? sql`WHERE ${finalConditions}` : sql``}
            `);

            const totalAlertsCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(dbSchema.Surveillance)
                .where(finalConditions);
            const totalAlerts = Number(totalAlertsCount[0]?.count) || 0;

            const criticalAlertsCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(dbSchema.Surveillance)
                .where(and(finalConditions, eq(dbSchema.Surveillance.severity, 'critical')));
            const criticalAlerts = Number(criticalAlertsCount[0]?.count) || 0;
            const criticalPercentage = totalAlerts > 0 ? (criticalAlerts / totalAlerts) * 100 : 0;

            const confirmedOutbreaksCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(dbSchema.Surveillance)
                .where(and(finalConditions, eq(dbSchema.Surveillance.eventType, 'confirmed_outbreak')));
            const confirmedOutbreaks = Number(confirmedOutbreaksCount[0]?.count) || 0;

            let emergencyLevel: "low" | "moderate" | "high" = "low";
            const avgRisk: number = Number((riskScoreQuery as any)[0]?.avgRisk) ?? 0;
            if (confirmedOutbreaks > 2 || avgRisk > 3) {
                emergencyLevel = "high";
            } else if (confirmedOutbreaks > 0 || avgRisk > 1.5) {
                emergencyLevel = "moderate";
            }

            return {
                ok: true,
                metrics: {
                    totalAlerts,
                    criticalPercentage,
                    avgRiskScore: avgRisk,
                    confirmedOutbreaks,
                    severityDistribution,
                    topBacteria,
                    topResistance,
                    environmentDistribution,
                    monthlyTrend,
                    emergencyLevel,
                },
            };
        }),
    saveAlert: authProcedure
        .input(
            z.object({
                title: z.string(),
                description: z.string(),
                severity: z.enum(["critical", "watch", "info"]),
                bacterium: z.string(),
                resistance: z.string(),
                country: z.string(),
                state: z.string(),
                city: z.string(),
                facility: z.string(),
                reportedBy: z.string(),
                isolatesCount: z.number(),
                antibiotics: z.array(z.string()),
                status: z.enum(["monitoring", "resolved", "closed"]),
                antibiogram: z.array(z.object({
                    name: z.string(),
                    result: z.enum(["S", "I", "R"]),
                    mic: z.number(),
                    method: z.enum(["BMD", "Disco Difusão", "Etest", "Outro"]),
                    standard: z.enum(["CLSI", "EUCAST", "Outro"]),
                    guidelineYear: z.number(),
                })),
                eventType: z.enum(["isolated", "cluster", "suspected_outbreak", "confirmed_outbreak", "regional_emergency"]),
                environment: z.enum(["community", "hospital", "icu", "outpatient", "other"]),
                sampleOrigin: z.enum(["blood_culture", "urine", "swab", "respiratory_secretion", "csf", "other"]),
                detectionDate: z.string(),
                eventStartDate: z.string(),
                eventEndDate: z.string(),
                detectionType: z.enum(["phenotypic", "pcr", "wgs", "other"]),
                certaintyDegree: z.enum(["lab_confirmed", "preliminary_data", "clinical_report", "sequencing_in_progress"]),
                useSuggestedSeverity: z.boolean(),
                manualSeverity: z.enum(["info", "watch", "critical"]),
                institution: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const geo = await geocodeLocation(
                input.city,
                input.state,
                input.country,
            )

            if (!geo) {
                throw new Error("Não foi possível determinar latitude/longitude")
            }

            const lat = geo.lat
            const lgn = geo.lon

            const [{ insertId }] = await db.insert(dbSchema.Surveillance).values({
                idUser: ctx.user.id,
                title: input.title,
                description: input.description,
                bacterium: input.bacterium,
                resistance: input.resistance,
                location: {
                    lat,
                    lng: lgn,
                    country: input.country,
                    state: input.state,
                    city: input.city,
                },
                facility: input.institution,
                reportedBy: input.reportedBy,
                isolatesCount: input.isolatesCount,
                antibiotics: input.antibiotics,
                status: input.status,
                date: new Date(),
                severity: input.severity,
                antibiogram: input.antibiogram,
                eventType: input.eventType,
                environment: input.environment,
                sampleOrigin: input.sampleOrigin,
                detectionDate: new Date(input.detectionDate),
                eventStartDate: new Date(input.eventStartDate),
                eventEndDate: null,
                detectionType: input.detectionType,
                certaintyDegree: input.certaintyDegree,
                useSuggestedSeverity: input.useSuggestedSeverity === true ? 'yes' : 'no',
                manualSeverity: input.manualSeverity,
                institution: input.institution,
            })

            return {
                ok: true,
            }
        }),
})