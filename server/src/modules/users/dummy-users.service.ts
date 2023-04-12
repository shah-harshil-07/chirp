import { Injectable } from "@nestjs/common";

export type User = any;

@Injectable()
export class DummyUsersService {
    private readonly users = [
        { userId: 1, username: "John", password: "123" },
        { userId: 2, username: "Maria", password: "123" },
    ];

    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }
}