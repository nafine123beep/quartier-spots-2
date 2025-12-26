"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FlohmarktProvider } from "@/app/flohmarkt/FlohmarktContext";
import SetUsernamePage from "./steps/SetUsernamePage";
import SetPasswordPage from "./steps/SetPasswordPage";
import OrganizationSetupPage from "./steps/OrganizationSetupPage";

type OnboardingStep = "username" | "password" | "organization";

export default function OnboardingPage() {
    return (
        <FlohmarktProvider>
            <OnboardingContent />
        </FlohmarktProvider>
    );
}

function OnboardingContent() {
    const supabase = createClient();
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState<OnboardingStep>("username");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [userEmail, setUserEmail] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkUser() {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/auth/login");
                return;
            }

            setUserEmail(session.user.email);

            // Check if user has already completed some steps
            const { data: profile } = await supabase
                .from("profiles")
                .select("display_name")
                .eq("id", session.user.id)
                .maybeSingle();

            // Check if user has any memberships
            const { data: memberships } = await supabase
                .from("memberships")
                .select("id")
                .eq("user_id", session.user.id)
                .limit(1);

            // If user has memberships, redirect to dashboard
            if (memberships && memberships.length > 0) {
                router.push("/flohmarkt/organizations");
                return;
            }

            // If user has display_name, skip to password step
            if (profile?.display_name) {
                setUsername(profile.display_name);
                setCurrentStep("password");
            }

            setIsLoading(false);
        }

        checkUser();
    }, [supabase, router]);

    const handleUsernameComplete = async (name: string) => {
        setUsername(name);

        // Save username to profile
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            // First try to update existing profile
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    display_name: name,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", session.user.id);

            // If update failed (profile doesn't exist), try to insert
            if (updateError) {
                console.log("Update failed, trying insert:", updateError);
                const { error: insertError } = await supabase
                    .from("profiles")
                    .insert({
                        id: session.user.id,
                        display_name: name,
                        email: session.user.email,
                        updated_at: new Date().toISOString(),
                    });

                if (insertError) {
                    console.error("Error saving profile:", insertError);
                    console.error("Error details:", JSON.stringify(insertError, null, 2));

                    // If it's an RLS error, we'll let it slide and continue
                    // The profile will be created by the createTenant/joinTenant functions
                    if (insertError.code !== 'PGRST301' && !insertError.message?.includes('row-level security')) {
                        const errorMessage = insertError.message || insertError.hint || insertError.details || "Unbekannter Fehler";
                        alert("Fehler beim Speichern des Profils: " + errorMessage);
                        return;
                    } else {
                        console.log("Skipping RLS error - profile will be created later");
                        // Store the display name in localStorage temporarily
                        localStorage.setItem('pending_display_name', name);
                    }
                }
            }
        }

        setCurrentStep("password");
    };

    const handlePasswordComplete = async (pwd: string) => {
        setPassword(pwd);

        // Update user password in Supabase Auth
        const { error } = await supabase.auth.updateUser({
            password: pwd,
        });

        if (error) {
            console.error("Error setting password:", error);
            alert("Fehler beim Setzen des Passworts: " + error.message);
            return;
        }

        setCurrentStep("organization");
    };

    const handleOrganizationComplete = () => {
        // Redirect to dashboard
        router.push("/flohmarkt/organizations");
    };

    const handleBackToUsername = () => {
        setCurrentStep("username");
    };

    const handleBackToPassword = () => {
        setCurrentStep("password");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
                    <p className="mt-4 text-gray-600">Lädt...</p>
                </div>
            </div>
        );
    }

    if (currentStep === "username") {
        return <SetUsernamePage onComplete={handleUsernameComplete} initialEmail={userEmail} />;
    }

    if (currentStep === "password") {
        return (
            <SetPasswordPage
                onComplete={handlePasswordComplete}
                onBack={handleBackToUsername}
                username={username}
            />
        );
    }

    if (currentStep === "organization") {
        return (
            <OrganizationSetupPage
                onComplete={handleOrganizationComplete}
                onBack={handleBackToPassword}
                username={username}
            />
        );
    }

    return null;
}
