"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectsService = exports.getUsersService = exports.getPrioritiesService = exports.getIssueStatusesService = exports.getIssueTypesService = void 0;
const issueType_model_1 = __importDefault(require("../../models/issueType.model"));
const issueStatus_model_1 = __importDefault(require("../../models/issueStatus.model"));
const priority_model_1 = __importDefault(require("../../models/priority.model"));
const appUser_model_1 = __importDefault(require("../../models/appUser.model"));
const project_model_1 = __importDefault(require("../../models/project.model"));
const serviceResponse_1 = require("../../utils/serviceResponse");
const getIssueTypesService = async () => {
    try {
        const data = await issueType_model_1.default.findAll();
        return serviceResponse_1.serviceResponse.success('DATA_FETCHED', data);
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.getIssueTypesService = getIssueTypesService;
const getIssueStatusesService = async () => {
    try {
        const data = await issueStatus_model_1.default.findAll();
        return serviceResponse_1.serviceResponse.success('DATA_FETCHED', data);
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.getIssueStatusesService = getIssueStatusesService;
const getPrioritiesService = async () => {
    try {
        const data = await priority_model_1.default.findAll();
        return serviceResponse_1.serviceResponse.success('DATA_FETCHED', data);
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.getPrioritiesService = getPrioritiesService;
const getUsersService = async () => {
    try {
        const all = await appUser_model_1.default.findAll();
        const data = all.map(({ passwordHash: _ph, ...u }) => u);
        return serviceResponse_1.serviceResponse.success('DATA_FETCHED', data);
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.getUsersService = getUsersService;
const getProjectsService = async () => {
    try {
        const data = await project_model_1.default.findAll();
        return serviceResponse_1.serviceResponse.success('DATA_FETCHED', data);
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.getProjectsService = getProjectsService;
