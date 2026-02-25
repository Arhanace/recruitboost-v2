"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X, Info } from "lucide-react";

export interface FilterOptions {
  sports: string[];
  divisions: string[];
  conferences: string[];
  regions: string[];
  states: string[];
}

export interface ActiveFilters {
  sport?: string;
  division?: string;
  conference?: string;
  region?: string;
  state?: string;
}

interface CoachFiltersProps {
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  /** If true, hide the sport filter (auto-filtered by session) */
  hideSportFilter?: boolean;
}

export function CoachFilters({
  filterOptions,
  activeFilters,
  onFiltersChange,
  hideSportFilter,
}: CoachFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ActiveFilters>(activeFilters);

  // Count active filters, excluding sport if it's auto-set
  const activeCount = Object.entries(activeFilters).filter(
    ([key, value]) => Boolean(value) && !(hideSportFilter && key === "sport")
  ).length;

  // Sync local state when dialog opens
  function handleOpenChange(value: boolean) {
    if (value) {
      setLocalFilters(activeFilters);
    }
    setOpen(value);
  }

  function handleLocalFilterChange(key: keyof ActiveFilters, value: string) {
    setLocalFilters((prev) => {
      const updated = { ...prev };
      if (value === "__all__") {
        delete updated[key];
      } else {
        updated[key] = value;
      }
      return updated;
    });
  }

  function applyFilters() {
    onFiltersChange(localFilters);
    setOpen(false);
  }

  function resetFilters() {
    if (hideSportFilter && activeFilters.sport) {
      setLocalFilters({ sport: activeFilters.sport });
    } else {
      setLocalFilters({});
    }
  }

  function removeFilter(key: keyof ActiveFilters) {
    const updated = { ...activeFilters };
    delete updated[key];
    onFiltersChange(updated);
  }

  function clearAllFilters() {
    if (hideSportFilter && activeFilters.sport) {
      onFiltersChange({ sport: activeFilters.sport });
    } else {
      onFiltersChange({});
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {activeCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Coaches</DialogTitle>
            <DialogDescription>
              Refine your results by division, conference, region, and state.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Sport info banner when auto-filtered */}
            {hideSportFilter && activeFilters.sport && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-sm font-medium">Sport-specific results</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Results are filtered to show only {activeFilters.sport} coaches. This
                    cannot be changed.
                  </p>
                </div>
              </div>
            )}

            {/* Sport - only show if not auto-filtered */}
            {!hideSportFilter && (
              <div className="space-y-2">
                <Label htmlFor="filter-sport">Sport</Label>
                <Select
                  value={localFilters.sport ?? "__all__"}
                  onValueChange={(v) => handleLocalFilterChange("sport", v)}
                >
                  <SelectTrigger id="filter-sport">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Sports</SelectItem>
                    {filterOptions.sports.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Division */}
            <div className="space-y-2">
              <Label htmlFor="filter-division">Division</Label>
              <Select
                value={localFilters.division ?? "__all__"}
                onValueChange={(v) => handleLocalFilterChange("division", v)}
              >
                <SelectTrigger id="filter-division">
                  <SelectValue placeholder="All Divisions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Divisions</SelectItem>
                  {filterOptions.divisions.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conference */}
            <div className="space-y-2">
              <Label htmlFor="filter-conference">Conference</Label>
              <Select
                value={localFilters.conference ?? "__all__"}
                onValueChange={(v) => handleLocalFilterChange("conference", v)}
              >
                <SelectTrigger id="filter-conference">
                  <SelectValue placeholder="All Conferences" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Conferences</SelectItem>
                  {filterOptions.conferences.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region */}
            <div className="space-y-2">
              <Label htmlFor="filter-region">Region</Label>
              <Select
                value={localFilters.region ?? "__all__"}
                onValueChange={(v) => handleLocalFilterChange("region", v)}
              >
                <SelectTrigger id="filter-region">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Regions</SelectItem>
                  {filterOptions.regions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="filter-state">State</Label>
              <Select
                value={localFilters.state ?? "__all__"}
                onValueChange={(v) => handleLocalFilterChange("state", v)}
              >
                <SelectTrigger id="filter-state">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All States</SelectItem>
                  {filterOptions.states.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active filter badges (excluding auto-set sport filter) */}
      {activeCount > 0 && (
        <>
          {Object.entries(activeFilters).map(
            ([key, value]) =>
              value &&
              !(hideSportFilter && key === "sport") && (
                <Badge
                  key={key}
                  variant="secondary"
                  className="gap-1 pl-2 pr-1 py-1 cursor-pointer"
                  onClick={() => removeFilter(key as keyof ActiveFilters)}
                >
                  <span className="capitalize text-xs text-muted-foreground mr-0.5">
                    {key}:
                  </span>
                  {value}
                  <X className="h-3 w-3 ml-0.5 hover:text-destructive" />
                </Badge>
              )
          )}
          {activeCount > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={clearAllFilters}
            >
              Clear all
            </Button>
          )}
        </>
      )}
    </div>
  );
}
