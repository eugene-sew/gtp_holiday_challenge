import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAuthStore,
  usePendingCognitoUserStore,
} from "../../stores/authStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { User, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { setCognitoUser } = usePendingCognitoUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password); // Use Cognito login
      navigate("/dashboard");
    } catch (err: unknown) {
      // Handle Cognito NEW_PASSWORD_REQUIRED challenge
      if (
        err &&
        typeof err === "object" &&
        "challenge" in err &&
        (err as { challenge: string }).challenge === "NEW_PASSWORD_REQUIRED" &&
        "cognitoUser" in err &&
        "userAttributes" in err &&
        "requiredAttributes" in err
      ) {
        const challengeObj = err as {
          cognitoUser: unknown;
          userAttributes: unknown;
          requiredAttributes: unknown;
        };
        setCognitoUser(challengeObj.cognitoUser);
        navigate("/set-password", {
          state: {
            email,
          },
        });
        return;
      }
      // Type the error more specifically
      let errorMessage = "Authentication failed. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
        Sign in to your account
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <Input
          id="email"
          type="text"
          label="Email address/Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          icon={<User className="h-5 w-5 text-gray-400" />}
          fullWidth
          className="bg-white px-2 py-2"
        />

        <Input
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          icon={<Lock className="h-5 w-5 text-gray-400" />}
          fullWidth
          className="bg-white px-2 py-2"
        />

        <div>
          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign in
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Login;
