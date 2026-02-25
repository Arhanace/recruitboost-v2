"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { completeOnboarding } from "@/actions/onboarding";

const SPORTS = [
  "Baseball",
  "Beach Volleyball",
  "Field Hockey",
  "Mens Basketball",
  "Mens Golf",
  "Mens Ice Hockey",
  "Mens Lacrosse",
  "Mens Soccer",
  "Mens Tennis",
  "Softball",
  "Womens Basketball",
  "Womens Golf",
  "Womens Ice Hockey",
  "Womens Lacrosse",
  "Womens Soccer",
  "Womens Tennis",
  "Womens Volleyball",
];

const GRADUATION_YEARS = Array.from({ length: 10 }, (_, i) => 2025 + i);

export function OnboardingModal() {
  const router = useRouter();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Form state
  const [sport, setSport] = useState("");
  const [gender, setGender] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [position, setPosition] = useState("");
  const [gpa, setGpa] = useState("");
  const [height, setHeight] = useState("");

  function canAdvance() {
    if (step === 1) return !!sport && !!gender;
    if (step === 2) return !!graduationYear;
    return true;
  }

  function handleNext() {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await completeOnboarding({
          sport,
          gender,
          graduationYear: parseInt(graduationYear),
          position: position || undefined,
          gpa: gpa || undefined,
          height: height || undefined,
        });

        if (!result.success) {
          setError(result.error || "Something went wrong");
          return;
        }

        // Update the session to reflect new sport/graduationYear
        await update();
        router.refresh();
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-[480px] p-0 gap-0 [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <Image src="/logo.png" alt="RecruitBoost" width={40} height={40} className="rounded-lg" />
            <span className="text-lg font-bold text-foreground tracking-tight">RecruitBoost</span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            {step === 1 && "Welcome! Let's get started"}
            {step === 2 && "Academic details"}
            {step === 3 && "Athletic profile"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {step === 1 && "Tell us about your sport so we can match you with the right coaches."}
            {step === 2 && "Help coaches learn about your academics."}
            {step === 3 && "Add your athletic details (you can update these later)."}
          </DialogDescription>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Step content */}
        <div className="px-6 py-4 space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sport" className="text-sm font-medium">
                  Sport <span className="text-red-500">*</span>
                </Label>
                <Select value={sport} onValueChange={setSport}>
                  <SelectTrigger id="sport">
                    <SelectValue placeholder="Select your sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This locks your coach database to this sport and cannot be changed later.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="graduationYear" className="text-sm font-medium">
                  Graduation Year <span className="text-red-500">*</span>
                </Label>
                <Select value={graduationYear} onValueChange={setGraduationYear}>
                  <SelectTrigger id="graduationYear">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADUATION_YEARS.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gpa" className="text-sm font-medium">
                  GPA
                </Label>
                <Input
                  id="gpa"
                  placeholder="e.g. 3.8"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">
                  Position
                </Label>
                <Input
                  id="position"
                  placeholder="e.g. Point Guard, Pitcher, Midfielder"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height" className="text-sm font-medium">
                  Height
                </Label>
                <Input
                  id="height"
                  placeholder='e.g. 6&apos;2"'
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
          {step > 1 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(step - 1)}
              disabled={isPending}
            >
              Back
            </Button>
          ) : (
            <div />
          )}
          <Button
            size="sm"
            onClick={handleNext}
            disabled={!canAdvance() || isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : step === 3 ? (
              "Get Started"
            ) : (
              <>
                Continue
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
