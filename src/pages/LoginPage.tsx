
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, User } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    // Store user data in localStorage
    localStorage.setItem("user", JSON.stringify(formData));
    toast.success("Welcome aboard, adventurer!");
    navigate("/instructions");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-adventure-primary/10 to-adventure-secondary/10 p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-adventure-primary">Welcome</h1>
          <p className="text-adventure-secondary">Begin your treasure hunting journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Username"
                className="pl-10"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-adventure-primary hover:bg-adventure-primary/90">
            Start Adventure
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
