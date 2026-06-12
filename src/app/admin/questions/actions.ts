"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Delete Question
export async function deleteQuestion(id: string) {
    await prisma.question.delete({
        where: {
            id,
        },
    });

    revalidatePath("/admin/questions");
}

// Mark Question as Completed
export async function markCompleted(questionId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await prisma.userProgress.upsert({
        where: {
            userId_questionId: {
                userId: session.user.id,
                questionId,
            },
        },
        update: {
            status: "COMPLETED",
        },
        create: {
            userId: session.user.id,
            questionId,
            status: "COMPLETED",
        },
    });

    revalidatePath("/");
    revalidatePath(`/questions/${questionId}`);
    revalidatePath("/admin");
    revalidatePath("/admin/users");
}