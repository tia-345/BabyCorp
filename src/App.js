
import React, { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const emptyForm = {
    name: "",
    email: "",
    password: "",
    role: "parent",
    profession: "",
    qualification: "",
    registrationNumber: "",
    workplace: "",
    certificate: null,
  };

  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const [adminStats, setAdminStats] = useState(null);
  const [pendingProfessionals, setPendingProfessionals] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  // HOMEPAGE FEATURES
  const features = [
    {
      image: "/cozy.png",
      icon: "♡",
      title: "Supportive Community",
      description:
        "Connect, share experiences and grow with other parents.",
    },
    {
      image: "/doc.png",
      icon: "✚",
      title: "Expert Support",
      description:
        "Find guidance from trusted healthcare professionals.",
    },
    {
      image: "/nursery.png",
      icon: "✦",
      title: "Baby Care",
      description:
        "Keep track of vaccinations, growth and milestones.",
    },
  ];

  // RESTORE LOGIN SESSION
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API}/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) return;

        const data = await response.json();
        setUser(data.user);
        setPage("dashboard");
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    checkSession();
  }, []);

  // LOAD ADMIN DATA
  const loadAdminData = async () => {
    setAdminLoading(true);
    setAdminError("");

    try {
      const [statsResponse, professionalsResponse] =
        await Promise.all([
          fetch(`${API}/admin/stats`, {
            credentials: "include",
          }),
          fetch(`${API}/admin/professionals/pending`, {
            credentials: "include",
          }),
        ]);

      if (!statsResponse.ok || !professionalsResponse.ok) {
        throw new Error("Could not load admin information.");
      }

      const stats = await statsResponse.json();
      const professionals = await professionalsResponse.json();

      setAdminStats(stats);
      setPendingProfessionals(professionals);
    } catch (error) {
      setAdminError(error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // LOAD ADMIN DATA WHEN ADMIN DASHBOARD OPENS
  useEffect(() => {
    if (page === "dashboard" && user?.role === "admin") {
      loadAdminData();
    }
  }, [page, user]);

  // UPDATE FORM INPUTS
  const updateForm = (event) => {
    const { name, value, files } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: files ? files[0] : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // NAVIGATION
  const openPage = (nextPage) => {
    setMessage("");
    setErrors({});
    setForm({ ...emptyForm });
    setPage(nextPage);
  };

  // FORM VALIDATION
  const validateForm = () => {
    const newErrors = {};

    if (page === "signup" && !form.name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Your password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must have at least 8 characters.";
    }

    if (page === "signup" && form.role === "professional") {
      if (!form.profession) {
        newErrors.profession = "Please select your profession.";
      }

      if (!form.qualification.trim()) {
        newErrors.qualification = "Please enter your qualification.";
      }

      if (!form.registrationNumber.trim()) {
        newErrors.registrationNumber =
          "Registration number is required.";
      }

      if (!form.workplace.trim()) {
        newErrors.workplace = "Please enter your workplace.";
      }

      if (!form.certificate) {
        newErrors.certificate = "Please upload your certificate.";
      } else {
        const allowedTypes = [
          "application/pdf",
          "image/jpeg",
          "image/png",
        ];

        if (!allowedTypes.includes(form.certificate.type)) {
          newErrors.certificate = "Upload a PDF, JPG or PNG file.";
        } else if (form.certificate.size > 5 * 1024 * 1024) {
          newErrors.certificate =
            "File must be smaller than 5 MB.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // LOGIN AND REGISTRATION
  const handleAuth = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    setLoading(true);

    const isSignup = page === "signup";
    const endpoint = isSignup ? "register" : "login";

    try {
      let requestBody;
      const headers = {};

      if (isSignup && form.role === "professional") {
        requestBody = new FormData();

        Object.entries(form).forEach(([key, value]) => {
          if (value !== null && value !== "") {
            requestBody.append(key, value);
          }
        });
      } else {
        requestBody = JSON.stringify(
          isSignup
            ? {
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
              }
            : {
                email: form.email,
                password: form.password,
              }
        );

        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(`${API}/auth/${endpoint}`, {
        method: "POST",
        headers,
        credentials: "include",
        body: requestBody,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setUser(data.user);
      setForm({ ...emptyForm });
      setErrors({});
      setMessage("");
      setPage("dashboard");
    } catch (error) {
      setMessage(
        error.message || "Could not connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  // APPROVE OR REJECT PROFESSIONAL
  const handleVerification = async (professionalId, decision) => {
    const actionKey = `${professionalId}-${decision}`;

    setActionLoading(actionKey);
    setAdminError("");

    try {
      const response = await fetch(
        `${API}/admin/professionals/${professionalId}/${decision}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Action failed.");
      }

      await loadAdminData();
    } catch (error) {
      setAdminError(error.message);
    } finally {
      setActionLoading("");
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    setAdminStats(null);
    setPendingProfessionals([]);
    openPage("home");
  };

  // FIELD ERROR
  const FieldError = ({ name }) => {
    if (!errors[name]) return null;

    return (
      <span className="field-error">
        {errors[name]}
      </span>
    );
  };

  return (
    <div className="babycorp">

      {/* NAVBAR */}
      <header className="navbar">
        <button
          className="brand"
          onClick={() => openPage("home")}
        >
          <span className="brand-icon">B.</span>
          <span>babycorp</span>
        </button>

        <nav className="nav-links">
          <button onClick={() => openPage("home")}>Home</button>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          {user ? (
            <button
              className="signup-btn"
              onClick={handleLogout}
            >
              Log out
            </button>
          ) : (
            <>
              <button
                className="login-btn"
                onClick={() => openPage("login")}
              >
                Login
              </button>

              <button
                className="signup-btn"
                onClick={() => openPage("signup")}
              >
                Sign Up ↗
              </button>
            </>
          )}
        </div>
      </header>

      {/* HOMEPAGE */}
      {page === "home" && (
        <main>

          {/* FLOATING DECORATIONS */}
          <div
            className="floating-decorations"
            aria-hidden="true"
          >
            <span className="float-icon float-heart">♡</span>
            <span className="float-icon float-star">✦</span>
            <span className="float-icon float-cloud">☁</span>
            <span className="float-icon float-sparkle">✧</span>
            <span className="float-icon float-heart-two">♥</span>
            <span className="float-icon float-star-two">✳</span>
          </div>

          {/* HERO */}
          <section className="hero">
            <div className="hero-content">
              <span className="eyebrow">
                PARENTING MADE EASIER
              </span>

              <h1>
                Parenting is better
                <span> together.</span>
              </h1>

              <p>
                Connect with other parents, find trusted healthcare
                professionals and make every little milestone count.
              </p>

              <button
                className="primary-btn"
                onClick={() => openPage("signup")}
              >
                Get Started ↗
              </button>

              <div className="hero-trust">
                <span>♡</span>
                Growing together, one little milestone at a time.
              </div>
            </div>

            <div className="hero-art">
              <div className="hero-blob"></div>

              <img
                src="/babies.png"
                alt="BabyCorp cartoon babies in business suits"
                className="babycorp-babies"
              />

              <span className="floating-star star-one">✦</span>
              <span className="floating-star star-two">✳</span>
            </div>
          </section>

          {/* FEATURES */}
          <section className="features" id="features">
            <div className="section-heading">
              <span className="eyebrow">
                YOUR PARENTING COMPANION
              </span>

              <h2>A little support goes a long way.</h2>

              <p>
                Everything you need for your parenting journey.
              </p>
            </div>

            <div className="feature-grid">
              {features.map((feature) => (
                <article
                  className="feature-card"
                  key={feature.title}
                >
                  <div className="feature-image">
                    <span className="feature-floating-icon">
                      {feature.icon}
                    </span>

                    <img
                      src={feature.image}
                      alt={feature.title}
                    />
                  </div>

                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ABOUT */}
          <section className="about" id="about">
            <div className="about-image">
              <span className="about-decoration about-heart">
                ♡
              </span>

              <span className="about-decoration about-star">
                ✦
              </span>

              <span className="about-decoration about-sparkle">
                ✧
              </span>

              <img
                src="/parents.png"
                alt="Parents and their children together"
              />
            </div>

            <div className="about-content">
              <span className="eyebrow">
                ABOUT BABYCORP
              </span>

              <h2>
                A little help makes a big difference.
              </h2>

              <p>
                Parenting is a beautiful journey, but it can sometimes
                feel overwhelming. BabyCorp brings parents, caregivers
                and healthcare professionals together in one supportive
                space.
              </p>

              <p>
                From sharing experiences to finding trusted guidance,
                we're here to make every little milestone easier.
              </p>

              <button
                className="text-link"
                onClick={() => openPage("signup")}
              >
                Join our community →
              </button>
            </div>
          </section>

          {/* CLOSING STRIP */}
          <section className="home-cta">
            <h2>You're not alone on this journey. ♡</h2>

            <button
              className="primary-btn"
              onClick={() => openPage("signup")}
            >
              Join BabyCorp
            </button>
          </section>

        </main>
      )}

      {/* LOGIN AND SIGNUP */}
      {(page === "login" || page === "signup") && (
        <main className="auth-page">
          <div className="auth-decoration decoration-one"></div>
          <div className="auth-decoration decoration-two"></div>

          <section className="auth-card">
            <button
              className="back-link"
              onClick={() => openPage("home")}
            >
              ← Back to home
            </button>

            <div className="auth-logo">B.</div>

            <span className="eyebrow">
              {page === "signup"
                ? "JOIN THE COMMUNITY"
                : "WELCOME BACK"}
            </span>

            <h1>
              {page === "signup"
                ? "Create your account"
                : "Good to see you again."}
            </h1>

            <p className="auth-subtitle">
              {page === "signup"
                ? "Your parenting journey deserves a little support."
                : "Log in to continue your BabyCorp journey."}
            </p>

            <form onSubmit={handleAuth} noValidate>
              {page === "signup" && (
                <>
                  <label htmlFor="name">Full name</label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={updateForm}
                    className={errors.name ? "input-error" : ""}
                  />

                  <FieldError name="name" />
                </>
              )}

              <label htmlFor="email">Email address</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={updateForm}
                className={errors.email ? "input-error" : ""}
              />

              <FieldError name="email" />

              <label htmlFor="password">Password</label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={updateForm}
                className={errors.password ? "input-error" : ""}
              />

              <FieldError name="password" />

              {page === "signup" && (
                <>
                  <label htmlFor="role">I am joining as a</label>

                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={updateForm}
                  >
                    <option value="parent">
                      Parent / Caregiver
                    </option>

                    <option value="professional">
                      Healthcare Professional
                    </option>
                  </select>

                  {form.role === "professional" && (
                    <div className="professional-fields">
                      <div className="professional-heading">
                        <h3>Professional details</h3>
                        <p>
                          Please provide your credentials for verification.
                        </p>
                      </div>

                      <label htmlFor="profession">
                        Profession
                      </label>

                      <select
                        id="profession"
                        name="profession"
                        value={form.profession}
                        onChange={updateForm}
                        className={
                          errors.profession ? "input-error" : ""
                        }
                      >
                        <option value="">
                          Select your profession
                        </option>
                        <option value="Doctor">Doctor</option>
                        <option value="Pediatrician">
                          Pediatrician
                        </option>
                        <option value="Nurse">Nurse</option>
                        <option value="Nutritionist">
                          Nutritionist
                        </option>
                        <option value="Psychologist">
                          Psychologist
                        </option>
                        <option value="Other">Other</option>
                      </select>

                      <FieldError name="profession" />

                      <label htmlFor="qualification">
                        Qualification
                      </label>

                      <input
                        id="qualification"
                        name="qualification"
                        type="text"
                        placeholder="e.g. MBBS, BSc Nursing"
                        value={form.qualification}
                        onChange={updateForm}
                        className={
                          errors.qualification ? "input-error" : ""
                        }
                      />

                      <FieldError name="qualification" />

                      <label htmlFor="registrationNumber">
                        Registration / Licence number
                      </label>

                      <input
                        id="registrationNumber"
                        name="registrationNumber"
                        type="text"
                        placeholder="Enter registration number"
                        value={form.registrationNumber}
                        onChange={updateForm}
                        className={
                          errors.registrationNumber
                            ? "input-error"
                            : ""
                        }
                      />

                      <FieldError name="registrationNumber" />

                      <label htmlFor="workplace">
                        Workplace / Hospital
                      </label>

                      <input
                        id="workplace"
                        name="workplace"
                        type="text"
                        placeholder="Enter workplace name"
                        value={form.workplace}
                        onChange={updateForm}
                        className={
                          errors.workplace ? "input-error" : ""
                        }
                      />

                      <FieldError name="workplace" />

                      <label htmlFor="certificate">
                        Upload qualification certificate
                      </label>

                      <input
                        id="certificate"
                        name="certificate"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={updateForm}
                        className={
                          errors.certificate ? "input-error" : ""
                        }
                      />

                      <FieldError name="certificate" />

                      <p className="file-help">
                        Accepted formats: PDF, JPG and PNG.
                        Maximum size: 5 MB.
                      </p>
                    </div>
                  )}
                </>
              )}

              {message && (
                <p className="form-message">{message}</p>
              )}

              <button
                type="submit"
                className="primary-btn auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : page === "signup"
                  ? "Create account ↗"
                  : "Log in ↗"}
              </button>
            </form>

            <p className="auth-switch">
              {page === "signup"
                ? "Already have an account?"
                : "New to BabyCorp?"}

              <button
                onClick={() =>
                  openPage(
                    page === "signup" ? "login" : "signup"
                  )
                }
              >
                {page === "signup"
                  ? "Log in"
                  : "Create an account"}
              </button>
            </p>
          </section>
        </main>
      )}

      {/* ADMIN DASHBOARD */}
      {page === "dashboard" && user?.role === "admin" && (
        <main className="admin-dashboard">
          <div className="admin-heading">
            <div>
              <span className="eyebrow">
                BABYCORP CONTROL CENTER
              </span>

              <h1>Admin Dashboard</h1>
              <p>Welcome back, {user.name}.</p>
            </div>

            <button
              className="login-btn"
              onClick={loadAdminData}
              disabled={adminLoading}
            >
              {adminLoading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {adminError && (
            <p className="form-message">{adminError}</p>
          )}

          {adminLoading && !adminStats ? (
            <p>Loading dashboard data...</p>
          ) : (
            <>
              <section className="admin-stats">
                <div className="admin-stat-card">
                  <span>Total users</span>
                  <h2>{adminStats?.totalUsers ?? 0}</h2>
                </div>

                <div className="admin-stat-card">
                  <span>Parents</span>
                  <h2>{adminStats?.totalParents ?? 0}</h2>
                </div>

                <div className="admin-stat-card">
                  <span>Professionals</span>
                  <h2>{adminStats?.totalProfessionals ?? 0}</h2>
                </div>

                <div className="admin-stat-card">
                  <span>Pending approvals</span>
                  <h2>{adminStats?.pendingApprovals ?? 0}</h2>
                </div>
              </section>

              <section className="admin-section">
                <div className="admin-section-heading">
                  <div>
                    <span className="eyebrow">
                      REVIEW APPLICATIONS
                    </span>

                    <h2>Professional verification</h2>
                  </div>

                  <span className="admin-count">
                    {pendingProfessionals.length} pending
                  </span>
                </div>

                {pendingProfessionals.length === 0 ? (
                  <div className="admin-empty">
                    <span>♡</span>
                    <h3>No pending applications</h3>
                    <p>
                      New professional registrations will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="professional-list">
                    {pendingProfessionals.map((professional) => (
                      <article
                        className="professional-card"
                        key={professional._id}
                      >
                        <div className="professional-info">
                          <h3>{professional.name}</h3>
                          <p>{professional.email}</p>

                          <p>
                            <strong>Profession:</strong>{" "}
                            {professional.profession}
                          </p>

                          <p>
                            <strong>Qualification:</strong>{" "}
                            {professional.qualification}
                          </p>

                          <p>
                            <strong>Registration:</strong>{" "}
                            {professional.registrationNumber}
                          </p>

                          <p>
                            <strong>Workplace:</strong>{" "}
                            {professional.workplace}
                          </p>

                          <span className="pending-label">
                            Pending review
                          </span>
                        </div>

                        <div className="professional-actions">
                          <a
                            className="certificate-link"
                            href={`${API}/admin/professionals/${professional._id}/certificate`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View certificate ↗
                          </a>

                          <button
                            className="approve-btn"
                            disabled={Boolean(actionLoading)}
                            onClick={() =>
                              handleVerification(
                                professional._id,
                                "approve"
                              )
                            }
                          >
                            {actionLoading ===
                            `${professional._id}-approve`
                              ? "Approving..."
                              : "Approve"}
                          </button>

                          <button
                            className="reject-btn"
                            disabled={Boolean(actionLoading)}
                            onClick={() =>
                              handleVerification(
                                professional._id,
                                "reject"
                              )
                            }
                          >
                            {actionLoading ===
                            `${professional._id}-reject`
                              ? "Rejecting..."
                              : "Reject"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      )}

      {/* PARENT DASHBOARD */}
      {page === "dashboard" && user?.role === "parent" && (
        <main className="dashboard">
          <span className="eyebrow">
            YOUR BABYCORP SPACE
          </span>

          <h1>Hello, {user.name}! ♡</h1>
          <p>Welcome to your parenting community.</p>

          <div className="dashboard-card">
            <div className="feature-icon">💬</div>
            <h2>Welcome, Parent!</h2>
            <p>
              Your parenting journey starts here.
              Connect with other parents and explore BabyCorp.
            </p>
          </div>
        </main>
      )}

      {/* PROFESSIONAL DASHBOARD */}
      {page === "dashboard" && user?.role === "professional" && (
        <main className="dashboard">
          <span className="eyebrow">
            YOUR BABYCORP SPACE
          </span>

          <h1>Hello, {user.name}! ♡</h1>

          <div className="dashboard-card">
            <div className="feature-icon">🩺</div>
            <h2>Healthcare Professional</h2>

            {user.verificationStatus === "pending" && (
              <p>
                Your credentials are awaiting admin verification.
              </p>
            )}

            {user.verificationStatus === "approved" && (
              <p>
                Your professional account has been verified.
              </p>
            )}

            {user.verificationStatus === "rejected" && (
              <p>
                Your verification was not approved.
                Please contact the administrator.
              </p>
            )}
          </div>
        </main>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <button
          className="brand"
          onClick={() => openPage("home")}
        >
          <span className="brand-icon">B.</span>
          <span>babycorp</span>
        </button>

        <span>Made with care ♡</span>
      </footer>

    </div>
  );
}

export default App;
