import { InstructorCard } from "../InstructorCard";

interface DataTableWrapperProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function DataTableWrapper({ children, footer, className }: DataTableWrapperProps) {
  return (
    <InstructorCard bodyClassName="p-0" footer={footer} className={className}>
      {children}
    </InstructorCard>
  );
}
