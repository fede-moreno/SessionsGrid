import { SessionSort } from '../fake/session.model';
import {
  NumberRange,
  SESSION_STATUSES,
  SORTABLE_FIELDS,
  SessionFilterState,
} from './session-filter.model';

export const DEFAULT_PAGE_SIZE = 10;

export interface UrlState {
  filters: SessionFilterState;
  sort: SessionSort[];
  skip: number;
  pageSize: number;
}

const FILTER_PARAMS: Record<keyof SessionFilterState, string> = {
  charger: 'charger',
  location: 'location',
  status: 'status',
  startedFrom: 'from',
  startedTo: 'to',
  duration: 'dur',
  energy: 'kwh',
  cost: 'cost',
  user: 'user',
  sessionId: 'id',
};

export function encodeState({
  filters,
  sort,
  skip,
  pageSize,
}: UrlState): Record<string, string> {
  const queryParams: Record<string, string> = {};
  const put = (name: string, value: string | null) => {
    if (value) queryParams[name] = value;
  };

  put(FILTER_PARAMS.charger, filters.charger);
  put(FILTER_PARAMS.location, filters.location.trim());
  put(FILTER_PARAMS.status, filters.status);
  put(FILTER_PARAMS.startedFrom, isoDate(filters.startedFrom));
  put(FILTER_PARAMS.startedTo, isoDate(filters.startedTo));
  putRange(queryParams, FILTER_PARAMS.duration, filters.duration);
  putRange(queryParams, FILTER_PARAMS.energy, filters.energy);
  putRange(queryParams, FILTER_PARAMS.cost, filters.cost);
  put(FILTER_PARAMS.user, filters.user.trim());
  put(FILTER_PARAMS.sessionId, filters.sessionId.trim());

  const [first] = sort;
  put('sort', first ? `${first.field}:${first.direction}` : null);
  put('skip', skip > 0 ? String(skip) : null);
  put('size', pageSize === DEFAULT_PAGE_SIZE ? null : String(pageSize));

  return queryParams;
}

export function decodeState(queryParams: Record<string, unknown>): UrlState {
  const read = (name: string): string | null => {
    const raw = queryParams[name];
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
  };
  const readRange = (name: string): NumberRange => ({
    min: readNumber(read(`${name}Min`)),
    max: readNumber(read(`${name}Max`)),
  });

  const filters: SessionFilterState = {
    charger: read(FILTER_PARAMS.charger),
    location: read(FILTER_PARAMS.location) ?? '',
    status:
      SESSION_STATUSES.find((status) => status === read(FILTER_PARAMS.status)) ?? null,
    startedFrom: readDate(read(FILTER_PARAMS.startedFrom)),
    startedTo: readDate(read(FILTER_PARAMS.startedTo)),
    duration: readRange(FILTER_PARAMS.duration),
    energy: readRange(FILTER_PARAMS.energy),
    cost: readRange(FILTER_PARAMS.cost),
    user: read(FILTER_PARAMS.user) ?? '',
    sessionId: read(FILTER_PARAMS.sessionId) ?? '',
  };

  return {
    filters,
    sort: readSort(read('sort')),
    skip: readNumber(read('skip')) ?? 0,
    pageSize: readNumber(read('size')) ?? DEFAULT_PAGE_SIZE,
  };
}

function putRange(
  queryParams: Record<string, string>,
  name: string,
  { min, max }: NumberRange,
): void {
  if (min !== null) queryParams[`${name}Min`] = String(min);
  if (max !== null) queryParams[`${name}Max`] = String(max);
}

function readSort(raw: string | null): SessionSort[] {
  const [name, direction] = (raw ?? '').split(':');
  const field = SORTABLE_FIELDS.find((sortable) => sortable === name);
  if (!field || (direction !== 'asc' && direction !== 'desc')) return [];
  return [{ field, direction }];
}

function readNumber(raw: string | null): number | null {
  if (raw === null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function readDate(raw: string | null): Date | null {
  if (raw === null) return null;
  const value = new Date(raw);
  return Number.isNaN(value.getTime()) ? null : value;
}

function isoDate(date: Date | null): string | null {
  if (!date) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
