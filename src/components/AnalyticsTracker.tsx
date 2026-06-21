"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const supabase = createClient();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid logging admin routes to keep stats focused on visitor traffic
    if (pathname.startsWith("/admin")) return;
    
    // Prevent duplicate tracking if pathname hasn't actually changed
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    // Retrieve or generate a session ID for tracking unique visitors
    let sessionId = sessionStorage.getItem("dorkhub_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("dorkhub_session_id", sessionId);
    }

    const logPageView = async () => {
      try {
        let countryCode = sessionStorage.getItem("dorkhub_visitor_country");
        if (!countryCode) {
          try {
            const geoRes = await fetch("https://ipapi.co/json/");
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData.country_code) {
                countryCode = geoData.country_code.toLowerCase();
                sessionStorage.setItem("dorkhub_visitor_country", countryCode);
              }
            }
          } catch (e) {
            console.error("Failed to geolocate page view:", e);
          }
        }

        await supabase.from("page_views").insert({
          session_id: sessionId,
          path: pathname,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          country_code: countryCode || null,
        });
      } catch (err) {
        console.error("Failed to log page view:", err);
      }
    };

    logPageView();
  }, [pathname, supabase]);

  return null;
}
