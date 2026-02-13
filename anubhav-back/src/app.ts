import Express from "express";
import Router from "./routes/IndexRoute";
import { uploadRouter } from './utils/Upload';
const app = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));


app.use("/api", Router);
app.use('/api/uploads', uploadRouter);
// Add this after the upload router configuration


app.listen(process.env.APP_PORT, () => {
  console.log(`Server is running on port ${process.env.APP_PORT}`);
});
