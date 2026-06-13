"use client";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function DifficultyChart({
    easy,
    medium,
    hard,
}: {
    easy: number;
    medium: number;
    hard: number;
}) {
    const data = [
        { name: "Easy", value: easy },
        { name: "Medium", value: medium },
        { name: "Hard", value: hard },
    ];

    const COLORS = [
        "#22c55e",
        "#f59e0b",
        "#ef4444",
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    outerRadius={100}
                    label
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={index}
                            fill={COLORS[index]}
                        />
                    ))}
                </Pie>

                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
}