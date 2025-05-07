import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
// import { updateUserMutationFn } from '@/api/users/user';

// Schema validation
const formSchema = z.object({
    familyName: z.string().min(2, {
        message: 'Firstname must be at least 2 characters.',
    }),
    givenName: z.string().min(2, {
        message: 'Lastname must be at least 2 characters.',
    }),
});
type PersonInformationFormProps = {
    id: string;
    initialValues?: {
        familyName?: string;
        givenName?: string;
    };
    refech: () => {};
};
// Kiểu dữ liệu cho response API
type PersonInformation = {
    id: string;
    familyName: string;
    givenName: string;
};

export function PersonInformationForm(params: PersonInformationFormProps) {
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            familyName: params.initialValues?.familyName,
            givenName: params.initialValues?.givenName,
        },
    });

    // const { mutate, isPending } = useMutation<
    //     PersonInformation,
    //     Error,
    //     z.infer<typeof formSchema>
    // >({
    //     mutationFn: async (formData) => {
    //         const response = await updateUserMutationFn({
    //             userId: params.id,
    //             data: formData,
    //         });
    //         return response.data;
    //     },
    //     onSuccess: (data) => {
    //         queryClient.invalidateQueries({ queryKey: ['profile'] });
    //         toast.message(`Profile updated successfully #${params.id}`);
    //         params.refech();
    //     },
    //     onError: (error) => {
    //         toast.error(error.message);
    //     },
    // });
    const isPending = false;
    
    function onSubmit(values: z.infer<typeof formSchema>) {
        // mutate(values);
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 md:space-y-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full">
                    {/* First Name Field */}
                    <FormField
                        control={form.control}
                        name="familyName"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>First name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="First name"
                                        {...field}
                                        className="w-full"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Last Name Field */}
                    <FormField
                        control={form.control}
                        name="givenName"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Last name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Last name"
                                        {...field}
                                        className="w-full"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Button Group - Adjusted for mobile */}

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full sm:w-auto">
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => form.reset()}
                        disabled={isPending}
                        className="w-full sm:w-auto">
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
