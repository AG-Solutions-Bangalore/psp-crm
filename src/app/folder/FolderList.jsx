import { useQuery } from "@tanstack/react-query";
import Page from "../dashboard/page";
import CreateFolder from "./FolderCreate";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Folder as FolderIcon, Trash2 } from "lucide-react";
import { ErrorComponent } from "@/components/LoaderComponent/LoaderComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ButtonConfig } from "@/config/ButtonConfig";
const FolderList = () => {
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemdata, setDeleteItemdata] = useState(null);
  const { toast } = useToast();

  const {
    data: fetchfolder,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/panel-fetch-folder`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.fileFolder;
    },
  });

  const handleDeleteFile = (name) => {
    setDeleteItemdata(name);
    console.log(name);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemdata) {
      toast({
        title: "Error",
        description: "Folder is required",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file_folder_unique", deleteItemdata);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/panel-delete-folder`,
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
      <ErrorComponent message="Error Fetching Folder Data" refetch={refetch} />
    );
  }
  return (
    <Page>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-left text-2xl text-gray-800 font-[500]">Folders</h1>
        <CreateFolder refetch={refetch} />
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
      ) : fetchfolder && fetchfolder.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {fetchfolder?.map((folder) => (
            <div
              key={folder.file_folder_unique}
              className="flex justify-between items-center border rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/file/${folder.file_folder_unique}`)}
            >
              <div className="flex items-center gap-2">
                <FolderIcon className="text-yellow-500" size={24} />
                <span className="text-gray-700 truncate max-w-[120px]">
                  {folder.file_folder}
                </span>
              </div>
              <Trash2
                className="text-gray-400 hover:text-red-500 cursor-pointer"
                size={18}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(folder?.file_folder_unique);
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-10 col-span-full">
          No folders found.
        </div>
      )}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              folder.
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

export default FolderList;
