import MachinePageWrapper from "@/components/imaging-technician/machines/machines-page-wrapper";
import { Suspense } from "react";
import Loading from "@/components/common/Loading";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <MachinePageWrapper />
    </Suspense>
  );
}
