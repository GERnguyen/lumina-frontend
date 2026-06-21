import { PaymentReturnHandler } from "@/components/checkout/PaymentReturnHandler";

type MomoReturnPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function MomoReturnPage({ searchParams }: MomoReturnPageProps) {
  return <PaymentReturnHandler searchParams={searchParams} defaultProvider="MOMO" />;
}
