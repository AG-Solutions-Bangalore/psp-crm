import Page from "@/app/dashboard/page";
import { ErrorComponent } from "@/components/LoaderComponent/LoaderComponent";
import { Skeleton } from "@/components/ui/skeleton";
import BASE_URL from "@/config/BaseUrl";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CreateFile from "./CreateFile";
import {
  File,
  FileSpreadsheet,
  FileText,
  FileImage,
  File as FileDoc,
  File as FilePdf,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
const FileList = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemdata, setDeleteItemdata] = useState(null);
  const { toast } = useToast();

  const {
    data: fetchfile,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["file", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/panel-fetch-file-folder`,
        { file_folder_unique: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.file || [];
    },
  });

  useEffect(() => {
    if (location.state?.shouldRefetch) {
      refetch();
    }
  }, [location.state]);

  const handleDeleteFile = (name, e) => {
    e.stopPropagation();
    setDeleteItemdata(name);
    console.log(name);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!id || !deleteItemdata) {
      toast({
        title: "Error",
        description: "File Name is required",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file_folder_unique", id);
    formData.append("file_name", deleteItemdata);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/panel-delete-file`,
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
      setDeleteConfirmOpen(false);
      setDeleteItemdata(null);
    }
  };
  if (isError) {
    return (
      <ErrorComponent message="Error Fetching File Data" refetch={refetch} />
    );
  }
  return (
    <Page>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-left text-2xl text-gray-800 font-[500]">File</h1>
        <CreateFile id={id} refetch={refetch} />
      </div>
      {isFetching ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex justify-between items-center border rounded-lg p-3 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded" />{" "}
                <Skeleton className="h-4 w-[100px] rounded" />{" "}
              </div>
              <Skeleton className="w-4 h-4 rounded" />{" "}
            </div>
          ))}
        </div>
      ) : (
        <>
          {fetchfile.length === 0 ? (
            <h1 className="text-center text-xl text-gray-800 font-[500]">
              No File Available
            </h1>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {fetchfile.map((file) => {
                const fileUrl = file.path;
                const fileName = file.name;
                const ext = file.name.split(".").pop().toLowerCase();

                const isExcel = ext === "xlsx" || ext === "xls";
                const isPdf = ext === "pdf";
                let IconComponent = File;
                let iconColor = "text-gray-500";
                if (isExcel) {
                  IconComponent = FileSpreadsheet;
                  iconColor = "text-green-500";
                } else if (isPdf) {
                  IconComponent = FaRegFilePdf;
                  iconColor = "text-red-500";
                }

                return isExcel ? (
                  <div
                    key={file.path}
                    className="flex justify-between items-center border rounded-lg cursor-pointer p-3 shadow-sm hover:shadow-md transition"
                    onClick={() => {
                      navigate(`/file-preview?=${Date.now()}`, {
                        state: {
                          fileUrl: `${fileUrl}?t=${Date.now()}`,
                          fileName,
                          id,
                        },
                      });
                    }}
                  >
                    <div className="flex items-center gap-2 ">
                      <IconComponent className={iconColor} size={24} />
                      <span className="text-gray-700 truncate max-w-[120px]">
                        {file.name.split(".")[0]}
                      </span>
                    </div>
                    <Trash2
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                      size={18}
                      onClick={(e) => handleDeleteFile(file.name, e)}
                    />
                  </div>
                ) : (
                  <div
                    key={file.path}
                    className="flex justify-between items-center cursor-pointer border rounded-lg p-3 shadow-sm hover:shadow-md transition"
                  >
                    <a
                      href={fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <IconComponent className={iconColor} size={24} />
                      <span className="text-gray-700 truncate max-w-[120px]">
                        {file.name.split(".")[0]}
                      </span>
                    </a>

                    <Trash2
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                      size={18}
                      onClick={(e) => handleDeleteFile(file.name, e)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={`${ButtonConfig.backgroundColor}  ${ButtonConfig.textColor}  hover:bg-red-600`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default FileList;
