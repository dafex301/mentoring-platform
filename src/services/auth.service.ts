import AuthRepository from "../repositories/auth.repository";
import UserRepository from "../repositories/user.repository";
import MentorRepository from "../repositories/mentor.repository";
import MenteeRepository from "../repositories/mentee.repository";
import FirestoreRepository from "../repositories/user.firestore.repository";

import { UserRecord } from "firebase-admin/lib/auth";

export class AuthService {
  private authRepository: AuthRepository;
  private userRepository: UserRepository;
  private menteeRepository: MenteeRepository;
  private mentorRepository: MentorRepository;
  private firestoreRepository: FirestoreRepository;

  constructor() {
    this.authRepository = new AuthRepository();
    this.userRepository = new UserRepository();
    this.menteeRepository = new MenteeRepository();
    this.mentorRepository = new MentorRepository();
    this.firestoreRepository = new FirestoreRepository();
  }

  async register(
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<{
    success: boolean;
    uid?: string;
    data?: UserRecord;
    message?: string;
  }> {
    try {
      const firebaseUser: UserRecord = await this.authRepository.createUser(
        name,
        email,
        password
      );

      const provider_id = firebaseUser.uid;

      const newUser = {
        name,
        email,
        provider_id,
        is_mentor: role === "mentor",
        is_mentee: role === "mentee",
      };

      const createdUser = await this.userRepository.createUser(newUser);

      if (role === "mentor") {
        await this.mentorRepository.createMentor(createdUser.id);
      } else {
        await this.menteeRepository.createMentee(createdUser.id);
      }

      await this.authRepository.setRoleClaims(provider_id, {
        roles: [role!],
        record_id: createdUser.id,
      });

      await this.firestoreRepository.createDocument("users", provider_id, {
        name: firebaseUser.displayName,
        groups: [],
      });

      return {
        success: true,
        data: firebaseUser,
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async providerLogin(
    provider_id: string,
    name: string,
    email: string,
    profile_picture_url: string,
    role: string
  ) {
    try {
      const newUser = {
        name,
        email,
        provider_id,
        profile_picture_url,
        is_mentor: role === "mentor",
        is_mentee: role === "mentee",
      };

      const createdUser = await this.userRepository.createUser(newUser);

      if (role === "mentor") {
        await this.mentorRepository.createMentor(createdUser.id);
      } else {
        await this.menteeRepository.createMentee(createdUser.id);
      }

      await this.authRepository.setRoleClaims(provider_id, {
        roles: [role!],
        record_id: createdUser.id,
      });

      const token = await this.authRepository.createCustomToken(provider_id, {
        roles: [role],
        record_id: createdUser.id,
      });

      await this.firestoreRepository.createDocument("users", provider_id, {
        name,
        groups: [],
      });

      return {
        success: true,
        token,
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

const authService = new AuthService();
export default authService;
