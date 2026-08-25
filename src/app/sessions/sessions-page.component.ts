import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
} from "@angular/core";
import { rxResource, toObservable, toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { KENDO_BUTTONS } from "@progress/kendo-angular-buttons";
import { PageChangeEvent } from "@progress/kendo-angular-grid";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { FakeSessionService } from "../fake/fake-session.service";
import { SessionQuery, SessionSort } from "../fake/session.model";
import { activeFilterCount, toSessionFilters } from "./session-query.mapper";
import { decodeState, encodeState } from "./session-url-params";
import { EMPTY_FILTER_STATE, SessionFilterState } from "./session-filter.model";
import { SessionsGridComponent } from "./sessions-grid/sessions-grid.component";

const FILTER_DEBOUNCE_MS = 300;

@Component({
  selector: "app-sessions-page",
  standalone: true,
  imports: [DecimalPipe, KENDO_BUTTONS, SessionsGridComponent],
  templateUrl: "./sessions-page.component.html",
  styleUrl: "./sessions-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsPageComponent {
  private readonly service = inject(FakeSessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly initial = decodeState(this.route.snapshot.queryParams);

  protected readonly filterDraft = signal<SessionFilterState>(
    this.initial.filters,
  );

  private readonly filters = toSignal(
    toObservable(this.filterDraft).pipe(
      debounceTime(FILTER_DEBOUNCE_MS),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    ),
    { initialValue: this.filterDraft() },
  );

  protected readonly sort = signal<SessionSort[]>(this.initial.sort);
  protected readonly pageSize = signal(this.initial.pageSize);

  protected readonly skip = linkedSignal<unknown, number>({
    source: () => [this.filters(), this.sort(), this.pageSize()],
    computation: (_source, previous) =>
      previous === undefined ? this.initial.skip : 0,
  });

  private readonly query = computed<SessionQuery>(() => ({
    skip: this.skip(),
    take: this.pageSize(),
    sort: this.sort(),
    filters: toSessionFilters(this.filters()),
  }));

  protected readonly sessions = rxResource({
    params: this.query,
    stream: ({ params }) => this.service.getSessions(params),
  });

  protected readonly chargers = rxResource({
    params: () => true,
    stream: () => this.service.getChargers(),
    defaultValue: [] as string[],
  });

  protected readonly rows = computed(() =>
    this.sessions.hasValue() ? this.sessions.value().data : [],
  );

  protected readonly total = computed(() =>
    this.sessions.hasValue() ? this.sessions.value().total : 0,
  );
  
  protected readonly activeFilters = computed(() =>
    activeFilterCount(this.filterDraft()),
  );

  constructor() {
    effect(() => {
      const queryParams = encodeState({
        filters: this.filters(),
        sort: this.sort(),
        skip: this.skip(),
        pageSize: this.pageSize(),
      });
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        replaceUrl: true,
      });
    });
  }

  protected onFilterChange(patch: Partial<SessionFilterState>): void {
    this.filterDraft.update((state) => ({ ...state, ...patch }));
  }

  protected onClearFilters(): void {
    this.filterDraft.set({ ...EMPTY_FILTER_STATE });
  }

  protected onSortChange(sort: SessionSort[]): void {
    this.sort.set(sort);
  }

  protected onPageChange({ skip, take }: PageChangeEvent): void {
    this.pageSize.set(take);
    this.skip.set(skip);
  }

  protected retry(): void {
    this.sessions.reload();
  }
}
