"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

interface Props {
    data: {
        name: string;
        count: number;
    }[];
}

export default function CategoryChart({
    data,
}: Props) {
    return (
        <ResponsiveContainer
            width="100%"
            height={350}
        >
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                    dataKey="count"
                    fill="#3b82f6"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}