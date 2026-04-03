"use client";
import React from "react";
import { getAdsenseConfig } from "../config";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical";
  className?: string;
}

export function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
  const config = getAdsenseConfig();

  if (!config.enabled) {
    return <div className={`ad-placeholder ${className}`} />;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={config.publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
