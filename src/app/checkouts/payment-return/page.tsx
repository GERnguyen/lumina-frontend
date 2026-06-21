import { PaymentReturnHandler } from "@/components/checkout/PaymentReturnHandler";

type PaymentReturnPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function PaymentReturnPage({ searchParams }: PaymentReturnPageProps) {
  return <PaymentReturnHandler searchParams={searchParams} />;
}
