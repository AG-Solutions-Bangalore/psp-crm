import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import BASE_URL from "@/config/BaseUrl";

const EmailDialog = ({
  open,
  onClose,
  handleSaveAsPdf,
  Subject,
  purchaseProductData,
}) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    to_email: "",
    subject_email: "",
    description_email: "",
    attachment_email: null,
  });

  console.log(formData.attachment_email);
  const [loading, setIsLoading] = useState(false);
  useEffect(() => {
    if (open) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        attachment_email: handleSaveAsPdf,
        subject_email: Subject,
      }));
    }
  }, [open]);
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };
  const handleClose = () => {
    onClose();
    setFormData({
      to_email: "",
      subject_email: "",
      description_email: "",
      attachment_email: null,
    });
  };

  const handleSubmit = async () => {
    if (formData.attachment_email == null) {
      toast({
        title: "Attachment Missing",
        description: "Please attach a file before sending the email.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.to_email) {
      toast({
        title: "Error",
        description: "Please fill in the  email.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.subject_email) {
      toast({
        title: "Error",
        description: "Please fill in the email subject.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");

    setIsLoading(true);
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No authentication token found. Please log in again.",
        variant: "destructive",
      });
      return;
    }
    try {
      const data = new FormData();
      data.append("to_email", formData.to_email);
      data.append("subject_email", formData.subject_email);
      data.append("description_email", formData.description_email);
      data.append(
        "attachment_email",
        formData.attachment_email,
        `${Subject}-${purchaseProductData.purchase_product_no}`
      );
      const response = await axios.post(
        `${BASE_URL}/api/panel-send-document-email`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response);
      if (response?.data.code == 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });

        handleClose();
      } else {
        toast({
          title: "Error",
          description: response.data.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error response:", error);
      console.error("Error details:", error.response?.data);

      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTitle></DialogTitle>
      <DialogContent className="max-w-md p-6" aria-describedby={undefined}>
        <DialogHeader>
          <h2 className="text-lg font-semibold">Send Email</h2>
        </DialogHeader>

        {/* Email Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="to_email">To Email</Label>
            <Input
              type="email"
              name="to_email"
              value={formData.to_email}
              onChange={handleChange}
              placeholder="Enter recipient's email"
              required
            />
          </div>

          <div>
            <Label htmlFor="subject_email">Subject</Label>
            <Input
              type="text"
              name="subject_email"
              value={formData.subject_email}
              onChange={handleChange}
              placeholder="Enter email subject"
              required
            />
          </div>

          <div>
            <Label htmlFor="description_email">Message</Label>
            <Textarea
              name="description_email"
              value={formData.description_email}
              onChange={handleChange}
              placeholder="Enter your message"
              rows="3"
              required
            />
          </div>
          {/* 
          <div>
            <Label htmlFor="attachment_email">Attachment</Label>
            <Input
              type="file"
              name="attachment_email"
              onChange={handleChange}
            />
          </div> */}
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailDialog;
