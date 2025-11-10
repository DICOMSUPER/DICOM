import ImagingPageWrapper from "@/components/imaging-technicians/imaging/ImagingPageWrapper";

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ImagingPageWrapper order_id={id} />;
}
