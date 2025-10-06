"use client";

import { useEffect } from "react";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";

/**
 * AnalyticsWrapper configures Microsoft Application Insights on the client.
 * A runtime environment variable controls whether telemetry initializes so
 * local development remains clean.
 */
export function AnalyticsWrapper() {
  useEffect(() => {
    const connectionString = process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING;

    if (!connectionString) {
      return;
    }

    const appInsights = new ApplicationInsights({
      config: {
        connectionString,
        enableAutoRouteTracking: true
      }
    });

    appInsights.loadAppInsights();

    return () => {
      appInsights.flush();
    };
  }, []);

  return null;
}
