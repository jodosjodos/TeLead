import { ApiProperty } from '@nestjs/swagger';

enum ROLE {
  MENTOR = 'MENTOR',
  STUDENT = 'STUDENT',
}
export class CreateUserResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  fullName: string;
  @ApiProperty()
  nickName: string;
  @ApiProperty({ enum: ['STUDENT', 'MENTOR'] })
  Role: ROLE;
  dateOfBirth: Date;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: string;
  gender: 'MALE' | 'FEMALE';
}
