"use client";

import { useState } from "react";
import { updateProfile } from "@/app/profile/actions";
import LanguageField from "./LanguageField";

export default function EditProfile({
  username, displayName, bio, language, isPrivate,
}: {
  username: string; displayName: string | null; bio: string | null; language: string; isPrivate: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="rounded-full border border-hairline px-4 py-1.5 text-sm text-ash hover:text-paper">
        edit profile
      </button>
    );
  }

  return (
    <form action={updateProfile} className="mt-3 w-full space-y-2">
      <input type="hidden" name="username" value={username} />
      <input name="displayName" defaultValue={displayName ?? ""} maxLength={60} placeholder="display name"
        className="w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
      <textarea name="bio" defaultValue={bio ?? ""} maxLength={240} rows={2} placeholder="bio"
        className="w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-paper placeholder:text-ash focus:border-emerald focus:outline-none" />
      <div>
        <label className="mb-1 block text-xs text-ash">preferred language</label>
        <LanguageField name="language" initial={language} />
      </div>
      <label className="flex items-center gap-2 text-sm text-paper">
        <input type="checkbox" name="private" defaultChecked={isPrivate} className="accent-emerald" />
        private account <span className="text-ash">— hide my posts from logged-out visitors & search</span>
      </label>
      <div className="flex gap-2">
        <button type="submit" className="rounded-full bg-emerald px-4 py-1.5 text-sm font-semibold text-ink hover:opacity-90">save</button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-hairline px-4 py-1.5 text-sm text-ash hover:text-paper">cancel</button>
      </div>
    </form>
  );
}
