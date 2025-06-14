import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import {
  useFetchBuyers,
  useFetchCompanys,
  useFetchCountrys,
  useFetchPortofLoadings,
  useFetchPorts,
  useFetchProduct,
} from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChevronDown, MinusCircle, PlusCircle } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Page from "../dashboard/page";
import { ProgressBar } from "@/components/spinner/ProgressBar";

const MemoizedSelect = React.memo(
  ({ value, onChange, options, placeholder }) => {
    const selectOptions = options.map((option) => ({
      value: option.value,
      label: option.label,
    }));

    const selectedOption = selectOptions.find(
      (option) => option.value === value
    );

    const customStyles = {
      control: (provided, state) => ({
        ...provided,
        minHeight: "36px",
        borderRadius: "6px",
        borderColor: state.isFocused ? "black" : "#e5e7eb",
        boxShadow: state.isFocused ? "black" : "none",
        "&:hover": {
          borderColor: "none",
          cursor: "text",
        },
      }),
      option: (provided, state) => ({
        ...provided,
        fontSize: "14px",
        backgroundColor: state.isSelected
          ? "#A5D6A7"
          : state.isFocused
          ? "#f3f4f6"
          : "white",
        color: state.isSelected ? "black" : "#1f2937",
        "&:hover": {
          backgroundColor: "#EEEEEE",
          color: "black",
        },
      }),

      menu: (provided) => ({
        ...provided,
        borderRadius: "6px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }),
      placeholder: (provided) => ({
        ...provided,
        color: "#616161",
        fontSize: "14px",
        display: "flex",
        flexDirection: "row",
        alignItems: "start",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }),
      singleValue: (provided) => ({
        ...provided,
        color: "black",
        fontSize: "14px",
      }),
    };

    const DropdownIndicator = (props) => {
      return (
        <div {...props.innerProps}>
          <ChevronDown className="h-4 w-4 mr-3 text-gray-500" />
        </div>
      );
    };

    return (
      <Select
        value={selectedOption}
        onChange={(selected) => onChange(selected ? selected.value : "")}
        options={selectOptions}
        placeholder={placeholder}
        styles={customStyles}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator,
        }}
        // menuPortalTarget={document.body}
        //   menuPosition="fixed"
      />
    );
  }
);
const branch = {
  branch_short: "ASI",
  branch_name: "ADITYA SPICE INDUSTRIES",
  branch_address:
    "S.No. 155-1C,155-1B,156-2,156-3\r\nO V Road, Singara Botla Palem,\r\nPrakasam, Andhra Pradesh - 523109",
};
const CreateCosting = () => {
  const [initialRawMaterial, setInitialRawMaterial] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [costingeData, setCostingData] = useState({
    branch_short: branch?.branch_short,
    branch_name: branch?.branch_name,
    branch_address: branch?.branch_address,
    costing_inv_no: "",
    costing_pono: "",
    costing_sc_no: "",
    costing_consignee: "",
    costing_consignee_add: "",
    costing_product_id: "",
    costing_country: "",
    costing_port: "",
    costing_destination_country: "",
    costing_destination_port: "",
    costing_shipper: "",
    costing_raw_material: "",
    costing_process_loss: "",
    costing_grinding_charges: "",
    costing_pala_charges: "",
    costing_local_transport: "",
    costing_loading_unloading: "",
    costing_packing_material: "",
    costing_lab_testing_cost: "",
    costing_adding_oil_cost: "",
    costing_chennai_cfs_feight: "",
    costing_fright_charges: "",
    costing_c_f_charges: "",
    costing_amc_1: "",
    costing_purchase_expences: "",
    costing_labels: "",
    costing_ex_factory: "0.00",
    costing_ex_chennai: "0.00",
    costing_to_destination: "0.00",
    costing_over_head_margin: "3.30",
    costing_sale_rate: "",
    costing_exchange_rate: "1",
    costing_total_amount: "",
  });
  console.log(costingeData);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [consigneData, setConsigneData] = useState([
    {
      costingSub_date: "",
      costingSub_variety: "",
      costingSub_percentage: "",
      costingSub_rm_cost: "",
      costingSub_material_cost: "",
      costingSub_colour: "",
      costingSub_pungency: "",
      costingSub_ex_colour: "",
      costingSub_ex_pungency: "",
    },
  ]);
  useEffect(() => {
    console.log("Consigne Data:", consigneData);
  }, [consigneData]);

  const {
    data: costingDefaults = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["costingDefault", costingeData.costing_product_id], // Ensure dependency
    queryFn: async () => {
      console.log(
        "📡 Fetching costingDefaults for:",
        costingeData.costing_product_id
      );
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-costing-default/${costingeData.costing_product_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("✅ API Response:", response.data);
        return response.data.costingDefault;
      } catch (error) {
        console.error("❌ API Fetch Error:", error);
        return [];
      }
    },
    enabled: Boolean(costingeData.costing_product_id),
  });

  const { data: branchData } = useFetchCompanys();
  const { data: buyerData } = useFetchBuyers();
  const { data: productData } = useFetchProduct();
  const { data: countryData } = useFetchCountrys();
  const { data: portofLoadingData } = useFetchPortofLoadings();
  const { data: portsData } = useFetchPorts();

  useEffect(() => {
    if (
      !costingDefaults ||
      !Array.isArray(costingDefaults) ||
      costingDefaults.length === 0
    ) {
      //   console.warn("⚠️ costingDefaults is empty or not yet loaded!");
      return;
    }

    const getAmount = (type) =>
      costingDefaults.find((item) => item.costing_default_type === type)
        ?.costing_default_amount || "";

    setCostingData((prev) => ({
      ...prev,
      costing_raw_material: getAmount("Raw Material"),
      costing_process_loss: getAmount("Process Loss"),
      costing_grinding_charges: getAmount("Grinding Charges"),
      costing_pala_charges: getAmount("Pala Charges"),
      costing_local_transport: getAmount("Local Transport"),
      costing_loading_unloading: getAmount("Loading & Unloading"),
      costing_packing_material: getAmount("Packing Material"),
      costing_lab_testing_cost: getAmount("Lab Testing Cost"),
      costing_adding_oil_cost: getAmount("Adding Oil Cost"),
      costing_chennai_cfs_feight: getAmount("Chennai CFS Fright"),
      costing_fright_charges: getAmount("Fright Charges"),
      costing_c_f_charges: getAmount("C& F Charges"),
      costing_amc_1: getAmount("AMC 1%"),
      costing_purchase_expences: getAmount("Purchase Expences"),
      costing_labels: getAmount("Labels/Stickers"),
    }));
  }, [costingDefaults]);

  const handleInputChange = useCallback((field, value) => {
    console.log(value);
    setCostingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSelectChange = useCallback(
    (field, value) => {
      setCostingData((prev) => {
        const updatedData = { ...prev, [field]: value };

        console.log(`🔹 Field Changed: ${field}, Value: ${value}`);

        if (field === "costing_consignee") {
          const selectedBuyer = buyerData?.buyer?.find(
            (buyer) => buyer.buyer_name === value
          );

          if (selectedBuyer) {
            updatedData.costing_consignee_add = selectedBuyer.buyer_address;
            updatedData.costing_destination_port = selectedBuyer.buyer_port;
            updatedData.costing_destination_country =
              selectedBuyer.buyer_country;
          }
        }

        return updatedData;
      });
    },
    [branchData, buyerData, costingDefaults]
  );
  const handleRowDataChange = useCallback((rowIndex, field, value) => {
    setConsigneData((prev) => {
      const newData = [...prev];
      let sanitizedValue = value;

      const numericFields = [
        "costingSub_ex_colour",
        "costingSub_ex_pungency",
        "costingSub_pungency",
        "costingSub_colour",
        "costingSub_rm_cost",
        "costingSub_percentage",
        "costingSub_percentage",
      ];

      if (numericFields.includes(field)) {
        // Allow only numbers and decimal point
        sanitizedValue = value.replace(/[^\d.]/g, "");
        const decimalCount = (sanitizedValue.match(/\./g) || []).length;
        if (decimalCount > 1) return prev;
      }

      newData[rowIndex] = { ...newData[rowIndex], [field]: sanitizedValue };

      if (field === "costingSub_percentage" || field === "costingSub_rm_cost") {
        let percentageValue =
          parseFloat(newData[rowIndex].costingSub_percentage) || 0;

        let rmCost = parseFloat(newData[rowIndex].costingSub_rm_cost) || 0;
        newData[rowIndex].costingSub_material_cost = (
          (percentageValue / 100) *
          rmCost
        ).toFixed(2);
      }

      if (field === "costingSub_percentage" || field === "costingSub_colour") {
        let percentageValue =
          parseFloat(newData[rowIndex].costingSub_percentage) || 0;

        let rmCost = parseFloat(newData[rowIndex].costingSub_colour) || 0;

        newData[rowIndex].costingSub_ex_colour = (
          (percentageValue / 100) *
          rmCost
        ).toFixed(2);
      }
      if (
        field === "costingSub_percentage" ||
        field === "costingSub_pungency"
      ) {
        let percentageValue =
          parseFloat(newData[rowIndex].costingSub_percentage) || 0;

        let rmCost = parseFloat(newData[rowIndex].costingSub_pungency) || 0;

        newData[rowIndex].costingSub_ex_pungency = (
          (percentageValue / 100) *
          rmCost
        ).toFixed(2);
      }

      return newData;
    });
  }, []);

  useEffect(() => {
    if (initialRawMaterial === null && costingeData?.costing_raw_material) {
      const initial = Number(costingeData.costing_raw_material) || 0;
      setInitialRawMaterial(initial);
    }
  }, [costingeData, initialRawMaterial]);
  useEffect(() => {
    if (initialRawMaterial === null) return;

    const totalMaterialCost = consigneData.reduce((acc, item) => {
      const materialCost = Number(item.costingSub_material_cost) || 0;
      return acc + materialCost;
    }, 0);

    const updatedRawMaterial = initialRawMaterial + totalMaterialCost;

    console.log("initialRawMaterial", initialRawMaterial);
    console.log("updatedRawMaterial", updatedRawMaterial);

    setCostingData((prev) => ({
      ...prev,
      costing_raw_material: updatedRawMaterial.toFixed(2),
    }));
  }, [consigneData, initialRawMaterial]);

  const addRow = useCallback(() => {
    setConsigneData((prev) => [
      ...prev,
      {
        costingSub_date: "",
        costingSub_variety: "",
        costingSub_percentage: "",
        costingSub_rm_cost: "",
        costingSub_colour: "",
        costingSub_pungency: "",
        costingSub_ex_colour: "",
        costingSub_ex_pungency: "",
      },
    ]);
  }, []);

  const removeRow = useCallback(
    (index) => {
      if (consigneData.length > 1) {
        setConsigneData((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [consigneData.length]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = {
      costing_consignee: "Consignee Name",
      costing_consignee_add: "Consignee Address",
      costing_product_id: "Product ID",
      costing_country: "Country",
      costing_destination_country: "Destination Country",
      costing_destination_port: "Destination Port",
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !String(costingeData[key] || "").trim())
      .map(([_, label]) => `${label} is required`);

    // Check for missing fields in consigneData
    consigneData.forEach((row, index) => {
      if (!row.costingSub_date?.trim()) {
        missingFields.push(`Row ${index + 1}: Date is required`);
      }
      if (!row.costingSub_variety?.trim()) {
        missingFields.push(`Row ${index + 1}: Variety is required`);
      }
      if (!row.costingSub_percentage?.trim()) {
        missingFields.push(`Row ${index + 1}: Percentage is required`);
      }
      if (!row.costingSub_rm_cost?.trim()) {
        missingFields.push(`Row ${index + 1}: RM Cost is required`);
      }
    });

    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: (
          <div>
            {missingFields.map((msg, idx) => (
              <div key={idx}>{msg}</div>
            ))}
          </div>
        ),
        variant: "destructive",
      });
      return;
    }
    // Check if total percentage equals 100
    const totalPercentage = consigneData.reduce((sum, row) => {
      return sum + parseFloat(row.costingSub_percentage || 0);
    }, 0);

    if (totalPercentage !== 100) {
      toast({
        title: "Error",
        description: `Total percentage must be 100. Current total: ${totalPercentage.toFixed(
          2
        )}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitLoading(true);

      const data = {
        ...costingeData,
        costing_data: consigneData,
      };
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${BASE_URL}/api/panel-create-costing`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.code === 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });
        navigate("/costing");
      } else {
        toast({
          title: "Error",
          description: response.data.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.msg ||
          "An error occurred while submitting. Try again later.",
        variant: "destructive",
      });
      setSubmitLoading(false);

      console.error("Error submitting data:", error);
    } finally {
      setSubmitLoading(false);
    }
  };
  const fieldsToSum = [
    "costing_raw_material",
    "costing_process_loss",
    "costing_grinding_charges",
    "costing_pala_charges",
    "costing_local_transport",
    "costing_loading_unloading",
    "costing_packing_material",
    "costing_lab_testing_cost",
    "costing_adding_oil_cost",
    "costing_chennai_cfs_feight",
    "costing_fright_charges",
    "costing_c_f_charges",
    "costing_amc_1",
    "costing_purchase_expences",
    "costing_labels",
    "costing_over_head_margin",
  ];

  const anyValueEntered = fieldsToSum.some(
    (field) => costingeData[field] && costingeData[field] !== ""
  );

  if (!anyValueEntered) return;

  const totalINR = fieldsToSum
    .reduce((acc, field) => {
      const val = Number(costingeData[field]) || 0;
      return acc + val;
    }, 0)
    .toFixed(2);
  const exchangeRate = Number(costingeData.costing_exchange_rate) || 1;
  const totalUSD = totalINR / exchangeRate;

  const totalSales = Math.round(totalUSD * 1000);
  useEffect(() => {
    // Update calculated fields
    setCostingData((prev) => ({
      ...prev,
      costing_total_amount: totalINR,
      costing_sale_rate: totalSales,
    }));
  }, [
    costingeData.costing_raw_material,
    costingeData.costing_process_loss,
    costingeData.costing_grinding_charges,
    costingeData.costing_pala_charges,
    costingeData.costing_local_transport,
    costingeData.costing_loading_unloading,
    costingeData.costing_packing_material,
    costingeData.costing_lab_testing_cost,
    costingeData.costing_adding_oil_cost,
    costingeData.costing_chennai_cfs_feight,
    costingeData.costing_fright_charges,
    costingeData.costing_c_f_charges,
    costingeData.costing_amc_1,
    costingeData.costing_purchase_expences,
    costingeData.costing_labels,
    costingeData.costing_over_head_margin,
    costingeData.costing_exchange_rate,
  ]);
  const totalPercentage = consigneData.reduce(
    (acc, row) => acc + (parseFloat(row.costingSub_percentage) || 0),
    0
  );
  return (
    <Page>
      <form
        onSubmit={handleSubmit}
        className="w-full p-4 bg-blue-50/30 rounded-lg"
      >
        {" "}
        <Card className={`mb-6 ${ButtonConfig.cardColor} `}>
          <CardContent className="p-6">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-8 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between `}
                    >
                      <span>
                        {" "}
                        Consignee <span className="text-red-500">*</span>
                      </span>
                      <span></span>
                    </label>
                    <MemoizedSelect
                      value={costingeData.costing_consignee}
                      onChange={(value) =>
                        handleSelectChange("costing_consignee", value)
                      }
                      options={
                        buyerData?.buyer?.map((buyer) => ({
                          value: buyer.buyer_name,
                          label: buyer.buyer_name,
                        })) || []
                      }
                      placeholder="Select Consignee"
                    />
                  </div>

                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                      SC No.
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter SC No"
                      value={costingeData.costing_sc_no}
                      className="bg-white"
                      onChange={(e) =>
                        handleInputChange("costing_sc_no", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                      PONO.
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter  PoNo"
                      value={costingeData.costing_pono}
                      className="bg-white"
                      onChange={(e) =>
                        handleInputChange("costing_pono", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                      Invoice No.
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter  Invoice No"
                      value={costingeData.costing_inv_no}
                      className="bg-white"
                      onChange={(e) =>
                        handleInputChange("costing_inv_no", e.target.value)
                      }
                    />
                  </div>
                  {/* //Product */}
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between `}
                    >
                      <span>
                        Product <span className="text-red-500">*</span>
                      </span>
                      <span></span>
                    </label>
                    <MemoizedSelect
                      value={costingeData.costing_product_id}
                      onChange={(value) =>
                        handleSelectChange("costing_product_id", value)
                      }
                      options={
                        productData?.product?.map((product) => ({
                          value: product.id,
                          label: product.product_name,
                        })) || []
                      }
                      placeholder="Select Product"
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between `}
                    >
                      <span>
                        {" "}
                        Country <span className="text-red-500">*</span>
                      </span>
                      <span></span>
                    </label>
                    <MemoizedSelect
                      value={costingeData.costing_country}
                      onChange={(value) =>
                        handleSelectChange("costing_country", value)
                      }
                      options={
                        countryData?.country?.map((country) => ({
                          value: country.country_name,
                          label: country.country_name,
                        })) || []
                      }
                      placeholder="Select Costing. Country"
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between`}
                    >
                      <span>
                        {" "}
                        Port <span className="text-red-500">*</span>
                      </span>
                      <span></span>
                    </label>
                    <MemoizedSelect
                      value={costingeData.costing_port}
                      onChange={(value) =>
                        handleSelectChange("costing_port", value)
                      }
                      options={
                        portofLoadingData?.portofLoading?.map(
                          (portofLoading) => ({
                            value: portofLoading.portofLoading,
                            label: portofLoading.portofLoading,
                          })
                        ) || []
                      }
                      placeholder="Select Costing Port "
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium flex items-center justify-between`}
                    >
                      <span>
                        {" "}
                        Dest. Port <span className="text-red-500">*</span>
                      </span>
                      <span></span>
                    </label>
                    <MemoizedSelect
                      value={costingeData.costing_destination_port}
                      onChange={(value) =>
                        handleSelectChange("costing_destination_port", value)
                      }
                      options={
                        portsData?.country?.map((country) => ({
                          value: country.country_port,
                          label: country.country_port,
                        })) || []
                      }
                      placeholder="Select Destination Port"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto mt-6">
                  <Table className="w-full border rounded-lg">
                    <TableHeader>
                      <TableRow className="bg-gray-100 text-[13px] font-medium">
                        {[
                          "Date",
                          "Variety / %",
                          "RM / Material Cost ",
                          "Color / Ex-Color ",
                          "Pungency / Ex-Pungency",
                          "Action",
                        ].map((head, i) => (
                          <TableHead
                            key={i}
                            className="p-2 text-center border whitespace-nowrap"
                          >
                            {head}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consigneData.map((row, rowIndex) => (
                        <>
                          <TableRow
                            key={rowIndex}
                            className="hover:bg-gray-50 text-sm"
                          >
                            <TableCell className="p-1 border">
                              <Input
                                type="date"
                                value={row.costingSub_date}
                                onChange={(e) =>
                                  handleRowDataChange(
                                    rowIndex,
                                    "costingSub_date",
                                    e.target.value
                                  )
                                }
                                className="bg-white w-full"
                              />
                            </TableCell>
                            <TableCell className="p-1 border">
                              <div className="flex flex-col gap-1">
                                <Input
                                  type="text"
                                  value={row.costingSub_variety}
                                  onChange={(e) =>
                                    handleRowDataChange(
                                      rowIndex,
                                      "costingSub_variety",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Variety"
                                  className="bg-white w-full"
                                />
                                <Input
                                  type="text"
                                  value={row.costingSub_percentage}
                                  onChange={(e) =>
                                    handleRowDataChange(
                                      rowIndex,
                                      "costingSub_percentage",
                                      e.target.value
                                    )
                                  }
                                  placeholder="%"
                                  className="bg-white w-full"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="p-1 border">
                              <div className="flex flex-col gap-1">
                                <Input
                                  value={row.costingSub_rm_cost}
                                  onChange={(e) =>
                                    handleRowDataChange(
                                      rowIndex,
                                      "costingSub_rm_cost",
                                      e.target.value
                                    )
                                  }
                                  placeholder="RM Cost"
                                  className="bg-white w-full"
                                />
                                <Input
                                  value={row.costingSub_material_cost}
                                  onChange={(e) =>
                                    handleRowDataChange(
                                      rowIndex,
                                      "costingSub_material_cost",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Material Cost"
                                  className="bg-white w-full"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="p-1 border">
                              <div className="flex flex-col gap-1">
                                <Input
                                  value={row.costingSub_colour}
                                  onChange={(e) =>
                                    handleRowDataChange(
                                      rowIndex,
                                      "costingSub_colour",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Color"
                                  className="bg-white w-full"
                                />

                                <Input
                                  value={row.costingSub_ex_colour}
                                  onChange={(e) =>
                                    handleRowDataChange(
                                      rowIndex,
                                      "costingSub_ex_colour",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ex-Color"
                                  className="bg-white w-full"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="p-1 border">
                              <div className="flex flex-col gap-1">
                                <Input
                                  value={row.costingSub_pungency}
                                  onChange={(e) =>
                                    handleRowDataChange(
                                      rowIndex,
                                      "costingSub_pungency",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Pungency"
                                  className="bg-white w-full"
                                />
                                <Input
                                  value={row.costingSub_ex_pungency}
                                  onChange={(e) =>
                                    handleRowDataChange(
                                      rowIndex,
                                      "costingSub_ex_pungency",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ex-Pungency"
                                  className="bg-white w-full"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="p-1 border text-center w-10">
                              <Button
                                variant="ghost"
                                onClick={() => removeRow(rowIndex)}
                                className="text-red-500"
                                type="button"
                              >
                                <MinusCircle className="h-5 w-5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          {/* //Footer sum */}
                        </>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-gray-100 font-semibold text-sm text-center">
                        <TableCell className="p-2 border">Total</TableCell>
                        <TableCell
                          className={`p-2 border ${
                            totalPercentage !== 100
                              ? "text-red-500 font-semibold"
                              : "text-black"
                          }`}
                        >
                          {totalPercentage.toFixed(2)}%
                        </TableCell>

                        <TableCell className="p-2 border">
                          ₹{" "}
                          {consigneData
                            .reduce(
                              (acc, row) =>
                                acc +
                                (parseFloat(row.costingSub_material_cost) || 0),
                              0
                            )
                            .toFixed(2)}
                        </TableCell>
                        <TableCell className="p-2 border">
                          Ex-Color:{" "}
                          {consigneData
                            .reduce(
                              (acc, row) =>
                                acc +
                                (parseFloat(row.costingSub_ex_colour) || 0),
                              0
                            )
                            .toFixed(2)}
                        </TableCell>
                        <TableCell className="p-2 border">
                          Ex-Pungency:{" "}
                          {consigneData
                            .reduce(
                              (acc, row) =>
                                acc +
                                (parseFloat(row.costingSub_ex_pungency) || 0),
                              0
                            )
                            .toFixed(2)}
                        </TableCell>
                        <TableCell className="p-0 border"></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      onClick={addRow}
                      className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center`}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-3">
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                      Ex Factory. <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={costingeData.costing_ex_factory}
                      className="bg-white"
                      onChange={(e) =>
                        handleInputChange("costing_ex_factory", e.target.value)
                      }
                      placeholder="Enter Ex Factory"
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                      Ex Chennai. <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={costingeData.costing_ex_chennai}
                      className="bg-white"
                      onChange={(e) =>
                        handleInputChange("costing_ex_chennai", e.target.value)
                      }
                      placeholder="Enter Ex Chennai"
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                      To Designation. <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={costingeData.costing_to_destination}
                      className="bg-white"
                      onChange={(e) =>
                        handleInputChange(
                          "costing_to_destination",
                          e.target.value
                        )
                      }
                      placeholder="Enter To Designation"
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                      Head Margin. <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={costingeData.costing_over_head_margin}
                      className="bg-white"
                      onChange={(e) =>
                        handleInputChange(
                          "costing_over_head_margin",
                          e.target.value
                        )
                      }
                      placeholder="Enter Head Margin"
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                      Exchange Rate. <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={costingeData.costing_exchange_rate}
                      className="bg-white"
                      onChange={(e) =>
                        handleInputChange(
                          "costing_exchange_rate",
                          e.target.value
                        )
                      }
                      placeholder="Enter Exchange Rate"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="p-4 border border-gray-300 rounded-xl shadow-sm w-full sm:w-1/2">
                    <p className="text-lg font-semibold text-gray-700">
                      Total Amount (INR)
                    </p>
                    <p className="text-xl text-green-600 font-bold">
                      {/* ₹ {costingeData?.costing_total_amount} */}₹ {totalINR}
                    </p>
                  </div>

                  <div className="p-4 border border-gray-300 rounded-xl shadow-sm w-full sm:w-1/2">
                    <p className="text-lg font-semibold text-gray-700">
                      Amount in USD
                    </p>
                    <p className="text-xl text-blue-600 font-bold">
                      $ {totalSales}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4 gap-4">
                {costingDefaults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border border-blue-400 p-4 rounded-xl">
                    {[
                      { key: "costing_raw_material", label: "Raw Material" },
                      { key: "costing_process_loss", label: "Process Loss" },
                      {
                        key: "costing_grinding_charges",
                        label: "Grading Charge",
                      },
                      { key: "costing_pala_charges", label: "Pala Charge" },
                      {
                        key: "costing_local_transport",
                        label: "Local Transport",
                      },
                      { key: "costing_loading_unloading", label: "UnLoading" },
                      {
                        key: "costing_packing_material",
                        label: "Packing Material",
                      },
                      {
                        key: "costing_lab_testing_cost",
                        label: "Testing Cost",
                      },
                      { key: "costing_adding_oil_cost", label: "Oil Cost" },
                      {
                        key: "costing_chennai_cfs_feight",
                        label: "Cfs Feight",
                      },
                      { key: "costing_fright_charges", label: "Fright Charge" },
                      { key: "costing_c_f_charges", label: "C F Charge" },
                      { key: "costing_amc_1", label: "Amc" },
                      {
                        key: "costing_purchase_expences",
                        label: "Purchase Expenses",
                      },
                      { key: "costing_labels", label: "Costing Label" },
                    ].map(({ key, label }) =>
                      costingeData[key] ? (
                        <div key={key} className="w-full">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {label} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={costingeData[key]}
                            className="w-full md:w-36 p-2 border border-gray-300 rounded-md bg-gray-50"
                            onChange={(e) =>
                              handleInputChange(key, e.target.value)
                            }
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-end  gap-2">
          {submitLoading && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
          >
            {submitLoading ? "Creating..." : "Create"}{" "}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default CreateCosting;
