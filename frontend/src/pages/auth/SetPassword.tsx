import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { usePendingCognitoUserStore } from "../../stores/authStore";

const SetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cognitoUser, clearCognitoUser } = usePendingCognitoUserStore();
  const { email } = (location.state || {}) as { email?: string };

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!cognitoUser) {
    // If no Cognito user, redirect to login
    navigate("/login");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    if (
      cognitoUser &&
      typeof cognitoUser === "object" &&
      "completeNewPasswordChallenge" in cognitoUser &&
      typeof (cognitoUser as { completeNewPasswordChallenge: unknown })
        .completeNewPasswordChallenge === "function"
    ) {
      (
        cognitoUser as {
          completeNewPasswordChallenge: (
            newPassword: string,
            requiredAttributes: object,
            callbacks: {
              onSuccess: () => void;
              onFailure: (err: unknown) => void;
            }
          ) => void;
        }
      ).completeNewPasswordChallenge(
        newPassword,
        {},
        {
          onSuccess: () => {
            setLoading(false);
            clearCognitoUser();
            navigate("/login", {
              state: { passwordResetSuccess: true, email },
            });
          },
          onFailure: (err: unknown) => {
            setLoading(false);
            clearCognitoUser();
            let msg = "Failed to set new password.";
            if (
              err &&
              typeof err === "object" &&
              "message" in err &&
              typeof (err as { message: string }).message === "string"
            ) {
              msg = (err as { message: string }).message;
            }
            setError(msg);
          },
        }
      );
    } else {
      setLoading(false);
      setError("Invalid Cognito user object.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
        Set a New Password
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          fullWidth
          className="bg-white px-2 py-2"
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          className="bg-white px-2 py-2"
        />
        <Button type="submit" fullWidth isLoading={loading}>
          Set Password
        </Button>
      </form>
    </div>
  );
};

export default SetPassword;
