import { PaymentReturnHandler } from "@/components/checkout/PaymentReturnHandler";

type CheckoutRedirectPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function CheckoutRedirectPage({ searchParams }: CheckoutRedirectPageProps) {
  return <PaymentReturnHandler searchParams={searchParams} />;
}
