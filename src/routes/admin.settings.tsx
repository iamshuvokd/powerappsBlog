import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Save, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PasswordInput } from "@/components/ui/password-input";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getProfile, updateAccount, updateProfile, uploadMedia } from "@/lib/admin-api";
import { updateStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings - PowerApps.blog Admin" }] }),
  component: SettingsPage,
});

const inputClass =
  "w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none";

function SettingsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "profile"], queryFn: getProfile });

  // ---- Profile (display name + title + bio + avatar) ----
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  // ---- Account (email + password) ----
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (query.data) {
      setName(query.data.profile.name ?? "");
      setTitle(query.data.profile.title ?? "");
      setBio(query.data.profile.bio ?? "");
      setAvatar(query.data.profile.avatar ?? "");
      setEmail(query.data.profile.email ?? "");
    }
  }, [query.data]);

  const onPickAvatar = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const res = await uploadMedia(file);
      setAvatar(res.url);
      toast.success("Photo uploaded — remember to Save profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfile = useMutation({
    mutationFn: () => updateProfile({ name, title, bio, avatar: avatar || null }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
      void queryClient.invalidateQueries({ queryKey: ["articles"] });
      void queryClient.invalidateQueries({ queryKey: ["author"] });
      toast.success("Profile saved");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const saveAccount = useMutation({
    mutationFn: () => {
      const emailChanged = email.trim() && email.trim() !== (query.data?.profile.email ?? "");
      return updateAccount({
        currentPassword,
        email: emailChanged ? email.trim() : undefined,
        newPassword: newPassword.trim() ? newPassword.trim() : undefined,
      });
    },
    onSuccess: (res) => {
      updateStoredUser({ email: res.profile.email });
      void queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
      toast.success("Account updated");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  const onSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      toast.error("Enter your current password to confirm changes.");
      return;
    }
    const emailChanged = email.trim() && email.trim() !== (query.data?.profile.email ?? "");
    if (!emailChanged && !newPassword.trim()) {
      toast.error("Change your email or set a new password first.");
      return;
    }
    if (newPassword.trim() && newPassword.trim().length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    saveAccount.mutate();
  };

  return (
    <AdminLayout title="Settings">
      <div className="max-w-xl space-y-6">
        {query.isPending ? (
          <div className="grid place-items-center py-20">
            <Spinner />
          </div>
        ) : (
          <>
            {/* Author profile */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveProfile.mutate();
              }}
              className="space-y-5 rounded-xl border border-border/70 bg-card p-6"
            >
              <div>
                <h2 className="text-sm font-semibold">Author profile</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Shown as the author on posts and in the author section on the homepage.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Profile photo</label>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onPickAvatar(f);
                    e.target.value = "";
                  }}
                />
                <div className="flex items-center gap-4">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/30"
                    />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-muted-foreground">
                      <Upload className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingAvatar}
                      onClick={() => avatarRef.current?.click()}
                    >
                      {uploadingAvatar ? (
                        <Spinner size="xs" className="mr-1.5" />
                      ) : (
                        <Upload className="mr-1.5 h-4 w-4" />
                      )}
                      {avatar ? "Replace" : "Upload photo"}
                    </Button>
                    {avatar ? (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAvatar("")}>
                        <X className="mr-1 h-4 w-4" /> Remove
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Display name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shuvo Khan"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title / role</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Power Platform Architect"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="A short bio shown in the author section on the homepage…"
                  className={`${inputClass} resize-y`}
                />
              </div>

              <Button
                type="submit"
                disabled={saveProfile.isPending}
                className="gradient-primary text-primary-foreground hover:opacity-90"
              >
                {saveProfile.isPending ? (
                  <Spinner size="xs" className="mr-1.5" />
                ) : (
                  <Save className="mr-1.5 h-4 w-4" />
                )}
                Save profile
              </Button>
            </form>

            {/* Account / login credentials */}
            <form
              onSubmit={onSaveAccount}
              className="space-y-5 rounded-xl border border-border/70 bg-card p-6"
            >
              <div>
                <h2 className="text-sm font-semibold">Account &amp; login</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Change your login email and/or password. Your current password is required to
                  confirm.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Login email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  New password <span className="opacity-60">(leave blank to keep current)</span>
                </label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Current password <span className="text-destructive">*</span>
                </label>
                <PasswordInput
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Confirm with your current password"
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>

              <Button
                type="submit"
                disabled={saveAccount.isPending}
                className="gradient-primary text-primary-foreground hover:opacity-90"
              >
                {saveAccount.isPending ? (
                  <Spinner size="xs" className="mr-1.5" />
                ) : (
                  <KeyRound className="mr-1.5 h-4 w-4" />
                )}
                Update account
              </Button>
            </form>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
