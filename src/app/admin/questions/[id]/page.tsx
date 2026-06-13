import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function updateQuestion(
    id: string,
    formData: FormData
) {
    "use server";

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const difficulty = formData.get("difficulty") as string;

    await prisma.question.update({
        where: {
            id,
        },
        data: {
            title,
            description,
            difficulty,
        },
    });

    redirect("/admin/questions");
}

export default async function EditQuestionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const question = await prisma.question.findUnique({
        where: {
            id,
        },
    });

    if (!question) {
        return <div>Question Not Found</div>;
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">
                Edit Question
            </h1>

            <form
                action={updateQuestion.bind(null, id)}
                className="space-y-4"
            >
                <input
                    name="title"
                    defaultValue={question.title}
                    className="w-full border p-3 rounded"
                />

                <textarea
                    name="description"
                    defaultValue={question.description}
                    className="w-full border p-3 rounded h-40"
                />

                <select
                    name="difficulty"
                    defaultValue={question.difficulty}
                    className="w-full border p-3 rounded"
                >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>

                <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-3 rounded"
                >
                    Update Question
                </button>
            </form>
        </div>
    );
}