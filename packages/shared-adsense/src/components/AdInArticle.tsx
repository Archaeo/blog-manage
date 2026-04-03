"use client";
import React from "react";
import { getAdsenseConfig } from "../config";

interface AdInArticleProps {
  slot: string;
  className?: string;
}

export function AdInArticle({ slot, className = "" }: AdInArticleProps) {
  const config = getAdsenseConfig();

  if (!config.enabled) {
    return <div className={`ad-placeholder-inline ${className}`} />;
  }

  return (
    <div className={`my-6 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client={config.publisherId}
        data-ad-slot={slot}
        data-ad-layout="in-article"
        data-ad-format="fluid"
      />
    </div>
  );
}
