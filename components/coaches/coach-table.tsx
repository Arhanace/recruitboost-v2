"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  getCoaches,
  getSchools,
  saveCoach,
  unsaveCoach,
  getSavedCoachIds,
} from "@/actions/coaches";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CoachFilters,
  type FilterOptions,
  type ActiveFilters,
} from "@/components/coaches/coach-filters";
import { PaginationControls } from "@/components/coaches/pagination-controls";
import { CoachCard, type Coach } from "@/components/coaches/coach-card";
import { SchoolGroupCard, type SchoolGroup } from "@/components/coaches/school-group";
import {
  Search,
  Loader2,
  GraduationCap,
  Info,
  List,
  LayoutGrid,
} from "lucide-react";

interface CoachTableProps {
  initialData: Coach[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  initialTotalPages: number;
  initialSavedIds: number[];
  filterOptions: FilterOptions;
  userSport: string | null;
}

type ViewMode = "list" | "school";

const SCHOOL_VIEW_LIMIT = 25;

export function CoachTable({
  initialData,
  initialTotal,
  initialPage,
  initialLimit,
  initialTotalPages,
  initialSavedIds,
  filterOptions,
  userSport,
}: CoachTableProps) {

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Data state
  const [coaches, setCoaches] = useState<Coach[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [savedIds, setSavedIds] = useState<Set<number>>(
    new Set(initialSavedIds)
  );

  // Input state - auto-set sport filter from session
  const [searchInput, setSearchInput] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(
    userSport ? { sport: userSport } : {}
  );

  // Transition state
  const [isPending, startTransition] = useTransition();
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());

  // Debounce ref
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build filter params from current state
  function buildFilterParams(opts?: {
    search?: string;
    filters?: ActiveFilters;
    newPage?: number;
  }) {
    const search = opts?.search ?? searchInput;
    const filters = opts?.filters ?? activeFilters;
    const targetPage = opts?.newPage ?? 1;
    return {
      search: search || undefined,
      sport: filters.sport || userSport || undefined,
      division: filters.division || undefined,
      conference: filters.conference || undefined,
      region: filters.region || undefined,
      state: filters.state || undefined,
      page: targetPage,
    };
  }

  // Fetch data (coaches for list view, schools for school view)
  const fetchData = useCallback(
    (opts?: { search?: string; filters?: ActiveFilters; newPage?: number; mode?: ViewMode }) => {
      const mode = opts?.mode ?? viewMode;
      const params = buildFilterParams(opts);

      startTransition(async () => {
        if (mode === "school") {
          const result = await getSchools({ ...params, limit: SCHOOL_VIEW_LIMIT });
          setCoaches(result.data as Coach[]);
          setTotal(result.total);
          setPage(result.page);
          setTotalPages(result.totalPages);
        } else {
          const result = await getCoaches({ ...params, limit: initialLimit });
          setCoaches(result.data as Coach[]);
          setTotal(result.total);
          setPage(result.page);
          setTotalPages(result.totalPages);
        }
      });
    },
    [searchInput, activeFilters, viewMode, initialLimit]
  );

  // Debounced search
  function handleSearchChange(value: string) {
    setSearchInput(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchData({ search: value, newPage: 1 });
    }, 350);
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Handle filter change
  function handleFiltersChange(filters: ActiveFilters) {
    setActiveFilters(filters);
    fetchData({ filters, newPage: 1 });
  }

  // Handle view mode change — re-fetch with appropriate data source
  function handleViewModeChange(mode: ViewMode) {
    setViewMode(mode);
    fetchData({ newPage: 1, mode });
  }

  // Handle page change
  function handlePageChange(newPage: number) {
    fetchData({ newPage });
    document.getElementById("coach-database-top")?.scrollIntoView({ behavior: "smooth" });
  }

  // Handle save/unsave
  async function handleToggleSave(coachId: number) {
    const isSaved = savedIds.has(coachId);

    setSavingIds((prev) => new Set(prev).add(coachId));

    try {
      if (isSaved) {
        await unsaveCoach(coachId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(coachId);
          return next;
        });
      } else {
        await saveCoach(coachId);
        setSavedIds((prev) => new Set(prev).add(coachId));
      }
    } catch {
      const ids = await getSavedCoachIds();
      setSavedIds(new Set(ids));
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(coachId);
        return next;
      });
    }
  }

  // Group coaches by school for school view
  const schoolGroups: SchoolGroup[] = useMemo(() => {
    const groupMap = new Map<string, Coach[]>();
    for (const coach of coaches) {
      const existing = groupMap.get(coach.school);
      if (existing) {
        existing.push(coach);
      } else {
        groupMap.set(coach.school, [coach]);
      }
    }

    return Array.from(groupMap.entries()).map(([school, schoolCoaches]) => ({
      school,
      coaches: schoolCoaches,
      division: schoolCoaches[0]?.division ?? null,
      conference: schoolCoaches[0]?.conference ?? null,
      state: schoolCoaches[0]?.state ?? null,
    }));
  }, [coaches]);

  const hasSportFilter = Boolean(userSport && activeFilters.sport === userSport);
  const paginationLimit = viewMode === "school" ? SCHOOL_VIEW_LIMIT : initialLimit;
  const paginationLabel = viewMode === "school" ? "schools" : "coaches";

  return (
    <div className="space-y-5" id="coach-database-top">
      {/* Page header with view toggle */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coach Database</h1>
          <p className="text-muted-foreground mt-1">
            Find and connect with college coaches
          </p>
        </div>
        <div className="flex items-center rounded-lg border bg-muted p-1">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className={`gap-1.5 h-8 px-3 text-xs font-medium ${
              viewMode === "list"
                ? "bg-card text-foreground shadow-sm hover:bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleViewModeChange("list")}
          >
            <List className="h-3.5 w-3.5" />
            List View
          </Button>
          <Button
            variant={viewMode === "school" ? "default" : "ghost"}
            size="sm"
            className={`gap-1.5 h-8 px-3 text-xs font-medium ${
              viewMode === "school"
                ? "bg-card text-foreground shadow-sm hover:bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleViewModeChange("school")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            School View
          </Button>
        </div>
      </div>

      {/* Blue info banner */}
      {hasSportFilter && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
          <Info className="h-4 w-4 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-800">
            Showing <span className="font-semibold">{userSport}</span> coaches only.
            The database is filtered to show coaches in your sport.
          </p>
        </div>
      )}

      {/* Search + Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, school, state, region, conference..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <CoachFilters
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          onFiltersChange={handleFiltersChange}
          hideSportFilter={hasSportFilter}
        />
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="flex items-center justify-center py-2 px-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700 gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading {viewMode === "school" ? "schools" : "coaches"}...
        </div>
      )}

      {/* Empty state */}
      {coaches.length === 0 && !isPending ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-lg border bg-card">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">No {viewMode === "school" ? "schools" : "coaches"} found</p>
          <p className="text-muted-foreground text-sm mt-1">
            {searchInput || Object.values(activeFilters).some(Boolean)
              ? "Try adjusting your search or filters"
              : "No coaches in the database yet"}
          </p>
        </div>
      ) : (
        <>
          {/* View mode content */}
          {viewMode === "list" ? (
            <div className="space-y-3">
              {coaches.map((coach) => (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                  isSaved={savedIds.has(coach.id)}
                  isSaving={savingIds.has(coach.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {schoolGroups.map((group) => (
                <SchoolGroupCard
                  key={group.school}
                  group={group}
                  savedIds={savedIds}
                  savingIds={savingIds}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="rounded-lg border bg-card shadow-sm">
            <PaginationControls
              page={page}
              totalPages={totalPages}
              total={total}
              limit={paginationLimit}
              onPageChange={handlePageChange}
              isPending={isPending}
              label={paginationLabel}
            />
          </div>
        </>
      )}
    </div>
  );
}
