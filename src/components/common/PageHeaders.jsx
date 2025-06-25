import { ButtonConfig } from "@/config/ButtonConfig";

const PageHeaders = ({ progress, title, subtitle, mode = "create" }) => {
  const actionText =
    mode === "edit"
      ? `Update the ${subtitle || ""} details for your organization`
      : `Add a new ${subtitle || ""} to your organization`;

  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-800">{title || ""}</h1>
        <p className="text-gray-600 mt-2">{actionText}</p>
      </div>

      <div className="flex-1 pt-2">
        <div className="sticky top-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Basic Details</span>
            <span className="text-sm font-medium">Additional Details</span>
          </div>

          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-[#1f7a57] h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-medium text-[#1f7a57]">
              {progress}% Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeaders;
