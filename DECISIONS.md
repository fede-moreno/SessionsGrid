# Decisions & Trade-offs

## Approach & Key decisions

Two components communicating through input and ouput signals, one owner of state:
- `SessionsPageComponent` (smart) owns the query (filters, sort, paging) as signals and turns it into exactly one backend call via `rxResource`
- `SessionsGridComponent` (presentational) has columns, custom filter row, cell templates, and the built-in pagination. Stateless

- `src/app/fake/` is left untouched since it is the backend contract
- Signals for state management, with a derived and writable linkedsignal `skip()` since it must reset the page to 1
- `OnPush` Change detection strategy to reduce/prevent re-renders. While using signals it also makes it zoneless ready
- Preferred modern control flow and standalone components
- `effect()` updates the URL queryparams when the filters change
- Error handling and retry mechanism since the fake api can result in error
- Pure functions for the query - params mapper

## Improvements on the screenshot (deliberate)

- Added a header to display the active filters and clear them. Also duplicated the total amount of sessions here which could not be always visible in large sets next to the pagination
- Energy and Cost have min and max filters to reduce potential errors
- Added error banner with retry
- Added Click to Copy button for sessionsIds.
- Url and query param sync allowing it to survive the app being reloaded and also bookmarked (I see this feature being used quite a lot in these screens)

## Trade-offs & things I'd revisit
- Used Inter font (same as DeftPower home page), but the screenshot seems like a famous Google Font
- The colors and spacing don't match 100%. I would spend more time on it to acommodate to the design. Implementing variables for these colors and having a design system would be ideal to mantain the consistency. Currently the colors are hardcoded and would introduce inconsistencies in the components in the long run
- Currently the grid only supports one column sorting
- Duration filters in minutes but displays as `6h 49m`, having a dual unit input would be better
- SessionIds are truncated a tooltip/popup displaying the entire Id would make more sense and the copy button could be 
- Dropdown lists styles need improvement.
- Favicon is using a DeftPower hardcoded CDN link which will break eventually
- Raised the production bundle budget in `angular.json` since the full Kendo theme is quite big
- Would add better linting (Angular specific and stylelint)
- Session filter state is pure and first candidate for adding the tests which is currently out of scope
- If the Session information and filters would be needed in other parts of the application then an application state (with NgRx) would make more sense than the current signal based implementation
- Add a auto retry (with attempts) mechanism if the (fake) API fails often. Currently its 5%
- Add custom validators, ex. Min value < Max value
- NgDeep was used to access to internal Kendo styling. It can probably be improved by applying the styles with more/better specificity

## AI usage

I made the structural calls: the component split, smart and dumb (also called container/presentational) component pattern, defined the good practices, decided for the state in the page rather than a store or NgRx.
Claude Code wrote most of the boilerplate and scaffolding, the filter mappings, URL Queryparam mapper with filter sync, also assisted with KendoUI components research & implementation. 
Most of my time was focused on challenging AI decisions (specifiying and being clear which part of the code it had to look at) and reviewing the solution
