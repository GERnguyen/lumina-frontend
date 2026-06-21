import { PaymentReturnHandler } from "@/components/checkout/PaymentReturnHandler";

type StripeReturnPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function StripeReturnPage({ searchParams }: StripeReturnPageProps) {
  return <PaymentReturnHandler searchParams={searchParams} defaultProvider="STRIPE" />;
}
