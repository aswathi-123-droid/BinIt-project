import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (order) => {
  const doc = new jsPDF();


  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); 
  doc.text("BinIt", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Your Eco-friendly Waste Management Solution", 14, 27);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(
    "Order Invoice",
    pageWidth - 14,
    20,
    { align: "right" },
  );

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Order ID: #${order.orderId}`, pageWidth - 14, 27, {
    align: "right",
  });
  doc.text(
    `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
    pageWidth - 14,
    32,
    { align: "right" },
  );
  doc.text(`Status: ${order.status}`, pageWidth - 14, 37, { align: "right" });

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Address:", 14, 45);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  if (order.pickupAddress) {
    doc.text(order.pickupAddress.name || "", 14, 52);
    doc.text(order.pickupAddress.street || "", 14, 57);
    doc.text(
      `${order.pickupAddress.city}, ${order.pickupAddress.state} - ${order.pickupAddress.pincode}`,
      14,
      62,
    );
    doc.text(`Phone: ${order.pickupAddress.phone}`, 14, 67);
  }

  const tableColumn = ["Product", "Type", "Quantity", "Unit Price", "Total"];
  const tableRows = [];

 order.items.forEach((item) => {
    const itemData = [
      item.name,
      item.productId?.type === "junk"? "Junk / Scrap": item.productId?.type === "recyclable" ? "Recyclable": "Store Item",
      item.quantity,
      `Rs. ${item.productId.price}`,
      `Rs. ${item.price }`,
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    startY: 75,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129] }, 
  });

  const finalY = doc.lastAutoTable.finalY || 75;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  let summaryY = finalY + 10;
  const summaryX = pageWidth - 14;

  let currentY = summaryY;
  const addSummaryRow = (label, value, isBold = false) => {
    if (isBold) {
      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setFont(undefined, "normal");
      doc.setTextColor(100, 100, 100);
    }
    doc.text(label, summaryX - 40, currentY);
    doc.text(value, summaryX, currentY, { align: "right" });
    currentY += 6;
  };

  if (order.pricing) {
    if (order.pricing.storeItems) {
      addSummaryRow("Store Items:", `Rs. ${order.pricing.storeItems}`);
    }
    if (order.pricing.pickupServices) {
      addSummaryRow("Pickup Services:", `Rs. ${order.pricing.pickupServices}`);
    }
    if (order.pricing.subtotal) {
      addSummaryRow("Subtotal:", `Rs. ${order.pricing.subtotal}`);
    }
    if (order.pricing.earnings) {
      addSummaryRow("Earnings:", `- Rs. ${Math.abs(order.pricing.earnings)}`);
    }
    if (order.pricing.couponDiscount>0) {
      addSummaryRow("Coupon Discount:", `- Rs. ${order.pricing.couponDiscount}`);
    }
    if (order.pricing.offerDiscount>0) {
      addSummaryRow("Offer Discount:", `- Rs. ${order.pricing.offerDiscount}`);
    }
    if ( order.pricing.platformFee) {
      addSummaryRow("Platform Fee:", `Rs. ${order.pricing.platformFee}`);
    }
  

    currentY += 2; 
    doc.setLineWidth(0.5);
    doc.line(summaryX - 45, currentY - 4, summaryX, currentY - 4);

    addSummaryRow(
      order.pricing.totalAmount <= 0 ? "Total Payout:" : "Total Amount:",
      `Rs. ${Math.abs(order.pricing.totalAmount || 0)}`,
      true,
    );
  }

  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Thank you for choosing BinIt!",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 15,
    { align: "center" },
  );


  doc.save(`"Invoice"_${order.orderId}.pdf`);
};
