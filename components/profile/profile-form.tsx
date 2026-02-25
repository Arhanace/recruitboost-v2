"use client";

import { useState, useTransition } from "react";
import {
  Save,
  Loader2,
  Lock,
  GraduationCap,
  Dumbbell,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfile } from "@/actions/profile";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  name: string | null;
  email: string | null;
  image: string | null;
  sport: string | null;
  position: string | null;
  height: string | null;
  graduationYear: number | null;
  gender: string | null;
  keyStats: string | null;
  highlights: string | null;
  bio: string | null;
  gpa: string | null;
  testScores: string | null;
  academicHonors: string | null;
  intendedMajor: string | null;
  preferredLocation: string | null;
  preferredSchoolSize: string | null;
  preferredProgramLevel: string | null;
}

interface ProfileFormProps {
  initialProfile: ProfileData;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  // Split name into first and last
  const nameParts = (initialProfile.name ?? "").split(" ");
  const initialFirstName = nameParts[0] ?? "";
  const initialLastName = nameParts.slice(1).join(" ") ?? "";

  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    sport: initialProfile.sport ?? "",
    position: initialProfile.position ?? "",
    height: initialProfile.height ?? "",
    graduationYear: initialProfile.graduationYear?.toString() ?? "",
    gender: initialProfile.gender ?? "",
    keyStats: initialProfile.keyStats ?? "",
    highlights: initialProfile.highlights ?? "",
    bio: initialProfile.bio ?? "",
    gpa: initialProfile.gpa ?? "",
    testScores: initialProfile.testScores ?? "",
    academicHonors: initialProfile.academicHonors ?? "",
    intendedMajor: initialProfile.intendedMajor ?? "",
    preferredLocation: initialProfile.preferredLocation ?? "",
    preferredSchoolSize: initialProfile.preferredSchoolSize ?? "",
    preferredProgramLevel: initialProfile.preferredProgramLevel ?? "",
  });

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSelectChange(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const fullName =
          `${formData.firstName} ${formData.lastName}`.trim();
        const payload = {
          name: fullName,
          sport: formData.sport,
          position: formData.position,
          height: formData.height,
          graduationYear: formData.graduationYear
            ? Number(formData.graduationYear)
            : null,
          gender: formData.gender,
          keyStats: formData.keyStats,
          highlights: formData.highlights,
          bio: formData.bio,
          gpa: formData.gpa,
          testScores: formData.testScores,
          academicHonors: formData.academicHonors,
          intendedMajor: formData.intendedMajor,
          preferredLocation: formData.preferredLocation,
          preferredSchoolSize: formData.preferredSchoolSize,
          preferredProgramLevel: formData.preferredProgramLevel,
        };
        await updateProfile(payload);
        toast({
          title: "Profile updated",
          description: "Your profile has been saved successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  // Generate graduation year options
  const currentYear = new Date().getFullYear();
  const gradYears = Array.from({ length: 12 }, (_, i) => currentYear - 2 + i);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">My Athlete Profile</CardTitle>
            <CardDescription className="mt-1">
              Update your profile information for college coaches
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Personal Information
          </h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={initialProfile.email ?? ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(v) => handleSelectChange("gender", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="sport">Sport</Label>
              <Badge
                variant="outline"
                className="text-xs gap-1 text-amber-700 border-amber-300 bg-amber-50"
              >
                <Lock className="w-3 h-3" />
                Locked
              </Badge>
            </div>
            <Input
              id="sport"
              name="sport"
              value={formData.sport}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Sport selection can only be changed by an administrator
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="graduationYear">Graduation Year</Label>
            <Select
              value={formData.graduationYear}
              onValueChange={(v) => handleSelectChange("graduationYear", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select graduation year" />
              </SelectTrigger>
              <SelectContent>
                {gradYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Personal Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell coaches about yourself, your journey, and goals..."
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Briefly describe your athletic journey and goals
            </p>
          </div>
        </div>

        {/* Athletic Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Athletic Information
          </h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="e.g., Point Guard, Midfielder"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder={'e.g., 6\'2"'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyStats">Key Stats</Label>
            <Textarea
              id="keyStats"
              name="keyStats"
              value={formData.keyStats}
              onChange={handleChange}
              placeholder="e.g., 15 PPG, 5 APG, 40% 3PT"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Highlight your most impressive stats and achievements
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="highlights">Highlight Links</Label>
            <Textarea
              id="highlights"
              name="highlights"
              value={formData.highlights}
              onChange={handleChange}
              placeholder="Paste links to your highlight videos..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Add YouTube or Hudl links to your game highlights
            </p>
          </div>
        </div>

        {/* Academic Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Academic Information
          </h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gpa">GPA</Label>
              <Input
                id="gpa"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                placeholder="e.g., 3.8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testScores">Test Scores</Label>
              <Input
                id="testScores"
                name="testScores"
                value={formData.testScores}
                onChange={handleChange}
                placeholder="e.g., SAT: 1400, ACT: 32"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicHonors">Academic Honors</Label>
              <Input
                id="academicHonors"
                name="academicHonors"
                value={formData.academicHonors}
                onChange={handleChange}
                placeholder="e.g., Honor Roll, AP Scholar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intendedMajor">Intended Major</Label>
              <Input
                id="intendedMajor"
                name="intendedMajor"
                value={formData.intendedMajor}
                onChange={handleChange}
                placeholder="e.g., Business, Engineering"
              />
            </div>
          </div>
        </div>

        {/* School Preferences Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            School Preferences
          </h3>
          <Separator />

          <div className="space-y-2">
            <Label htmlFor="preferredLocation">Preferred Location</Label>
            <Input
              id="preferredLocation"
              name="preferredLocation"
              value={formData.preferredLocation}
              onChange={handleChange}
              placeholder="e.g., East Coast, California, Midwest"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredSchoolSize">Preferred School Size</Label>
              <Select
                value={formData.preferredSchoolSize}
                onValueChange={(v) => handleSelectChange("preferredSchoolSize", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (under 5,000)</SelectItem>
                  <SelectItem value="medium">Medium (5,000–15,000)</SelectItem>
                  <SelectItem value="large">Large (15,000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredProgramLevel">Preferred Program Level</Label>
              <Select
                value={formData.preferredProgramLevel}
                onValueChange={(v) => handleSelectChange("preferredProgramLevel", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="D1">NCAA Division I</SelectItem>
                  <SelectItem value="D2">NCAA Division II</SelectItem>
                  <SelectItem value="D3">NCAA Division III</SelectItem>
                  <SelectItem value="NAIA">NAIA</SelectItem>
                  <SelectItem value="NJCAA">NJCAA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bottom save button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isPending} size="lg">
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
