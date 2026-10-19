export interface User {
  id: number;
  username: string;
  email: string;
}

export type UserInput = Pick<User, 'username'>;