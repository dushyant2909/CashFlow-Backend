import { Account } from "../models/account.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { z } from "zod"

const signupBody = z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string()
})

const signinBody = z.object({
    email: z.string().email(),
    password: z.string()
})

const updateBody = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
})

const updatePasswordBody = z.object({
    oldPassword: z.string().min(4),
    newPassword: z.string().min(4)
})

// Method to generate refresh and access token
const generateAccessAndRefreshToken = async (userId) => {
    try {
        // S-1 Find a user from given id
        const user = await User.findById(userId)

        if (!user)
            throw new ApiError(401, "User not found")

        // S-2 Generate tokens from methods defined in user schema
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // S-3 Save refresh token in DB
        user.refreshToken = refreshToken

        // S-4 Save the user
        await user.save({ validateBeforeSave: false })

        // S-5 Return tokens
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500, `Something went wrong while generating refresh and access token :: ${error?.message}`);
    }
}

const signup = asyncHandler(async (req, res) => {
    const { success, data } = signupBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    // Destructure validated data
    const { email, firstName, lastName, password } = data;

    if (!email || !firstName || !lastName || !password)
        return res.status(401).json({
            message: "All fields are required"
        })

    const user = await User.findOne({ email })

    if (user)
        return res.status(411).json({
            message: "User with email already exists"
        })
    const userCreationResponse = await User.create({
        email,
        firstName,
        lastName,
        password
    })

    if (!userCreationResponse)
        throw new ApiError(500, "Error in creating user in Db")

    // Generate a random number between 1 and 10000
    const randomBalance = 1 + Math.random() * 10000;

    // Round the randomBalance to two decimal places
    const roundedBalance = Math.round(randomBalance * 100) / 100;

    // Create account also
    const accountCreationResponse = await Account.create({
        userId: userCreationResponse._id,
        balance: roundedBalance
    })


    if (!accountCreationResponse)
        throw new ApiError(500, "Error in creating Account in Db")

    return res.status(200).json(
        new ApiResponse(200, userCreationResponse, "User registered successfully")
    )
})

const signin = asyncHandler(async (req, res) => {
    const { success, data } = signinBody.safeParse(req.body);
    if (!success) {
        // throw new ApiError(400, "Incorrect inputs");
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const { email, password } = data;

    if (!password || !email)
        return res.status(401).json({
            message: "All fields are required"
        })

    const user = await User.findOne({
        email
    })

    if (!user)
        throw new ApiError(404, "User not found, kindly register");

    // Note: when you have to interact with any mongodb queries of functions
    // then you can interact with the model (e.g. User model)
    // But when you have to use predefined methods created in models then you
    // use user which we get by findOne

    const passwordCheck = await user.isPasswordCorrect(password);

    if (!passwordCheck)
        return res.status(401).json({
            message: "Incorrect Password"
        })

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Generate cookies
    const options = {
        httpOnly: true,
        secure: true // Modified only by server not by frontend
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true // Modified only by server not by frontend
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, "User-logged out successfully")
        )
})

const updateUserDetails = asyncHandler(async (req, res) => {
    const { success, data } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const userId = req.user._id;

    const { firstName, lastName } = data;

    // Create an empty object to store the fields to be updated
    const updateFields = {};

    // Check which fields are provided in the request body and add them to the updateFields object
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;

    // Check if any fields were provided for update
    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
            message: "No fields provided for update"
        })
    }

    // Perform the update using updateOne
    const result = await User.updateOne({ _id: userId }, { $set: updateFields });

    if (!result) {
        return res.status(500).json({
            message: "Error in updating fields"
        })
    }

    return res.status(200).json({
        message: "Updated successfully"
    })

})

const updatePassword = asyncHandler(async (req, res) => {
    const { success, data } = updatePasswordBody.safeParse(req.body);
    if (!success) {
        res.status(411).json({
            message: "Incorrect password format (must be > 4 characters)"
        })
    }
    const { oldPassword, newPassword } = data;

    if (!oldPassword || !newPassword)
        return res.status(401).json({
            message: "All fields are required"
        })

    const userId = req.user?._id;

    if (!userId)
        throw new ApiError(401, "Unauthorised access")

    const user = await User.findById({
        _id: userId
    })
    const oldPasswordCheck = await user.isPasswordCorrect(oldPassword);

    if (!oldPasswordCheck)
        return res.status(400).json({
            message: "Incorrect old password"
        })

    user.password = newPassword

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password updated successfully")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        return res.status(200).json(
            new ApiResponse(200, req.user, "Current user fetched successfully")
        )
    } catch (error) {
        console.log("Error in getting current user::", error);
        return res.status(500).json({
            message: "Something went wrong while getting current user"
        })
    }
})
export {
    generateAccessAndRefreshToken,
    signup,
    signin,
    updateUserDetails,
    logout,
    updatePassword,
    getCurrentUser
}