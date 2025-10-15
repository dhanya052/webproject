import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles
import "./styles.css";

// Get user from localStorage
const getUserFromStorage = () => {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

// API calls
const loginUser = async (credentials: { email: string; password: string }) => {
  const response = await fetch("http://127.0.0.1:5000/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  return response.json();
};

const signUpUser = async (credentials: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  const response = await fetch("http://127.0.0.1:5000/users/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Signup failed. Please try again.");
  }

  return response.json();
};

const resetPassword = async (data: { email: string; new_password: string }) => {
  const response = await fetch("http://127.0.0.1:5000/users/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to reset password. Please try again.");
  }

  return response.json();
};

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  isSignUp?: boolean;
}

const SignInModal: React.FC<SignInModalProps> = ({ open, onClose, onLoginSuccess, isSignUp = false }) => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [role, setRole] = React.useState("user");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = React.useState("");
  
  // State for password visibility toggle
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = React.useState(false);

  // Mutations for login, signup, and password reset
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      sessionStorage.setItem("user", JSON.stringify(data));
      onLoginSuccess(data);
      toast.success(`Welcome back, ${data.name}!`);
      setErrorMessage("");
      onClose();
    },
    onError: () => {
      setErrorMessage("Invalid email or password.");
      toast.error("Login failed. Please check your credentials.");
    },
  });

  const signUpMutation = useMutation({
    mutationFn: signUpUser,
    onSuccess: (data) => {
      sessionStorage.setItem("user", JSON.stringify(data));
      onLoginSuccess(data);
      toast.success(`Account created! Welcome, ${data.name}!`);
      setErrorMessage("");
      onClose();
    },
    onError: () => {
      setErrorMessage("Signup failed. Please check your details and try again.");
      toast.error("Signup failed. Please try again.");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast.success(data.message || "Password reset successfully. You can now log in.");
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
      setNewPassword("");
      setNewPasswordConfirm("");
      onClose();
    },
    onError: () => {
      toast.error("Failed to reset password. Please try again.");
    },
  });

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      toast.error("Passwords do not match.");
      return;
    }

    resetPasswordMutation.mutate({
      email: forgotPasswordEmail,
      new_password: newPassword,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (isSignUp) {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        toast.error("Passwords do not match.");
        return;
      }
      signUpMutation.mutate({ name, email, password, role });
    } else {
      const existingUser = getUserFromStorage();
      if (existingUser && existingUser.email === email) {
        setErrorMessage("You are already logged in.");
        toast.info("You are already logged in!");
        return;
      }
      loginMutation.mutate({ email, password });
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email.");
      return;
    }
    setShowForgotPassword(false);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible((prev) => !prev);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">
            {showForgotPassword ? "Reset Password" : isSignUp ? "Sign Up" : "Sign In"}
          </Dialog.Title>

          <Dialog.Description className="dialog-description">
            {showForgotPassword
              ? "Enter a new password for your account."
              : isSignUp
              ? "Create a new account."
              : "Enter your credentials to sign in."}
          </Dialog.Description>

          {showForgotPassword ? (
            <form onSubmit={handleResetPasswordSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  id="forgotEmail"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-wrapper">
                  <input
                    id="newPassword"
                    type={isPasswordVisible ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-icon-button"
                    onClick={togglePasswordVisibility}
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  >
                    {isPasswordVisible ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="newPasswordConfirm">Confirm New Password</label>
                <div className="password-wrapper">
                  <input
                    id="newPasswordConfirm"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-icon-button"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={isConfirmPasswordVisible ? "Hide password" : "Show password"}
                  >
                    {isConfirmPasswordVisible ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              {isSignUp && (
                <>
                  <div className="input-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-icon-button"
                    onClick={togglePasswordVisibility}
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  >
                    {isPasswordVisible ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="password-wrapper">
                    <input
                      id="confirmPassword"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eye-icon-button"
                      onClick={toggleConfirmPasswordVisibility}
                      aria-label={isConfirmPasswordVisible ? "Hide password" : "Show password"}
                    >
                      {isConfirmPasswordVisible ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>
              )}

              {!isSignUp && (
                <p className="forgot-password-link" onClick={() => setShowForgotPassword(true)}>
                  Forgot Password?
                </p>
              )}

              {errorMessage && <p className="error-message">{errorMessage}</p>}

              <button
                type="submit"
                className="submit-button"
                disabled={loginMutation.isPending || signUpMutation.isPending}
              >
                {loginMutation.isPending || signUpMutation.isPending
                  ? "Submitting..."
                  : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
              </button>
            </form>
          )}

          <Dialog.Close asChild>
            <button className="close-button">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SignInModal;
