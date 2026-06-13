import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function addQuestion(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const difficulty = formData.get("difficulty") as string;

    await prisma.question.create({
        data: {
            title,
            description,
            difficulty,
        },
    });

    redirect("/admin/questions");
}

export default function NewQuestionPage() {
    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">
                Add New Question
            </h1>

            <form action={addQuestion} className="space-y-4">
                <input
                    name="title"
                    placeholder="Question Title"
                    className="w-full border p-3 rounded"
                    required
                />

                <textarea
                    name="description"
                    placeholder="Description"
                    className="w-full border p-3 rounded h-40"
                    required
                />

                <select
                    name="difficulty"
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
                    Save Question
                </button>
            </form>
        </div>
    );
}