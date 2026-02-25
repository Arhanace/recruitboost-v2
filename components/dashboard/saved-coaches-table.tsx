"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Mail, Bookmark, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { SchoolLogo } from "@/components/ui/school-logo";
import { titleCase } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SavedCoachItem = {
  savedCoach: {
    id: number;
    userId: string;
    coachId: number;
    notes: string | null;
    status: string | null;
    isFavorite: boolean | null;
    createdAt: string;
    updatedAt: string;
  };
  coach: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    school: string;
    sport: string;
    division: string | null;
    conference: string | null;
    role: string | null;
    state: string | null;
    region: string | null;
  };
};

interface SavedCoachesTableProps {
  coaches: SavedCoachItem[];
}

const ITEMS_PER_PAGE = 5;

export function SavedCoachesTable({ coaches }: SavedCoachesTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!search.trim()) return coaches;
    const term = search.toLowerCase();
    return coaches.filter((item) => {
      const name = `${item.coach.firstName} ${item.coach.lastName}`.toLowerCase();
      const school = item.coach.school.toLowerCase();
      const sport = item.coach.sport.toLowerCase();
      return name.includes(term) || school.includes(term) || sport.includes(term);
    });
  }, [coaches, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, end);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (coaches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Saved Coaches</CardTitle>
          <CardDescription>View and manage your saved coaches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No saved coaches yet</p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Save coaches from the school database to see them here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Saved Coaches</CardTitle>
        <CardDescription>View and manage your saved coaches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search coaches by name, school, sport..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No coaches match your search
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((item) => (
                  <TableRow key={item.savedCoach.id}>
                    <TableCell className="font-medium">
                      {titleCase(item.coach.firstName)} {titleCase(item.coach.lastName)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <SchoolLogo school={item.coach.school} size="sm" />
                        {item.coach.school}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.coach.role || "Coach"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => router.push(`/outreach?coachId=${item.coach.id}`)}
                        >
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Bookmark className="w-4 h-4 text-muted-foreground fill-current" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {start + 1} to {Math.min(end, filtered.length)} of {filtered.length} coaches
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
