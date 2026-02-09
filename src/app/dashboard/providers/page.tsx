import { ProviderList } from "@/components/providers/provider-list";

export default function ProvidersPage() {
  return (
    <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Find Healthcare Providers</h1>
        <p className="text-muted-foreground">
          Search for nearby urgent care, hospitals, clinics, pharmacies, and dentists
        </p>
      </div>

      <ProviderList />
    </div>
  );
}
