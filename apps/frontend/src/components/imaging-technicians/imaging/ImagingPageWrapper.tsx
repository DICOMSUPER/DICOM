"use client";
import axios from "axios";
import { Camera } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import OrderInfo from "./OrderInfo";
import Loading from "@/components/common/Loading";
import UploadedStudies from "./UploadedStudies";
import FileUpload from "./FileUpload";

export default function ImagingPageWrapper({ order_id }: { order_id: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [studies, setStudies] = useState<any[]>([]);
  const [files, setFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchStudies = async () => {
    try {
      setIsLoading(true);

      //the data here does not follow db, is deeply nested, need to adjust to later, which could use many api, or just 1 join table
      // 1. Get studies by order_id
      // 2. Get series by study_id
      // 3. Get instance by series_id
      const response = await axios.get(
        `https://67de69d0471aaaa742845858.mockapi.io/dicom_instance?order_id=${order_id}`
      );

      const studyMap = new Map();
      response.data.forEach((instance: any) => {
        const study = instance.series?.study;
        const series = instance.series;
        if (study && study.study_id && series && series.series_id) {
          if (!studyMap.has(study.study_id)) {
            studyMap.set(study.study_id, {
              ...study,
              series: new Map(),
            });
          }
          const studyData = studyMap.get(study.study_id);
          if (!studyData.series.has(series.series_id)) {
            studyData.series.set(series.series_id, {
              ...series,
              instances: [],
            });
          }
          studyData.series.get(series.series_id).instances.push({
            id: instance.id,
            instance_id: instance.instance_id,
            sop_instance_uid: instance.sop_instance_uid,
            instance_number: instance.instance_number,
            file_path: instance.file_path,
            file_name: instance.file_name,
            rows: instance.rows,
            columns: instance.columns,
            bits_allocated: instance.bits_allocated,
            bits_stored: instance.bits_stored,
            created_at: instance.created_at,
            is_deleted: instance.is_deleted,
          });
        }
      });

      const studiesArray = Array.from(studyMap.values()).map((study) => ({
        ...study,
        series: Array.from(study.series.values()),
      }));
      setStudies(studiesArray);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };
  const fetchOrder = async () => {
    try {
      setIsLoading(true);

      //the data here does not follow db, is deeply nested, need to adjust to later, which could use many api, or just 1 join table
      // 1. Get order by order_id
      // 2. Get user (physician,receiption...), modality, visit, patient, room...
      const response = await axios.get(
        `https://67de69d0471aaaa742845858.mockapi.io/imaging_order/${order_id}`
      );

      setOrder(response.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchStudies();
  }, [order_id]);

  if (isLoading) return <Loading />;
  return (
    <div>
      <div className="py-1">
        {order && <OrderInfo order={order}></OrderInfo>}
      </div>
      <div className="py-1">
        {order && <UploadedStudies studies={studies} />}
      </div>
      <div className="py-1">
        {order && (
          <FileUpload
            order={order}
            isImporting={isImporting}
            setIsImporting={setIsImporting}
            importProgress={importProgress}
            setImportProgress={setImportProgress}
            fileInputRef={fileInputRef}
            files={files}
            setFiles={setFiles}
          />
        )}
      </div>
    </div>
  );
}
