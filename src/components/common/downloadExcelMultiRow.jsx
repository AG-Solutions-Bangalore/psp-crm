import ExcelJS from "exceljs";
import moment from "moment";

const downloadExcelMultiRow = async ({
  data,
  sheetName = "Report",
  headers = [],
  getRowData,
  fileNamePrefix = "report",
  emptyDataCallback,
  toast,
  customFormat = false,
}) => {
  if (!data || data.length === 0) {
    if (toast && emptyDataCallback) toast(emptyDataCallback());
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);


  const titleRow = worksheet.addRow([sheetName]);
  worksheet.mergeCells(
    `A${titleRow.number}:${String.fromCharCode(64 + (headers.length || 1))}${
      titleRow.number
    }`
  );
  titleRow.font = { bold: true, size: 14 };
  titleRow.alignment = { horizontal: "center" };
  worksheet.addRow([]);

  if (customFormat) {
  
    data.forEach((row) => {
      if (row.isHeader) {
        const headerRow = worksheet.addRow(row.values);
        worksheet.mergeCells(`A${headerRow.number}:${String.fromCharCode(64 + row.values.length)}${headerRow.number}`);
        headerRow.font = { bold: true, size: 12 };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
      } else if (row.isFooter) {
        const footerRow = worksheet.addRow(row.values);
        footerRow.font = { bold: true };
        footerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE5E7EB" },
        };
      } else if (row.values && row.values.length > 0) {
        const dataRow = worksheet.addRow(row.values);
        if (!headers.length && dataRow.number === 1) {
          // Auto-detect headers if not provided
          dataRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF82B8A4" },
            };
          });
        }
      } else {
        worksheet.addRow([]); 
      }
    });
  } else {
 
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

 
    data.forEach((item) => {
      const rowData = getRowData(item);
      if (!Array.isArray(rowData)) return;
      worksheet.addRow(rowData);
    });

   
    const numericColumns = [];
    if (data.length > 0) {
      const firstRow = getRowData(data[0]);
      firstRow.forEach((val, i) => {
        if (typeof val === "number") numericColumns.push(i);
      });
    }

    if (numericColumns.length > 0) {
      const totals = Array(headers.length).fill("");
      totals[0] = "Total";
      
      numericColumns.forEach(col => {
        totals[col] = data.reduce((sum, item) => {
          const row = getRowData(item);
          return sum + (Number(row[col]) || 0);
        }, 0);
      });

      const totalRow = worksheet.addRow(totals);
      totalRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE5E7EB" },
        };
      });
    }
  }


  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      let columnLength = 0;
      if (cell.value) {
        columnLength = cell.value.toString().length;
      }
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = Math.min(Math.max(maxLength + 2, 10), 30);
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

export default downloadExcelMultiRow;