import { DatePipe, DecimalPipe, LowerCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_DATEPICKER } from '@progress/kendo-angular-dateinputs';
import { KENDO_DROPDOWNLIST } from '@progress/kendo-angular-dropdowns';
import {
  KENDO_GRID,
  PageChangeEvent,
  PagerSettings,
  SortSettings,
} from '@progress/kendo-angular-grid';
import { KENDO_NUMERICTEXTBOX, KENDO_TEXTBOX } from '@progress/kendo-angular-inputs';
import { CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { Session, SessionSort } from '../../fake/session.model';
import { DurationPipe } from '../duration.pipe';
import {
  NumberRange,
  SESSION_STATUSES,
  SORTABLE_FIELDS,
  SessionFilterState,
} from '../session-filter.model';

const COPIED_FEEDBACK_MS = 1500;

export const ALL_CHARGERS = 'All chargers';
export const ALL_STATUSES = 'All statuses';

@Component({
  selector: 'app-sessions-grid',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    LowerCasePipe,
    DurationPipe,
    KENDO_GRID,
    KENDO_BUTTONS,
    KENDO_DATEPICKER,
    KENDO_DROPDOWNLIST,
    KENDO_NUMERICTEXTBOX,
    KENDO_TEXTBOX,
  ],
  templateUrl: './sessions-grid.component.html',
  styleUrl: './sessions-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsGridComponent {
  readonly rows = input.required<Session[]>();
  readonly total = input.required<number>();
  readonly loading = input.required<boolean>();
  readonly failed = input(false);
  readonly skip = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly sort = input.required<SessionSort[]>();
  readonly filterState = input.required<SessionFilterState>();
  readonly chargers = input.required<string[]>();
  readonly chargersLoading = input(false);

  readonly sortChange = output<SessionSort[]>();
  readonly pageChange = output<PageChangeEvent>();
  readonly filterChange = output<Partial<SessionFilterState>>();
  readonly clearFilters = output<void>();

  protected readonly allChargers = ALL_CHARGERS;
  protected readonly allStatuses = ALL_STATUSES;
  protected readonly statuses = SESSION_STATUSES;
  protected readonly pagerSettings: PagerSettings = {
    buttonCount: 10,
    info: true,
    previousNext: true,
    pageSizes: [10, 20, 50, 100],
    responsive: true,
  };
  protected readonly sortSettings: SortSettings = {
    mode: 'single',
    allowUnsort: true,
  };
  /** The grid never filters client-side, this keeps its filter row inert. */
  protected readonly inertFilter: CompositeFilterDescriptor = {
    logic: 'and',
    filters: [],
  };

  protected readonly copiedId = signal<string | null>(null);

  protected readonly gridData = computed(() => ({
    data: this.rows(),
    total: this.total(),
  }));

  protected readonly kendoSort = computed<SortDescriptor[]>(() =>
    this.sort().map(({ field, direction }) => ({ field, dir: direction })),
  );

  protected onSortChange(descriptors: SortDescriptor[]): void {
    this.sortChange.emit(
      descriptors.flatMap(({ field, dir }) => {
        const sortable = SORTABLE_FIELDS.find((candidate) => candidate === field);
        return sortable && dir ? [{ field: sortable, direction: dir }] : [];
      }),
    );
  }

  protected onCharger(value: string | null): void {
    this.filterChange.emit({ charger: value === ALL_CHARGERS ? null : value });
  }

  protected onStatus(value: string | null): void {
    this.filterChange.emit({
      status: SESSION_STATUSES.find((status) => status === value) ?? null,
    });
  }

  protected onRange(
    key: 'duration' | 'energy' | 'cost',
    bound: 'min' | 'max',
    value: number | null,
  ): void {
    const current: NumberRange = this.filterState()[key];
    this.filterChange.emit({ [key]: { ...current, [bound]: value } });
  }

  protected copyId(id: string): void {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        this.copiedId.set(id);
        setTimeout(() => this.copiedId.set(null), COPIED_FEEDBACK_MS);
      })
      .catch(() => console.log('Error while trying to copy session id'));
  }
}
