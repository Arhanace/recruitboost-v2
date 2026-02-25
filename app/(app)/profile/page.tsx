import { getProfile } from "@/actions/profile";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your athlete profile information
        </p>
      </div>

      <ProfileForm initialProfile={profile} />
    </div>
  );
}
