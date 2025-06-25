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

export default function LoginAuth() {
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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

  const handleResetPassword = (e) => {
    e.preventDefault();
    // Placeholder for reset password functionality
    toast({
      title: "Reset Link Sent",
      description: `A password reset link has been sent to ${resetEmail}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-[Inter]">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-[#ccefd9] to-[#c3e2f7] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            className="absolute w-64 h-64 bg-green-200 rounded-full opacity-30 blur-[100px] top-8 left-12"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 6 }}
          />
          <motion.div
            className="absolute w-52 h-52 bg-blue-300 rounded-full opacity-25 blur-[90px] bottom-16 right-10"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 7 }}
          />
          <motion.div
            className="absolute w-40 h-40 bg-green-100 rounded-full opacity-20 blur-[70px] bottom-6 left-28"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 8 }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 text-center px-10"
        >
          <h1 className="text-5xl font-extrabold text-[#1f7a57] drop-shadow-md">
            Pavanshree Plastic
          </h1>
          <p className="text-xl text-gray-700 mt-4 h-8">
            <Typewriter
              words={[
                "Crafting quality plastic innovations for tomorrow",
                "Reliable solutions for a sustainable future",
                "Engineering plastic excellence with passion",
                "Delivering performance through precision",
              ]}
              loop={0}
              cursor
              cursorStyle="|"
              typeSpeed={30}
              deleteSpeed={10}
              delaySpeed={2000}
            />
          </p>
        </motion.div>
      </div>

      {/* Right Section */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-[#f7f9fa] px-4 py-12">
        <motion.div
          key={showForgotPassword ? "forgot" : "login"}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {showForgotPassword ? (
              <Card className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-gray-300 shadow-2xl rounded-2xl p-6 md:p-8">
                <CardHeader className="text-center space-y-2">
                  <CardTitle className="text-xl font-bold">
                    Forgot Password
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Enter your email to receive a reset link
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Email</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <Button className="w-full bg-[#1f7a57] hover:bg-[#15724f] text-white">
                      Send Reset Link
                    </Button>
                    <div className="text-center">
                      <span
                        onClick={() => setShowForgotPassword(false)}
                        className="text-sm text-blue-600 hover:underline cursor-pointer"
                      >
                        Back to Login
                      </span>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-gray-300 shadow-2xl rounded-2xl p-6 md:p-8">
                <CardHeader className="space-y-2 text-center">
                  <CardTitle>
                    {/* SVG Logo */}
                    <svg
                      width="250"
                      height="60"
                      viewBox="0 0 240 60"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto"
                    >
                      <defs>
                        <linearGradient
                          id="logoGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#1f7a57" />
                          <stop offset="100%" stopColor="#4cd964" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="30"
                        cy="30"
                        r="28"
                        fill="url(#logoGradient)"
                      />
                      <path
                        d="M22 20h10a6 6 0 1 1 0 12h-6v8h-4V20zm4 4v4h6a2 2 0 1 0 0-4h-6z"
                        fill="#ffffff"
                      />
                      <text
                        x="70"
                        y="32"
                        fontSize="20"
                        fill="#1f7a57"
                        fontWeight="600"
                      >
                        Pavanshree Plastic
                      </text>
                      <text x="70" y="50" fontSize="12" fill="#444">
                        Industries
                      </text>
                    </svg>
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    Sign in to continue to your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Username</Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="relative overflow-hidden w-full font-semibold text-white"
                    >
                      {isLoading ? loadingMessage : "Sign In"}
                    </Button>
                    <div className="text-right">
                      <span
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-600 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </span>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
