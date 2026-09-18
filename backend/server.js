import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";



const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(
    cors({
        origin: function(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        }
    })
);

app.use(express.json({ limit: "5mb" }));

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

const Profile = mongoose.model("Profile", profileSchema);
const Project = mongoose.model("Project", projectSchema);
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
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(
                new Error("Only PDF, JPG, PNG and WEBP files are allowed.")
            );
        }
    }
});

/* =========================
   ADMIN AUTH
========================= */

function authenticate(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const token = authorization.replace("Bearer ", "");

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
        success: true,
        message: "Abhay Portfolio API is running 🚀"
    });
});

/* =========================
   LOGIN
========================= */

app.post("/api/auth/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
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

        if (password !== process.env.ADMIN_PASSWORD) {
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
        res.status(500).json({
            message: "Login failed"
        });
    }
});

/* =========================
   PROFILE
========================= */

app.get("/api/profile", async(req, res) => {
    try {
        let profile = await Profile.findOne();

        if (!profile) {
            profile = await Profile.create({
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
        res.status(500).json({
            message: "Could not load profile"
        });
    }
});

app.put("/api/profile", authenticate, async(req, res) => {
    try {
        let profile = await Profile.findOne();

        if (!profile) {
            profile = new Profile();
        }

        Object.assign(profile, req.body);

        await profile.save();

        res.json(profile);
    } catch (error) {
        res.status(500).json({
            message: "Could not update profile"
        });
    }
});

/* =========================
   PROJECTS
========================= */

app.get("/api/projects", async(req, res) => {
    try {
        const projects = await Project.find().sort({
            featured: -1,
            createdAt: -1
        });

        res.json(projects);
    } catch (error) {
        res.status(500).json({
            message: "Could not load projects"
        });
    }
});

app.post("/api/projects", authenticate, async(req, res) => {
    try {
        const project = await Project.create(req.body);

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({
            message: "Could not create project"
        });
    }
});

app.put(
    "/api/projects/:id",
    authenticate,
    async(req, res) => {
        try {
            const project =
                await Project.findByIdAndUpdate(
                    req.params.id,
                    req.body, {
                        new: true
                    }
                );

            if (!project) {
                return res.status(404).json({
                    message: "Project not found"
                });
            }

            res.json(project);
        } catch (error) {
            res.status(500).json({
                message: "Could not update project"
            });
        }
    }
);

app.delete(
    "/api/projects/:id",
    authenticate,
    async(req, res) => {
        try {
            await Project.findByIdAndDelete(
                req.params.id
            );

            res.json({
                success: true,
                message: "Project deleted"
            });
        } catch (error) {
            res.status(500).json({
                message: "Could not delete project"
            });
        }
    }
);

/* =========================
   CERTIFICATES
========================= */

app.get("/api/certificates", async(req, res) => {
    try {
        const certificates =
            await Certificate.find()
            .select("-file.data")
            .sort({
                createdAt: -1
            });

        res.json(certificates);
    } catch (error) {
        res.status(500).json({
            message: "Could not load certificates"
        });
    }
});

/* ADD CERTIFICATE */

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

            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({
                message: "Could not add certificate"
            });
        }
    }
);

/* UPDATE CERTIFICATE */

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

            certificate.title =
                req.body.title ||
                certificate.title;

            certificate.issuer =
                req.body.issuer !== undefined ?
                req.body.issuer :
                certificate.issuer;

            certificate.date =
                req.body.date !== undefined ?
                req.body.date :
                certificate.date;

            certificate.description =
                req.body.description !== undefined ?
                req.body.description :
                certificate.description;

            certificate.verificationUrl =
                req.body.verificationUrl !== undefined ?
                req.body.verificationUrl :
                certificate.verificationUrl;

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
            res.status(500).json({
                message: "Could not update certificate"
            });
        }
    }
);

/* VIEW CERTIFICATE FILE */

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

                "Content-Disposition": `inline; filename="${certificate.file.name}"`
            });

            res.send(
                certificate.file.data
            );
        } catch (error) {
            res.status(500).send(
                "Could not open certificate"
            );
        }
    }
);

/* DELETE CERTIFICATE */

app.delete(
    "/api/certificates/:id",
    authenticate,
    async(req, res) => {
        try {
            await Certificate.findByIdAndDelete(
                req.params.id
            );

            res.json({
                success: true,
                message: "Certificate deleted"
            });
        } catch (error) {
            res.status(500).json({
                message: "Could not delete certificate"
            });
        }
    }
);

/* =========================
   DEFAULT DATA
========================= */

async function createDefaultData() {
    let profile =
        await Profile.findOne();

    if (!profile) {
        await Profile.create({
            name: "Abhay Bhardwaj",

            headline: "B.Tech CSE Student & Aspiring Software Developer",

            bio: "I build modern web applications, AI-powered interfaces and practical software projects.",

            email: "",

            location: "India",

            github: "https://github.com/Abhay93681",

            linkedin: "",

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
    }
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
                    `Server running on http://localhost:${PORT}`
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