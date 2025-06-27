import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "@/redux/slices/AuthSlice";
import apiClient from "@/api/axios";
import { PANEL_LOGIN } from "@/api";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import Logo from "../common/Logo";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import { ButtonConfig } from "@/config/ButtonConfig";
import rawmaterial from "@/assets/img/raw-material.jpg";
import fabric from "@/assets/img/fabric.jpg";
import yarn from "@/assets/img/yarn.jpg";
import LoginCarsol from "../common/LoginCarsol";
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
          })
        );
        navigate("/home");
      } else {
        toast.error("Login Failed: Unexpected response.");
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
                          onChange={() => setEmail(event.target.value)}
                          required
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
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          placeholder="••••••••"
                          onChange={() => setPassword(event.target.value)}
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
