import { Session } from "../fake/session.model";

export const SESSION_STATUSES = [
  'Active',
  'Completed',
  'Failed',
  'Cancelled',
] as const satisfies readonly Session['status'][];

export const SORTABLE_FIELDS: (keyof Session)[] = [
  'chargerName',
  'chargerLocation',
  'status',
  'startedAt',
  'durationMinutes',
  'energyKwh',
  'costEur',
  'user',
];

export interface NumberRange {
  min: number | null;
  max: number | null;
}

export interface SessionFilterState {
  charger: string | null;
  location: string;
  status: Session['status'] | null;
  startedFrom: Date | null;
  startedTo: Date | null;
  duration: NumberRange;
  energy: NumberRange;
  cost: NumberRange;
  user: string;
  sessionId: string;
}

export const EMPTY_FILTER_STATE: SessionFilterState = {
  charger: null,
  location: '',
  status: null,
  startedFrom: null,
  startedTo: null,
  duration: { min: null, max: null },
  energy: { min: null, max: null },
  cost: { min: null, max: null },
  user: '',
  sessionId: '',
};
