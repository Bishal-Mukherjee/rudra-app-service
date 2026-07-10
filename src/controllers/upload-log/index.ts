import { Request, Response } from "express";
import { uploadFileToStorage } from "@/utils/file-upload";

const LOG_TYPES = ["regular", "forced"] as const;
type LogType = (typeof LOG_TYPES)[number];

const getDateString = () => new Date().toISOString().split("T")[0]; // YYYY-MM-DD

export const uploadLog = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No file provided" });
      return;
    }

    const deviceId = (req.body.deviceId as string | undefined) || "Unknown";
    const type = (req.body.type as string | undefined) || "regular";

    if (!LOG_TYPES.includes(type as LogType)) {
      res.status(400).json({
        message: `Invalid type. Must be one of: ${LOG_TYPES.join(", ")}`,
      });
      return;
    }

    const uploadResult = await uploadFileToStorage(file, {
      bucket: "device-logs",
      folder: `${req.user.id}/${deviceId}/${getDateString()}/${type}`,
      doRename: false,
    });

    if (!uploadResult.success) {
      const statusCode = uploadResult.error?.includes("too large") ? 413 : 500;
      res.status(statusCode).json({ message: uploadResult.error });
      return;
    }

    res.status(200).json({ message: "File uploaded successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
