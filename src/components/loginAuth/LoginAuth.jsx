/* eslint-disable no-unused-vars */
import { PANEL_LOGIN } from "@/api";
import apiClient from "@/api/axios";
import fabric from "@/assets/img/fabric.jpg";
import rawmaterial from "@/assets/img/raw-material.jpg";
import yarn from "@/assets/img/yarn.jpg";
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
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { loginSuccess } from "@/redux/slices/AuthSlice";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoginCarsol from "../common/LoginCarsol";
import Logo from "../common/Logo";
import { Eye, EyeOff } from "lucide-react";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
const images = [
  {
    src: rawmaterial,
    text: "Crafting quality plastic innovations for tomorrow",
  },
  {
    src: yarn,
    text: "Reliable solutions for a sustainable future",
  },
  { src: fabric, text: "Delivering performance through precision" },
];

export default function LoginAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [forgot, setForgot] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const loadingMessages = [
    "Authenticating...",
    "Validating credentials...",
    "Loading your dashboard...",
    "One moment please...",
  ];

  useEffect(() => {
    let index = 0;
    let intervalId;
    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      intervalId = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 900);
    }
    return () => clearInterval(intervalId);
  }, [isLoading]);
  useEffect(() => {
    images.forEach((img) => {
      const image = new Image();
      image.src = img.src;
    });
  }, []);
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await apiClient.post(PANEL_LOGIN, formData);
      if (res.data.code === 200 && res.data.UserInfo?.token) {
        const { UserInfo } = res.data;
        dispatch(
          loginSuccess({
            token: UserInfo.token,
            id: UserInfo.user.id,
            name: UserInfo.user?.name,
            user_type: UserInfo.user?.user_type,
            email: UserInfo.user?.email,
            token_expire_time: UserInfo.token_expires_at,
            version: res?.data?.version?.version_panel,
            companyname: res?.data?.company_detils?.company_name,
            companystatename: res?.data?.company_detils?.company_state_name,
            company_address: res?.data?.company_detils?.company_address,
            company_email: res?.data?.company_detils?.company_email,
            company_gst: res?.data?.company_detils?.company_gst,
            company_mobile: res?.data?.company_detils?.company_mobile,
            company_state_code: res?.data?.company_detils?.company_state_code,
            company_state_name: res?.data?.company_detils?.company_state_name,
          })
        );
        navigate("/home");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description:
            res.data.message || "Login Failed: Unexpected response cc.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    hidden: ({ dir }) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    visible: { x: "0%", opacity: 1 },
    exit: ({ dir }) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-inter">
      <LoginCarsol />

      <div className="flex flex-1 min-h-screen justify-center items-center bg-[#f7f9fa] px-[12px]">
        <AnimatePresence
          custom={{ dir: forgot ? 1 : -1 }}
          initial={false}
          mode="wait"
        >
          <motion.div
            key={forgot ? "reset" : "login"}
            variants={slideVariants}
            custom={{ dir: forgot ? 1 : -1 }}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {forgot ? (
              <ForgotPassword setForgot={setForgot} />
            ) : (
              <Card className="bg-white backdrops-blur-lg rounded-lg shadow-lg  md:p-6">
                <CardHeader className="text-center space-y-2 p-3">
                  <CardTitle>
                    {" "}
                    <Logo />
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Sign in to continue to your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <Label htmlFor="email">Username</Label>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Input
                          id="email"
                          type="text"
                          value={email}
                          placeholder="Enter your username"
                          onChange={(event) => setEmail(event.target.value)}
                          required
                          autoComplete="username"
                          maxLength={30}
                        />
                      </motion.div>
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            onChange={(event) =>
                              setPassword(event.target.value)
                            }
                            required
                            maxLength={30}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`${ButtonConfig.backgroundColor}  ${ButtonConfig.textColor} relative w-full overflow-hidden px-6 py-2 rounded-md transition-all duration-700 ease-in-out group`}
                    >
                      <span className="relative z-10">
                        {isLoading ? loadingMessage : "Sign In"}
                      </span>
                      <span className="absolute left-0 top-0 h-full w-0 bg-[#82b8a4] transition-all duration-700 ease-in-out group-hover:w-full z-0"></span>
                    </Button>
                  </form>
                  <div className="flex justify-end mt-4">
                    <span
                      className="text-blue-600 hover:underline cursor-pointer text-sm"
                      onClick={() => setForgot(true)}
                    >
                      Forgot Password?
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
