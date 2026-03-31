import { Request, Response } from "express";
import { uploadFileToStorage } from "@/utils/file-upload";
import { nanoid } from "nanoid";

export const uploadResource = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No file provided" });
      return;
    }

    const formId = req.body.formId || nanoid();
    const source = req.body.source || "unknown";

    const date = new Date();
    const currentDateInIST = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    const uploadTimestamp = currentDateInIST
      .toISOString()
      .replace("Z", "+05:30");

    const uploadResult = await uploadFileToStorage(file, {
      bucket: "submissions",
      folder: `uploads/${req.user.id}/${formId}`,
      fileName: `${source}_${uploadTimestamp}`,
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
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
