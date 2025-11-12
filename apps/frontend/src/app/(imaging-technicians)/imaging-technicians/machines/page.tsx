import Loading from "@/components/common/Loading";
import MachinePageWrapper from "@/components/imaging-technicians/machines/machines-page-wrapper";
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <MachinePageWrapper />
      </Suspense>
    </div>
  );
}
