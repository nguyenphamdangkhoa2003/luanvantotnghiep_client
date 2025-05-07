import API from '../api';

type signupType = {
    name: string;
    email: string;
    password1: string;
    password2: string;
};
type verifyEmailType = { code: string };

export const signupMutationFn = async (data: signupType) =>
    await API.post(`/auth/signup`, data);

export const verifyEmailMutationFn = async (data: verifyEmailType) =>
    await API.get(`/auth/confirm-email/${data.code}`);