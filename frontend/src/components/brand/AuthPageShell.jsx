import AuthAmbient from "./AuthAmbient";

export default function AuthPageShell({ children }) {
  return (
    <div className="login-world">
      <AuthAmbient />
      {children}
    </div>
  );
}