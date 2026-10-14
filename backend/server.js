import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================
   CORS
========================= */

const allowedOrigins = [
    "http://localhost:5173",
    "https://abhaypremiumportfolio.netlify.app",
    "https://abhay-premium-portfolio.vercel.app",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(
    cors({
        origin: function(origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

app.use(express.json());

/* =========================
   DATABASE SCHEMAS
========================= */

const profileSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "Abhay Bhardwaj"
    },

    headline: {
        type: String,
        default: "B.Tech CSE Student & Aspiring Software Developer"
    },

    bio: {
        type: String,
        default: ""
    },

    email: {
        type: String,
        default: ""
    },

    phone: {
        type: String,
        default: ""
    },

    location: {
        type: String,
        default: "India"
    },

    github: {
        type: String,
        default: ""
    },

    linkedin: {
        type: String,
        default: ""
    },

    instagram: {
        type: String,
        default: ""
    },

    resumeUrl: {
        type: String,
        default: ""
    },

    skills: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        default: ""
    },

    tech: {
        type: [String],
        default: []
    },

    githubUrl: {
        type: String,
        default: ""
    },

    liveUrl: {
        type: String,
        default: ""
    },

    featured: {
        type: Boolean,
        default: false
    },
    screenshot: {
        data: Buffer,
        contentType: String,
        name: String
    },
    video: {
        data: Buffer,
        contentType: String,
        name: String
    }

}, {
    timestamps: true
});

const certificateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    issuer: {
        type: String,
        default: ""
    },

    date: {
        type: String,
        default: ""
    },

    description: {
        type: String,
        default: ""
    },

    verificationUrl: {
        type: String,
        default: ""
    },

    file: {
        data: Buffer,
        contentType: String,
        name: String
    }
}, {
    timestamps: true
});

const Profile = mongoose.model(
    "Profile",
    profileSchema
);

const Project = mongoose.model(
    "Project",
    projectSchema
);

const Certificate = mongoose.model(
    "Certificate",
    certificateSchema
);

/* =========================
   FILE UPLOAD
========================= */

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/webm",
            "video/ogg"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(
                new Error(
                    "Only PDF, JPG, PNG, WEBP and Video files are allowed."
                )
            );
        }
    }
});

/* Safe Content-Disposition header (handles spaces, unicode, quotes in file names) */
function safeDisposition(name = "file") {
    const ascii = String(name).replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
    return `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

/* =========================
   ADMIN AUTH
========================= */

function authenticate(req, res, next) {
    const authorization =
        req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const token =
        authorization.replace("Bearer ", "");

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.admin = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

/* =========================
   HEALTH
========================= */

app.get("/api/health", (req, res) => {
    res.json({
        allowedOrigins: allowedOrigins,
        incomingOrigin: req.headers.origin || "no origin header",
        clientUrlEnv: process.env.CLIENT_URL || "not set",
        success: true,
        message: "Abhay Portfolio API is running 🚀"
    });
});

/* =========================
   LOGIN
========================= */

app.post(
    "/api/auth/login",
    async(req, res) => {
        try {
            const {
                email,
                password
            } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: "Email and password are required"
                });
            }

            if (!process.env.ADMIN_EMAIL ||
                !process.env.ADMIN_PASSWORD
            ) {
                return res.status(500).json({
                    message: "Admin credentials are not configured"
                });
            }

            if (
                email.toLowerCase() !==
                process.env.ADMIN_EMAIL.toLowerCase()
            ) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            if (
                password !==
                process.env.ADMIN_PASSWORD
            ) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const token = jwt.sign({
                    email
                },
                process.env.JWT_SECRET, {
                    expiresIn: "7d"
                }
            );

            res.json({
                success: true,
                token
            });
        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            res.status(500).json({
                message: "Login failed"
            });
        }
    }
);

/* =========================
   PROFILE - GET
========================= */

app.get(
    "/api/profile",
    async(req, res) => {
        try {
            let profile =
                await Profile.findOne();

            if (!profile) {
                profile =
                    await Profile.create({
                        name: "Abhay Bhardwaj",

                        headline: "B.Tech CSE Student & Aspiring Software Developer",

                        bio: "I build modern web applications, AI-powered interfaces and practical software projects.",

                        skills: [
                            "React",
                            "JavaScript",
                            "Node.js",
                            "MongoDB",
                            "AWS",
                            "HTML",
                            "CSS",
                            "Git",
                            "C++"
                        ]
                    });
            }

            res.json(profile);
        } catch (error) {
            console.error(
                "Profile GET error:",
                error
            );

            res.status(500).json({
                message: "Could not load profile"
            });
        }
    }
);

/* =========================
   PROFILE - UPDATE
========================= */

app.put(
    "/api/profile",
    authenticate,
    async(req, res) => {
        try {
            let profile =
                await Profile.findOne();

            if (!profile) {
                profile =
                    new Profile();
            }

            Object.assign(
                profile,
                req.body
            );

            await profile.save();

            res.json(profile);
        } catch (error) {
            console.error(
                "Profile UPDATE error:",
                error
            );

            res.status(500).json({
                message: "Could not update profile"
            });
        }
    }
);

/* =========================
   PROJECTS - GET
   (file bytes excluded so the list stays small and fast)
========================= */

app.get(
    "/api/projects",
    async(req, res) => {
        try {
            const projects =
                await Project.find()
                .select("-screenshot.data -video.data")
                .sort({
                    featured: -1,
                    createdAt: -1
                });

            res.json(projects);
        } catch (error) {
            console.error(
                "Projects GET error:",
                error
            );

            res.status(500).json({
                message: "Could not load projects"
            });
        }
    }
);

/* =========================
   PROJECTS - CREATE
========================= */

app.post(
    "/api/projects",
    authenticate,
    upload.fields([
        { name: "screenshot", maxCount: 1 },
        { name: "video", maxCount: 1 }
    ]),
    async(req, res) => {
        try {
            const project =
                await Project.create({
                    title: req.body.title,
                    description: req.body.description,
                    tech: req.body.tech ? JSON.parse(req.body.tech) : [],
                    githubUrl: req.body.githubUrl,
                    liveUrl: req.body.liveUrl,
                    featured: req.body.featured === "true" || req.body.featured === true,
                    screenshot: req.files && req.files.screenshot ? {
                        data: req.files.screenshot[0].buffer,
                        contentType: req.files.screenshot[0].mimetype,
                        name: req.files.screenshot[0].originalname
                    } : undefined,
                    video: req.files && req.files.video ? {
                        data: req.files.video[0].buffer,
                        contentType: req.files.video[0].mimetype,
                        name: req.files.video[0].originalname
                    } : undefined
                });

            const result = project.toObject();
            if (result.screenshot) delete result.screenshot.data;
            if (result.video) delete result.video.data;

            res.status(201).json(result);
        } catch (error) {
            console.error(
                "Project CREATE error:",
                error
            );

            res.status(500).json({
                message: "Could not create project"
            });
        }
    }
);

/* =========================
   PROJECTS - UPDATE
========================= */

app.put(
    "/api/projects/:id",
    authenticate,
    upload.fields([
        { name: "screenshot", maxCount: 1 },
        { name: "video", maxCount: 1 }
    ]),
    async(req, res) => {
        try {
            const project =
                await Project.findById(
                    req.params.id
                );

            if (!project) {
                return res.status(404).json({
                    message: "Project not found"
                });
            }

            if (req.body.title) project.title = req.body.title;
            if (req.body.description !== undefined) project.description = req.body.description;
            if (req.body.tech) project.tech = JSON.parse(req.body.tech);
            if (req.body.githubUrl !== undefined) project.githubUrl = req.body.githubUrl;
            if (req.body.liveUrl !== undefined) project.liveUrl = req.body.liveUrl;
            if (req.body.featured !== undefined) project.featured = req.body.featured === "true" || req.body.featured === true;

            if (req.files && req.files.screenshot) {
                project.screenshot = {
                    data: req.files.screenshot[0].buffer,
                    contentType: req.files.screenshot[0].mimetype,
                    name: req.files.screenshot[0].originalname
                };
            }

            if (req.files && req.files.video) {
                project.video = {
                    data: req.files.video[0].buffer,
                    contentType: req.files.video[0].mimetype,
                    name: req.files.video[0].originalname
                };
            }

            await project.save();

            const result = project.toObject();
            if (result.screenshot) delete result.screenshot.data;
            if (result.video) delete result.video.data;

            res.json(result);
        } catch (error) {
            console.error(
                "Project UPDATE error:",
                error
            );

            res.status(500).json({
                message: "Could not update project"
            });
        }
    }
);

/* =========================
   VIEW PROJECT SCREENSHOT / VIDEO
========================= */

app.get(
    "/api/projects/:id/screenshot",
    async(req, res) => {
        try {
            const project = await Project.findById(req.params.id);
            if (!project || !project.screenshot || !project.screenshot.data) {
                return res.status(404).send("Screenshot not found");
            }
            res.set({
                "Content-Type": project.screenshot.contentType,
                "Content-Disposition": safeDisposition(project.screenshot.name),
                "Cache-Control": "public, max-age=300"
            });
            res.send(project.screenshot.data);
        } catch (error) {
            console.error("Screenshot error:", error);
            res.status(500).send("Could not load screenshot");
        }
    }
);

app.get(
    "/api/projects/:id/video",
    async(req, res) => {
        try {
            const project = await Project.findById(req.params.id);
            if (!project || !project.video || !project.video.data) {
                return res.status(404).send("Video not found");
            }
            res.set({
                "Content-Type": project.video.contentType,
                "Content-Disposition": safeDisposition(project.video.name),
                "Cache-Control": "public, max-age=300"
            });
            res.send(project.video.data);
        } catch (error) {
            console.error("Video error:", error);
            res.status(500).send("Could not load video");
        }
    }
);

/* =========================
   CERTIFICATES - GET
========================= */

app.get(
    "/api/certificates",
    async(req, res) => {
        try {
            const certificates =
                await Certificate.find()
                .select("-file.data")
                .sort({
                    createdAt: -1
                });

            res.json(certificates);
        } catch (error) {
            console.error(
                "Certificates GET error:",
                error
            );

            res.status(500).json({
                message: "Could not load certificates"
            });
        }
    }
);

/* =========================
   CERTIFICATES - CREATE
========================= */

app.post(
    "/api/certificates",
    authenticate,
    upload.single("file"),
    async(req, res) => {
        try {
            const certificate =
                await Certificate.create({
                    title: req.body.title,

                    issuer: req.body.issuer,

                    date: req.body.date,

                    description: req.body.description,

                    verificationUrl: req.body.verificationUrl,

                    file: req.file ? {
                        data: req.file.buffer,

                        contentType: req.file.mimetype,

                        name: req.file.originalname
                    } : undefined
                });

            const result =
                certificate.toObject();

            delete result.file;

            res.status(201).json(
                result
            );
        } catch (error) {
            console.error(
                "Certificate CREATE error:",
                error
            );

            res.status(500).json({
                message: "Could not add certificate"
            });
        }
    }
);

/* =========================
   CERTIFICATES - UPDATE
========================= */

app.put(
    "/api/certificates/:id",
    authenticate,
    upload.single("file"),
    async(req, res) => {
        try {
            const certificate =
                await Certificate.findById(
                    req.params.id
                );

            if (!certificate) {
                return res.status(404).json({
                    message: "Certificate not found"
                });
            }

            if (req.body.title) {
                certificate.title =
                    req.body.title;
            }

            if (req.body.issuer !== undefined) {
                certificate.issuer =
                    req.body.issuer;
            }

            if (req.body.date !== undefined) {
                certificate.date =
                    req.body.date;
            }

            if (req.body.description !== undefined) {
                certificate.description =
                    req.body.description;
            }

            if (req.body.verificationUrl !== undefined) {
                certificate.verificationUrl =
                    req.body.verificationUrl;
            }

            if (req.file) {
                certificate.file = {
                    data: req.file.buffer,

                    contentType: req.file.mimetype,

                    name: req.file.originalname
                };
            }

            await certificate.save();

            const result =
                certificate.toObject();

            delete result.file;

            res.json(result);
        } catch (error) {
            console.error(
                "Certificate UPDATE error:",
                error
            );

            res.status(500).json({
                message: "Could not update certificate"
            });
        }
    }
);

/* =========================
   VIEW CERTIFICATE FILE
========================= */

app.get(
    "/api/certificates/:id/file",
    async(req, res) => {
        try {
            const certificate =
                await Certificate.findById(
                    req.params.id
                );

            if (!certificate ||
                !certificate.file ||
                !certificate.file.data
            ) {
                return res.status(404).send(
                    "Certificate file not found"
                );
            }

            res.set({
                "Content-Type": certificate.file.contentType,

                "Content-Disposition": safeDisposition(certificate.file.name)
            });

            res.send(
                certificate.file.data
            );
        } catch (error) {
            console.error(
                "Certificate FILE error:",
                error
            );

            res.status(500).send(
                "Could not open certificate"
            );
        }
    }
);

/* =========================
   CERTIFICATES - DELETE
========================= */

app.delete(
    "/api/certificates/:id",
    authenticate,
    async(req, res) => {
        try {
            const certificate =
                await Certificate.findByIdAndDelete(
                    req.params.id
                );

            if (!certificate) {
                return res.status(404).json({
                    message: "Certificate not found"
                });
            }

            res.json({
                success: true,
                message: "Certificate deleted"
            });
        } catch (error) {
            console.error(
                "Certificate DELETE error:",
                error
            );

            res.status(500).json({
                message: "Could not delete certificate"
            });
        }
    }
);

/* =========================
   PROJECTS - DELETE
========================= */

app.delete(
    "/api/projects/:id",
    authenticate,
    async(req, res) => {
        try {
            const project =
                await Project.findByIdAndDelete(
                    req.params.id
                );

            if (!project) {
                return res.status(404).json({
                    message: "Project not found"
                });
            }

            res.json({
                success: true,
                message: "Project deleted"
            });
        } catch (error) {
            console.error(
                "Project DELETE error:",
                error
            );

            res.status(500).json({
                message: "Could not delete project"
            });
        }
    }
);

/* =========================
   DEFAULT DATA
========================= */

async function createDefaultData() {
    try {
        const profile =
            await Profile.findOne();

        if (!profile) {
            await Profile.create({
                name: "Abhay Bhardwaj",

                headline: "B.Tech CSE Student & Aspiring Software Developer",

                bio: "I build modern web applications, AI-powered interfaces and practical software projects.",

                email: "",

                phone: "",

                location: "India",

                github: "https://github.com/Abhay93681",

                linkedin: "",

                instagram: "",

                resumeUrl: "",

                skills: [
                    "React",
                    "JavaScript",
                    "Node.js",
                    "MongoDB",
                    "AWS",
                    "HTML",
                    "CSS",
                    "Git",
                    "C++"
                ]
            });

            console.log(
                "Default profile created ✅"
            );
        }

        const projectCount =
            await Project.countDocuments();

        if (projectCount === 0) {
            await Project.create({
                title: "AI Chat Interface",

                description: "AI-powered chat application using React, Node.js, Gemini API and AWS.",

                tech: [
                    "React",
                    "Node.js",
                    "Gemini API",
                    "AWS"
                ],

                githubUrl: "https://github.com/Abhay93681/ai_chatbot",

                liveUrl: "http://aichatbott.s3-website.ap-south-1.amazonaws.com",

                featured: true
            });

            console.log(
                "Default project created ✅"
            );
        }
    } catch (error) {
        console.error(
            "Default data error:",
            error
        );
    }
}

/* =========================
   404 HANDLER
========================= */

app.use(
    (req, res) => {
        res.status(404).json({
            success: false,
            message: `Route ${req.method} ${req.originalUrl} not found`
        });
    }
);

/* =========================
   ERROR HANDLER
========================= */

app.use(
    (error, req, res, next) => {
        console.error(
            "Server error:",
            error
        );

        if (error.message === "Not allowed by CORS") {
            return res.status(403).json({
                success: false,
                message: "CORS: Origin not allowed"
            });
        }

        if (error instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: error.message ||
                "Internal server error"
        });
    }
);

/* =========================
   ENVIRONMENT CHECK
========================= */

if (!process.env.MONGO_URI) {
    console.error(
        "❌ MONGO_URI is missing in environment variables."
    );

    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error(
        "❌ JWT_SECRET is missing in environment variables."
    );

    process.exit(1);
}

/* =========================
   START SERVER
========================= */

mongoose
    .connect(process.env.MONGO_URI)
    .then(async() => {
        console.log(
            "MongoDB connected successfully ✅"
        );

        await createDefaultData();

        app.listen(
            PORT,
            "0.0.0.0",
            () => {
                console.log(
                    `Server running on port ${PORT} 🚀`
                );
            }
        );
    })
    .catch((error) => {
        console.error(
            "MongoDB connection error:",
            error.message
        );

        process.exit(1);
    });