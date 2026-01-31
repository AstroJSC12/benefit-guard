"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

type ProviderType = "all" | "urgent_care" | "hospital" | "clinic";

export function ProviderList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProviderType>("all");
  const [searchZip, setSearchZip] = useState("");

  useEffect(() => {
    fetchProviders();
  }, [filter]);

  const fetchProviders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.set("type", filter);
      }
      if (searchZip) {
        params.set("zipCode", searchZip);
      }

      const response = await fetch(`/api/providers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Enter zip code"
            value={searchZip}
            onChange={(e) => setSearchZip(e.target.value)}
            className="max-w-[150px]"
          />
          <Button type="submit" variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {(["all", "urgent_care", "hospital", "clinic"] as const).map(
            (type) => (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type)}
              >
                {type === "all" ? "All" : formatProviderType(type)}
              </Button>
            )
          )}
        </div>
      </div>

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
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {providers.map((provider) => (
            <Card key={provider.id} className="p-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  {getProviderIcon(provider.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold truncate">{provider.name}</h3>
                    <Badge variant={getProviderBadgeVariant(provider.type)}>
                      {formatProviderType(provider.type)}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{provider.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <a
                        href={`tel:${provider.phone}`}
                        className="hover:text-primary"
                      >
                        {provider.phone}
                      </a>
                    </div>
                    {provider.distance && (
                      <p className="text-xs">{provider.distance} away</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
