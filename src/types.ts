export type User = {
  email: string;
  password: string;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: { email: string };
};