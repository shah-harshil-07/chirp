import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {
    public createFourDigitOtp(): string {
        const num = (+(Math.random().toFixed(4))) * 10000;
        return num.toString();
    }
}
