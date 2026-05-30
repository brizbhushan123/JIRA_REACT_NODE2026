"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjects = exports.getUsers = exports.getPriorities = exports.getIssueStatuses = exports.getIssueTypes = void 0;
const apiResponse_1 = require("../../utils/apiResponse");
const logger_1 = __importDefault(require("../../config/logger"));
const lookup_service_1 = require("../../services/candidate/lookup.service");
const respond = async (res, fn) => {
    try {
        const result = await fn();
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
const getIssueTypes = (_req, res) => respond(res, lookup_service_1.getIssueTypesService);
exports.getIssueTypes = getIssueTypes;
const getIssueStatuses = (_req, res) => respond(res, lookup_service_1.getIssueStatusesService);
exports.getIssueStatuses = getIssueStatuses;
const getPriorities = (_req, res) => respond(res, lookup_service_1.getPrioritiesService);
exports.getPriorities = getPriorities;
const getUsers = (_req, res) => respond(res, lookup_service_1.getUsersService);
exports.getUsers = getUsers;
const getProjects = (_req, res) => respond(res, lookup_service_1.getProjectsService);
exports.getProjects = getProjects;
