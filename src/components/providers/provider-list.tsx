"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Provider } from "@/types";
import { formatProviderType } from "@/lib/providers";
import {
  MapPin,
  Phone,
  Building2,
  Search,
  Loader2,
  Hospital,
  Stethoscope,
  AlertCircle,
  Star,
  ExternalLink,
  Pill,
  SmilePlus,
  Navigation,
  ArrowUpDown,
  Clock,
  ChevronDown,
  Globe,
  Shield,
  X,
  Map,
} from "lucide-react";

type ProviderType = "all" | "urgent_care" | "hospital" | "clinic" | "pharmacy" | "dentist";
type SortMode = "none" | "distance" | "rating";

const FILTER_OPTIONS: { value: ProviderType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "urgent_care", label: "Urgent Care" },
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "dentist", label: "Dentist" },
];

export function ProviderList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProviderType>("all");
  const [searchLocation, setSearchLocation] = useState("");
  const [resolvedLocation, setResolvedLocation] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("none");
  const [showMapsMenu, setShowMapsMenu] = useState<string | null>(null);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [insurer, setInsurer] = useState<{ id: string; name: string; finderUrl: string } | null>(null);

  useEffect(() => {
    fetchProviders();
  }, [filter]);

  // Close maps dropdown when clicking outside
  useEffect(() => {
    if (!showMapsMenu) return;
    const handleClickOutside = () => setShowMapsMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMapsMenu]);

  // Detect user's insurer from their uploaded documents
  useEffect(() => {
    fetch("/api/user/insurer")
      .then((res) => res.json())
      .then((data) => {
        if (data.insurer) setInsurer(data.insurer);
      })
      .catch(() => {});
  }, []);

  // Client-side sort + open-now filter (avoids re-fetching from API)
  const displayProviders = useMemo(() => {
    let list = [...providers];

    if (openNowOnly) {
      list = list.filter((p) => p.openNow === true);
    }

    if (sortMode !== "none") {
      list.sort((a, b) => {
        if (sortMode === "rating") {
          return (b.rating ?? 0) - (a.rating ?? 0);
        }
        // distance
        const distA = parseFloat(a.distance?.replace(" miles", "") || "999");
        const distB = parseFloat(b.distance?.replace(" miles", "") || "999");
        return distA - distB;
      });
    }

    return list;
  }, [providers, sortMode, openNowOnly]);

  const fetchProviders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.set("type", filter);
      }
      if (searchLocation) {
        params.set("location", searchLocation);
      }

      const response = await fetch(`/api/providers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers || []);
        if (isInitialLoad && data.location && !searchLocation) {
          setSearchLocation(data.location);
          setIsInitialLoad(false);
        }
        setResolvedLocation(data.location || "");
      } else {
        setError("Unable to load providers. Please try again.");
      }
    } catch (err) {
      console.error("Failed to fetch providers:", err);
      setError("Connection error. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case "hospital":
        return <Hospital className="w-5 h-5" />;
      case "urgent_care":
        return <Stethoscope className="w-5 h-5" />;
      case "pharmacy":
        return <Pill className="w-5 h-5" />;
      case "dentist":
        return <SmilePlus className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  const getProviderBadgeVariant = (
    type: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "hospital":
        return "destructive";
      case "urgent_care":
        return "default";
      default:
        return "secondary";
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.25;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < fullStars
                ? "fill-amber-400 text-amber-400"
                : i === fullStars && hasHalf
                  ? "fill-amber-400/50 text-amber-400"
                  : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  const toggleExpand = (id: string) => {
    setShowMapsMenu(null);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Search + Type Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Zip code or address"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="max-w-[280px]"
          />
          <Button type="submit" variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <Button
              key={value}
              variant={filter === value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Sort + Open Now controls */}
      {!isLoading && !error && providers.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ArrowUpDown className="w-4 h-4" />
            <span>Sort:</span>
          </div>
          <Button
            variant={sortMode === "distance" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortMode("distance")}
          >
            <Navigation className="w-3.5 h-3.5 mr-1.5" />
            Distance
          </Button>
          <Button
            variant={sortMode === "rating" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortMode("rating")}
          >
            <Star className="w-3.5 h-3.5 mr-1.5" />
            Rating
          </Button>
          {sortMode !== "none" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortMode("none")}
              className="px-1.5 text-muted-foreground hover:text-foreground"
              title="Clear sort"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}

          <div className="w-px h-5 bg-border mx-1" />

          <Button
            variant={openNowOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setOpenNowOnly(!openNowOnly)}
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Open Now
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Finding nearby providers...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={fetchProviders}>
            Try Again
          </Button>
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No providers found</h3>
          <p className="text-sm text-muted-foreground">
            {!resolvedLocation
              ? "Enter your zip code or address above to find nearby providers"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      ) : displayProviders.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No open providers right now</h3>
          <p className="text-sm text-muted-foreground">
            Try removing the &quot;Open Now&quot; filter to see all {providers.length} result{providers.length !== 1 ? "s" : ""}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {displayProviders.length} provider{displayProviders.length !== 1 ? "s" : ""}{resolvedLocation ? ` near ${resolvedLocation}` : ""}
            {openNowOnly ? " (open now)" : ""}
            {sortMode === "distance" ? " · sorted by distance" : sortMode === "rating" ? " · sorted by rating" : ""}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {displayProviders.map((provider) => {
              const isExpanded = expandedId === provider.id;
              const hasDetails = provider.weekdayHours?.length || provider.websiteUrl || provider.npi || insurer;

              return (
                <Card key={provider.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {getProviderIcon(provider.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold truncate">{provider.name}</h3>
                        <Badge variant={getProviderBadgeVariant(provider.type)} className="flex-shrink-0">
                          {formatProviderType(provider.type)}
                        </Badge>
                      </div>

                      {/* Rating + Open/Closed */}
                      <div className="flex items-center gap-3 mt-1.5">
                        {provider.rating != null && (
                          <div className="flex items-center gap-1.5">
                            {renderStars(provider.rating)}
                            <span className="text-xs text-muted-foreground">
                              {provider.rating.toFixed(1)}
                              {provider.totalRatings != null && (
                                <span> ({provider.totalRatings.toLocaleString()})</span>
                              )}
                            </span>
                          </div>
                        )}
                        {provider.openNow != null && (
                          <span className={`text-xs font-medium ${provider.openNow ? "text-emerald-600" : "text-red-500"}`}>
                            {provider.openNow ? "Open now" : "Closed"}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{provider.address}</span>
                        </div>
                        {provider.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <a
                              href={`tel:${provider.phone}`}
                              className="hover:text-primary transition-colors"
                            >
                              {provider.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Distance + Directions */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t">
                        <div className="flex items-center gap-3">
                          {provider.distance && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Navigation className="w-3.5 h-3.5" />
                              {provider.distance}
                            </div>
                          )}
                          {provider.address && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowMapsMenu(showMapsMenu === provider.id ? null : provider.id);
                                }}
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <Map className="w-3 h-3" />
                                Directions
                                <ChevronDown className="w-2.5 h-2.5" />
                              </button>
                              {showMapsMenu === provider.id && (
                                <div className="absolute left-0 top-full mt-1 z-20 bg-popover border rounded-md shadow-md py-1 min-w-[160px] animate-in fade-in slide-in-from-top-1 duration-150">
                                  <a
                                    href={
                                      provider.latitude && provider.longitude
                                        ? `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`
                                        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(provider.address)}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                                    onClick={() => setShowMapsMenu(null)}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Google Maps
                                  </a>
                                  <a
                                    href={
                                      provider.latitude && provider.longitude
                                        ? `maps://?daddr=${provider.latitude},${provider.longitude}`
                                        : `maps://?daddr=${encodeURIComponent(provider.address)}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                                    onClick={() => setShowMapsMenu(null)}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Apple Maps
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {hasDetails && (
                          <button
                            onClick={() => toggleExpand(provider.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {isExpanded ? "Less" : "More"}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>

                      {/* Expandable details */}
                      {isExpanded && hasDetails && (
                        <div className="mt-3 pt-3 border-t space-y-3 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                          {provider.weekdayHours && provider.weekdayHours.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Business Hours
                              </div>
                              <div className="grid gap-0.5 text-xs text-muted-foreground">
                                {provider.weekdayHours.map((line, i) => {
                                  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
                                  const isToday = line.toLowerCase().startsWith(today.toLowerCase());
                                  return (
                                    <span key={i} className={isToday ? "text-foreground font-medium" : ""}>
                                      {line}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {provider.websiteUrl && (
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                              <a
                                href={provider.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline truncate"
                              >
                                {provider.websiteUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                              </a>
                            </div>
                          )}
                          {provider.npi && (
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">NPI:</span>
                                <span className="font-mono">{provider.npi}</span>
                              </div>
                              {provider.taxonomy && (
                                <span className="text-muted-foreground truncate ml-2">{provider.taxonomy}</span>
                              )}
                            </div>
                          )}
                          {insurer && (
                            <a
                              href={insurer.finderUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors text-xs"
                            >
                              <Shield className="w-4 h-4 text-primary" />
                              <span>
                                <span className="font-medium">Check Network Status</span>
                                <span className="text-muted-foreground"> on {insurer.name}</span>
                              </span>
                              <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
