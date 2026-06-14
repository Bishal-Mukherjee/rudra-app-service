import { Request, Response } from "express";
import { uploadFileToStorage } from "@/utils/file-upload";

export const uploadLog = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No file provided" });
      return;
    }

    const uploadResult = await uploadFileToStorage(file, {
      bucket: "device-logs",
      folder: "uploads",
    });

    if (!uploadResult.success) {
      const statusCode = uploadResult.error?.includes("too large") ? 413 : 500;
      res.status(statusCode).json({ message: uploadResult.error });
      return;
    }

    res.status(200).json({
      message: "Log file uploaded successfully",
      result: {
        filePath: uploadResult.filePath,
        publicUrl: uploadResult.publicUrl,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
