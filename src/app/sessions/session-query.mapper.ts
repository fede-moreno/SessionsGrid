import { Session, SessionFilter } from '../fake/session.model';
import { NumberRange, SessionFilterState } from './session-filter.model';


export function toSessionFilters(state: SessionFilterState): SessionFilter[] {
  return [
    ...exact('chargerName', state.charger),
    ...contains('chargerLocation', state.location),
    ...exact('status', state.status),
    ...atOrAfter('startedAt', state.startedFrom),
    ...atOrBefore('startedAt', state.startedTo),
    ...between('durationMinutes', state.duration),
    ...between('energyKwh', state.energy),
    ...between('costEur', state.cost),
    ...contains('user', state.user),
    ...contains('id', state.sessionId),
  ];
}

export function activeFilterCount(state: SessionFilterState): number {
  const activeCells = [
    state.charger !== null,
    hasText(state.location),
    state.status !== null,
    state.startedFrom !== null || state.startedTo !== null,
    hasRange(state.duration),
    hasRange(state.energy),
    hasRange(state.cost),
    hasText(state.user),
    hasText(state.sessionId),
  ];

  return activeCells.filter((isActive) => isActive).length;
}

function hasText(value: string): boolean {
  return value.trim() !== '';
}

function hasRange({ min, max }: NumberRange): boolean {
  return min !== null || max !== null;
}

function contains(field: keyof Session, value: string): SessionFilter[] {
  const trimmed = value.trim();
  return trimmed ? [{ field, operator: 'contains', value: trimmed }] : [];
}

function exact(field: keyof Session, value: string | null): SessionFilter[] {
  return value ? [{ field, operator: 'eq', value }] : [];
}

function atOrAfter(field: keyof Session, value: Date | null): SessionFilter[] {
  return value ? [{ field, operator: 'gte', value: dayStart(value) }] : [];
}

function atOrBefore(field: keyof Session, value: Date | null): SessionFilter[] {
  return value ? [{ field, operator: 'lte', value: dayEnd(value) }] : [];
}

function between(field: keyof Session, { min, max }: NumberRange): SessionFilter[] {
  const filters: SessionFilter[] = [];
  if (min !== null) filters.push({ field, operator: 'gte', value: min });
  if (max !== null) filters.push({ field, operator: 'lte', value: max });
  return filters;
}

function dayStart(date: Date): Date {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  return dateStart;
}

function dayEnd(date: Date): Date {
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);
  return dateEnd;
}
