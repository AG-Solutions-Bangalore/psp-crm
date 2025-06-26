import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../common/Logo";
import { PANEL_SEND_PASSWORD } from "@/api";
import apiClient from "@/api/axios";

export default function ForgotPassword({ setForgot }) {
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadingMessages = [
    "Setting things up for you...",
    "Preparing your Password...",
    "Almost there...",
  ];

  useEffect(() => {
    let messageIndex = 0;
    let intervalId;

    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 800);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading]);

  const handleReset = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("username", username);

    try {
      console.log("Submitting forgot password request...");

      const res = await apiClient.post(`${PANEL_SEND_PASSWORD}`, formData);

      if (res.status === 200) {
        const response = res.data;

        if (response.code === 201) {
          toast({
            title: "Success",
            description: response.message,
          });
        } else if (response.code === 400) {
          toast({
            title: "Duplicate Entry",
            description: response.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Unexpected Response",
            description: response.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Unexpected response from the server.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: error.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="bg-white backdrops-blur-lg rounded-lg shadow-lg  md:p-6">
        <CardHeader className="text-center space-y-2 p-3">
          <Logo />
          {/* <CardTitle className="text-xl font-bold text-start">
                    Forgot Password
                  </CardTitle> */}
          <CardDescription className="text-sm text-gray-600">
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your Username"
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </motion.div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </motion.div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={`${ButtonConfig.backgroundColor}  ${ButtonConfig.textColor} relative w-full overflow-hidden px-6 py-2 rounded-md transition-all duration-700 ease-in-out group`}
            >
              <span className="relative z-10">
                {isLoading ? loadingMessage : "Reset Password"}
              </span>
              <span className="absolute left-0 top-0 h-full w-0 bg-[#82b8a4] transition-all duration-700 ease-in-out group-hover:w-full z-0"></span>
            </Button>
          </form>
          <div className="flex justify-center mt-4">
            <span
              className=" text-blue-600 hover:underline cursor-pointer text-sm"
              onClick={() => setForgot(false)}
            >
              Back to Login
            </span>
          </div>
        </CardContent>
      </Card>
    </>
    //   </motion.div>
    // </motion.div>
  );
}
