import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from '@src/users/users.service';
import { User } from '@src/users/schema/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async createUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('age') age: number,
  ): Promise<User> {
    return this.userService.createUser(name, email, age);
  }

  @Get()
  async getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }
}
