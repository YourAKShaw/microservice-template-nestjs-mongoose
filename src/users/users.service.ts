import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@src/users/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(
    name: string,
    email: string,
    age: number,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      name,
      email,
      age,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();
    const userWithoutPassword = omit(savedUser, 'password');
    return userWithoutPassword;
  }

  async getUsers(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async replaceUser(id: string, userData: Omit<User, '_id'>): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const replacedUser = await this.userModel
      .findByIdAndUpdate(id, userData, { new: true, overwrite: true })
      .select('-password')
      .exec();

    if (!replacedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return replacedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }
}
