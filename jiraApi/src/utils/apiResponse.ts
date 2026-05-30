import { en } from "../lang/en";
import { hi } from "../lang/hi";
import { apiMessages } from "./apiMessage";
import { utility } from "./utility";

export type ApiResponseType = "SUCCESS" | "ERROR";
type Language = "en" | "hi";

const translations: Record<Language, any> = { en, hi };

export interface JsonResponse<T = any> {
  status: boolean;
  code: number;
  message: string;
  data?: T;
  errors?: any;
}

export class ApiResponse {
  static getLocalizedMessage(messageKey: string): string {
    const lang = Context.get<Language>("lang", "en");
    return (
      translations[lang]?.[messageKey] ||
      translations["en"]?.[messageKey] ||
      messageKey
    );
  }

  static message<T = any>(
    type: ApiResponseType = "SUCCESS",
    key = "DEFAULT",
    payload: T | any = {},
  ): JsonResponse<T> {
    const messageData = apiMessages[type]?.[key] || apiMessages[type]["DEFAULT"];
    const localizedMessage = this.getLocalizedMessage(messageData.message_key);
    const returnObj = {
      status: true,
      code: messageData.code,
      message: localizedMessage,
      data: payload,
    };
    if (type === "ERROR") {
     returnObj.status = false;
    }
    utility.log("API Response:", returnObj);
    return returnObj;
  }

  static success<T = any>(key = "DEFAULT", data: T = {} as T): JsonResponse<T> {
    return this.message("SUCCESS", key, data);
  }

  static error(key = "DEFAULT", errors: any = {}): JsonResponse {
    return this.message("ERROR", key, errors);
  }
}

export class Context {
  private static store: Record<string, any> = {};

  static add(key: string, value: any): void {
    this.store[key] = value;
  }

  static get<T = any>(key: string, defaultValue?: T): T {
    return this.store[key] ?? defaultValue;
  }

  static clear(): void {
    this.store = {};
  }
}