import { useLocation } from "react-router-dom";
import ExcelViewer from "./file/ExcelViewer";
import Page from "../dashboard/page";

function FilePreviewWrapper() {
  const { state } = useLocation();
  const fileUrl = state?.fileUrl;
  const fileName = state?.fileName;
  const folderunique = state?.id;
  return (
    <Page>
      <div className="p-4">
        <ExcelViewer
          fileUrl={fileUrl}
          fileName={fileName}
          folderunique={folderunique}
        />
      </div>
    </Page>
  );
}
export default FilePreviewWrapper;
