"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFlohmarkt } from "../../FlohmarktContext";
import { createClient } from "@/lib/supabase/client";

export function ProfileSettings() {
  const { user, updateUserProfile } = useFlohmarkt();

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notification preferences state
  const [contactFormEmails, setContactFormEmails] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notificationLoaded, setNotificationLoaded] = useState(false);

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  // Load notification preferences
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      if (!user) return;

      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (data?.notification_preferences) {
        const prefs = data.notification_preferences as { contact_form_emails?: boolean };
        setContactFormEmails(prefs.contact_form_emails !== false);
      }
      setNotificationLoaded(true);
    };

    loadNotificationPreferences();
  }, [user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage(null);

    const result = await updateUserProfile(profileName, profileEmail);

    if (result.success) {
      if (result.emailChanged) {
        setProfileMessage({ type: 'success', text: 'Bestätigungs-E-Mail wurde an die neue Adresse gesendet.' });
      } else {
        setProfileMessage({ type: 'success', text: 'Profil wurde aktualisiert.' });
      }
    } else {
      setProfileMessage({ type: 'error', text: result.error || 'Fehler beim Speichern.' });
    }

    setSavingProfile(false);
  };

  const handleReset = () => {
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
    setProfileMessage(null);
  };

  const handlePasswordChange = async () => {
    setSavingPassword(true);
    setPasswordMessage(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwörter stimmen nicht überein.' });
      setSavingPassword(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Passwort muss mindestens 6 Zeichen lang sein.' });
      setSavingPassword(false);
      return;
    }

    const supabase = createClient();

    console.log("Attempting to update password...");
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    console.log("Password update response:", { data, error });

    if (error) {
      console.error("Password update error:", error);
      setPasswordMessage({ type: 'error', text: error.message });
    } else {
      // Check if email confirmation is required
      if (data?.user?.identities && data.user.identities.length === 0) {
        setPasswordMessage({
          type: 'success',
          text: 'Bestätigungs-E-Mail wurde gesendet. Bitte prüfe dein Postfach und klicke auf den Link, um das Passwort zu aktivieren.'
        });
      } else {
        setPasswordMessage({ type: 'success', text: 'Passwort wurde erfolgreich gesetzt und ist sofort aktiv!' });
      }
      setNewPassword("");
      setConfirmPassword("");
    }

    setSavingPassword(false);
  };

  const handlePasswordReset = () => {
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage(null);
  };

  const handleSaveNotifications = async () => {
    if (!user) return;

    setSavingNotifications(true);
    setNotificationMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        notification_preferences: {
          contact_form_emails: contactFormEmails
        }
      })
      .eq('id', user.id);

    if (error) {
      setNotificationMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellungen.' });
    } else {
      setNotificationMessage({ type: 'success', text: 'Benachrichtigungseinstellungen gespeichert.' });
    }

    setSavingNotifications(false);
  };

  const hasChanges = user && (profileName !== user.name || profileEmail !== user.email);
  const passwordValid = newPassword.length >= 6 && newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
        <div>
          <span className="font-bold text-lg">Profil bearbeiten</span>
        </div>
        <Link
          href="/flohmarkt/settings"
          className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10 no-underline"
        >
          ← Zurück
        </Link>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto w-full max-w-[600px] mx-auto flex-grow">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-[#003366] mt-0 mb-4 font-bold">Dein Profil</h3>

          {profileMessage && (
            <div className={`p-3 rounded-md mb-4 ${
              profileMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {profileMessage.text}
            </div>
          )}

          {user && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-semibold block mb-1">Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-gray-900 font-medium"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-semibold block mb-1">E-Mail</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-gray-900 font-medium"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Bei Änderung der E-Mail wird eine Bestätigungs-E-Mail gesendet.
                </p>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile || !hasChanges}
                  className="bg-[#003366] text-white px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProfile ? 'Speichern...' : 'Speichern'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={savingProfile || !hasChanges}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Zurücksetzen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Password Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-[#003366] mt-0 mb-4 font-bold">Passwort setzen/ändern</h3>
          <p className="text-gray-600 text-sm mb-4">
            Setze ein Passwort, um dich zusätzlich zum Magic Link mit E-Mail und Passwort anmelden zu können.
          </p>

          {passwordMessage && (
            <div className={`p-3 rounded-md mb-4 ${
              passwordMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {passwordMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-gray-700 text-sm font-semibold block mb-1">Neues Passwort</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-gray-900 font-medium"
              />
            </div>
            <div>
              <label className="text-gray-700 text-sm font-semibold block mb-1">Passwort bestätigen</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort wiederholen"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-gray-900 font-medium"
              />
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handlePasswordChange}
                disabled={savingPassword || !newPassword || !passwordValid}
                className="bg-[#003366] text-white px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingPassword ? 'Speichern...' : 'Passwort speichern'}
              </button>
              <button
                onClick={handlePasswordReset}
                disabled={savingPassword || (!newPassword && !confirmPassword)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-[#003366] mt-0 mb-4 font-bold">Benachrichtigungen</h3>
          <p className="text-gray-600 text-sm mb-4">
            Verwalte, welche E-Mail-Benachrichtigungen du erhalten möchtest.
          </p>

          {notificationMessage && (
            <div className={`p-3 rounded-md mb-4 ${
              notificationMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {notificationMessage.text}
            </div>
          )}

          {notificationLoaded ? (
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactFormEmails}
                  onChange={(e) => setContactFormEmails(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                />
                <div>
                  <span className="font-semibold text-gray-800">Kontaktformular E-Mails</span>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Erhalte E-Mails, wenn jemand das Kontaktformular für deine Events nutzt.
                  </p>
                </div>
              </label>

              <div className="mt-6">
                <button
                  onClick={handleSaveNotifications}
                  disabled={savingNotifications}
                  className="bg-[#003366] text-white px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingNotifications ? 'Speichern...' : 'Einstellungen speichern'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Laden...</p>
          )}
        </div>
      </div>
    </div>
  );
}
