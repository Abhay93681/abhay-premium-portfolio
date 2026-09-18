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
    "http://localhost:5174",
    "https://abhay-premium-portfolio.vercel.app"
];

app.use(
    cors({
        origin: function(origin, callback) {
            // Allow requests without origin
            // such as Postman or server-to-server requests
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
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(
                new Error(
                    "Only PDF, JPG, PNG and WEBP files are allowed."
                )
            );
        }
    }
});

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
========================= */

app.get(
    "/api/projects",
    async(req, res) => {
        try {
            const projects =
                await Project.find().sort({
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
    async(req, res) => {
        try {
            const project =
                await Project.create(
                    req.body
                );

            res.status(201).json(
                project
            );
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
                        data: req.file
                            .buffer,

                        contentType: req.file
                            .mimetype,

                        name: req.file
                            .originalname
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

            if (
                req.body.issuer !==
                undefined
            ) {
                certificate.issuer =
                    req.body.issuer;
            }

            if (
                req.body.date !==
                undefined
            ) {
                certificate.date =
                    req.body.date;
            }

            if (
                req.body.description !==
                undefined
            ) {
                certificate.description =
                    req.body.description;
            }

            if (
                req.body.verificationUrl !==
                undefined
            ) {
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
                "Content-Type": certificate.file
                    .contentType,

                "Content-Disposition": `inline; filename="${certificate.file.name}"`
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
   DEFAULT DATA
========================= */

async function createDefaultData() {
    try {
        /* PROFILE */

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

        /* PROJECT */

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

        if (
            error.message ===
            "Not allowed by CORS"
        ) {
            return res.status(403).json({
                success: false,
                message: "CORS: Origin not allowed"
            });
        }

        if (
            error instanceof multer.MulterError
        ) {
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