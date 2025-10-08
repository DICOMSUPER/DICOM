import ImagingPageWrapper from "@/components/imaging-technicians/imaging/ImagingPageWrapper";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <ImagingPageWrapper order_id={id} />;
}
