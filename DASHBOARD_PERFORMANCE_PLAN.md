# Dashboard Performance Optimization Plan

## Goals
- Improve initial load time and perceived responsiveness for doctor, patient, and admin dashboards (including sub-pages).
- Reduce client-side JavaScript, hydration cost, and network fan-out.
- Ensure analytics and dashboard metrics scale without degrading performance.
- Establish ongoing performance monitoring and budgets.

## Success Metrics (targets)
- LCP < 2.5s, TTFB < 800ms, INP < 200ms on dashboard pages.
- JS payload per dashboard page reduced by 30–50%.
- Admin dashboard analytics response time < 500ms (cached).
- No regressions in core user flows (appointments, messages, payments).

---

## Phase 0: Baseline & Measurement (1–2 days)
### Tasks
- Identify top 10 slowest dashboard routes (doctor, patient, admin, and sub-pages).
- Capture Lighthouse/Speed Insights metrics for baseline.
- Record largest JS bundles per route and top network requests.
- Define acceptable performance budgets per route.

### Deliverables
- Baseline metrics report.
- Performance budget thresholds per route.

---

## Phase 1: Quick Wins (1 week)
### Tasks
- Replace full-page reload navigation with client routing in dashboard UI.
- Enable Next image optimization for avatars and dashboard images.
- Add responsive `sizes` metadata for images to improve LCP.
- Defer non-critical animations and reduce motion for low-power devices.
- Add route-level loading states/skeletons for dashboard sections.

### Deliverables
- Faster initial paint on dashboard routes.
- Reduced LCP and bandwidth on mobile.

---

## Phase 2: Server-First Rendering (2–3 weeks)
### Tasks
- Split dashboard pages into server-rendered shells + client “islands”.
- Fetch summary stats on the server for above-the-fold content.
- Stream secondary sections (messages, activity, tasks) with Suspense boundaries.
- Remove client-side fetch on mount for initial content.

### Deliverables
- Earlier first contentful paint.
- Reduced hydration cost and JS size.

---

## Phase 3: Data & Query Optimization (2–3 weeks)
### Tasks
- Replace admin analytics full-table scans with SQL aggregates or RPCs.
- Create materialized views for heavy analytics and refresh periodically.
- Add missing DB indexes for dashboard query patterns.
- Add caching for dashboard metrics (short TTL).
- Paginate admin data and avoid unbounded admin list fetches.

### Deliverables
- Stable performance at scale.
- Predictable analytics response times.

---

## Phase 4: Continuous Monitoring (ongoing)
### Tasks
- Track performance metrics in production dashboards.
- Add alerts for regressions (LCP/TTFB/INP thresholds).
- Review bundle sizes and slow queries monthly.

### Deliverables
- Continuous performance visibility.
- Early detection of regressions.

---

## Doctor Dashboard Scope
- Summary stats: server-rendered.
- Today’s appointments: lazy/streamed.
- Messages/tasks: lazy-loaded and cached.
- Availability sync: run after idle or when needed.

## Patient Dashboard Scope
- Summary stats: server-rendered.
- Next appointment: server-rendered.
- Recent activity + reviews: lazy/streamed.
- Notifications and secondary widgets: client-only, deferred.

## Admin Dashboard Scope
- Summary stats: server-rendered with cached aggregates.
- Pending approvals + activity: server-rendered with pagination.
- Analytics: materialized view/RPC + cached responses.

---

## Risks & Mitigations
- Risk: larger refactor due to server/client split.  
  Mitigation: incremental rollout per dashboard.
- Risk: stale analytics data.  
  Mitigation: short TTL cache + manual refresh action.
- Risk: hydration mismatches.  
  Mitigation: isolate time-based logic to client only.

---

## Implementation Order (recommended)
1) Quick wins (routing, images, animation defers).  
2) Server-first rendering for doctor + patient dashboards.  
3) Admin analytics aggregation + caching.  
4) Extend server-first and caching to all sub-pages.  

