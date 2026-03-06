import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors";


export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    throw new ValidationError(messages.join(", "));
  }
  next();
};

export const validateRegister = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters")
    .matches(/^[a-z0-9_-]+$/)
    .withMessage("Username can only contain lowercase letters, numbers, underscore, and hyphen"),
  body("email")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  /*body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),*/
];

export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password required"),
];

export const validateSendMessage = [
  body("receiverId")
    .notEmpty()
    .withMessage("Receiver ID required")
    .isMongoId()
    .withMessage("Invalid receiver ID"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content required")
    .isLength({ max: 5000 })
    .withMessage("Message cannot exceed 5000 characters"),
];

export const validateFriendRequest = [
  body("receiverId")
    .notEmpty()
    .withMessage("Receiver ID required")
    .isMongoId()
    .withMessage("Invalid receiver ID"),
];