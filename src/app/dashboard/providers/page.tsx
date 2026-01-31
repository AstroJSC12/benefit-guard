import { ProviderList } from "@/components/providers/provider-list";

export default function ProvidersPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Find Healthcare Providers</h1>
        <p className="text-muted-foreground">
          Locate nearby urgent care centers, hospitals, and clinics
        </p>
      </div>

      <ProviderList />
    </div>
  );
}
