import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {

  const { fullName, email, userName, password } = req.body;

  if ([fullName, email, password, userName].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User email or username already exist");
  }

  //   const avatarLocalPath = req.files?.avatar[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log(req.files);
  let avatarLocalPath, coverImageLocalPath;
  if(req.files && Array.isArray(req.files.avatar) 
     && req.files.avatar.length > 0) {
    avatarLocalPath  = req.files.avatar[0].path;
    console.log(avatarLocalPath);
   }

  if ( req.files && Array.isArray(req.files.coverImage)
     && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar not uploaded");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(400, "Something went wrong while creating the user");
  }

  return res.status(201).json(new ApiResponse(201, createdUser, "UYser registered successfully"));
});

export { registerUser };
