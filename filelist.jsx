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
} from "lucide-react";
import { useEffect } from "react";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa";
const FileList = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
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
              className="flex items-center gap-2 border rounded-lg p-3 shadow-sm"
            >
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="h-4 w-2/3" />
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
                const isWord = ext == "doc" || ext == "docx";
                const isImage = [
                  "png",
                  "jpg",
                  "jpeg",
                  "gif",
                  "bmp",
                  "webp",
                ].includes(ext);
                const isText = ext === "txt" || ext === "csv";

                let IconComponent = File;
                let iconColor = "text-gray-500";

                if (isExcel) {
                  IconComponent = FileSpreadsheet;
                  iconColor = "text-green-500";
                } else if (isPdf) {
                  IconComponent = FaRegFilePdf;
                  iconColor = "text-red-500";
                } else if (isWord) {
                  IconComponent = FaRegFileWord;
                  iconColor = "text-blue-500";
                } else if (isImage) {
                  IconComponent = FileImage;
                  iconColor = "text-pink-500";
                } else if (isText) {
                  IconComponent = FileText;
                  iconColor = "text-yellow-500";
                }
                return isExcel ? (
                  <div
                    key={file.path}
                    onClick={() => {
                      const randomQuery = Date.now();
                      navigate(`/file-preview?=${randomQuery}`, {
                        state: { fileUrl, fileName, id },
                      });
                    }}
                    className="cursor-pointer flex items-center gap-2 border rounded-lg p-3 shadow-sm hover:shadow-md transition"
                  >
                    <IconComponent className={iconColor} size={24} />
                    <span className="text-gray-700">
                      {file.name.split(".")[0]}
                    </span>
                  </div>
                ) : (
                  <a
                    key={file.path}
                    href={fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border rounded-lg p-3 shadow-sm hover:shadow-md transition"
                  >
                    <IconComponent className={iconColor} size={24} />
                    <span className="text-gray-700">
                      {file.name.split(".")[0]}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </>
      )}
    </Page>
  );
};

export default FileList;
