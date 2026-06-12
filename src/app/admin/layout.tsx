export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-black text-white p-4 flex gap-8">
                <a href="/admin">Dashboard</a>
                <a href="/admin/questions">Questions</a>
                <a href="/admin/users">Users</a>
            </div>

            <main className="p-6">
                {children}
            </main>
        </div>
    );
}