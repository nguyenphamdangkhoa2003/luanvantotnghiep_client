import API from '../api';

type forgotPasswordEmailType = { email: string };
type resetPasswordType = { password1: string;password2: string; resetToken: string };

type signinType = {
    emailOrUsername: string;
    password: string;
};
type signupType = {
    name: string;
    email: string;
    password1: string;
    password2: string;
};
type verifyEmailType = { code: string };

export const signinMutationFn = async (data: signinType) =>
    await API.post('/auth/signin', data);

export const signupMutationFn = async (data: signupType) =>
    await API.post(`/auth/signup`, data);

export const verifyEmailMutationFn = async (data: verifyEmailType) =>
    await API.get(`/auth/confirm-email/${data.code}`);

export const forgotPasswordMutationFn = async (data: forgotPasswordEmailType) =>
    await API.post(`/auth/reset-password-email`, data);

export const resetPasswordMutationFn = async (data: resetPasswordType) =>
    await API.post(`/auth/reset-password`, data);