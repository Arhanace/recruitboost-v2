"use client";

import { format } from "date-fns";
import { Mail } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { titleCase } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ResponseItem = {
  email: {
    id: number;
    userId: string;
    coachId: number;
    subject: string;
    body: string;
    direction: string;
    status: string;
    templateId: number | null;
    isFollowUp: boolean | null;
    parentEmailId: number | null;
    scheduledFor: string | null;
    hasResponded: boolean | null;
    gmailMessageId: string | null;
    gmailThreadId: string | null;
    sentAt: string | null;
    receivedAt: string | null;
    createdAt: string;
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

interface RecentResponsesProps {
  responses: ResponseItem[];
}

export function RecentResponses({ responses }: RecentResponsesProps) {
  if (responses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No responses yet</p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Responses from coaches will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coach</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.slice(0, 10).map((item) => (
                <TableRow key={item.email.id}>
                  <TableCell className="font-medium">
                    {titleCase(item.coach.firstName)} {titleCase(item.coach.lastName)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.coach.school}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(
                      new Date(item.email.receivedAt || item.email.createdAt),
                      "MMM d, yyyy"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700 border-green-200 font-normal"
                    >
                      received
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/outreach">View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-center">
          <Button variant="link" asChild>
            <Link href="/outreach">View All Responses</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
