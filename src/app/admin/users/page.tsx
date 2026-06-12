import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        include: {
            progress: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">
                User Management
            </h1>

            <table className="w-full bg-white rounded shadow">
                <thead>
                    <tr className="border-b">
                        <th className="p-4 text-left">Name</th>
                        <th className="p-4 text-left">Email</th>
                        <th className="p-4 text-left">Role</th>
                        <th className="p-4 text-left">Joined</th>
                        <th className="p-4 text-left">
                            Questions Solved
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            className="border-b"
                        >
                            <td className="p-4">
                                {user.name}
                            </td>

                            <td className="p-4">
                                {user.email}
                            </td>

                            <td className="p-4">
                                {user.role}
                            </td>

                            <td className="p-4">
                                {new Date(
                                    user.createdAt
                                ).toLocaleDateString()}
                            </td>

                            <td className="p-4">
                                {user.progress.length}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}