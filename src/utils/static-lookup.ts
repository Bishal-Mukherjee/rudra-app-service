import { config } from "@/config/config";
import { getS3ObjectJson } from "@/utils/s3-client";

export const getStaticLookup = async (fileName: string): Promise<any> => {
  if (!fileName) return null;

  return getS3ObjectJson(`${config.s3.lookupFolder}/${fileName}.json`);
};
