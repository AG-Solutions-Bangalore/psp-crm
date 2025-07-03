import ExcelJS from "exceljs";
import moment from "moment";

const downloadExcel = async ({
  data,
  sheetName = "Report",
  headers = [],
  getRowData,
  fileNamePrefix = "report",
  emptyDataCallback,
  toast,
}) => {
  if (!data || data.length === 0) {
    if (toast && emptyDataCallback) toast(emptyDataCallback());
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Title row
  // worksheet.addRow([sheetName]).font = { bold: true };
  // worksheet.addRow([]);
  const titleRow = worksheet.addRow([sheetName]);
  worksheet.mergeCells(
    `A${titleRow.number}:${String.fromCharCode(64 + headers.length)}${
      titleRow.number
    }`
  );
  titleRow.font = { bold: true, size: 14 };
  titleRow.alignment = { horizontal: "center" };
  worksheet.addRow([]);
  // Header row
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "000000" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF82B8A4" },
    };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
    };
  });

  const numericTotals = Array(headers.length).fill(0);

  // Data rows
  data.forEach((item) => {
    const rowData = getRowData(item);
    if (!Array.isArray(rowData)) return;
    //   worksheet.addRow(rowData);

    //   rowData.forEach((val, i) => {
    //     if (typeof val === "number") {
    //       numericTotals[i] += val;
    //     }
    //   });
    // });

    // // const totalLabelIndex = headers.findIndex((h) => /total|amount/i.test(h));
    //new end

    const row = worksheet.addRow(rowData);
    const closingStockIndex = headers.findIndex((h) =>
      /closing stock/i.test(h)
    );
    const closingStock = rowData[closingStockIndex];
    if (typeof closingStock == "number" && closingStock < 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFB3B3" },
        };
      });
    }

    rowData.forEach((val, i) => {
      if (typeof val === "number") {
        numericTotals[i] += val;
      }
    });
  });
  //new end
  const totalRowData = headers.map((_, i) =>
    i === 0
      ? "Total"
      : typeof numericTotals[i] === "number"
      ? numericTotals[i]
      : ""
  );
  const totalRow = worksheet.addRow(totalRowData);
  totalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" },
    };
  });

  worksheet.columns.forEach((col) => {
    col.width = 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileNamePrefix}_${moment().format("YYYY-MM-DD")}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

export default downloadExcel;
