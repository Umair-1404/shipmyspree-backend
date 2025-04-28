import { loginSchema, registerSchema } from "../schemas/user.schema.js";
import bcrypt from "bcrypt";
import { ZodError } from "zod";
import { formatErrors } from "../utils/commonFunctions.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import "dotenv/config";
import prisma from "../db/db.config.js";

const transporter = nodemailer.createTransport({
  secure: true,
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otpEmailTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>OTP Verification</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 30px; text-align: center;">
                  <img src="https://aipexworldwide.com/images/aipex-logo.png" alt="ShipMySpree" style="height: 50px; margin-bottom: 20px;" />
                  <h2 style="color: #0d6efd; margin-bottom: 10px;">Verify Your Email</h2>
                  <p style="color: #333; font-size: 16px;">Use the OTP below to complete your registration:</p>
                  <div style="margin: 20px 0;">
                    <span style="display: inline-block; background-color: #0d6efd; color: #ffffff; padding: 14px 28px; font-size: 22px; font-weight: bold; border-radius: 8px; letter-spacing: 4px;">
                      ${otp}
                    </span>
                  </div>
                  <p style="color: #333;">This OTP is valid for <strong>10 minutes</strong>.</p>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 20px; font-size: 13px; color: #999;">
                  <p style="margin: 0;">Didn’t request this? Just ignore this email.</p>
                  <p style="margin: 5px 0 0;">— ShipMySpree Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const successEmailTemplate = (uname) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification Success</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 30px; text-align: center;">
                  <img src="https://aipexworldwide.com/images/aipex-logo.png" alt="ShipMySpree" style="height: 50px; margin-bottom: 20px;" />
                  <h2 style="color: #0d6efd; margin-bottom: 10px;">Registration Successful!</h2>
                  <p style="color: #333; font-size: 16px;">Thank you for verifying your email. Your account is now fully activated and ready to use.</p>
                  <div style="margin: 20px 0;">
                    <span style="display: inline-block; background-color: #0d6efd; color: #ffffff; padding: 14px 28px; font-size: 22px; font-weight: bold; border-radius: 8px; letter-spacing: 4px;">
                      Welcome, ${uname}!
                    </span>
                  </div>
                  <p style="color: #333;">Start exploring your account and enjoy the services.</p>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 20px; font-size: 13px; color: #999;">
                  <p style="margin: 0;">If you did not register for this account, please contact our support team.</p>
                  <p style="margin: 5px 0 0;">— ShipMySpree Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const generateRandomFiveDigitNumber = () => {
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  const remainingDigits = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(5, "0");
  return parseInt(firstDigit + remainingDigits);
};

class userController {
  // API to register
  static async register(req, res) {
    try {
      const body = req.body;
      const payload = registerSchema.parse(body);

      const existingUname = await prisma.user.findUnique({
        where: { uname: payload.uname },
      });
      console.log("existingUname----", existingUname);

      if (existingUname) {
        return res.status(400).json({ msg: "Username is already taken" });
      }

      const existingEmail = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      console.log("Existingemail----", existingEmail);

      if (existingEmail) {
        return res.status(400).json({ msg: "Email is already taken" });
      }
      const existingNum = await prisma.user.findFirst({
        where: { phone_no: payload.phone_no },
      });

      console.log("existingNum----", existingNum);

      if (existingNum) {
        return res.status(400).json({ msg: "Number is already taken" });
      }

      const salt = bcrypt.genSaltSync(10);
      payload.pass = bcrypt.hashSync(payload.pass, salt);

      const user = await prisma.user.create({
        data: payload,
      });

      return res.status(200).json({
        msg: "User created successfully",
        user,
      });
    } catch (error) {
      const errors = error instanceof ZodError ? formatErrors(error) : error;
      return res.status(500).json({ msg: errors });
    }
  }

  static async fetchUser(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Payload------", payload);
      let findUser = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });
      if (!findUser)
        return res.status(404).json({ msg: "User does not exist" });

      console.log("Find User------", findUser);

      return res.status(200).json({
        msg: "User found",
        findUser,
      });
    } catch (error) {
      const errors = error instanceof ZodError ? formatErrors(error) : error;
      console.error("Error during login:", errors);
      return res.status(500).json({ msg: errors });
    }
  }

  // API to generate OTP and send it to the user's email
  static async generate(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!findUser) return res.status(404).json({ message: "User not found" });

    const verificationCode = generateRandomFiveDigitNumber();
    const otpExpiryTime = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        otp: verificationCode,
        otp_expiry: otpExpiryTime,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      html: otpEmailTemplate(verificationCode),
    };

    try {
      await transporter.sendMail(mailOptions);
      return res
        .status(200)
        .json({ message: "OTP sent to your email address" });
    } catch (error) {
      return res.status(500).json({ message: "Error sending email", error });
    }
  }

  // API to verify OTP sent to the user's email
  static async verify(req, res) {
    const { email, otp } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    console.log("Finduser-----", findUser);

    if (!findUser || !findUser.otp || !findUser.otp_expiry) {
      return res.status(400).json({ message: "OTP not generated" });
    }

    if (new Date() > new Date(findUser.otp_expiry)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    console.log("OTP-----", typeof parseInt(findUser.otp));

    if (parseInt(otp) === parseInt(findUser.otp)) {
      await prisma.user.update({
        where: { email: findUser.email },
        data: {
          email_verified: "true",
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: findUser.email,
        subject: "Email successfully verified",
        html: successEmailTemplate(findUser.uname),
      };

      try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "OTP Verified Successfully" });
      } catch (error) {
        return res.status(500).json({ message: "Error sending email", error });
      }
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  }

  static async login(req, res) {
    try {
      const body = req.body;
      const payload = loginSchema.parse(body);
      let isAuthenticated = false;
      console.log("Payload------", payload);
      let findUser = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!findUser)
        return res.status(404).json({ msg: "User does not exist" });

      console.log("Find User------", findUser);

      const isPasswordValid = await bcrypt.compare(payload.pass, findUser.pass);

      if (isPasswordValid) {
        const payloadData = {
          id: findUser.id,
          name: findUser.uname,
          email: findUser.email,
        };

        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        if (findUser) {
          isAuthenticated = true;
        }
        await prisma.user.update({
          where: {
            email: payload.email,
          },
          data: { last_login: new Date() },
        });

        res.cookie("authToken", token, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 3600 * 1000,
        });

        res.cookie("refreshToken", token, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 5400 * 1000,
        });

        res.cookie("auth", isAuthenticated, {
          httpOnly: false,
          sameSite: "lax",
          secure: false,
          maxAge: 3600 * 1000,
        });

        return res.status(200).json({
          msg: "Logged In Successfully",
          data: payloadData,
          access_token: `Bearer ${token}`,
        });
      } else {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }
    } catch (error) {
      const errors = error instanceof ZodError ? formatErrors(error) : error;
      console.error("Error during login:", errors);
      return res.status(500).json({ msg: errors });
    }
  }

  // API to update
  static async update(req, res) {
    try {
      const body = req.body;
      if (!body) return res.status(404).json({ msg: "Body is empty" });

      const { email, uname, fname, lname, pass } = body;
      const userId = req.user.id;
      console.log("User Id-------", userId);
      const updateData = {};

      if (fname) updateData.fname = fname;
      if (lname) updateData.lname = lname;
      if (pass) updateData.pass = await bcrypt.hash(pass, 10);
      if (email) updateData.email = email;
      if (uname) updateData.uname = uname;

      const findUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!findUser) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (email && email === findUser.email) {
        return res
          .status(400)
          .json({ msg: "New email cannot be the same as the current one" });
      }

      if (email && email !== findUser.email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });
        if (existingEmail && existingEmail.id !== findUser.id) {
          return res.status(400).json({ msg: "Email is already in use" });
        }
        updateData.email = email;
        updateData.email_verified = "false";
      }

      if (uname && uname === findUser.uname) {
        return res
          .status(400)
          .json({ msg: "New username cannot be the same as the current one" });
      }

      if (uname && uname !== findUser.uname) {
        const existingUname = await prisma.user.findUnique({
          where: { uname },
        });
        if (existingUname && existingUname.id !== findUser.id) {
          return res.status(400).json({ msg: "Username is already in use" });
        }
        updateData.uname = uname;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return res.status(200).json({
        msg: "User updated successfully",
        data: {
          uname: updatedUser.uname,
          email: updatedUser.email,
          fname: updatedUser.fname,
          lname: updatedUser.lname,
          email_verified: updatedUser.email_verified,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: "Server error", error: error.message });
    }
  }
}

export default userController;
