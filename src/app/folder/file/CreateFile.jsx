import { FileCreate } from "@/components/buttonIndex/ButtonComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const CreateFile = ({ id, refetch }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [filename, setFileName] = useState(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!file || !id || !filename) {
      toast({
        title: "Error",
        description: "File Name  and File  are required",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file_folder_unique", id);
    formData.append("file_name", file);
    formData.append("folder_file_name", filename);
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/panel-create-file-folder`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data.code === 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });
        refetch();
        setFile(null);
        setOpen(false);
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
        description: error.response?.data?.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="inline-block">
          <FileCreate
            className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="start" className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Upload File</h4>
            <p className="text-sm text-muted-foreground">
              Choose a file to upload
            </p>
          </div>
          <div className="grid gap-2">
            <div>
              <label
                className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
              >
                File Name
              </label>
              <Input
                label="File Name"
                id="folder_file_name"
                type="text"
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter your File Name"
              />
            </div>
            <div>
              <label
                className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
              >
                Upload File
              </label>
              <Input
                id="file_name"
                type="file"
                accept=".pdf, .xls, .xlsx, application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`mt-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload File"
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CreateFile;
