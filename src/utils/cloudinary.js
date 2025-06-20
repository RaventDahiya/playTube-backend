import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //file system present in node.js

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on clodinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file is now uploaded
    //console.log("file uploded suucessfully", response.url);
    //remove the local file after uploading to cloudinary
    fs.unlinkSync(localFilePath); // remove the local saved temp files
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the local saved temp files
    return null;
  }
};

export { uploadOnCloudinary };
