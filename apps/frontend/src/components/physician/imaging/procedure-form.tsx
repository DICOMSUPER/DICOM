import { ImagingProcedure } from "@/components/patients/detail/create-order-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImagingModality } from "@/common/interfaces/image-dicom/imaging_modality.interface";
import { ModalityMachine } from "@/common/interfaces/image-dicom/modality-machine.interface";
import { RequestProcedure } from "@/common/interfaces/image-dicom/request-procedure.interface";
import { useGetAllRequestProceduresQuery } from "@/store/requestProcedureAPi";
import { Trash2 } from "lucide-react";
import { BodyPart } from "@/common/interfaces/imaging/body-part.interface";

export function ProcedureForm({
  procedure,
  index,
  proceduresLength,
  imagingModalitiesData,
  bodyPartsData,
  updateProcedure,
  removeProcedure,
  selectedProcedureIds,
}: {
  procedure: ImagingProcedure;
  index: number;
  proceduresLength: number;
  imagingModalitiesData: any;
  bodyPartsData: any;
  updateProcedure: (
    id: string,
    field: keyof ImagingProcedure,
    value: string | boolean
  ) => void;
  removeProcedure: (id: string) => void;
  selectedProcedureIds: string[];
}) {
  const { data: proceduresData, isLoading: isProceduresLoading } =
    useGetAllRequestProceduresQuery(
      {
        bodyPartId: procedure.bodyPart,
        modalityId: procedure.modality,
      },
      {
        skip: !procedure.bodyPart || !procedure.modality,
      }
    );

  const availableProcedures =
    proceduresData?.data.filter(
      (proc) =>
        proc.id === procedure.procedureServiceId ||
        !selectedProcedureIds.includes(proc.id)
    ) || [];

  // Get unique modalities from imagingModalitiesData
  const uniqueModalities =
    imagingModalitiesData?.reduce((acc: any[], machine: ModalityMachine) => {
      if (
        machine.modality &&
        !acc.find((m) => m.id === (machine?.modality?.id as string))
      ) {
        acc.push(machine.modality);
      }
      return acc;
    }, []) || [];

  return (
    <div>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">
            Procedure {index + 1}
          </h3>
          {proceduresLength > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeProcedure(procedure.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">
              Modality <span className="text-red-500">*</span>
            </Label>
            <Select
              value={procedure.modality}
              onValueChange={(value) => {
                updateProcedure(procedure.id, "modality", value);
                // updateProcedure(procedure.id, "procedureServiceId", "");
              }}
            >
              <SelectTrigger
                className={`${
                  !procedure.modality ? "border-slate-300" : "border-teal-300"
                } w-full`}
              >
                <SelectValue placeholder="Select modality" />
              </SelectTrigger>
              <SelectContent>
                {uniqueModalities.map(
                  (modality: ImagingModality, modalityIndex: number) => (
                    <SelectItem
                      key={`${modality.id}-${modalityIndex}`}
                      value={modality.id}
                    >
                      {modality.modalityName}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">
              Body Part <span className="text-red-500">*</span>
            </Label>
            <Select
              value={procedure.bodyPart}
              onValueChange={(value) => {
                updateProcedure(procedure.id, "bodyPart", value);
                // updateProcedure(procedure.id, "procedureServiceId", "");
              }}
            >
              <SelectTrigger
                className={`${
                  !procedure.bodyPart ? "border-slate-300" : "border-teal-300"
                } w-full`}
              >
                <SelectValue placeholder="Select body part" />
              </SelectTrigger>
              <SelectContent>
                {bodyPartsData?.map(
                  (bodyPart: BodyPart, bodyPartIndex: number) => (
                    <SelectItem
                      key={`${bodyPart.id}-${bodyPartIndex}`}
                      value={bodyPart.id}
                    >
                      {bodyPart.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">
              Choose Procedure Service <span className="text-red-500">*</span>
            </Label>
            <Select
              value={procedure.procedureServiceId}
              onValueChange={(value) => {
                updateProcedure(procedure.id, "procedureServiceId", value);

                const selectedProc = proceduresData?.data.find(
                  (p: RequestProcedure) => p.id === value
                );

                updateProcedure(
                  procedure.id,
                  "procedureServiceName",
                  selectedProc?.name || ""
                );
              }}
              disabled={!procedure.modality || !procedure.bodyPart}
            >
              <SelectTrigger
                className={`${
                  !procedure.procedureServiceId
                    ? "border-slate-300"
                    : "border-teal-300"
                } w-full`}
              >
                <SelectValue
                  placeholder={
                    isProceduresLoading
                      ? "Loading..."
                      : !procedure.modality || !procedure.bodyPart
                      ? "Select modality & body part first"
                      : "Select procedure service"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableProcedures.length > 0 ? (
                  availableProcedures.map(
                    (proc: RequestProcedure, index: number) => (
                      <SelectItem key={`${proc.id}-${index}`} value={proc.id}>
                        {proc.name}
                      </SelectItem>
                    )
                  )
                ) : (
                  <div className="px-2 py-4 text-sm text-slate-500 text-center">
                    All procedures have been selected
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label className="text-slate-700 font-medium">
              Clinical Indication <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Enter clinical reason for this imaging procedure..."
              value={procedure.clinicalIndication}
              onChange={(e) =>
                updateProcedure(
                  procedure.id,
                  "clinicalIndication",
                  e.target.value
                )
              }
              className={`min-h-[80px] ${
                !procedure.clinicalIndication
                  ? "border-slate-300"
                  : "border-teal-300"
              }`}
            />
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label className="text-slate-700 font-medium">
              Special Instructions (Optional)
            </Label>
            <Textarea
              placeholder="Add any special instructions..."
              value={procedure.specialInstructions}
              onChange={(e) =>
                updateProcedure(
                  procedure.id,
                  "specialInstructions",
                  e.target.value
                )
              }
              className="min-h-[100px] border-slate-300"
            />
          </div>
                    <div className="space-y-2 md:col-span-3">
            <div className="flex items-center space-x-3">
              <Switch
                id={`contrast-${procedure.id}`}
                checked={procedure.contrastRequired || false}
                onCheckedChange={(checked) =>
                  updateProcedure(procedure.id, "contrastRequired", checked)
                }
              />
              <Label
                htmlFor={`contrast-${procedure.id}`}
                className="text-slate-700 font-medium cursor-pointer"
              >
                Contrast Required
              </Label>
            </div>
            <p className="text-xs text-slate-500 ml-11">
              Enable this if the procedure requires contrast material/dye
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
