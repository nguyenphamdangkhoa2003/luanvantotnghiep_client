import API from '../api';

type signupType = {
    name: string;
    email: string;
    password1: string;
    password2: string;
};

export const signupMutationFn = async (data: signupType) =>
    await API.post(`/auth/signup`, data);

