import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle, ArrowUp, ArrowUpRight, Award, Brain, Briefcase, CheckCircle2,
  Cloud, Code2, Copy, Database, Download, ExternalLink, Eye, FileText, Github,
  GraduationCap, Instagram, LayoutDashboard, Linkedin, LogOut, Mail, MapPin,
  Menu, Monitor, Moon, Pencil, Plus, RefreshCw, Save, Send, Server, Sparkles,
  Sun, Trash2, Upload, Wrench, X
} from "lucide-react";

/* =================================
   CONFIG
   VITE_API_URL must include "/api", e.g. https://abhay-premium-portfolio.onrender.com/api
================================= */

const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const NAV = [
  ["home", "Home"], ["about", "About"], ["projects", "Projects"],
  ["skills", "Skills"], ["experience", "Experience"],
  ["certificates", "Certificates"], ["resume", "Resume"], ["contact", "Contact"]
];
const NAV_IDS = NAV.map((item) => item[0]);

/*
  EXPERIENCE: the backend has no experience endpoint, so this list lives here.
  Edit it freely. Only add entries whose details you can verify.
  Template:
  { title: "", org: "", date: "", description: "", skills: [], link: "https://verification-url" }
*/
const EXPERIENCE = [
  {
    title: "Web Development and Marketing Virtual Internship",
    org: "IBM",
    date: "21 Jul 2026 to 23 Sep 2026",
    description: "Virtual internship program covering web development and marketing.",
    skills: ["Web Development", "Marketing"],
    link: ""
  },
  {
    title: "IBM SkillsBuild Internship: Generative AI and Cloud Computing",
    org: "IBM",
    date: "22 Jun 2026 to 31 Jul 2026",
    description: "Internship program focused on generative AI and cloud computing.",
    skills: ["Generative AI", "Cloud Computing"],
    link: ""
  }
];

const SKILL_GROUPS = [
  { title: "Frontend", Icon: Monitor, match: ["html", "css", "javascript", "react", "tailwind", "bootstrap", "typescript", "next", "vite", "redux"] },
  { title: "Backend", Icon: Server, match: ["node", "express", "rest", "jwt", "php", "django", "flask", "spring"] },
  { title: "Database", Icon: Database, match: ["mongo", "sql", "firebase", "postgres", "mysql", "redis"] },
  { title: "AI and APIs", Icon: Brain, match: ["gemini", "openai", "ai", "ml", "llm", "tensorflow", "chatgpt"] },
  { title: "Cloud and tools", Icon: Cloud, match: ["aws", "git", "github", "docker", "linux", "vercel", "netlify", "render", "azure", "gcp", "postman", "figma"] },
  { title: "Programming", Icon: Code2, match: ["c", "c++", "java", "python", "go", "dsa"] }
];

/* =================================
   HELPERS
================================= */

function safeUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function skillMatches(skill, key) {
  const lower = skill.toLowerCase().trim();
  if (lower === key) return true;
  if (lower.split(/[\s./+#-]+/).includes(key)) return true;
  return key.length >= 4 && lower.includes(key);
}

function groupSkills(skills) {
  const groups = SKILL_GROUPS.map((g) => ({ ...g, items: [] }));
  const other = { title: "Other", Icon: Wrench, items: [] };
  skills.forEach((skill) => {
    if (typeof skill !== "string" || !skill.trim()) return;
    const group = groups.find((g) => g.match.some((key) => skillMatches(skill, key)));
    (group || other).items.push(skill);
  });
  return [...groups, other].filter((g) => g.items.length > 0);
}

function getSocials(profile) {
  const list = [];
  const github = safeUrl(profile.github);
  const linkedin = safeUrl(profile.linkedin);
  const instagram = safeUrl(profile.instagram);
  if (github) list.push({ key: "github", label: "GitHub", href: github, Icon: Github, external: true });
  if (linkedin) list.push({ key: "linkedin", label: "LinkedIn", href: linkedin, Icon: Linkedin, external: true });
  if (instagram) list.push({ key: "instagram", label: "Instagram", href: instagram, Icon: Instagram, external: true });
  if (profile.email) list.push({ key: "email", label: "Email", href: "#contact", Icon: Mail, external: false });
  return list;
}

async function fetchJson(path) {
  const response = await fetch(`${API}${path}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/* =================================
   SMALL UI PIECES
================================= */

function Reveal({ children, delay = 0, className = "" }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({ title, text }) {
  return (
    <Reveal className="section-head">
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </Reveal>
  );
}

function StateBox({ icon: Icon, title, text, action }) {
  return (
    <div className="state-box glass" role="status">
      <Icon size={24} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

function Toasts({ items }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {t.text}
        </div>
      ))}
    </div>
  );
}

function Particles() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return undefined;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let raf = 0;
    const dots = Array.from({ length: 38 }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.00005, vy: (Math.random() - 0.5) * 0.00005,
      c: Math.random() > 0.5 ? "81,69,255" : "0,217,255"
    }));
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      dots.forEach((d) => {
        d.x = (d.x + d.vx * 16 + 1) % 1;
        d.y = (d.y + d.vy * 16 + 1) % 1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${d.c},.55)`;
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) draw();
    };
    resize();
    draw();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);
  return <canvas ref={ref} className="particles" aria-hidden="true" />;
}

function SocialLinks({ profile }) {
  return (
    <div className="socials">
      {getSocials(profile).map(({ key, label, href, Icon, external }) => (
        <a
          key={key}
          href={href}
          className="social"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <Icon size={17} />
          {label}
        </a>
      ))}
    </div>
  );
}

/* =================================
   MAIN APP
================================= */

function App() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [status, setStatus] = useState("loading");
  const [sectionErrors, setSectionErrors] = useState({ projects: false, certificates: false });
  const [dark, setDark] = useState(localStorage.getItem("theme") !== "light");
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken"));
  const [loginPage, setLoginPage] = useState(false);
  const [adminPage, setAdminPage] = useState(false);
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((text, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, text, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3800);
  }, []);

  const loadData = useCallback(async (showLoader = false) => {
    if (showLoader) setStatus("loading");
    const [p, pr, c] = await Promise.allSettled([
      fetchJson("/profile"), fetchJson("/projects"), fetchJson("/certificates")
    ]);
    const profileOk = p.status === "fulfilled" && p.value && typeof p.value === "object" && !Array.isArray(p.value);
    if (!profileOk) {
      setStatus((prev) => (prev === "ready" && !showLoader ? "ready" : "error"));
      return;
    }
    const projectsOk = pr.status === "fulfilled" && Array.isArray(pr.value);
    const certsOk = c.status === "fulfilled" && Array.isArray(c.value);
    setProfile({ ...p.value, skills: Array.isArray(p.value.skills) ? p.value.skills : [] });
    setProjects(projectsOk ? pr.value : []);
    setCertificates(certsOk ? c.value : []);
    setSectionErrors({ projects: !projectsOk, certificates: !certsOk });
    setStatus("ready");
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    document.title = profile?.name ? `${profile.name} | Portfolio` : "Abhay Bhardwaj | Portfolio";
  }, [profile]);

  if (status === "loading") {
    return (
      <div className="boot" role="status" aria-live="polite">
        <div className="boot-inner">
          <div className="skeleton sk-line w60" />
          <div className="skeleton sk-title" />
          <div className="skeleton sk-line w80" />
          <div className="skeleton sk-line w40" />
          <p>Loading portfolio. If the server was idle, this can take up to a minute.</p>
        </div>
      </div>
    );
  }

  if (status === "error" || !profile) {
    return (
      <div className="boot">
        <div className="boot-inner">
          <StateBox
            icon={AlertCircle}
            title="Could not reach the server"
            text="The backend may be waking up or your connection dropped. Wait a few seconds and try again."
            action={
              <button className="btn btn-primary" onClick={() => loadData(true)}>
                <RefreshCw size={16} /> Try again
              </button>
            }
          />
        </div>
      </div>
    );
  }

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

  if (adminPage && adminToken) {
    return (
      <AdminDashboard
        profile={profile}
        projects={projects}
        certificates={certificates}
        token={adminToken}
        reload={() => loadData(false)}
        onBack={() => setAdminPage(false)}
        onLogout={() => {
          localStorage.removeItem("adminToken");
          setAdminToken(null);
          setAdminPage(false);
        }}
      />
    );
  }

  const resumeUrl = safeUrl(profile.resumeUrl) || "/resume.pdf";

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to content</a>
      <Particles />
      <Navbar
        dark={dark}
        setDark={setDark}
        resumeUrl={resumeUrl}
        onAdmin={() => (adminToken ? setAdminPage(true) : setLoginPage(true))}
      />
      <main id="main">
        <Hero profile={profile} projects={projects} certificates={certificates} />
        <About profile={profile} />
        <Projects projects={projects} error={sectionErrors.projects} onRetry={() => loadData(false)} />
        <Skills profile={profile} />
        <Experience />
        <Certificates certificates={certificates} error={sectionErrors.certificates} onRetry={() => loadData(false)} />
        <ResumeSection profile={profile} resumeUrl={resumeUrl} />
        <Contact profile={profile} notify={notify} />
      </main>
      <Footer profile={profile} />
      <BackToTop />
      <Toasts items={toasts} />
    </div>
  );
}

/* =================================
   NAVBAR
================================= */

function Navbar({ dark, setDark, resumeUrl, onAdmin }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(NAV_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className={`nav-wrap ${scrolled ? "scrolled" : ""}`}>
      <nav className="navbar" aria-label="Primary">
        <a href="#home" className="logo" aria-label="Abhay Bhardwaj, home">
          AB<span>.</span>
        </a>

        <div id="nav-menu" className={`nav-links ${open ? "open" : ""}`}>
          {NAV.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? "active" : ""}
              aria-current={active === id ? "true" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <a className="btn btn-small btn-primary nav-cv" href={resumeUrl} download="Abhay-Bhardwaj-Resume.pdf">
            <Download size={15} /> Resume
          </a>
          <button className="icon-btn" onClick={() => setDark(!dark)} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn" onClick={onAdmin} aria-label="Admin login">
            <LayoutDashboard size={18} />
          </button>
          <button
            className="icon-btn menu-button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
    </header>
  );
}

/* =================================
   HERO
================================= */

function Hero({ profile, projects, certificates }) {
  const reduce = useReducedMotion();
  const [imageOk, setImageOk] = useState(true);
  const name = profile.name || "Abhay Bhardwaj";
  const firstName = name.split(" ")[0];
  const initials = name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  const onMove = (event) => {
    if (reduce) return;
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--px", ((event.clientX - box.left) / box.width - 0.5).toFixed(3));
    event.currentTarget.style.setProperty("--py", ((event.clientY - box.top) / box.height - 0.5).toFixed(3));
  };
  const onLeave = (event) => {
    event.currentTarget.style.setProperty("--px", 0);
    event.currentTarget.style.setProperty("--py", 0);
  };

  return (
    <section id="home" className="hero container">
      <div className="hero-copy">
        <p className="greeting">Hello, I'm {firstName} 👋</p>
        <h1>{name}</h1>
        <p className="hero-role">{profile.headline}</p>
        <p className="hero-bio">
          {profile.bio ||
            "I build web applications, solve real-world problems with code, and keep learning modern technologies."}
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#projects">
            View My Projects <ArrowUpRight size={18} />
          </a>
          <a className="btn btn-ghost" href="#contact">Let's Connect</a>
        </div>
        <SocialLinks profile={profile} />
      </div>

      <div className="hero-visual" onMouseMove={onMove} onMouseLeave={onLeave}>
        <div className="photo-frame">
          <div className="photo-glow" aria-hidden="true" />
          {imageOk ? (
            <img
              src="/profile.jpg"
              alt={`Portrait of ${name}`}
              width="420"
              height="525"
              onError={() => setImageOk(false)}
            />
          ) : (
            <div className="photo-fallback" aria-hidden="true">{initials}</div>
          )}
        </div>

        <div className="float-card fc-edu glass">
          <GraduationCap size={20} />
          <div>
            <strong>B.Tech CSE</strong>
            <span>Moradabad Institute of Technology</span>
          </div>
        </div>
        {(projects.length > 0 || certificates.length > 0) && (
          <div className="float-card fc-stats glass">
            <Code2 size={20} />
            <div>
              {projects.length > 0 && <strong>{projects.length} {projects.length === 1 ? "project" : "projects"}</strong>}
              {certificates.length > 0 && (
                <span>{certificates.length} {certificates.length === 1 ? "certificate" : "certificates"}</span>
              )}
            </div>
          </div>
        )}
        <div className="float-card fc-learn glass">
          <Sparkles size={20} />
          <div>
            <strong>Always learning</strong>
            <span>Solving problems by building</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================================
   ABOUT
================================= */

function About({ profile }) {
  const interests = ["Frontend development", "Full-stack development", "AI applications", "Software engineering"];
  return (
    <section id="about" className="section container">
      <SectionHead title="About me" text="A student developer who learns by shipping real projects." />
      <div className="about-grid">
        <Reveal className="about-text">
          <p className="lead">
            I'm {profile.name}, a Computer Science Engineering student at Moradabad Institute of Technology.
            I like taking an idea from interface to API to a live deployment.
          </p>
          {profile.bio && <p>{profile.bio}</p>}
          <p>
            Right now I'm focused on becoming a well-rounded software engineer: building useful products,
            reading other people's code, and learning something new every week.
          </p>
        </Reveal>

        <Reveal className="about-cards" delay={0.1}>
          <div className="info-card glass">
            <GraduationCap size={20} />
            <h3>Education</h3>
            <p>B.Tech in Computer Science Engineering</p>
            <p className="muted">Moradabad Institute of Technology</p>
          </div>
          <div className="info-card glass">
            <Sparkles size={20} />
            <h3>Areas of interest</h3>
            <ul className="chips">
              {interests.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          {profile.location && (
            <div className="info-card glass">
              <MapPin size={20} />
              <h3>Based in</h3>
              <p>{profile.location}</p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* =================================
   PROJECTS
================================= */

function Projects({ projects, error, onRetry }) {
  return (
    <section id="projects" className="section container">
      <SectionHead title="Projects" text="Things I've built, with source code and live demos where available." />
      {error ? (
        <StateBox
          icon={AlertCircle}
          title="Projects didn't load"
          text="The server may still be waking up. Try again in a moment."
          action={<button className="btn btn-ghost" onClick={onRetry}><RefreshCw size={16} /> Try again</button>}
        />
      ) : projects.length === 0 ? (
        <StateBox
          icon={Code2}
          title="No projects yet"
          text="Projects added from the admin dashboard will appear here."
        />
      ) : (
        <div className="bento">
          {projects.map((project, index) => (
            <ProjectCard key={project._id || project.title} project={project} wide={index === 0 || project.featured} />
          ))}
        </div>
      )}
    </section>
  );
}

/* =================================
   PROJECT CARD (Fixed Screenshot & Video Display)
================================= */

function ProjectCard({ project, wide }) {
  // Check if screenshot exists by checking project.screenshot object or name
  const hasScreenshot = Boolean(project.screenshot && (project.screenshot.name || project.screenshot.contentType));
  const screenshotUrl = `${API}/projects/${project._id}/screenshot`;
  
  const hasVideo = Boolean(project.video && (project.video.name || project.video.contentType));
  const videoUrl = `${API}/projects/${project._id}/video`;

  const github = safeUrl(project.githubUrl);
  const live = safeUrl(project.liveUrl);
  const tech = Array.isArray(project.tech) ? project.tech : [];

  return (
    <Reveal className={`project-card glow ${wide ? "wide" : ""}`}>
      <div className="thumb" style={{ height: hasScreenshot ? "220px" : "170px" }}>
        {hasScreenshot ? (
          <img src={screenshotUrl} alt={`${project.title} screenshot`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Monitor size={40} aria-hidden="true" />
        )}
        {project.featured && <span className="badge">Featured</span>}
      </div>

      {hasVideo && (
        <div style={{ padding: "16px 22px 0 22px" }}>
          <video width="100%" controls preload="metadata" style={{ borderRadius: "8px", maxHeight: "220px", background: "#000" }}>
            <source src={videoUrl} type={project.video.contentType} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      <div className="project-body">
        <h3>{project.title}</h3>
        {project.description && <p>{project.description}</p>}
        {tech.length > 0 && (
          <ul className="chips">
            {tech.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}
        <div className="project-links">
          {live && (
            <a className="btn btn-small btn-primary" href={live} target="_blank" rel="noopener noreferrer">
              Live demo <ExternalLink size={14} />
            </a>
          )}
          {github && (
            <a className="btn btn-small btn-ghost" href={github} target="_blank" rel="noopener noreferrer">
              <Github size={14} /> GitHub
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/* =================================
   SKILLS
================================= */

function Skills({ profile }) {
  const groups = groupSkills(profile.skills);
  return (
    <section id="skills" className="section container">
      <SectionHead title="Skills and tools" text="Technologies I use to build and ship projects." />
      {groups.length === 0 ? (
        <StateBox icon={Wrench} title="No skills listed" text="Add skills from the admin dashboard." />
      ) : (
        <div className="skills-grid">
          {groups.map(({ title, Icon, items }, index) => (
            <Reveal key={title} className="skill-card glass" delay={index * 0.05}>
              <div className="skill-title"><Icon size={20} /><h3>{title}</h3></div>
              <ul className="chips">
                {items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

/* =================================
   EXPERIENCE
================================= */

function Experience() {
  return (
    <section id="experience" className="section container">
      <SectionHead title="Experience" text="Internships and training programs, newest first." />
      {EXPERIENCE.length === 0 ? (
        <StateBox icon={Briefcase} title="Nothing here yet" text="Experience entries will appear here." />
      ) : (
        <ol className="timeline">
          {EXPERIENCE.map((item) => {
            const link = safeUrl(item.link);
            return (
              <li key={`${item.org}-${item.title}`}>
                <Reveal className="timeline-card glass">
                  <div className="timeline-top">
                    <Briefcase size={18} />
                    <span className="muted">{item.date}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="org">{item.org}</p>
                  {item.description && <p>{item.description}</p>}
                  {item.skills?.length > 0 && (
                    <ul className="chips">
                      {item.skills.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  )}
                  {link && (
                    <a className="text-link" href={link} target="_blank" rel="noopener noreferrer">
                      Verify <ExternalLink size={14} />
                    </a>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/* =================================
   CERTIFICATES
================================= */

function Certificates({ certificates, error, onRetry }) {
  return (
    <section id="certificates" className="section container">
      <SectionHead title="Certificates" text="Courses and programs I've completed." />
      {error ? (
        <StateBox
          icon={AlertCircle}
          title="Certificates didn't load"
          text="The server may still be waking up. Try again in a moment."
          action={<button className="btn btn-ghost" onClick={onRetry}><RefreshCw size={16} /> Try again</button>}
        />
      ) : certificates.length === 0 ? (
        <StateBox icon={Award} title="No certificates yet" text="Certificates added from the admin dashboard will appear here." />
      ) : (
        <div className="cert-grid">
          {certificates.map((cert) => <CertificateCard key={cert._id || cert.title} cert={cert} />)}
        </div>
      )}
    </section>
  );
}

function CertificateCard({ cert }) {
  const hasFile = Boolean(cert.file && cert.file.name);
  const fileUrl = `${API}/certificates/${cert._id}/file`;
  const isImage = hasFile && String(cert.file.contentType || "").startsWith("image/");
  const verify = safeUrl(cert.verificationUrl);

  return (
    <Reveal className="cert-card glow">
      <div className="cert-preview">
        {isImage ? (
          <img src={fileUrl} alt={`${cert.title} certificate preview`} loading="lazy" />
        ) : (
          <div className="cert-icon" aria-hidden="true">
            {hasFile ? <FileText size={34} /> : <Award size={34} />}
            {hasFile && <span>PDF</span>}
          </div>
        )}
      </div>
      <div className="cert-body">
        {cert.issuer && <p className="muted">{cert.issuer}</p>}
        <h3>{cert.title}</h3>
        {cert.date && <p className="muted">Issued {cert.date}</p>}
        {cert.description && <p>{cert.description}</p>}
        <div className="project-links">
          {hasFile && (
            <a className="btn btn-small btn-primary" href={fileUrl} target="_blank" rel="noopener noreferrer">
              <Eye size={14} /> View certificate
            </a>
          )}
          {verify && (
            <a className="btn btn-small btn-ghost" href={verify} target="_blank" rel="noopener noreferrer">
              Verify <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/* =================================
   RESUME
   Put your PDF at frontend/public/resume.pdf, or set "resumeUrl" in the admin Profile tab.
================================= */

function ResumeSection({ profile, resumeUrl }) {
  return (
    <section id="resume" className="section container">
      <SectionHead title="Resume" text="A one-page summary of my education, projects and experience." />
      <Reveal className="resume-card glow">
        <div className="resume-icon" aria-hidden="true"><FileText size={34} /></div>
        <div className="resume-info">
          <h3>{profile.name}</h3>
          <p>{profile.headline}</p>
          <p className="muted">PDF document</p>
        </div>
        <div className="resume-actions">
          <a className="btn btn-primary" href={resumeUrl} target="_blank" rel="noopener noreferrer">
            <Eye size={16} /> View resume
          </a>
          <a className="btn btn-ghost" href={resumeUrl} download="Abhay-Bhardwaj-Resume.pdf">
            <Download size={16} /> Download PDF
          </a>
        </div>
      </Reveal>
    </section>
  );
}

/* =================================
   CONTACT
   The backend has no contact endpoint, so the form prepares a Gmail draft (or a mail-app draft).
   Nothing is reported as "sent" because the visitor still has to press Send.
================================= */

function Contact({ profile, notify }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [drafted, setDrafted] = useState(null);
  const email = (profile.email || "").trim();

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  function validate() {
    const found = {};
    if (form.name.trim().length < 2) found.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) found.email = "Enter a valid email address.";
    if (form.subject.trim().length < 3) found.subject = "Add a short subject.";
    if (form.message.trim().length < 10) found.message = "Write at least 10 characters.";
    return found;
  }

  function submit(event) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    const firstKey = Object.keys(found)[0];
    if (firstKey) {
      document.getElementById(`contact-${firstKey}`)?.focus();
      notify("Fix the highlighted fields.", "error");
      return;
    }
    if (!email) {
      notify("The site owner hasn't added an email address yet.", "error");
      return;
    }
    const subject = form.subject.trim();
    const body = `${form.message.trim()}\n\nFrom: ${form.name.trim()} (${form.email.trim()})`;
    const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmail, "_blank", "noopener,noreferrer");
    setDrafted({ mailto });
    notify("Gmail draft opened. Press Send there to deliver it.");
  }

  function copyEmail() {
    if (!navigator.clipboard?.writeText) {
      notify("Copy isn't available here. Select the address manually.", "error");
      return;
    }
    navigator.clipboard.writeText(email).then(
      () => notify("Email address copied."),
      () => notify("Couldn't copy. Select the address manually.", "error")
    );
  }

  const field = (key, label, props = {}) => (
    <div className={`field ${errors[key] ? "invalid" : ""}`}>
      <label htmlFor={`contact-${key}`}>{label}</label>
      {key === "message" ? (
        <textarea id={`contact-${key}`} rows={5} value={form[key]} onChange={set(key)}
          aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `err-${key}` : undefined} {...props} />
      ) : (
        <input id={`contact-${key}`} value={form[key]} onChange={set(key)}
          aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `err-${key}` : undefined} {...props} />
      )}
      {errors[key] && <span className="field-error" id={`err-${key}`}>{errors[key]}</span>}
    </div>
  );

  return (
    <section id="contact" className="section container">
      <SectionHead title="Let's connect" text="Have a project, an internship or a question? Send me a note." />
      <div className="contact-grid">
        <Reveal className="contact-form glass">
          <form onSubmit={submit} noValidate>
            <div className="field-row">
              {field("name", "Name", { autoComplete: "name" })}
              {field("email", "Your email", { type: "email", autoComplete: "email" })}
            </div>
            {field("subject", "Subject")}
            {field("message", "Message")}
            <button className="btn btn-primary" type="submit">
              <Send size={16} /> Write message
            </button>
            {drafted && (
              <p className="form-note" role="status">
                Your draft is open in Gmail. Press Send there to deliver it.{" "}
                <a href={drafted.mailto}>Use my mail app instead</a>
              </p>
            )}
          </form>
        </Reveal>

        <Reveal className="contact-side" delay={0.1}>
          <div className="info-card glass">
            <Mail size={20} />
            <h3>Email</h3>
            {email ? (
              <>
                <p className="email-text">{email}</p>
                <button className="btn btn-small btn-ghost" onClick={copyEmail}>
                  <Copy size={14} /> Copy address
                </button>
              </>
            ) : (
              <p className="muted">Email address not added yet.</p>
            )}
          </div>
          {profile.location && (
            <div className="info-card glass">
              <MapPin size={20} />
              <h3>Location</h3>
              <p>{profile.location}</p>
            </div>
          )}
          <div className="info-card glass">
            <Linkedin size={20} />
            <h3>Find me online</h3>
            <SocialLinks profile={profile} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =================================
   FOOTER + BACK TO TOP
================================= */

function Footer({ profile }) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <SocialLinks profile={profile} />
      </div>
    </footer>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      className="top-button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
    >
      <ArrowUp size={18} />
    </button>
  );
}

/* =================================
   ADMIN: LOGIN
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
      if (!response.ok) throw new Error(data.message || "Login failed");
      onSuccess(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="login-card">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="eyebrow"><LayoutDashboard size={15} /> PRIVATE ADMIN AREA</div>
        <h1>Admin Login</h1>
        <p>Manage your portfolio.</p>
        <form onSubmit={login} className="login-form">
          <input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
   ADMIN: DASHBOARD
================================= */

function AdminDashboard({ profile, projects, certificates, token, reload, onBack, onLogout }) {
  const [tab, setTab] = useState("profile");
  const [message, setMessage] = useState("");
  const authHeaders = { Authorization: `Bearer ${token}` };

  async function saveProfile(profileData) {
    const response = await fetch(`${API}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(profileData)
    });
    if (response.ok) {
      setMessage("Profile saved successfully ✓");
      await reload();
    } else {
      setMessage("Could not save. Please log in again.");
    }
  }

  async function deleteItem(type, id) {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    await fetch(`${API}/${type}/${id}`, { method: "DELETE", headers: authHeaders });
    await reload();
  }

  const tabs = [["profile", "Profile"], ["projects", "Projects"], ["skills", "Skills"], ["certificates", "Certificates"]];

  return (
    <div className="admin-page">
      <div className="dashboard">
        <aside className="sidebar">
          <div className="sidebar-logo">AB<span>.</span></div>
          <p>PORTFOLIO CMS</p>
          {tabs.map(([id, label]) => (
            <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>
          ))}
          <button onClick={onBack}>View Website</button>
          <button className="logout-button" onClick={onLogout}><LogOut size={15} /> Logout</button>
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-top">
            <button className="back-button" onClick={onBack}>← Website</button>
            <span>{message}</span>
          </div>
          {tab === "profile" && <ProfileEditor profile={profile} saveProfile={saveProfile} />}
          {tab === "projects" && <ProjectEditor projects={projects} token={token} reload={reload} deleteItem={deleteItem} />}
          {tab === "certificates" && <CertificateEditor certificates={certificates} token={token} reload={reload} deleteItem={deleteItem} />}
          {tab === "skills" && <SkillsEditor profile={profile} saveProfile={saveProfile} />}
        </main>
      </div>
    </div>
  );
}

/* =================================
   ADMIN: PROFILE EDITOR
================================= */

function ProfileEditor({ profile, saveProfile }) {
  const [form, setForm] = useState(profile);
  const update = (key, value) => setForm({ ...form, [key]: value });

  function save() {
    saveProfile({
      ...form,
      skills:
        typeof form.skills === "string"
          ? form.skills.split(",").map((item) => item.trim()).filter(Boolean)
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
        <button className="primary-button" onClick={save}><Save size={16} /> Save Changes</button>
      </div>

      <div className="form-grid">
        {["name", "headline", "email", "phone", "location", "github", "linkedin", "instagram", "resumeUrl"].map((key) => (
          <label key={key}>
            {key}
            <input value={form[key] || ""} onChange={(e) => update(key, e.target.value)} />
          </label>
        ))}
        <label className="wide">
          Bio
          <textarea value={form.bio || ""} onChange={(e) => update("bio", e.target.value)} />
        </label>
        <label className="wide">
          Skills
          <input
            value={Array.isArray(form.skills) ? form.skills.join(", ") : form.skills || ""}
            onChange={(e) => update("skills", e.target.value)}
            placeholder="React, JavaScript, Node.js..."
          />
        </label>
      </div>
    </div>
  );
}



/* =================================
   ADMIN: PROJECT EDITOR (Updated list with clear Edit/Delete buttons)
================================= */

function ProjectEditor({ projects, token, reload, deleteItem }) {
  const empty = { title: "", description: "", tech: "", githubUrl: "", liveUrl: "", featured: false, screenshot: null, video: null };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const change = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    const techArray = typeof form.tech === "string"
      ? form.tech.split(",").map((item) => item.trim()).filter(Boolean)
      : form.tech;
    formData.append("tech", JSON.stringify(techArray));
    formData.append("githubUrl", form.githubUrl);
    formData.append("liveUrl", form.liveUrl);
    formData.append("featured", form.featured);

    if (form.screenshot) formData.append("screenshot", form.screenshot);
    if (form.video) formData.append("video", form.video);

   const res = await fetch(editing ? `${API}/projects/${editing}` : `${API}/projects`, {
  method: editing ? "PUT" : "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData
});
if (!res.ok) {
  const data = await res.json().catch(() => ({}));
  alert(data.message || `Upload failed (HTTP ${res.status})`);
  return;
}
setForm(empty);
setEditing(null);
await reload();
  }

  function edit(project) {
    setEditing(project._id);
    setForm({
      title: project.title || "",
      description: project.description || "",
      tech: (project.tech || []).join(", "),
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      featured: project.featured || false,
      screenshot: null,
      video: null
    });
  }

  return (
    <div className="editor">
      <div className="editor-heading">
        <div>
          <div className="eyebrow">CONTENT</div>
          <h1>Projects</h1>
        </div>
        <button className="secondary-button" onClick={() => { setForm(empty); setEditing(null); }}>
          <Plus size={16} /> New Project
        </button>
      </div>

      <form className="content-form" onSubmit={submit}>
        <input placeholder="Project title" value={form.title} onChange={change("title")} required />
        <textarea placeholder="Project description" value={form.description} onChange={change("description")} />
        <input placeholder="React, Node.js, MongoDB" value={form.tech} onChange={change("tech")} />
        <input placeholder="GitHub URL" value={form.githubUrl} onChange={change("githubUrl")} />
        <input placeholder="Live Demo URL" value={form.liveUrl} onChange={change("liveUrl")} />
        
        <label className="upload-box">
          <Upload size={16} />
          {form.screenshot ? `Screenshot: ${form.screenshot.name}` : "Upload Screenshot (Image)"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setForm({ ...form, screenshot: e.target.files[0] || null })}
          />
        </label>

        <label className="upload-box">
          <Upload size={16} />
          {form.video ? `Video: ${form.video.name}` : "Upload Demo Video (MP4/WebM)"}
          <input
            type="file"
            accept="video/mp4,video/webm"
            onChange={(e) => setForm({ ...form, video: e.target.files[0] || null })}
          />
        </label>

        <label className="checkbox">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Featured Project
        </label>
        <button className="primary-button">
          {editing ? <Save size={16} /> : <Plus size={16} />} {editing ? "Update Project" : "Add Project"}
        </button>
      </form>

      <div className="admin-list" style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {projects.map((project) => (
          <div className="admin-item" key={project._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ overflow: "hidden", marginRight: "10px" }}>
              <strong style={{ display: "block", fontSize: "15px" }}>{project.title}</strong>
              <small style={{ opacity: 0.7 }}>{(project.tech || []).join(" · ")}</small>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button 
                type="button" 
                onClick={() => edit(project)} 
                style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Pencil size={14} /> Edit
              </button>
              <button 
                type="button" 
                onClick={() => deleteItem("projects", project._id)} 
                style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================================
   ADMIN: CERTIFICATE EDITOR
================================= */

function CertificateEditor({ certificates, token, reload, deleteItem }) {
  const empty = { title: "", issuer: "", date: "", description: "", verificationUrl: "", file: null };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const change = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    const formData = new FormData();
    ["title", "issuer", "date", "description", "verificationUrl"].forEach((key) => {
      if (form[key] !== null && form[key] !== undefined && form[key] !== "") formData.append(key, form[key]);
    });
    if (form.file) formData.append("file", form.file);

    await fetch(editing ? `${API}/certificates/${editing}` : `${API}/certificates`, {
      method: editing ? "PUT" : "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    setForm(empty);
    setEditing(null);
    await reload();
  }

  function edit(certificate) {
    setEditing(certificate._id);
    setForm({
      title: certificate.title || "",
      issuer: certificate.issuer || "",
      date: certificate.date || "",
      description: certificate.description || "",
      verificationUrl: certificate.verificationUrl || "",
      file: null
    });
  }

  return (
    <div className="editor">
      <div className="editor-heading">
        <div>
          <div className="eyebrow">CONTENT</div>
          <h1>Certificates</h1>
        </div>
        <button className="secondary-button" onClick={() => { setForm(empty); setEditing(null); }}>
          <Plus /> New Certificate
        </button>
      </div>

      <form className="content-form" onSubmit={submit}>
        <input placeholder="Certificate title" value={form.title} onChange={change("title")} required />
        <input placeholder="Issuer" value={form.issuer} onChange={change("issuer")} />
        <input placeholder="Date / Year" value={form.date} onChange={change("date")} />
        <textarea placeholder="Description" value={form.description} onChange={change("description")} />
        <input placeholder="Certificate verification URL" value={form.verificationUrl} onChange={change("verificationUrl")} />
        <label className="upload-box">
          <Upload />
          {form.file ? form.file.name : "Upload PDF / JPG / PNG"}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] || null })}
          />
        </label>
        <button className="primary-button">
          {editing ? <Save /> : <Plus />} {editing ? "Update Certificate" : "Add Certificate"}
        </button>
      </form>

      <div className="admin-list">
        {certificates.map((certificate) => (
          <div className="admin-item" key={certificate._id}>
            <div>
              <strong>{certificate.title}</strong>
              <small>{certificate.issuer}{" · "}{certificate.date}</small>
            </div>
            <div>
              <button onClick={() => edit(certificate)} aria-label="Edit certificate"><Pencil /></button>
              <button onClick={() => deleteItem("certificates", certificate._id)} aria-label="Delete certificate"><Trash2 /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
/* =================================
   ADMIN: SKILLS EDITOR
================================= */

function SkillsEditor({ profile, saveProfile }) {
  const [skillsText, setSkillsText] = useState(
    Array.isArray(profile.skills) ? profile.skills.join(", ") : profile.skills || ""
  );

  async function save(e) {
    e.preventDefault();
    const skillsArray = skillsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    await saveProfile({
      ...profile,
      skills: skillsArray
    });
  }

  return (
    <div className="editor">
      <div className="editor-heading">
        <div>
          <div className="eyebrow">CONTENT</div>
          <h1>Skills & Tools</h1>
        </div>
      </div>

      <form className="content-form" onSubmit={save}>
        <p style={{ opacity: 0.8, marginBottom: "12px", fontSize: "14px" }}>
          Apne saare skills aur tools ko commas (,) se alag karke likhein. Yeh automatically website ke 'Skills and tools' section mein category wise dikhne lagenge.
        </p>
        
        <textarea 
          rows={6}
          value={skillsText} 
          onChange={(e) => setSkillsText(e.target.value)}
          placeholder="React, JavaScript, Node.js, MongoDB, AWS, C++..." 
          style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "inherit" }}
        />

        <button className="primary-button" type="submit" style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Save size={16} /> Save Skills
        </button>
      </form>
    </div>
  );
}

export default App;