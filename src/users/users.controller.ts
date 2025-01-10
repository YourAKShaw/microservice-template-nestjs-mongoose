import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schema/user.schema';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from '@src/common/response/api-response';
import { TransformInterceptor } from '@src/common/interceptors/transform.interceptor';

@Controller('users')
@UseInterceptors(TransformInterceptor)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  async createUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('age') age: number,
    @Body('password') password: string,
  ): Promise<ApiResponse<Omit<User, 'password'>>> {
    const user = await this.userService.createUser(name, email, age, password);
    return ApiResponse.success(user, 'User created successfully', 201);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers(): Promise<ApiResponse<User[]>> {
    const users = await this.userService.getUsers();
    return ApiResponse.success(users, 'Users retrieved successfully');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id') id: string): Promise<ApiResponse<User>> {
    const user = await this.userService.getUserById(id);
    return ApiResponse.success(user, 'User retrieved successfully');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ): Promise<ApiResponse<User>> {
    const updatedUser = await this.userService.updateUser(id, updateData);
    return ApiResponse.success(updatedUser, 'User updated successfully');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async replaceUser(
    @Param('id') id: string,
    @Body() userData: Omit<User, '_id'>,
  ): Promise<ApiResponse<User>> {
    const replacedUser = await this.userService.replaceUser(id, userData);
    return ApiResponse.success(replacedUser, 'User replaced successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string): Promise<ApiResponse<void>> {
    await this.userService.deleteUser(id);
    return ApiResponse.success(undefined, 'User deleted successfully', 200);
  }

  @Post('signin')
  async signIn(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<ApiResponse<{ access_token: string } | null>> {
    // Changed return type here
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      return ApiResponse.error('Invalid credentials', 401);
    }

    const payload = { email: user.email, sub: user._id };
    return ApiResponse.success(
      { access_token: this.jwtService.sign(payload) },
      'Sign in successful',
    );
  }
}
