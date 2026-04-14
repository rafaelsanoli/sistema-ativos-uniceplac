import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureAdminUser();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async ensureAdminUser() {
    const adminEmail = this.configService.getOrThrow<string>('ADMIN_EMAIL');
    const adminPassword =
      this.configService.getOrThrow<string>('ADMIN_PASSWORD');

    const existingUser = await this.findByEmail(adminEmail);
    if (existingUser) {
      return existingUser;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    return this.userModel.create({
      email: adminEmail.toLowerCase().trim(),
      passwordHash,
      role: 'ADMIN',
    });
  }
}
