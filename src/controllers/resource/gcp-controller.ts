import { Request, Response } from "express";
import { uploadFileToGCPStorage } from "@/utils/gcp-storage";

export const uploadResourceGCP = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No file provided" });
      return;
    }

    const uploadResult = await uploadFileToGCPStorage(file, {
      bucket: "rudra-submissions",
      folder: "uploads",
    });

    if (!uploadResult.success) {
      const statusCode = uploadResult.error?.includes("too large") ? 413 : 500;
      res.status(statusCode).json({ message: uploadResult.error });
      return;
    }

    res.status(200).json({
      message: "File uploaded successfully",
      result: { filePath: uploadResult.filePath },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
