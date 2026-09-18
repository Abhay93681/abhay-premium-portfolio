import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  Moon,
  Sun,
  Download,
  ExternalLink,
  Code2,
  Sparkles,
  Menu,
  X,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  Award,
  LayoutDashboard,
  Save,
  Upload,
  Eye
} from "lucide-react";

const API =  "http://localhost:5001/api";

/* =================================
   MAIN APP
================================= */

function App() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [dark, setDark] = useState(localStorage.getItem("theme") !== "light");
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken"));
  const [loginPage, setLoginPage] = useState(false);
  const [adminPage, setAdminPage] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  /* =========================
     LOAD DATA (FIXED & SAFE FETCH)
  ========================= */

  async function loadData() {
    try {
      const [profileResponse, projectsResponse, certificatesResponse] =
        await Promise.all([
          fetch(`${API}/profile`),
          fetch(`${API}/projects`),
          fetch(`${API}/certificates`)
        ]);

      // Safe JSON parsing with fallback checks
      const profileData = profileResponse.ok
        ? await profileResponse.json()
        : { name: "Developer", headline: "Welcome", bio: "", skills: [] };

      const projectsData = projectsResponse.ok
        ? await projectsResponse.json()
        : [];

      const certificatesData = certificatesResponse.ok
        ? await certificatesResponse.json()
        : [];

      setProfile(profileData);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setCertificates(Array.isArray(certificatesData) ? certificatesData : []);
    } catch (error) {
      console.error("Loading error:", error);
      // Fallback state in case server is completely down
      setProfile({ name: "Developer", headline: "Welcome", bio: "", skills: [] });
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /* =========================
     THEME
  ========================= */

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  if (!profile) {
    return <div className="loading">Loading portfolio...</div>;
  }

  /* =========================
     LOGIN PAGE
  ========================= */

  if (loginPage) {
    return (
      <LoginPage
        onBack={() => setLoginPage(false)}
        onSuccess={(token) => {
          localStorage.setItem("adminToken", token);
          setAdminToken(token);
          setLoginPage(false);
          setAdminPage(true);
        }}
      />
    );
  }

  /* =========================
     ADMIN PAGE
  ========================= */

  if (adminPage && adminToken) {
    return (
      <AdminDashboard
        profile={profile}
        projects={projects}
        certificates={certificates}
        token={adminToken}
        reload={loadData}
        onBack={() => setAdminPage(false)}
        onLogout={() => {
          localStorage.removeItem("adminToken");
          setAdminToken(null);
          setAdminPage(false);
        }}
      />
    );
  }

  /* =========================
     WEBSITE
  ========================= */

  return (
    <div className="app">
      <Navbar
        dark={dark}
        setDark={setDark}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
        onAdmin={() => {
          if (adminToken) {
            setAdminPage(true);
          } else {
            setLoginPage(true);
          }
        }}
      />

      <main>
        <Hero profile={profile} />
        <HeroInfo profile={profile} />
        <About profile={profile} />
        <Projects projects={projects} />
        <Certificates certificates={certificates} api={API} />
        <Skills profile={profile} />
        <Contact profile={profile} />
      </main>

      <Footer profile={profile} />

      <button
        className="top-button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </div>
  );
}

/* =================================
   NAVBAR
================================= */

function Navbar({ dark, setDark, mobileMenu, setMobileMenu, onAdmin }) {
  const links = ["about", "projects", "certificates", "skills", "contact"];

  return (
    <nav className="navbar">
      <a href="#home" className="logo">
        AB<span>.</span>
      </a>

      <div className={mobileMenu ? "nav-links mobile-open" : "nav-links"}>
        {links.map((link) => (
          <a key={link} href={`#${link}`} onClick={() => setMobileMenu(false)}>
            {link}
          </a>
        ))}

        <button className="theme-button" onClick={() => setDark(!dark)}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="admin-button" onClick={onAdmin}>
          <LayoutDashboard size={16} />
          Admin
        </button>
      </div>

      <button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)}>
        {mobileMenu ? <X /> : <Menu />}
      </button>
    </nav>
  );
}

/* =================================
   HERO
================================= */
function Hero({
  profile
}) {

  return (

    <section
      id="home"
      className="hero-showcase"
    >

      <motion.h1
        className="giant-heading"

        initial={{
          opacity: 0
        }}

        animate={{
          opacity: 1
        }}

        transition={{
          duration: 0.8
        }}
      >

        I'M A
        <br />
        {profile.headline || "DEVELOPER"}

      </motion.h1>


      <motion.img
        src="/profile.jpg"
        alt={profile.name}
        className="hero-photo-large"

        initial={{
          opacity: 0,
          y: 40
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          duration: 0.8,
          delay: 0.2
        }}
      />

    </section>

  );

}


function HeroInfo({
  profile
}) {

  return (

    <section className="hero-info section">

      <motion.div

        initial={{
          opacity: 0,
          y: 30
        }}

        whileInView={{
          opacity: 1,
          y: 0
        }}

        viewport={{
          once: true
        }}
      >

        <div className="eyebrow">
          HELLO
        </div>


        <h2>
          I'M {profile.name?.toUpperCase()}
        </h2>


        <p className="hero-description">

          {profile.bio}

        </p>


        <div className="hero-buttons">

          
            href="#projects"
            className="primary-button"
          >

            Explore Projects

            <ArrowUpRight size={18} />

          </a>


          {profile.resumeUrl && (

            
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="secondary-button"
            >

              <Download size={17} />

              Resume

            </a>

          )}

        </div>


        <div className="social-links">

          {profile.github && (

            
              href={profile.github}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={16} />
              GitHub
            </a>

          )}


          {profile.linkedin && (

            
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              <Linkedin size={16} />
              LinkedIn
            </a>

          )}


          {profile.email && (

            <a href={`mailto:${profile.email}`}>
              <Mail size={16} />
              Email
            </a>

          )}

        </div>

      </motion.div>

    </section>

  );

}
/* =================================
   ABOUT
================================= */

function About({ profile }) {
  return (
    <section id="about" className="section">
      <SectionTitle number="01" title="About me" />

      <div className="about-grid">
        <div>
          <p className="large-text">
            I'm <strong>{profile.name}</strong>, a CSE student focused on
            building clean, useful and interactive software.
          </p>
        </div>

        <div className="about-card">
          <span>FOCUS</span>
          <h3>Web · AI · Cloud</h3>
          <p>
            I enjoy creating complete products — from beautiful frontend
            interfaces to APIs, databases and cloud deployment.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =================================
   PROJECTS
================================= */

function Projects({ projects }) {
  return (
    <section id="projects" className="section">
      <SectionTitle number="02" title="Projects" />

      <div className="project-grid">
        {projects.map((project, index) => (
          <motion.article
            key={project._id || index}
            className="project-card"
            whileHover={{ y: -8 }}
          >
            <div className="project-number">
              0{index + 1}
              {project.featured && <span>FEATURED</span>}
            </div>

            <h3>{project.title}</h3>
            <p>{project.description}</p>

            <div className="tags">
              {Array.isArray(project.tech) &&
                project.tech.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
            </div>

            <div className="project-links">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                  Live Demo <ExternalLink size={15} />
                </a>
              )}

              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noreferrer">
                  GitHub <Github size={15} />
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/* =================================
   CERTIFICATES
================================= */

function Certificates({ certificates, api }) {
  return (
    <section id="certificates" className="section">
      <SectionTitle number="03" title="Certificates" />

      <div className="certificate-grid">
        {certificates.length === 0 ? (
          <div className="empty-box">
            Add certificates from the Admin Dashboard.
          </div>
        ) : (
          certificates.map((certificate) => (
            <motion.article
              key={certificate._id}
              className="certificate-card"
              whileHover={{ scale: 1.02 }}
            >
              <div className="certificate-icon">
                <Award />
              </div>

              <div>
                <span className="issuer">{certificate.issuer}</span>
                <h3>{certificate.title}</h3>
                <p>{certificate.date}</p>
              </div>

              <div className="certificate-buttons">
                <a
                  href={`${api}/certificates/${certificate._id}/file`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Eye size={15} /> View
                </a>

                {certificate.verificationUrl && (
                  <a
                    href={certificate.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Verify <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </motion.article>
          ))
        )}
      </div>
    </section>
  );
}

/* =================================
   SKILLS
================================= */

function Skills({ profile }) {
  const skillsList = Array.isArray(profile.skills) ? profile.skills : [];

  return (
    <section id="skills" className="section">
      <SectionTitle number="04" title="Skills & Tools" />

      <div className="skill-cloud">
        {skillsList.map((skill, index) => (
          <motion.div
            key={skill}
            className="skill"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
          >
            {skill}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* =================================
   CONTACT
================================= */

function Contact({ profile }) {
  return (
    <section id="contact" className="section">
      <SectionTitle number="05" title="Let's connect" />

      <div className="contact-box">
        <div>
          <div className="eyebrow">HAVE AN IDEA?</div>
          <h2>
            Let's build something <br />
            <em>great together.</em>
          </h2>
        </div>

        {profile.email && (
          <a href={`mailto:${profile.email}`} className="primary-button">
            Send Email <ArrowUpRight />
          </a>
        )}
      </div>
    </section>
  );
}

/* =================================
   FOOTER
================================= */

function Footer({ profile }) {
  return (
    <footer>
      <span>
        © {new Date().getFullYear()} {profile.name}
      </span>

      <div>
        {profile.github && (
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        )}

        {profile.linkedin && (
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        )}
      </div>
    </footer>
  );
}

/* =================================
   SECTION TITLE
================================= */

function SectionTitle({ number, title }) {
  return (
    <div className="section-title">
      <span>{number}</span>
      <h2>{title}</h2>
    </div>
  );
}

/* =================================
   LOGIN
================================= */

function LoginPage({ onBack, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      onSuccess(data.token);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="login-card">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>

        <div className="eyebrow">
          <LayoutDashboard size={15} /> PRIVATE ADMIN AREA
        </div>

        <h1>Admin Login</h1>
        <p>Manage your portfolio.</p>

        <form onSubmit={login} className="login-form">
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <div className="error">{error}</div>}

          <button className="primary-button full" disabled={loading}>
            {loading ? "Logging in..." : "Login"} <ArrowUpRight />
          </button>
        </form>
      </div>
    </div>
  );
}

/* =================================
   ADMIN DASHBOARD
================================= */

function AdminDashboard({
  profile,
  projects,
  certificates,
  token,
  reload,
  onBack,
  onLogout
}) {
  const [tab, setTab] = useState("profile");
  const [message, setMessage] = useState("");

  const authHeaders = {
    Authorization: `Bearer ${token}`
  };

  async function saveProfile(profileData) {
    const response = await fetch(`${API}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders
      },
      body: JSON.stringify(profileData)
    });

    if (response.ok) {
      setMessage("Profile saved successfully ✓");
      await reload();
    }
  }

  async function deleteItem(type, id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this?"
    );

    if (!confirmed) return;

    await fetch(`${API}/${type}/${id}`, {
      method: "DELETE",
      headers: authHeaders
    });

    await reload();
  }

  return (
    <div className="admin-page">
      <div className="dashboard">
        <aside className="sidebar">
          <div className="sidebar-logo">
            AB<span>.</span>
          </div>

          <p>PORTFOLIO CMS</p>

          <button
            className={tab === "profile" ? "active" : ""}
            onClick={() => setTab("profile")}
          >
            Profile
          </button>

          <button
            className={tab === "projects" ? "active" : ""}
            onClick={() => setTab("projects")}
          >
            Projects
          </button>

          <button
            className={tab === "certificates" ? "active" : ""}
            onClick={() => setTab("certificates")}
          >
            Certificates
          </button>

          <button onClick={onBack}>View Website</button>

          <button className="logout-button" onClick={onLogout}>
            <LogOut size={15} /> Logout
          </button>
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-top">
            <button className="back-button" onClick={onBack}>
              ← Website
            </button>
            <span>{message}</span>
          </div>

          {tab === "profile" && (
            <ProfileEditor profile={profile} saveProfile={saveProfile} />
          )}

          {tab === "projects" && (
            <ProjectEditor
              projects={projects}
              token={token}
              reload={reload}
              deleteItem={deleteItem}
            />
          )}

          {tab === "certificates" && (
            <CertificateEditor
              certificates={certificates}
              token={token}
              reload={reload}
              deleteItem={deleteItem}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* =================================
   PROFILE EDITOR
================================= */

function ProfileEditor({ profile, saveProfile }) {
  const [form, setForm] = useState(profile);

  function update(key, value) {
    setForm({
      ...form,
      [key]: value
    });
  }

  function save() {
    saveProfile({
      ...form,
      skills:
        typeof form.skills === "string"
          ? form.skills
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : form.skills
    });
  }

  return (
    <div className="editor">
      <div className="editor-heading">
        <div>
          <div className="eyebrow">SETTINGS</div>
          <h1>Profile</h1>
        </div>

        <button className="primary-button" onClick={save}>
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="form-grid">
        {[
          "name",
          "headline",
          "email",
          "phone",
          "location",
          "github",
          "linkedin",
          "instagram",
          "resumeUrl"
        ].map((key) => (
          <label key={key}>
            {key}
            <input
              value={form[key] || ""}
              onChange={(event) => update(key, event.target.value)}
            />
          </label>
        ))}

        <label className="wide">
          Bio
          <textarea
            value={form.bio || ""}
            onChange={(event) => update("bio", event.target.value)}
          />
        </label>

        <label className="wide">
          Skills
          <input
            value={
              Array.isArray(form.skills)
                ? form.skills.join(", ")
                : form.skills || ""
            }
            onChange={(event) => update("skills", event.target.value)}
            placeholder="React, JavaScript, Node.js..."
          />
        </label>
      </div>
    </div>
  );
}

/* =================================
   PROJECT EDITOR
================================= */

function ProjectEditor({ projects, token, reload, deleteItem }) {
  const empty = {
    title: "",
    description: "",
    tech: "",
    githubUrl: "",
    liveUrl: "",
    featured: false
  };

  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  async function submit(event) {
    event.preventDefault();

    const data = {
      ...form,
      tech:
        typeof form.tech === "string"
          ? form.tech
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : form.tech
    };

    const url = editing ? `${API}/projects/${editing}` : `${API}/projects`;

    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    setForm(empty);
    setEditing(null);
    await reload();
  }

  function edit(project) {
    setEditing(project._id);
    setForm({
      ...project,
      tech: Array.isArray(project.tech) ? project.tech.join(", ") : ""
    });
  }

  return (
    <div className="editor">
      <div className="editor-heading">
        <div>
          <div className="eyebrow">CONTENT</div>
          <h1>Projects</h1>
        </div>

        <button
          className="secondary-button"
          onClick={() => {
            setForm(empty);
            setEditing(null);
          }}
        >
          <Plus /> New Project
        </button>
      </div>

      <form className="content-form" onSubmit={submit}>
        <input
          placeholder="Project title"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          required
        />

        <textarea
          placeholder="Project description"
          value={form.description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
        />

        <input
          placeholder="React, Node.js, MongoDB"
          value={form.tech}
          onChange={(event) => setForm({ ...form, tech: event.target.value })}
        />

        <input
          placeholder="GitHub URL"
          value={form.githubUrl}
          onChange={(event) =>
            setForm({ ...form, githubUrl: event.target.value })
          }
        />

        <input
          placeholder="Live Demo URL"
          value={form.liveUrl}
          onChange={(event) => setForm({ ...form, liveUrl: event.target.value })}
        />

        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) =>
              setForm({ ...form, featured: event.target.checked })
            }
          />
          Featured Project
        </label>

        <button className="primary-button">
          {editing ? <Save /> : <Plus />}
          {editing ? "Update Project" : "Add Project"}
        </button>
      </form>

      <div className="admin-list">
        {projects.map((project) => (
          <div className="admin-item" key={project._id}>
            <div>
              <strong>{project.title}</strong>
              <small>
                {Array.isArray(project.tech)
                  ? project.tech.join(" · ")
                  : project.tech}
              </small>
            </div>

            <div>
              <button onClick={() => edit(project)}>
                <Pencil />
              </button>
              <button onClick={() => deleteItem("projects", project._id)}>
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================================
   CERTIFICATE EDITOR
================================= */

function CertificateEditor({ certificates, token, reload, deleteItem }) {
  const empty = {
    title: "",
    issuer: "",
    date: "",
    verificationUrl: ""
  };

  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);

  async function submit(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("issuer", form.issuer);
    formData.append("date", form.date);
    formData.append("verificationUrl", form.verificationUrl);
    if (file) formData.append("file", file);

    await fetch(`${API}/certificates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    setForm(empty);
    setFile(null);
    await reload();
  }

  return (
    <div className="editor">
      <div className="editor-heading">
        <div>
          <div className="eyebrow">CONTENT</div>
          <h1>Certificates</h1>
        </div>
      </div>

      <form className="content-form" onSubmit={submit}>
        <input
          placeholder="Certificate Title"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          required
        />

        <input
          placeholder="Issuer (e.g. AWS, Coursera)"
          value={form.issuer}
          onChange={(event) =>
            setForm({ ...form, issuer: event.target.value })
          }
          required
        />

        <input
          placeholder="Date"
          value={form.date}
          onChange={(event) => setForm({ ...form, date: event.target.value })}
        />

        <input
          placeholder="Verification URL"
          value={form.verificationUrl}
          onChange={(event) =>
            setForm({ ...form, verificationUrl: event.target.value })
          }
        />

        <input
          type="file"
          onChange={(event) => setFile(event.target.files[0])}
        />

        <button className="primary-button">
          <Upload /> Add Certificate
        </button>
      </form>

      <div className="admin-list">
        {certificates.map((cert) => (
          <div className="admin-item" key={cert._id}>
            <div>
              <strong>{cert.title}</strong>
              <small>{cert.issuer}</small>
            </div>

            <div>
              <button onClick={() => deleteItem("certificates", cert._id)}>
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;