import { differenceInCalendarDays, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';

export interface CalEvent {
    id: string;
    title: string;
    description: string | null;
    type: string;
    start_date: string;
    end_date: string | null;
    all_day: boolean;
    start_time: string | null;
    end_time: string | null;
    color: string | null;
}

/** Pastille pleine (barres du calendrier). */
export const TYPE_SOLID: Record<string, string> = {
    holiday: 'bg-emerald-500',
    exam: 'bg-red-500',
    meeting: 'bg-violet-500',
    event: 'bg-blue-500',
    other: 'bg-gray-400',
};

/** Variante douce (agenda, badges). */
export const TYPE_CHIP: Record<string, string> = {
    holiday: 'bg-emerald-100 text-emerald-700',
    exam: 'bg-red-100 text-red-700',
    meeting: 'bg-violet-100 text-violet-700',
    event: 'bg-blue-100 text-blue-700',
    other: 'bg-gray-100 text-gray-600',
};

export const solidClass = (type: string) => TYPE_SOLID[type] ?? TYPE_SOLID.other;
export const chipClass = (type: string) => TYPE_CHIP[type] ?? TYPE_CHIP.other;

/* ── Dates (locales, sans décalage UTC) ─────────────────────────────── */

/** « 2026-01-05 » → Date locale à minuit. */
export const toDate = (s: string): Date => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
};
export const toISO = (d: Date): string => format(d, 'yyyy-MM-dd');

export const eventStart = (e: CalEvent) => toDate(e.start_date);
export const eventEnd = (e: CalEvent) => toDate(e.end_date || e.start_date);
/** Durée en jours (0 = événement d'un seul jour). */
export const eventSpanDays = (e: CalEvent) => differenceInCalendarDays(eventEnd(e), eventStart(e));

export const overlapsRange = (e: CalEvent, from: Date, to: Date) =>
    eventEnd(e) >= from && eventStart(e) <= to;

/** Jours affichés dans la grille du mois (semaines complètes, lundi → dimanche). */
export const monthGridDays = (cursor: Date): Date[] => {
    const from = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const to = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const days: Date[] = [];
    for (let d = from; d <= to; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) days.push(d);
    return days;
};

/* ── Minutes / heures ───────────────────────────────────────────────── */

export const toMinutes = (hhmm: string | null): number | null => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + (m || 0);
};
export const fromMinutes = (min: number): string => {
    const m = Math.max(0, Math.min(24 * 60 - 1, Math.round(min)));
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/* ── Placement des barres multi-jours (une rangée = une semaine) ─────── */

export interface Segment {
    event: CalEvent;
    /** Colonne de départ 1..7 */
    col: number;
    /** Nombre de colonnes couvertes */
    span: number;
    /** Ligne (piste) attribuée, 0-indexée */
    lane: number;
    /** L'événement commence-t-il / finit-il réellement dans cette semaine ? */
    startsHere: boolean;
    endsHere: boolean;
}

/**
 * Répartit les événements d'une semaine en « pistes » (lanes) sans chevauchement,
 * pour rendre des barres continues sur plusieurs jours.
 */
export function packWeek(events: CalEvent[], weekDays: Date[]): Segment[] {
    const from = weekDays[0];
    const to = weekDays[weekDays.length - 1];

    const segs = events
        .filter((e) => overlapsRange(e, from, to))
        .map((e) => {
            const s = eventStart(e) < from ? from : eventStart(e);
            const en = eventEnd(e) > to ? to : eventEnd(e);
            return {
                event: e,
                col: differenceInCalendarDays(s, from) + 1,
                span: differenceInCalendarDays(en, s) + 1,
                lane: 0,
                startsHere: differenceInCalendarDays(eventStart(e), from) >= 0,
                endsHere: differenceInCalendarDays(eventEnd(e), to) <= 0,
            } satisfies Segment;
        })
        // Les plus longs d'abord (barres du haut), puis par date de début.
        .sort((a, b) => a.col - b.col || b.span - a.span);

    const lanes: boolean[][] = [];
    for (const seg of segs) {
        let lane = 0;
        for (;;) {
            lanes[lane] ??= new Array(weekDays.length).fill(false);
            const free = lanes[lane].slice(seg.col - 1, seg.col - 1 + seg.span).every((x) => !x);
            if (free) {
                for (let i = seg.col - 1; i < seg.col - 1 + seg.span; i++) lanes[lane][i] = true;
                seg.lane = lane;
                break;
            }
            lane++;
        }
    }

    return segs;
}
