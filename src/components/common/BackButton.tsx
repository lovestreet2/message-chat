"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BackButton({
    fallbackHref = "/chat",
    label = "Back",
}: {
    fallbackHref?: string;
    label?: string;
}) {
    const router = useRouter();

    function goBack() {
        // If user opened page directly, history may be empty → fallback to /chat
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
        }
        router.push(fallbackHref);
    }

    return (
        <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            className="gap-2 text-white/80 hover:text-white hover:bg-white/10"
        >
            <ArrowLeft className="h-4 w-4" />
            {label}
        </Button>
    );
}
