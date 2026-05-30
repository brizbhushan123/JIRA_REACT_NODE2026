"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIssueStatus = exports.addComment = exports.getComments = exports.getIssueById = exports.getProjectIssues = exports.createIssue = void 0;
const express_validator_1 = require("express-validator");
const validation_1 = require("../../utils/validation");
const apiResponse_1 = require("../../utils/apiResponse");
const logger_1 = __importDefault(require("../../config/logger"));
const issue_service_1 = require("../../services/candidate/issue.service");
const createIssue = async (req, res) => {
    try {
        const validators = [
            (0, express_validator_1.body)('projectId').notEmpty().isInt({ min: 1 }).withMessage('Valid projectId is required'),
            (0, express_validator_1.body)('summary').notEmpty().withMessage('summary is required'),
            (0, express_validator_1.body)('issuetypeId').notEmpty().isInt({ min: 1 }).withMessage('Valid issuetypeId is required'),
            (0, express_validator_1.body)('priorityId').optional().isInt({ min: 1 }).withMessage('priorityId must be a valid integer'),
            (0, express_validator_1.body)('assigneeId').optional().isInt({ min: 1 }).withMessage('assigneeId must be a valid integer'),
            (0, express_validator_1.body)('duedate').optional().isISO8601().withMessage('duedate must be a valid date'),
        ];
        const validation = await (0, validation_1.validateRequest)(validators, req);
        if (!validation.status) {
            res.status(validation.httpCode).json(apiResponse_1.ApiResponse.error(validation.key, validation.data));
            return;
        }
        const result = await (0, issue_service_1.createIssueService)(req);
        if (!result.status) {
            logger_1.default.error(`${result.key}: ${JSON.stringify(result.data)}`);
            res.status(result.httpCode).json(apiResponse_1.ApiResponse.error(result.key, result.data));
            return;
        }
        res.status(result.httpCode).json(apiResponse_1.ApiResponse.success(result.key, result.data));
    }
    catch (error) {
        res.status(500).json(apiResponse_1.ApiResponse.error('INTERNAL_SERVER_ERROR', error));
    }
};
exports.createIssue = createIssue;
const getProjectIssues = async (req, res) => {
    try {
        const validators = [
            (0, express_validator_1.param)('projectId').isInt({ min: 1 }).withMessage('Valid projectId is required'),
        ];
        const validation = await (0, validation_1.validateRequest)(validators, req);
        if (!validation.status) {
            res.status(validation.httpCode).json(apiResponse_1.ApiResponse.error(validation.key, validation.data));
            return;
        }
        const result = await (0, issue_service_1.getProjectIssuesService)(req);
        if (!result.status) {
            logger_1.default.error(`${result.key}: ${JSON.stringify(result.data)}`);
            res.status(result.httpCode).json(apiResponse_1.ApiResponse.error(result.key, result.data));
            return;
        }
        res.json(apiResponse_1.ApiResponse.success(result.key, result.data));
    }
    catch (error) {
        res.status(500).json(apiResponse_1.ApiResponse.error('INTERNAL_SERVER_ERROR', error));
    }
};
exports.getProjectIssues = getProjectIssues;
const getIssueById = async (req, res) => {
    try {
        const validators = [
            (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('Valid issue id is required'),
        ];
        const validation = await (0, validation_1.validateRequest)(validators, req);
        if (!validation.status) {
            res.status(validation.httpCode).json(apiResponse_1.ApiResponse.error(validation.key, validation.data));
            return;
        }
        const result = await (0, issue_service_1.getIssueByIdService)(req);
        if (!result.status) {
            logger_1.default.error(`${result.key}: ${JSON.stringify(result.data)}`);
            res.status(result.httpCode).json(apiResponse_1.ApiResponse.error(result.key, result.data));
            return;
        }
        res.json(apiResponse_1.ApiResponse.success(result.key, result.data));
    }
    catch (error) {
        res.status(500).json(apiResponse_1.ApiResponse.error('INTERNAL_SERVER_ERROR', error));
    }
};
exports.getIssueById = getIssueById;
const getComments = async (req, res) => {
    try {
        const validators = [
            (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('Valid issue id is required'),
        ];
        const validation = await (0, validation_1.validateRequest)(validators, req);
        if (!validation.status) {
            res.status(validation.httpCode).json(apiResponse_1.ApiResponse.error(validation.key, validation.data));
            return;
        }
        const result = await (0, issue_service_1.getCommentsService)(req);
        if (!result.status) {
            res.status(result.httpCode).json(apiResponse_1.ApiResponse.error(result.key, result.data));
            return;
        }
        res.json(apiResponse_1.ApiResponse.success(result.key, result.data));
    }
    catch (error) {
        res.status(500).json(apiResponse_1.ApiResponse.error('INTERNAL_SERVER_ERROR', error));
    }
};
exports.getComments = getComments;
const addComment = async (req, res) => {
    try {
        const validators = [
            (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('Valid issue id is required'),
            (0, express_validator_1.body)('body').notEmpty().withMessage('Comment body is required'),
        ];
        const validation = await (0, validation_1.validateRequest)(validators, req);
        if (!validation.status) {
            res.status(validation.httpCode).json(apiResponse_1.ApiResponse.error(validation.key, validation.data));
            return;
        }
        const result = await (0, issue_service_1.addCommentService)(req);
        if (!result.status) {
            logger_1.default.error(`${result.key}: ${JSON.stringify(result.data)}`);
            res.status(result.httpCode).json(apiResponse_1.ApiResponse.error(result.key, result.data));
            return;
        }
        res.status(result.httpCode).json(apiResponse_1.ApiResponse.success(result.key, result.data));
    }
    catch (error) {
        res.status(500).json(apiResponse_1.ApiResponse.error('INTERNAL_SERVER_ERROR', error));
    }
};
exports.addComment = addComment;
const updateIssueStatus = async (req, res) => {
    try {
        const validators = [
            (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('Valid issue id is required'),
            (0, express_validator_1.body)('status').notEmpty().withMessage('status is required'),
        ];
        const validation = await (0, validation_1.validateRequest)(validators, req);
        if (!validation.status) {
            res.status(validation.httpCode).json(apiResponse_1.ApiResponse.error(validation.key, validation.data));
            return;
        }
        const result = await (0, issue_service_1.updateIssueStatusService)(req);
        if (!result.status) {
            logger_1.default.error(`${result.key}: ${JSON.stringify(result.data)}`);
            res.status(result.httpCode).json(apiResponse_1.ApiResponse.error(result.key, result.data));
            return;
        }
        res.json(apiResponse_1.ApiResponse.success(result.key, result.data));
    }
    catch (error) {
        res.status(500).json(apiResponse_1.ApiResponse.error('INTERNAL_SERVER_ERROR', error));
    }
};
exports.updateIssueStatus = updateIssueStatus;
