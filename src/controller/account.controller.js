import mongoose from "mongoose";
import { Account } from "../models/account.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getBalance = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;

        const account = await Account.findOne({
            userId
        })

        if (!account)
            return res.status(401).json({
                message: "Account not found"
            })

        return res.status(200).json(
            new ApiResponse(200, account.balance, "Balance fetched successfully")
        )
    } catch (error) {
        console.log("Error in fetching balance::", error);
        throw new ApiError(500, "Something went wrong while fetching balance")
    }
})

const transfer = asyncHandler(async (req, res) => {
    // In transfer make sure you use session to have 
    // rollback functionality if failure occurs
    try {
        const session = await mongoose.startSession();

        session.startTransaction();

        const { to, amount } = req.body;

        if (to == req.user.email)
            return res.status(411).json({
                message: "Can't send money to yourself"
            })

        const userId = req.user._id;

        // Transfering person account details
        const account = await Account.findOne({
            userId
        }).session(session)

        if (!account) {
            return res.status(401).json({
                message: "Senders account not found"
            })
        }

        if (account.balance < amount) {
            return res.status(400).json({
                message: "Insufficient balance"
            })
        }

        const receiverUser = await User.findOne({
            email: to
        })

        if (!receiverUser) {
            return res.status(400).json({
                message: "Invalid user to send"
            })
        }

        const toAccount = await Account.findOne({
            userId: receiverUser._id
        }).session(session)

        if (!toAccount) {
            return res.status(400).json({
                message: "Invalid account to send"
            })
        }

        // Perform the transfer
        await Account.updateOne(
            {
                userId: userId
            },
            {
                $inc: {
                    balance: -amount
                }
            }).session(session)

        await Account.updateOne(
            {
                userId: receiverUser._id
            },
            {
                $inc: {
                    balance: amount
                }
            }).session(session)

        // Commit the transaction
        await session.commitTransaction();

        return res.status(200).json(
            new ApiResponse(200, {}, "Amount transferred successfully"))

    } catch (error) {
        console.log("Error in transfer::", error);
        return res.status(400).json({
            message: "Something went wrong while transferring amount"
        })
    }
})

export { getBalance, transfer }