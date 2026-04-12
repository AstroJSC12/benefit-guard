export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full animate-in fade-in duration-150">{children}</div>
  );
}
