import { prisma } from "@/lib/prisma";
import DifficultyChart from "@/components/DifficultyChart";
import SubmissionChart from "@/components/SubmissionChart";
import CategoryChart from "@/components/CategoryChart";

export default async function AdminPage() {
    const totalUsers = await prisma.user.count();

    const totalQuestions = await prisma.question.count();

    const totalCategories = await prisma.category.count();

    const totalCompanies = await prisma.company.count();

    const solvedCount = await prisma.userProgress.count({
        where: {
            status: "SOLVED",
        },
    });

    const easyQuestions = await prisma.question.count({
        where: {
            difficulty: "Easy",
        },
    });

    const mediumQuestions = await prisma.question.count({
        where: {
            difficulty: "Medium",
        },
    });

    const hardQuestions = await prisma.question.count({
        where: {
            difficulty: "Hard",
        },
    });

    // Submission Analytics
    const progressRecords =
        await prisma.userProgress.findMany({
            where: {
                status: "SOLVED",
            },
            orderBy: {
                updatedAt: "asc",
            },
        });

    const submissionMap = new Map<
        string,
        number
    >();

    progressRecords.forEach((item) => {
        const date =
            item.updatedAt.toLocaleDateString();

        submissionMap.set(
            date,
            (submissionMap.get(date) || 0) + 1
        );
    });

    const submissionData = Array.from(
        submissionMap,
        ([date, count]) => ({
            date,
            count,
        })
    );
    const categories = await prisma.category.findMany({
        include: {
            questions: true,
        },
    });

    const categoryData = categories
        .map((category) => ({
            name: category.name,
            count: category.questions.length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    const recentActivity =
        await prisma.userProgress.findMany({
            include: {
                user: true,
                question: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
            take: 10,
        });

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold">
                Dashboard Overview
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="bg-white shadow rounded p-6">
                    <h3>Total Users</h3>
                    <p className="text-4xl font-bold">
                        {totalUsers}
                    </p>
                </div>

                <div className="bg-white shadow rounded p-6">
                    <h3>Total Questions</h3>
                    <p className="text-4xl font-bold">
                        {totalQuestions}
                    </p>
                </div>

                <div className="bg-white shadow rounded p-6">
                    <h3>Questions Solved</h3>
                    <p className="text-4xl font-bold">
                        {solvedCount}
                    </p>
                </div>

                <div className="bg-white shadow rounded p-6">
                    <h3>Categories</h3>
                    <p className="text-4xl font-bold">
                        {totalCategories}
                    </p>
                </div>

                <div className="bg-white shadow rounded p-6">
                    <h3>Companies</h3>
                    <p className="text-4xl font-bold">
                        {totalCompanies}
                    </p>
                </div>
            </div>

            <div className="bg-white shadow rounded p-6">
                <h2 className="text-2xl font-bold mb-4">
                    Question Difficulty Distribution
                </h2>

                <DifficultyChart
                    easy={easyQuestions}
                    medium={mediumQuestions}
                    hard={hardQuestions}
                />
            </div>

            <div className="bg-white shadow rounded p-6">
                <h2 className="text-2xl font-bold mb-4">
                    Submission Trends
                </h2>
                <div className="bg-white shadow rounded p-6">
                    <h2 className="text-2xl font-bold mb-4">
                        Most Popular Categories
                    </h2>
                    <div className="bg-white shadow rounded p-6">
                        <h2 className="text-2xl font-bold mb-6">
                            Recent Activity
                        </h2>

                        <div className="space-y-4">
                            {recentActivity.length === 0 ? (
                                <p>No activity yet.</p>
                            ) : (
                                recentActivity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="border-b pb-3"
                                    >
                                        <p>
                                            <span className="font-semibold">
                                                {activity.user.name}
                                            </span>{" "}
                                            solved{" "}
                                            <span className="font-semibold">
                                                {activity.question.title}
                                            </span>
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {new Date(
                                                activity.updatedAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <CategoryChart
                        data={categoryData}
                    />
                </div>

                <SubmissionChart
                    data={submissionData}
                />
            </div>
        </div>
    );
}