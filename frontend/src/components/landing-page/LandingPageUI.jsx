export default function LandingPageUI({
  signupEmail,
  signupPassword,
  signupUsername,
  loginEmail,
  loginPassword,
  onChangeSignupEmail,
  onChangeSignupPassword,
  onChangeSignupUsername,
  onChangeLoginEmail,
  onChangeLoginPassword,
  onSignup,
  onLogin,
  loading,
  error,
}) {
  return (
    <div style={{ padding: 16 }}>
      {" "}
      <h1>Welcome to Questly</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {" "} 
        <div>
          {" "}
          <h3>Sign Up</h3>{" "}
          <input
            placeholder="Username"
            value={signupUsername}
            onChange={(e) => onChangeSignupUsername(e.target.value)}
          />{" "}
          <input
            placeholder="Email"
            value={signupEmail}
            onChange={(e) => onChangeSignupEmail(e.target.value)}
          />{" "}
          <input
            placeholder="Password"
            type="password"
            value={signupPassword}
            onChange={(e) => onChangeSignupPassword(e.target.value)}
          />{" "}
          <div>
            {" "}
            <button onClick={onSignup} disabled={loading}>
              {" "}
              {loading ? "Signing up..." : "Sign Up"}{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        <div>
          {" "}
          <h3>Login</h3>{" "}
          <input
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => onChangeLoginEmail(e.target.value)}
          />{" "}
          <input
            placeholder="Password"
            type="password"
            value={loginPassword}
            onChange={(e) => onChangeLoginPassword(e.target.value)}
          />{" "}
          <div>
            {" "}
            <button onClick={onLogin} disabled={loading}>
              {" "}
              {loading ? "Logging in..." : "Login"}{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
