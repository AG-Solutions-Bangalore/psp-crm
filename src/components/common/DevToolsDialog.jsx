import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

const DevToolsDialog = ({ open }) => {
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-lg p-6 sm:p-8 rounded-2xl border shadow-xl bg-background text-center [&>button.absolute]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideClose={true}
      >
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="w-12 h-12 text-yellow-500" />
          <DialogTitle className="text-2xl font-semibold text-destructive">
            Developer Tools Detected
          </DialogTitle>
          <p className="text-sm text-muted-foreground max-w-md">
            For security reasons, access to this page is restricted when browser
            developer tools are active.
            <br />
            If you believe this is an error or need assistance, please contact{" "}
            <strong>AG Solutions Support</strong>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DevToolsDialog;
