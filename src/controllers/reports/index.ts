import { Request, Response } from "express";
import axios from "axios";
import { config } from "@/config/config";

export const generateReport = async (req: Request, res: Response) => {
  try {
    const response = await axios({
      url: `${config.reportApiUrl}/generate-reports/${req.body.type}`,
      method: "POST",
      data: req.body,
      responseType: "arraybuffer",
    });

    const contentType =
      response.headers["content-type"] ?? "application/octet-stream";
    const contentDisposition = response.headers["content-disposition"];

    res.setHeader("Content-Type", contentType);
    if (contentDisposition) {
      res.setHeader("Content-Disposition", contentDisposition);
    }
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
