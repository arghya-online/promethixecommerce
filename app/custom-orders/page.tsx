import { CustomOrdersClient } from "@/components/custom-orders/custom-orders-client";

export const metadata = {
  title: "Custom Orders",
  description: "Tell us about your custom 3D print project.",
};

export default function CustomOrdersPage() {
  return <CustomOrdersClient />;
}
