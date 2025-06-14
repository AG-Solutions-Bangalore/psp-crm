import React, { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, MinusCircle, Settings2, Copy, Trash2, Save, Upload, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Page from "../dashboard/page";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { getTodayDate } from "@/utils/currentDate";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import CreateCustomer from "../customer/CreateCustomer";
import CreateProduct from "../product/CreateProduct";

// Keep your existing validation schemas...
// [Previous validation schemas remain unchanged]

// Validation Schemas
const productRowSchema = z.object({
  enquirySub_product_name: z.string().min(1, "Product name is required"),
  enquirySub_product_code: z.string().optional(),
  enquirySub_shu: z.string().min(1, "SHU is required"),
  enquirySub_asta: z.string().min(1, "ASTA is required"),
  enquirySub_qlty_type: z.string().min(1, "Quality type is required"),
  enquirySub_stem_type: z.string().optional(),
  enquirySub_course_type: z.string().min(1, "Course type is required"),
  enquirySub_moist_value: z.string().optional(),
  enquirySub_qnty: z.string().min(1, "Quantity is required"),
  enquirySub_quoted_price: z.string().min(1, "Quoted price is required"),
  enquirySub_final_price: z.string().optional(),
  enquirySub_p2b_blend: z.string().optional(),
});

const enquiryFormSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  enquiry_date: z.string().min(1, "Enquiry date is required"),
  packing_type: z.string().min(1, "Packing type is required"),
  marking: z.string().min(1, "Marking is required"),
  shipment_date: z.string().min(1, "Shipment date is required"),
  sample_required: z.enum(["Yes", "No"]),
  treatment_required: z.enum(["Yes", "No"]),
  etd: z.enum(["Yes", "No"]).optional(),
  gama_rediations: z.enum(["Yes", "No"]).optional(),
  steam_sterlizaton: z.enum(["Yes", "No"]).optional(),
  enquiry_data: z
    .array(productRowSchema)
    .min(1, "At least one product is required"),
});

// API functions
const fetchCustomers = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    "https://adityaspice.com/app/public/api/panel-fetch-customer",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch customer data");
  return response.json();
};

const fetchProducts = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    "https://adityaspice.com/app/public/api/panel-fetch-product",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch product data");
  return response.json();
};

const createEnquiry = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    "https://adityaspice.com/app/public/api/panel-create-enquiry",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) throw new Error("Failed to create enquiry");
  return response.json();
};

// Header Component
const EnquiryHeader = ({ progress }) => {
  return (
    <div className="flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 bg-white p-4 shadow-sm">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-800">Enquiry Form</h1>
        <p className="text-gray-600 mt-2">Create your enquiries</p>
      </div>

      <div className="flex-1 pt-2">
        <div className="sticky top-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Basic Details</span>
            <span className="text-sm font-medium">Products</span>
            <span className="text-sm font-medium">Requirements</span>
          </div>

          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-yellow-500 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-medium text-yellow-600">
              {progress}% Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EnquiryCreateOne = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  
  // New states for advanced features
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState(() => {
    const saved = localStorage.getItem('enquiry-drafts');
    return saved ? JSON.parse(saved) : [];
  });

  // Keep your existing states...
  // [Previous state declarations remain unchanged]
 const [visibleColumns, setVisibleColumns] = useState([
    "enquirySub_product_name",
    "enquirySub_shu",
    "enquirySub_asta",
    "enquirySub_qlty_type",
    "enquirySub_course_type",
    "enquirySub_qnty",
    "enquirySub_quoted_price",
  ]);

  const defaultTableHeaders = [
    { key: "enquirySub_product_name", label: "Product Name", required: true },
    { key: "enquirySub_shu", label: "SHU (in K)", required: true },
    { key: "enquirySub_asta", label: "ASTA", required: true },
    { key: "enquirySub_qlty_type", label: "Quality Type", required: true },
    { key: "enquirySub_course_type", label: "Course Type", required: true },
    { key: "enquirySub_qnty", label: "Quantity (in MT)", required: true },
    { key: "enquirySub_quoted_price", label: "Quoted Price", required: true },
  ];

  const optionalHeaders = [
    { key: "enquirySub_product_code", label: "Product Code" },
    { key: "enquirySub_stem_type", label: "Stem Type" },
    { key: "enquirySub_moist_value", label: "Moisture Value" },
    { key: "enquirySub_final_price", label: "Final Price" },
    { key: "enquirySub_p2b_blend", label: "P2B Blend" },
  ];

  const [enquiryData, setEnquiryData] = useState([
    {
      enquirySub_product_name: "",
      enquirySub_product_code: "",
      enquirySub_shu: "",
      enquirySub_asta: "",
      enquirySub_qlty_type: "",
      enquirySub_stem_type: "",
      enquirySub_course_type: "",
      enquirySub_moist_value: "",
      enquirySub_qnty: "",
      enquirySub_quoted_price: "",
      enquirySub_final_price: "",
      enquirySub_p2b_blend: "",
    },
  ]);

  const [formData, setFormData] = useState({
    enquiry_year: "",
    customer_id: "",
    enquiry_date: getTodayDate(),
    packing_type: "",
    marking: "",
    shipment_date: "",
    sample_required: "No",
    treatment_required: "No",
    etd: "No",
    gama_rediations: "No",
    steam_sterlizaton: "No",
  });

  const { data: customerData } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const { data: productData } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const createEnquiryMutation = useMutation({
    mutationFn: createEnquiry,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Enquiry created successfully",
      });
      navigate("/enquiries");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const packingTypes = ["5 Kg", "10 Kg", "15 Kg", "20 Kg", "25 Kg"];

  useEffect(() => {
    const calculateProgress = () => {
      let filledFields = 0;
      let totalFields = 0;

      // Count basic details fields
      const basicDetailsFields = [
        "customer_id",
        "enquiry_date",
        "packing_type",
      ];
      basicDetailsFields.forEach((field) => {
        totalFields++;
        if (formData[field]) filledFields++;
      });

      // Count requirements fields
      const requirementsFields = [
        "marking",
        "shipment_date",
        "sample_required",
      ];
      requirementsFields.forEach((field) => {
        totalFields++;
        if (formData[field]) filledFields++;
      });

      // Add treatment fields if treatment is required
      if (formData.treatment_required === "Yes") {
        const treatmentFields = ["etd", "gama_rediations", "steam_sterlizaton"];
        treatmentFields.forEach((field) => {
          totalFields++;
          if (formData[field] === "Yes") filledFields++;
        });
      }

      // Count all visible product fields for each row
      enquiryData.forEach((row) => {
        visibleColumns.forEach((columnKey) => {
          totalFields++;
          if (row[columnKey] && row[columnKey].toString().trim() !== "") {
            filledFields++;
          }
        });
      });

      const percentage = Math.round((filledFields / totalFields) * 100);
      setProgress(Math.min(percentage, 100));
    };

    calculateProgress();
  }, [formData, enquiryData, visibleColumns]);

  const handleInputChange = (e, field) => {
    let value;
    if (e.target.type === "checkbox") {
      value = e.target.checked ? "Yes" : "No";
    } else {
      value = e.target.value;
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRowDataChange = (rowIndex, field, value) => {
    const numericFields = [
      'enquirySub_qnty',
      'enquirySub_quoted_price',
      
      'enquirySub_shu',
      'enquirySub_asta'
    ];
    let processedValue = value;
       // If it's a numeric field, process it
       if (numericFields.includes(field)) {
        // Remove any non-numeric characters except decimal point
        const sanitizedValue = value.replace(/[^\d.]/g, '');
        
        // Prevent multiple decimal points
        const decimalCount = (sanitizedValue.match(/\./g) || []).length;
        if (decimalCount > 1) {
          return; // Ignore input with multiple decimal points
        }
        
        // Convert to number if it's a valid number, otherwise keep as empty string
        processedValue = sanitizedValue === '' ? '' : Number(sanitizedValue);
        
        // Validate if it's a valid number
        if (isNaN(processedValue)) {
          return; // Ignore invalid numbers
        }
      }
    const newData = [...enquiryData];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [field]: processedValue,
    };
    setEnquiryData(newData);
  };

  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const addRow = () => {
    setEnquiryData([
      ...enquiryData,
      {
        enquirySub_product_name: "",
        enquirySub_product_code: "",
        enquirySub_shu: "",
        enquirySub_asta: "",
        enquirySub_qlty_type: "",
        enquirySub_stem_type: "",
        enquirySub_course_type: "",
        enquirySub_moist_value: "",
        enquirySub_qnty: "",
        enquirySub_quoted_price: "",
        enquirySub_final_price: "",
        enquirySub_p2b_blend: "",
      },
    ]);
  };

  const removeRow = (index) => {
    if (enquiryData.length > 1) {
      setEnquiryData((prevData) => prevData.filter((_, i) => i !== index));
    }
  };

  const RadioOption = ({
    label,
    value,
    onChange,
    currentValue,
    required = false,
  }) => (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <RadioGroup
        value={currentValue}
        onValueChange={(newValue) =>
          onChange({ target: { value: newValue } }, value)
        }
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2 cursor-pointer">
          <RadioGroupItem value="Yes" id={`${value}-yes`} />
          <label htmlFor={`${value}-yes`} className="cursor-pointer">
            Yes
          </label>
        </div>
        <div className="flex items-center space-x-2 cursor-pointer">
          <RadioGroupItem value="No" id={`${value}-no`} />
          <label htmlFor={`${value}-no`} className="cursor-pointer">
            No
          </label>
        </div>
      </RadioGroup>
    </div>
  );
  const fieldLabels = {
    customer_id: "Customer",
    enquiry_date: "Enquiry Date",
    packing_type: "Packing Type",
    marking: "Marking",
    shipment_date: "Shipment Date",
    sample_required: "Sample Required",
    treatment_required: "Treatment Required",
    etd: "ETD",
    gama_rediations: "Gama Radiations",
    steam_sterlizaton: "Steam Sterilization",
    enquirySub_product_name: "Product Name",
    enquirySub_shu: "SHU",
    enquirySub_asta: "ASTA",
    enquirySub_qlty_type: "Quality Type",
    enquirySub_course_type: "Course Type",
    enquirySub_qnty: "Quantity",
    enquirySub_quoted_price: "Quoted Price",
    enquirySub_final_price: "Final Price",
    enquirySub_p2b_blend: "P2B Blend",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const validatedData = enquiryFormSchema.parse({
        ...formData,
        enquiry_data: enquiryData,
      });
      createEnquiryMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const groupedErrors = error.errors.reduce((acc, err) => {
          const field = err.path.join(".");
          if (!acc[field]) {
            acc[field] = [];
          }
          acc[field].push(err.message);
          return acc;
        }, {});

        const errorMessages = Object.entries(groupedErrors).map(
          ([field, messages]) => {
            const fieldKey = field.split(".").pop();
            const label = fieldLabels[fieldKey] || field;
            return `${label}: ${messages.join(", ")}`;
          }
        );

        toast({
          title: "Validation Error",
          description: (
            <div>
              <ul className="list-disc pl-5">
                {errorMessages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          ),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  // Auto-save functionality
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      localStorage.setItem('current-enquiry-draft', JSON.stringify({
        formData,
        enquiryData,
        lastSaved: new Date().toISOString()
      }));
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [formData, enquiryData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelectedRows();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [selectedRows]);

  // Bulk operations
  const duplicateSelectedRows = () => {
    const newRows = selectedRows.map(index => ({
      ...enquiryData[index],
      enquirySub_qnty: "",
      enquirySub_quoted_price: ""
    }));
    setEnquiryData([...enquiryData, ...newRows]);
    setSelectedRows([]);
  };

  const deleteSelectedRows = () => {
    if (enquiryData.length <= 1) return;
    const newData = enquiryData.filter((_, index) => !selectedRows.includes(index));
    setEnquiryData(newData);
    setSelectedRows([]);
  };

  // CSV import/export
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n').map(row => row.split(','));
        // Skip header row
        const newData = rows.slice(1).map(row => ({
          enquirySub_product_name: row[0] || "",
          enquirySub_shu: row[1] || "",
          enquirySub_asta: row[2] || "",
          enquirySub_qlty_type: row[3] || "",
          enquirySub_course_type: row[4] || "",
          enquirySub_qnty: row[5] || "",
          enquirySub_quoted_price: row[6] || "",
          // ... map other fields
        }));
        setEnquiryData(newData);
      };
      reader.readAsText(file);
    }
  };

  const exportToCSV = (e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
    const headers = ['Product Name', 'SHU', 'ASTA', 'Quality Type', 'Course Type', 'Quantity', 'Quoted Price'];
    const csvContent = [
      headers.join(','),
      ...enquiryData.map(row => [
        row.enquirySub_product_name,
        row.enquirySub_shu,
        row.enquirySub_asta,
        row.enquirySub_qlty_type,
        row.enquirySub_course_type,
        row.enquirySub_qnty,
        row.enquirySub_quoted_price
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `enquiry_${new Date().toISOString()}.csv`;
    link.click();
  };

  // Draft management
  const saveDraft = (e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
    const draft = {
      id: Date.now(),
      formData,
      enquiryData,
      savedAt: new Date().toISOString()
    };
    setSavedDrafts(prev => [...prev, draft]);
    localStorage.setItem('enquiry-drafts', JSON.stringify([...savedDrafts, draft]));
    toast({
      title: "Draft Saved",
      description: "Your enquiry has been saved as a draft",
    });
  };

  const loadDraft = (draft) => {
    setFormData(draft.formData);
    setEnquiryData(draft.enquiryData);
  };

  // Enhanced product table component
  const ProductTable = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Products</h2>
          <CreateProduct />
          
          {/* Bulk Operations */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={duplicateSelectedRows}
                  disabled={selectedRows.length === 0}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate Selected (Ctrl+D)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSelectedRows}
                  disabled={selectedRows.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Selected</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Import/Export */}
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    document.getElementById('csv-upload').click()
                  }}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import CSV</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export CSV</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Column customization dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4 mr-2" />
              Customize Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {optionalHeaders.map((header) => (
              <DropdownMenuItem
                key={header.key}
                onClick={() => toggleColumn(header.key)}
              >
                <span>{header.label}</span>
                {visibleColumns.includes(header.key) && (
                  <span className="text-green-500">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Enhanced table with drag-and-drop and row selection */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left border w-8">
                <Checkbox
                  checked={selectedRows.length === enquiryData.length}
                  onCheckedChange={(checked) => {
                    setSelectedRows(checked ? enquiryData.map((_, i) => i) : []);
                  }}
                />
              </th>
              {[...defaultTableHeaders, ...optionalHeaders]
                .filter((header) => visibleColumns.includes(header.key))
                .map((header) => (
                  <th
                    key={header.key}
                    className="p-2 text-left border text-sm font-medium"
                  >
                    {header.label}
                    {header.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </th>
                ))}
              <th className="p-2 text-left border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiryData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b hover:bg-gray-50 ${
                  selectedRows.includes(rowIndex) ? "bg-yellow-50" : ""
                }`}
                draggable
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
              >
                <td className="p-2 border">
                  <Checkbox
                    checked={selectedRows.includes(rowIndex)}
                    onCheckedChange={(checked) => {
                      setSelectedRows(
                        checked
                          ? [...selectedRows, rowIndex]
                          : selectedRows.filter((i) => i !== rowIndex)
                      );
                    }}
                  />
                </td>
                {/* Your existing row cells */}
                {[...defaultTableHeaders, ...optionalHeaders]
                  .filter((header) => visibleColumns.includes(header.key))
                  .map((header) => (
                    <td key={header.key} className="p-2 border">
                      {header.key === "enquirySub_product_name" ? (
                        <Select
                          value={row[header.key]}
                          onValueChange={(value) =>
                            handleRowDataChange(rowIndex, header.key, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {productData?.product?.map((product) => (
                              <SelectItem
                                key={product.id}
                                value={product.product_name}
                              >
                                {product.product_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={row[header.key]}
                          onChange={(e) =>
                            handleRowDataChange(
                              rowIndex,
                              header.key,
                              e.target.value
                            )
                          }
                          type={
                            ['enquirySub_qnty', 'enquirySub_quoted_price', 
                              'enquirySub_shu', 
                             'enquirySub_asta'].includes(header.key) 
                              ? "number" 
                              : "text"
                          }
                          step={
                            ['enquirySub_qnty', 'enquirySub_quoted_price', 
                              'enquirySub_shu', 
                             'enquirySub_asta'].includes(header.key) 
                              ? "any" 
                              : undefined
                          }
                          min={
                            ['enquirySub_qnty', 'enquirySub_quoted_price', 
                              'enquirySub_shu', 
                             'enquirySub_asta'].includes(header.key) 
                              ? "0" 
                              : undefined
                          }
                          className="w-full border border-gray-300 bg-yellow-50"
                        />
                      )}
                    </td>
                  ))}
                <td className="p-2 border">
                  <Button
                    variant="ghost"
                    onClick={() => removeRow(rowIndex)}
                    disabled={enquiryData.length === 1}
                    className="text-red-500"
                    type="button"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        onClick={addRow}
                        className="bg-yellow-500 text-black hover:bg-yellow-400"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
    </div>
  );

  // Return JSX
  return (
    <Page>
      <form onSubmit={handleSubmit} className="w-full p-4">
        <EnquiryHeader progress={progress} />

        {/* Draft Management */}
     
        <div className="mb-4 flex justify-end space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveDraft}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save Draft (Ctrl+S)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Load Draft
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Saved Drafts</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {savedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <span>
                      Draft from{" "}
                      {new Date(draft.savedAt).toLocaleDateString()}
                    </span>
                    <Button onClick={() => loadDraft(draft)}>Load</Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Basic Details Section */}
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) =>
                      handleInputChange({ target: { value } }, "customer_id")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerData?.customer?.map((customer) => (
                        <SelectItem
                          key={customer.id}
                          value={customer.id.toString()}
                        >
                          {customer.customer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <CreateCustomer />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enquiry Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.enquiry_date}
                    onChange={(e) => handleInputChange(e, "enquiry_date")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Shipment Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.shipment_date}
                    onChange={(e) => handleInputChange(e, "shipment_date")}
                  />
                </div>
              </div>
            </div>

            {/* Products Section */}
            <ProductTable />

            {/* Requirements Section */}
            <div className="mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Marking <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter marking details"
                    value={formData.marking}
                    onChange={(e) => handleInputChange(e, "marking")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Packing Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.packing_type}
                    onValueChange={(value) =>
                      handleInputChange({ target: { value } }, "packing_type")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select packing type" />
                    </SelectTrigger>
                    <SelectContent>
                      {packingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <RadioOption
                  label="Sample Required"
                  value="sample_required"
                  onChange={handleInputChange}
                  currentValue={formData.sample_required}
                  required={true}
                />
                <RadioOption
                  label="Treatment Required"
                  value="treatment_required"
                  onChange={handleInputChange}
                  currentValue={formData.treatment_required}
                  required={true}
                />

                {/* Conditional Treatment Options */}
                {formData.treatment_required === "Yes" && (
                  <div className="col-span-2 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.etd === "Yes"}
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            { target: { checked, type: "checkbox" } },
                            "etd"
                          )
                        }
                      />
                      <label>ETD</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.gama_rediations === "Yes"}
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            { target: { checked, type: "checkbox" } },
                            "gama_rediations"
                          )
                        }
                      />
                      <label>Gama Radiations</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.steam_sterlizaton === "Yes"}
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            { target: { checked, type: "checkbox" } },
                            "steam_sterlizaton"
                          )
                        }
                      />
                      <label>Steam Sterilization</label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button and Progress */}
        <div className="flex flex-col items-end">
          {createEnquiryMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className="bg-yellow-500 text-black hover:bg-yellow-400 flex items-center mt-2"
            disabled={createEnquiryMutation.isPending}
          >
            {createEnquiryMutation.isPending ? "Submitting..." : "Submit Enquiry"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default EnquiryCreateOne;