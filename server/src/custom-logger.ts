import * as chalk from "chalk";
import {  LoggerService } from "@nestjs/common";

import { ConfigService } from "./modules/config/config.service";

export class CustomLogger implements LoggerService {
    private colorConfig: any;

    constructor() {
        const configObj = new ConfigService();
        this.colorConfig = configObj.getLoggingColorConfig();
        this.printMessage("cyan", "Welcome to Chirp!");
    }

    public log(message: string) {
        let color: string;

        for (const searchKey in this.colorConfig) {
            const index = message.search(new RegExp(searchKey, 'i'));
            if (index >= 0) {
                color = this.colorConfig[searchKey];
                break;
            }
        }

        color ??= "whiteBright";
        this.printMessage(color, message);
    }

    public error(message: string) {
        const color = this.colorConfig["error"];
        this.printMessage(color, "internal error intercepted!", message);
    }

    public warn(message: string) {
        const color = this.colorConfig["warning"];
        this.printMessage(color, "internal warning intercepted!", message);
    }

    private printMessage(color: string, message: string, detailedMessage = '') {
        console.log(`${chalk[color]["bold"](message)}\n${detailedMessage}`);
    }
}
