import express from "express";
import OpenIdLogin from "models/User/services/openId";

const router = express.Router();

router.post("/login", OpenIdLogin);

export default router;
