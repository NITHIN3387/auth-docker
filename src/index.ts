import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
import UserRouter from "./router/auth.router"

const app = express();

const PORT: string | 4000 = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "*",
  methods: 'GET, POST, PUT, DELETE',
  credentials: true
}))

app.use("/user", UserRouter)

app.listen(PORT, () => console.log(`auth server started at the PORT: ${PORT}`));
