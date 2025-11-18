import ImagingPageWrapper from "@/components/imaging-technicians/imaging/imaging-page-wrapper";

interface PageProps {
  params: { id: string };
}

export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;
  return <ImagingPageWrapper order_id={id} />;
}
