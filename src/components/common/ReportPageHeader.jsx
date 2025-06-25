import { ButtonConfig } from "@/config/ButtonConfig";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function ReportPageHeader({
  title = "Section Title",
  subtitle = "Subtitle here",
  filters = [],
  actionButtons = [],
  className = "",
}) {
  return (
    <div
      className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="lg:w-64 xl:w-72 shrink-0">
          <h1 className="text-xl font-bold text-gray-800 truncate">{title}</h1>
          <p className="text-md text-gray-500 truncate">{subtitle}</p>
        </div>

        <div className="bg-white p-3 rounded-md shadow-xs">
          <div className="flex flex-col lg:flex-col lg:items-end gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 space-x-3 items-center">
              {filters.map(({ label, element }, idx) => (
                <div className="space-y-1" key={idx}>
                  <label
                    className={`text-xs ${
                      ButtonConfig.cardLabel || "text-gray-700"
                    } block`}
                  >
                    {label}
                  </label>
                  {element}
                </div>
              ))}

              {actionButtons.length > 0 && (
                <div>
                  <span
                    className={`text-xs ${
                      ButtonConfig.cardLabel || "text-gray-700"
                    } block`}
                  >
                    Downloads
                  </span>
                  <div className="flex space-x-2 mt-1">
                    {actionButtons.map(({ element, title }, idx) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <div>{element}</div>
                        </TooltipTrigger>
                        <TooltipContent side="top">{title}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
