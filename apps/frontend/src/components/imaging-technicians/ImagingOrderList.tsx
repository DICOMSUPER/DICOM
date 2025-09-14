import React from "react";
import ImagingOrderCard from "./ImagingOrderCard";

export default function ImagingOrderList({ orders }: { orders: any[] }) {
  return (
    <div className="space-y-6">
      {orders &&
        orders.length > 0 &&
        orders.map((order) => (
          <div key={order.order_id}>
            <ImagingOrderCard order={order} />
          </div>
        ))}
      {(!orders || orders.length === 0) && <div>No order found</div>}
    </div>
  );
}
