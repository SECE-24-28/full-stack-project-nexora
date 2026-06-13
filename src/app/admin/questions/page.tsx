import { prisma } from "@/lib/prisma";
import { deleteQuestion } from "./actions";

export default async function QuestionsPage({
    searchParams,
}: {
    searchParams: Promise<{
        search?: string;
    }>;
}) {
    const { search } = await searchParams;

    const questions = await prisma.question.findMany({
        where: {
            title: {
                contains: search || "",
                mode: "insensitive",
            },
        },
        include: {
            categories: true,
            companies: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">
                        Manage Questions
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Create, edit and manage interview questions.
                    </p>
                </div>

                <a
                    href="/admin/questions/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
                >
                    + Add Question
                </a>
            </div>

            {/* Stats */}
            <div className="bg-white shadow-lg rounded-xl p-5">
                <h3 className="text-lg font-semibold">
                    Total Questions
                </h3>

                <p className="text-3xl font-bold text-blue-600 mt-2">
                    {questions.length}
                </p>
            </div>

            {/* Search */}
            <div className="bg-white shadow-lg rounded-xl p-5">
                <form className="flex gap-4">
                    <input
                        type="text"
                        name="search"
                        defaultValue={search}
                        placeholder="Search questions..."
                        className="border p-3 rounded-lg flex-1"
                    />

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 text-left">
                                Title
                            </th>

                            <th className="p-4 text-left">
                                Difficulty
                            </th>

                            <th className="p-4 text-left">
                                Categories
                            </th>

                            <th className="p-4 text-left">
                                Companies
                            </th>

                            <th className="p-4 text-left">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {questions.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center p-10 text-gray-500"
                                >
                                    No Questions Found
                                </td>
                            </tr>
                        ) : (
                            questions.map((question) => (
                                <tr
                                    key={question.id}
                                    className="border-b hover:bg-gray-50 transition"
                                >
                                    <td className="p-4 font-medium">
                                        {question.title}
                                    </td>

                                    <td className="p-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${question.difficulty === "Easy"
                                                    ? "bg-green-100 text-green-700"
                                                    : question.difficulty === "Medium"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {question.difficulty}
                                        </span>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {question.categories.map(
                                                (category) => (
                                                    <span
                                                        key={category.id}
                                                        className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full"
                                                    >
                                                        {category.name}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {question.companies.map(
                                                (company) => (
                                                    <span
                                                        key={company.id}
                                                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                                                    >
                                                        {company.name}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-4 flex gap-2">
                                        <a
                                            href={`/admin/questions/${question.id}`}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                                        >
                                            Edit
                                        </a>

                                        <form
                                            action={async () => {
                                                "use server";
                                                await deleteQuestion(
                                                    question.id
                                                );
                                            }}
                                        >
                                            <button
                                                type="submit"
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}