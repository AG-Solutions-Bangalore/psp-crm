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

const TabbedTableGranualToYarn = ({
  YarnRows,
  FabricRows,
  handleChange,
  addYarnRow,
  addFabricRow,
  removeYarnRow,
  removeFabricRow,
  deleteRowYarn,
  deleteRowFabric,
  colorData,
}) => {
  const [activeTab, setActiveTab] = useState("first");
  const isInput = activeTab === "first";

  const totalInputWeight = YarnRows.reduce(
    (acc, row) => acc + (parseFloat(row.yarn_to_fp_weight) || 0),
    0
  );

  const totalOutputWeight = FabricRows.reduce(
    (acc, row) => acc + (parseFloat(row.fabric_from_p_weight) || 0),
    0
  );

  const estimatedWaste =
    totalInputWeight > 0
      ? (
          ((totalInputWeight - totalOutputWeight) / totalInputWeight) *
          100
        ).toFixed(2)
      : "0.00";
  return (
    <>
      <Tabs defaultValue="first" onValueChange={setActiveTab}>
        <div className="flex justify-center w-full my-4">
          <TabsList className="w-full flex justify-center bg-gray-100 p-1 rounded-md">
            <TabsTrigger
              value="first"
              className="w-full data-[state=active]:bg-[#1f7a57] data-[state=active]:text-white rounded-md transition-colors"
            >
              Yarn
            </TabsTrigger>
            <TabsTrigger
              value="second"
              className="w-full data-[state=active]:bg-[#1f7a57] data-[state=active]:text-white rounded-md transition-colors"
            >
              Fabric
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="first">
          <TableSection
            rows={YarnRows}
            itemData={colorData}
            addRow={addYarnRow}
            removeRow={removeYarnRow}
            deleteRow={deleteRowYarn}
            handleChange={handleChange}
            fields={[
              "yarn_to_fp_sub_color_id",
              "yarn_to_fp_thickness",
              "yarn_to_fp_weight",
            ]}
            labels={["Color", "Thickness", "Weight"]}
            placeholders={["Select Color", "Enter Thickness", "Enter Weight"]}
          />
        </TabsContent>

        <TabsContent value="second">
          <TableSection
            rows={FabricRows}
            itemData={colorData}
            addRow={addFabricRow}
            removeRow={removeFabricRow}
            deleteRow={deleteRowFabric}
            handleChange={handleChange}
            fields={[
              "fabric_from_p_color_id",
              "fabric_from_p_mtr",
              "fabric_from_p_weight",
              "fabric_from_p_thickness",
            ]}
            labels={["Color", "Meter", "Weight", "Thickness"]}
            placeholders={[
              "Select Color",
              "Enter Meter",
              "Enter Weight",
              "Enter Thickness",
            ]}
          />
        </TabsContent>
      </Tabs>
      <div className="text-right mt-6 pr-4 text-sm font-medium">
        <div>
          Total {isInput ? "Input" : "Output"} Weight:{" "}
          {(isInput ? totalInputWeight : totalOutputWeight).toFixed(2)} kg
        </div>
        <div
          className={`${
            parseFloat(estimatedWaste) < 0 || parseFloat(estimatedWaste) >= 40
              ? "text-red-800"
              : parseFloat(estimatedWaste) < 20
              ? "text-green-800"
              : "text-orange-800"
          }`}
        >
          Estimated Waste: {`${estimatedWaste}%`}
        </div>
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
                className="text-sm font-semibold text-gray-600 px-4 py-3 w-[25%]"
              >
                {label}
              </TableHead>
            ))}
            <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 text-center w-[10%]">
              <div className="flex justify-center items-center gap-2">
                Action
                <PlusCircle
                  onClick={addRow}
                  className="cursor-pointer text-blue-500 hover:text-gray-800 h-4 w-4"
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
                <TableCell key={fieldIndex} className="px-4 py-3 align-top">
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
                      className="bg-white border border-gray-300 rounded-lg"
                      value={row[field] || ""}
                      placeholder={placeholders[fieldIndex]}
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

export default TabbedTableGranualToYarn;
