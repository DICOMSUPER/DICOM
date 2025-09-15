"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import NavigationTabs from "./NavigationTabs";
import ImagingOrderList from "./ImagingOrderList";
import Loading from "../common/Loading";
import { ModalityCode } from "./data/modality";
import Pagination from "../common/Pagination";

type ImagingOrder = {
  order_status?: "in_progress" | "cancelled" | "completed";
  [key: string]: unknown;
};

export default function ImageTechnicianPageWrapper() {
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [imagingOrders, setImagingOrders] = useState<ImagingOrder[]>([]);

  // filters
  const [statusFilter, setStatusFilter] = useState<
    "all" | "in_progress" | "completed" | "cancelled"
  >("in_progress");
  const [urgencyFilter, setUrgencyFilter] = useState<
    "" | "routine" | "urgent" | "stat"
  >("");
  const [modalityFilter, setModalityFilter] = useState<"" | ModalityCode>("");
  const [patientName, setPatientName] = useState<string>("");

  const fetchImagingOrder = async () => {
    try {
      setIsLoading(true);

      // Build params; omit order_status when status is 'all'
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("order_status", statusFilter);
      if (urgencyFilter) params.append("urgency", urgencyFilter);

      //mock api pagination
      params.append("page", page.toString());
      params.append("limit", size.toString());

      // //patientName not filtered because mockapi not support nest query
      // if (patientName.trim()) {
      //   params.append("patientName", patientName);
      // }

      //the data here does not follow db, is deeply nested, need to adjust to later, which could use many api, or just 1 join table
      // 1. Get order by order_id
      // 2. Get user (physician,receiption...), modality, visit, patient, room...
      const url = `https://67de69d0471aaaa742845858.mockapi.io/imaging_order?${params.toString()}`;

      const ordersResponse = await axios.get(url);
      let data = ordersResponse.data as ImagingOrder[];

      // client-side filter by patient name
      if (patientName.trim()) {
        const query = patientName.trim().toLowerCase();
        data = data.filter((order: any) => {
          const first =
            order?.visit?.patient?.first_name?.toString().toLowerCase() ?? "";
          const last =
            order?.visit?.patient?.last_name?.toString().toLowerCase() ?? "";
          const full = `${first} ${last}`.trim();
          return (
            first.includes(query) ||
            last.includes(query) ||
            full.includes(query)
          );
        });
      }

      // client-side filter by modality code
      if (modalityFilter) {
        data = data.filter(
          (order: any) => order?.modality?.modality_code === modalityFilter
        );
      }

      setImagingOrders(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setImagingOrders([]);
      setIsLoading(false);
    }
  };

  // Only fetch once on mount. Subsequent fetches are triggered by the Search button.
  useEffect(() => {
    fetchImagingOrder();
  }, [page, size]);

  if (isLoading) return <Loading />;
  return (
    <div>
      <NavigationTabs
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        urgencyFilter={urgencyFilter}
        setUrgencyFilter={setUrgencyFilter}
        modalityFilter={modalityFilter}
        setModalityFilter={setModalityFilter}
        patientName={patientName}
        setPatientName={setPatientName}
        onGo={fetchImagingOrder}
      ></NavigationTabs>

      <>
        <>
          {imagingOrders.length > 0 ? (
            <ImagingOrderList orders={imagingOrders} />
          ) : (
            <div>No orders found</div>
          )}
        </>
      </>
      <Pagination
        page={page}
        size={10}
        maxPage={1}
        theme="light"
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
