import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Trash2, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";
import { getWasteLevel } from "@/routes/common/WasteLevel";
import { ButtonConfig } from "@/config/ButtonConfig";

const TabbedTable = ({
  rawMaterialRows,
  granualsRows,
  itemData,
  handleChange,
  addRawRow,
  addGranualsRow,
  removeRawRow,
  removeGranualsRow,
  deleteRow,
  deleteRow1,
  colorData,
}) => {
  const [activeTab, setActiveTab] = useState("first");
  const isInput = activeTab === "first";

  // const totalInputWeight = rawMaterialRows.reduce(
  //   (acc, row) => acc + (parseFloat(row.raw_material_sub_to_p_weight) || 0),
  //   0
  // );

  // const totalOutputWeight = granualsRows.reduce(
  //   (acc, row) => acc + (parseFloat(row.granuals_from_p_weight) || 0),
  //   0
  // );

  // const estimatedWaste =
  //   totalInputWeight > 0
  //     ? (
  //         ((totalInputWeight - totalOutputWeight) / totalInputWeight) *
  //         100
  //       ).toFixed(2)
  //     : "0.00";

  // const estimatedWasteNum = parseFloat(estimatedWaste);
  // const efficiency = 100 - estimatedWasteNum;
  // const level = getWasteLevel(
  //   estimatedWasteNum < 0 ? -1 : estimatedWasteNum,
  //   efficiency
  // );
  // const textColor = ButtonConfig.wasteLevels[level].textColor;
  const totalInputWeight = rawMaterialRows.reduce(
    (acc, row) => acc + (parseFloat(row.raw_material_sub_to_p_weight) || 0),
    0
  );

  const totalOutputWeight = granualsRows.reduce(
    (acc, row) => acc + (parseFloat(row.granuals_from_p_weight) || 0),
    0
  );

  let estimatedWaste = "0.00";
  let level = "optimal";

  if (totalOutputWeight == 0 && totalInputWeight > 0) {
    level = "underProduction";
  } else if (totalInputWeight > 0) {
    const wastePercent =
      ((totalInputWeight - totalOutputWeight) / totalInputWeight) * 100;
    estimatedWaste = wastePercent.toFixed(2);
    const efficiency = 100 - wastePercent;

    level = getWasteLevel(wastePercent < 0 ? -1 : wastePercent, efficiency);
  }

  const textColor = ButtonConfig.wasteLevels[level].textColor;

  return (
    <>
      <Tabs defaultValue="first" onValueChange={setActiveTab}>
        <div className="flex justify-center w-full my-4">
          <TabsList className="w-full flex justify-center bg-gray-100 p-1 rounded-md">
            <TabsTrigger
              value="first"
              className="w-full data-[state=active]:bg-[#1f7a57] data-[state=active]:text-white rounded-md transition-colors"
            >
              Raw Material
            </TabsTrigger>
            <TabsTrigger
              value="second"
              className="w-full data-[state=active]:bg-[#1f7a57] data-[state=active]:text-white rounded-md transition-colors"
            >
              Granuals
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="first">
          <TableSection
            rows={rawMaterialRows}
            itemData={itemData}
            addRow={addRawRow}
            removeRow={removeRawRow}
            deleteRow={deleteRow}
            handleChange={handleChange}
            fields={[
              "raw_material_sub_to_p_item_id",
              "raw_material_sub_to_p_weight",
            ]}
            labels={["Item", "Weight"]}
            placeholders={["Select Item", "Enter Weight"]}
          />
        </TabsContent>

        <TabsContent value="second">
          <TableSection
            rows={granualsRows}
            itemData={colorData}
            addRow={addGranualsRow}
            removeRow={removeGranualsRow}
            deleteRow={deleteRow1}
            handleChange={handleChange}
            fields={[
              "granuals_from_p_color_id",
              "granuals_from_p_bags",
              "granuals_from_p_weight",
            ]}
            labels={["Color", "Bags", "Weight"]}
            placeholders={["Select Color", "Enter Bags", "Enter Weight"]}
          />
        </TabsContent>
      </Tabs>
      <div className="text-right mt-6 pr-4 text-sm font-medium">
        <div>
          Total {isInput ? "Input" : "Output"} Weight:{" "}
          {(isInput ? totalInputWeight : totalOutputWeight).toFixed(2)} kg
        </div>
        {/* <div
          className={`${
            parseFloat(estimatedWaste) < 0 || parseFloat(estimatedWaste) >= 40
              ? "text-red-800"
              : parseFloat(estimatedWaste) < 20
              ? "text-green-800"
              : "text-orange-600"
          }`}
        >
          Estimated Waste: {`${estimatedWaste}%`}
        </div> */}
        <span className={`${textColor}`}>
          {level == "underProduction"
            ? "Under Production"
            : `Estimated Waste: ${estimatedWaste}%`}
        </span>
      </div>
    </>
  );
};

const TableSection = ({
  rows,
  itemData,
  addRow,
  removeRow,
  deleteRow,
  handleChange,
  fields,
  labels,
  placeholders,
}) => {
  return (
    <div className="grid grid-cols-1 mt-4">
      <Table className="border border-gray-300 rounded-lg shadow-sm">
        <TableHeader>
          <TableRow className="bg-gray-100">
            {labels.map((label, index) => (
              <TableHead
                key={index}
                className="text-sm font-semibold text-gray-600 px-4 py-3"
              >
                {label}
              </TableHead>
            ))}
            <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 text-center w-[10%]">
              <div className="flex justify-center items-center gap-2">
                Action
                <PlusCircle
                  onClick={addRow}
                  className="cursor-pointer text-blue-500 hover:text-gray-800 h-4 w-4 "
                />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className="border-t border-gray-200 hover:bg-gray-50"
            >
              {fields.map((field, fieldIndex) => (
                <TableCell
                  key={fieldIndex}
                  className="px-4 py-3 align-top w-[30%]"
                >
                  {field.includes("id") ? (
                    <MemoizedProductSelect
                      value={row[field]}
                      onChange={(e) => handleChange(e, rowIndex, field)}
                      options={
                        itemData?.data?.map((item) => ({
                          value: item.id,
                          label: item.color || item.item_name,
                        })) || []
                      }
                      placeholder={placeholders[fieldIndex]}
                    />
                  ) : (
                    <Input
                      className="bg-white border border-gray-300 rounded-lg "
                      value={row[field] || ""}
                      placeholder={placeholders[fieldIndex]}
                      maxLength={10}
                      onChange={(e) => handleChange(e, rowIndex, field)}
                    />
                  )}
                </TableCell>
              ))}

              <TableCell className="p-2 align-middle">
                {row.id !== undefined && row.id !== null ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        console.log("Deleting row with ID:", row.id);
                        deleteRow(row.id);
                      }}
                      className="text-red-500"
                      disabled={rows.length == 1}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => removeRow(rowIndex)}
                    className="text-red-500"
                    disabled={rows.length == 1}
                    type="button"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TabbedTable;
